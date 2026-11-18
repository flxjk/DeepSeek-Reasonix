/**
 * Shared Gemini calling core: model fallback, retry/backoff, thinking budget
 * and bounded concurrency.
 *
 * Used by both the CLI and the MCP server so behaviour cannot drift between them.
 */
import { loadGenAI } from './genai.mjs';
import { installKey } from './gemini-key.mjs';

/**
 * Preference order. The 4.x models are the strongest available on this key;
 * deep-research-* and antigravity-preview-* are deliberately absent because the
 * API rejects them with "This model only supports Interactions API".
 */
export const DEFAULT_CHAIN = [
  'gemini-4-argon',
  'gemini-4-carbon',
  'gemini-3.8-flash',
  'gemini-2.5-flash',
];

export const DEFAULT_EMBED_MODEL = 'gemini-embedding-001';

/**
 * Token budgets per effort label. `-1` means automatic, which lets the model
 * spend as much as it needs; `0` disables thinking entirely.
 */
const EFFORT_BUDGETS = {
  minimal: 0,
  low: 1024,
  medium: 8192,
  high: 24576,
  max: -1,
};

export const EFFORTS = Object.keys(EFFORT_BUDGETS);

/**
 * Builds the `thinkingConfig` block for an effort label.
 *
 * Only one of `thinkingBudget` and `thinkingLevel` may be sent -- the API rejects
 * both together with "You can only set only one of thinking budget and thinking
 * level." The budget is the more precise control, so it is the one used.
 */
export function thinkingFor(effort = 'max', includeThoughts = false) {
  const key = String(effort).toLowerCase();
  const budget = EFFORT_BUDGETS[key];
  if (budget === undefined) {
    throw new Error(`unknown effort '${effort}'. Use one of: ${EFFORTS.join(', ')}`);
  }
  return {
    thinkingBudget: budget,
    ...(includeThoughts ? { includeThoughts: true } : {}),
  };
}

let clientPromise = null;

/** Lazily constructs one shared client. */
export async function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      installKey();
      const { GoogleGenAI, version } = await loadGenAI();
      return { ai: new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }), version };
    })();
  }
  return clientPromise;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** True for errors worth retrying rather than failing the caller. */
function isRetryable(err) {
  const text = String(err?.message ?? err);
  if (/\b(429|500|502|503|504)\b/.test(text)) return true;
  if (/RESOURCE_EXHAUSTED|UNAVAILABLE|INTERNAL|DEADLINE_EXCEEDED|overloaded/i.test(text)) return true;
  return false;
}

/** Pulls a readable sentence out of the API's JSON error envelope. */
export function explain(err) {
  let message = String(err?.message ?? err);
  const brace = message.indexOf('{');
  if (brace !== -1) {
    try {
      const inner = JSON.parse(message.slice(brace))?.error;
      if (inner?.message) {
        const reason = inner.details?.find((d) => d?.reason)?.reason;
        message = [inner.message, inner.status].filter(Boolean).join(' — ');
        if (reason) message += ` | ${reason}`;
      }
    } catch {
      /* keep the original text */
    }
  }
  return message;
}

/**
 * Runs one generation, walking the chain and retrying retryable failures.
 *
 * @returns {Promise<{text: string, model: string, usage: object|null, thoughts: string|null, attempts: number}>}
 */
export async function generate({
  prompt,
  chain = DEFAULT_CHAIN,
  system,
  effort = 'max',
  temperature,
  maxOutputTokens,
  includeThoughts = false,
  retries = 2,
  baseDelayMs = 1200,
  signal,
} = {}) {
  if (!prompt) throw new Error('prompt is required');
  const { ai } = await getClient();

  const config = { thinkingConfig: thinkingFor(effort, includeThoughts) };
  if (system) config.systemInstruction = system;
  if (Number.isFinite(temperature)) config.temperature = temperature;
  if (Number.isFinite(maxOutputTokens)) config.maxOutputTokens = maxOutputTokens;

  let attempts = 0;
  let lastError = null;

  for (const model of chain) {
    for (let round = 0; round <= retries; round += 1) {
      attempts += 1;
      try {
        const res = await ai.models.generateContent({ model, contents: prompt, config, ...(signal ? { signal } : {}) });
        const thoughts = collectThoughts(res);
        return {
          text: res.text ?? '',
          model,
          usage: res.usageMetadata ?? null,
          thoughts,
          attempts,
        };
      } catch (err) {
        lastError = err;
        if (!isRetryable(err)) {
          // A hard error such as INVALID_ARGUMENT will not improve on another model.
          throw err;
        }
        if (round < retries) await sleep(baseDelayMs * 2 ** round);
      }
    }
  }
  throw lastError ?? new Error('all models in the chain failed');
}

/** Extracts any thought parts the model returned alongside its answer. */
function collectThoughts(res) {
  const parts = res?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  const thoughts = parts.filter((p) => p?.thought && typeof p.text === 'string').map((p) => p.text);
  return thoughts.length ? thoughts.join('\n') : null;
}

/** Runs many prompts with bounded concurrency, preserving input order. */
export async function generateBatch(prompts, { concurrency = 4, onResult, ...options } = {}) {
  const results = new Array(prompts.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, prompts.length)) }, async () => {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= prompts.length) return;
      try {
        results[index] = { ok: true, ...(await generate({ prompt: prompts[index], ...options })) };
      } catch (err) {
        results[index] = { ok: false, error: explain(err), prompt: prompts[index] };
      }
      onResult?.(index, results[index]);
    }
  });

  await Promise.all(workers);
  return results;
}

export async function listModels() {
  const { ai } = await getClient();
  const names = [];
  for await (const m of await ai.models.list()) names.push(m.name);
  return names;
}

export async function embed(text, { model = DEFAULT_EMBED_MODEL } = {}) {
  const { ai } = await getClient();
  const res = await ai.models.embedContent({ model, contents: text });
  const values = res.embeddings?.[0]?.values ?? [];
  return { model, dimensions: values.length, values };
}

export async function countTokens(text, { model = DEFAULT_CHAIN[0] } = {}) {
  const { ai } = await getClient();
  const res = await ai.models.countTokens({ model, contents: text });
  return { model, totalTokens: res.totalTokens };
}

/** Streams a response, yielding text pieces. */
export async function* stream({ prompt, model = DEFAULT_CHAIN[0], system, effort = 'max', temperature, maxOutputTokens, includeThoughts = false }) {
  const { ai } = await getClient();
  const config = { thinkingConfig: thinkingFor(effort, includeThoughts) };
  if (system) config.systemInstruction = system;
  if (Number.isFinite(temperature)) config.temperature = temperature;
  if (Number.isFinite(maxOutputTokens)) config.maxOutputTokens = maxOutputTokens;

  const handle = await ai.models.generateContentStream({ model, contents: prompt, config });
  for await (const chunk of handle) {
    const piece = chunk.text ?? '';
    if (piece) yield piece;
  }
}
