#!/usr/bin/env node
/**
 * MCP server exposing the Gemini API over stdio.
 *
 * Tools
 *   gemini_generate        one prompt through the fallback chain
 *   gemini_batch           many prompts with bounded concurrency
 *   gemini_embed           embeddings
 *   gemini_count_tokens    token accounting before you spend them
 *   gemini_models          what the key can reach
 *   gemini_chain           the fallback order and thinking budget in force
 *
 * Run standalone to test:
 *   printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node scripts/gemini-api-server.mjs
 */
import { createInterface } from 'node:readline';

import {
  DEFAULT_CHAIN,
  DEFAULT_EMBED_MODEL,
  EFFORTS,
  countTokens,
  embed,
  explain,
  generate,
  generateBatch,
  listModels,
  thinkingFor,
} from './lib/genai-core.mjs';

const SERVER_NAME = 'gemini-api';
const SERVER_VERSION = '1.0.0';
const DEFAULT_PROTOCOL = '2025-06-18';
const SUPPORTED_PROTOCOLS = new Set(['2024-11-05', '2025-03-26', '2025-06-18']);

const promptProp = { type: 'string', description: 'The prompt to send.' };
const effortProp = {
  type: 'string',
  enum: EFFORTS,
  description: `Thinking budget: ${EFFORTS.join(', ')}. Default max.`,
};
const systemProp = { type: 'string', description: 'System instruction.' };
const chainProp = {
  type: 'array',
  items: { type: 'string' },
  description: `Fallback order. Default: ${DEFAULT_CHAIN.join(', ')}.`,
};

const TOOLS = [
  {
    name: 'gemini_generate',
    description:
      'Generate text with Gemini. Walks a model fallback chain (gemini-4-argon first), retries ' +
      '429/5xx with backoff, and runs with the maximum thinking budget by default.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: promptProp,
        system: systemProp,
        effort: effortProp,
        chain: chainProp,
        temperature: { type: 'number' },
        maxOutputTokens: { type: 'number' },
        includeThoughts: { type: 'boolean', description: 'Return the reasoning trace too.' },
      },
      required: ['prompt'],
      additionalProperties: false,
    },
  },
  {
    name: 'gemini_batch',
    description:
      'Run many prompts in parallel with bounded concurrency. Returns results in input order, ' +
      'each marked ok or failed, so one bad prompt does not sink the batch.',
    inputSchema: {
      type: 'object',
      properties: {
        prompts: { type: 'array', items: { type: 'string' }, minItems: 1 },
        concurrency: { type: 'number', description: 'Parallel requests. Default 4.' },
        system: systemProp,
        effort: effortProp,
        chain: chainProp,
      },
      required: ['prompts'],
      additionalProperties: false,
    },
  },
  {
    name: 'gemini_embed',
    description: `Embed text. Default model ${DEFAULT_EMBED_MODEL} (3072 dimensions).`,
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        model: { type: 'string', description: `Default ${DEFAULT_EMBED_MODEL}.` },
      },
      required: ['text'],
      additionalProperties: false,
    },
  },
  {
    name: 'gemini_count_tokens',
    description: 'Count tokens for text without generating anything.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' }, model: { type: 'string' } },
      required: ['text'],
      additionalProperties: false,
    },
  },
  {
    name: 'gemini_models',
    description: 'List every model the configured key can reach.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'gemini_chain',
    description: 'Report the fallback chain, default effort and the thinking budget it maps to.',
    inputSchema: {
      type: 'object',
      properties: { effort: effortProp },
      additionalProperties: false,
    },
  },
];

async function callTool(name, args = {}) {
  switch (name) {
    case 'gemini_generate':
      return generate({
        prompt: args.prompt,
        system: args.system,
        effort: args.effort ?? 'max',
        chain: args.chain ?? DEFAULT_CHAIN,
        temperature: args.temperature,
        maxOutputTokens: args.maxOutputTokens,
        includeThoughts: args.includeThoughts ?? false,
      });

    case 'gemini_batch': {
      const prompts = args.prompts ?? [];
      if (!prompts.length) throw new Error('prompts must not be empty');
      const results = await generateBatch(prompts, {
        concurrency: args.concurrency ?? 4,
        system: args.system,
        effort: args.effort ?? 'low',
        chain: args.chain ?? DEFAULT_CHAIN,
      });
      return {
        count: results.length,
        ok: results.filter((r) => r.ok).length,
        failed: results.filter((r) => !r.ok).length,
        results: results.map((r) => (r.ok ? { ok: true, model: r.model, text: r.text } : { ok: false, error: r.error })),
      };
    }

    case 'gemini_embed': {
      const res = await embed(args.text, args.model ? { model: args.model } : {});
      return { model: res.model, dimensions: res.dimensions, preview: res.values.slice(0, 8) };
    }

    case 'gemini_count_tokens':
      return countTokens(args.text, args.model ? { model: args.model } : {});

    case 'gemini_models': {
      const models = await listModels();
      return { count: models.length, models };
    }

    case 'gemini_chain': {
      const effort = args.effort ?? 'max';
      return { chain: DEFAULT_CHAIN, effort, thinkingConfig: thinkingFor(effort) };
    }

    default:
      throw new Error(`unknown tool '${name}'`);
  }
}

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function reply(id, result) {
  send({ jsonrpc: '2.0', id, result });
}

function replyError(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

async function handle(msg) {
  const { id, method, params } = msg;
  const isNotification = id === undefined || id === null;

  switch (method) {
    case 'initialize': {
      const asked = params?.protocolVersion;
      reply(id, {
        protocolVersion: SUPPORTED_PROTOCOLS.has(asked) ? asked : DEFAULT_PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
      });
      return;
    }
    case 'notifications/initialized':
    case 'initialized':
      return;
    case 'ping':
      if (!isNotification) reply(id, {});
      return;
    case 'tools/list':
      reply(id, { tools: TOOLS });
      return;
    case 'tools/call': {
      const name = params?.name;
      const args = params?.arguments ?? {};
      try {
        const out = await callTool(name, args);
        reply(id, { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }], isError: false });
      } catch (err) {
        reply(id, {
          content: [{ type: 'text', text: `error: ${explain(err)}` }],
          isError: true,
        });
      }
      return;
    }
    default:
      if (!isNotification) replyError(id, -32601, `method not found: ${method}`);
  }
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
let queue = Promise.resolve();

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    replyError(null, -32700, 'parse error');
    return;
  }
  // Serialize handling so responses cannot interleave on stdout.
  queue = queue.then(() => handle(msg)).catch((err) => {
    if (msg?.id !== undefined) replyError(msg.id, -32603, explain(err));
  });
});

rl.on('close', () => {
  queue.finally(() => process.exit(0));
});
