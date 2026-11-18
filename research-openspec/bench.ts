#!/usr/bin/env node
/**
 * Benchmarks a local Ollama model on the real extraction task:
 * pull normative invariants out of a research study's prose.
 *
 * Streams the response so long generations do not hit a headers timeout,
 * and reports prefill / generation throughput plus the extracted invariants.
 */
import { readFileSync } from 'node:fs';

const MODEL: string = process.env['MODEL'] ?? 'qwen3.5:9b-mlx';
const HOST: string = process.env['OLLAMA'] ?? 'http://127.0.0.1:11434';
const STUDY: string = process.argv[2] ?? 'edge-coding-models-and-accelerators';
const RHEX: string = '/Users/gj/git/rhex';

const GOLD = [
  'Doubly-stochastic routing matrix P satisfies rowSum(P) == 1 and colSum(P) == 1',
  'Zero raw node:* imports in emitter adapters; 100% programmatic emission from TypeSpec contracts',
  'CLI shims remain <= 30 lines and emit 0 bytes on exit code 0',
  'Sub-millisecond (< 0.8ms) IPC round-trip latency via pre-allocated slab BufferPool recycling',
];

const text = readFileSync(`${RHEX}/docs/rhex/research/${STUDY}.md`, 'utf8');

const system = `You extract normative invariants from engineering research prose.

An invariant is a statement that is:
- checkable: it names a number, a threshold, a structural constraint, or a prohibition
- about the system being built, not about the document
- expressible as one sentence

GOOD examples:
${GOLD.map((g) => `- ${g}`).join('\n')}

BAD examples (section headings, not invariants):
- "Section invariant codified: Executive assessment"
- "Section invariant codified: Role: user"

Rules:
- Every statement must be supported by an exact quote from the text.
- Do not invent numbers. If the text gives no number, do not add one.
- If the text contains no real invariant, return an empty list.
- Prefer 0 to 5 invariants. Quality over quantity.

Return JSON only: {"invariants":[{"statement":"...","quote":"..."}]}`;

interface OllamaChunk {
  message?: { content?: string; thinking?: string };
  done?: boolean;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
  load_duration?: number;
}

const t0 = Date.now();
const res = await fetch(`${HOST}/api/chat`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    model: MODEL,
    stream: true,
    format: 'json',
    think: process.env['THINK'] === '1',
    options: {
      temperature: 0,
      num_ctx: Number(process.env['NUMCTX'] ?? 16384),
      num_predict: Number(process.env['MAXTOK'] ?? 4096),
    },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: `TEXT:\n\n${text}` },
    ],
  }),
});

if (!res.ok || !res.body) {
  console.error(`HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}

let content = '';
let thinking = '';
let final: OllamaChunk = {};

const decoder = new TextDecoder();
let buffer = '';

for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
  buffer += decoder.decode(chunk, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() ?? '';
  for (const line of lines) {
    if (!line.trim()) continue;
    let parsed: OllamaChunk;
    try {
      parsed = JSON.parse(line) as OllamaChunk;
    } catch {
      continue;
    }
    if (parsed.message?.content) content += parsed.message.content;
    if (parsed.message?.thinking) thinking += parsed.message.thinking;
    if (parsed.done) final = parsed;
  }
}

const wall = Date.now() - t0;
const prefillTok = final.prompt_eval_count ?? 0;
const prefillNs = final.prompt_eval_duration ?? 0;
const genTok = final.eval_count ?? 0;
const genNs = final.eval_duration ?? 0;

let parsedOut: unknown = null;
try {
  parsedOut = JSON.parse(content);
} catch {
  parsedOut = null;
}

const raw = parsedOut as { invariants?: Array<{ statement?: string; quote?: string }> } | null;
const invariants = Array.isArray(raw?.invariants) ? raw.invariants : [];

console.log(
  JSON.stringify(
    {
      model: MODEL,
      study: STUDY,
      inputBytes: text.length,
      wallMs: wall,
      prefill: {
        tokens: prefillTok,
        tokPerSec: prefillNs > 0 ? Math.round(prefillTok / (prefillNs / 1e9)) : 0,
      },
      generation: {
        tokens: genTok,
        tokPerSec: genNs > 0 ? Math.round(genTok / (genNs / 1e9)) : 0,
      },
      loadMs: Math.round((final.load_duration ?? 0) / 1e6),
      thinkingChars: thinking.length,
      parsedOk: parsedOut !== null,
      invariantsFound: invariants.length,
      invariants,
    },
    null,
    2,
  ),
);
