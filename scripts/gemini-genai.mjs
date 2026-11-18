#!/usr/bin/env node
/**
 * Gemini via the official @google/genai SDK -- full-power CLI.
 *
 * Defaults to the strongest models available on the key (gemini-4-argon first),
 * maximum thinking budget, automatic fallback down the chain, retry with
 * backoff on 429/5xx, and bounded-concurrency batching.
 *
 * Usage
 *   node scripts/gemini-genai.mjs "your prompt"
 *   node scripts/gemini-genai.mjs --effort minimal "quick question"
 *   node scripts/gemini-genai.mjs --thoughts "hard problem"      # show reasoning
 *   node scripts/gemini-genai.mjs --model gemini-3.8-flash "hi"
 *   node scripts/gemini-genai.mjs --stream "count to five"
 *   node scripts/gemini-genai.mjs --batch prompts.txt --concurrency 8
 *   echo "one prompt per line" | node scripts/gemini-genai.mjs --batch -
 *   node scripts/gemini-genai.mjs models
 *   node scripts/gemini-genai.mjs count "some text"
 *   node scripts/gemini-genai.mjs embed "some text"
 *   node scripts/gemini-genai.mjs chain                        # show fallback order
 *
 * Exit codes: 0 ok, 1 usage, 2 no key, 3 upstream error.
 */
import { readFileSync } from 'node:fs';
import { DEFAULT_CHAIN, EFFORTS, countTokens, embed, explain, generate, generateBatch, listModels, thinkingFor } from './lib/genai-core.mjs';

const DEFAULT_EFFORT = process.env.GEMINI_EFFORT ?? 'max';

const USAGE = `usage: gemini-genai.mjs [options] <prompt>
       gemini-genai.mjs [options] models|count|embed|chain <text>
       gemini-genai.mjs [options] --batch <file|->

options
  --model <id>          pin one model (disables fallback)
  --chain <a,b,c>       custom fallback order (default ${DEFAULT_CHAIN.join(',')})
  --effort <level>      thinking budget: ${EFFORTS.join('|')} (default ${DEFAULT_EFFORT})
  --thoughts            include the model's reasoning in the output
  --system <text>       system instruction
  --temperature <n>     sampling temperature
  --max-tokens <n>      cap output tokens
  --stream              stream the response
  --batch <file|->      one prompt per line; - reads stdin
  --concurrency <n>     parallel requests in batch mode (default 4)
  --json                machine-readable output
  --show-source         print key origin and SDK version (never the key)`;

function parseArgs(argv) {
  const opts = { prompt: [], effort: DEFAULT_EFFORT, concurrency: 4, stream: false, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[++i];
    if (arg === '--model') {
      opts.model = next();
      opts.modelSet = true;
    } else if (arg === '--chain') opts.chain = String(next()).split(',').map((s) => s.trim()).filter(Boolean);
    else if (arg === '--effort') opts.effort = next();
    else if (arg === '--thoughts') opts.thoughts = true;
    else if (arg === '--system') opts.system = next();
    else if (arg === '--temperature') opts.temperature = Number(next());
    else if (arg === '--max-tokens') opts.maxOutputTokens = Number(next());
    else if (arg === '--stream') opts.stream = true;
    else if (arg === '--batch') opts.batch = next();
    else if (arg === '--concurrency') opts.concurrency = Number(next());
    else if (arg === '--json') opts.json = true;
    else if (arg === '--show-source') opts.showSource = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else opts.prompt.push(arg);
  }
  if (opts.modelSet) opts.chain = [opts.model];
  return opts;
}

function readLines(source) {
  const text = source === '-' ? readFileSync(0, 'utf8') : readFileSync(source, 'utf8');
  return text.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(USAGE);
    return 0;
  }

  // Validate effort before doing anything expensive.
  try {
    thinkingFor(opts.effort);
  } catch (err) {
    console.error(err.message);
    return 1;
  }

  if (opts.showSource) {
    const { installKey } = await import('./lib/gemini-key.mjs');
    const { loadGenAI } = await import('./lib/genai.mjs');
    const key = installKey();
    const { version } = await loadGenAI();
    console.error(`# key: ${key.origin} (${key.hint})\n# @google/genai v${version}\n# effort: ${opts.effort}`);
  }

  const [first] = opts.prompt;

  if (first === 'chain') {
    const chain = opts.chain ?? DEFAULT_CHAIN;
    if (opts.json) console.log(JSON.stringify({ chain, effort: opts.effort, thinking: thinkingFor(opts.effort) }, null, 2));
    else {
      console.log(`fallback chain (effort ${opts.effort}, thinking ${JSON.stringify(thinkingFor(opts.effort))}):`);
      chain.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
    }
    return 0;
  }

  try {
    if (first === 'models') {
      const names = await listModels();
      if (opts.json) console.log(JSON.stringify({ count: names.length, models: names }, null, 2));
      else console.log(`${names.length} models:\n${names.map((n) => `  ${n}`).join('\n')}`);
      return 0;
    }

    const text = (first === 'count' || first === 'embed' ? opts.prompt.slice(1) : opts.prompt).join(' ').trim();

    if (first === 'count') {
      if (!text) throw new UsageError('count needs text');
      const res = await countTokens(text);
      if (opts.json) console.log(JSON.stringify(res));
      else console.log(`${res.totalTokens} tokens`);
      return 0;
    }

    if (first === 'embed') {
      if (!text) throw new UsageError('embed needs text');
      const res = await embed(text, opts.modelSet ? { model: opts.model } : {});
      if (opts.json) console.log(JSON.stringify({ model: res.model, dimensions: res.dimensions, preview: res.values.slice(0, 8) }));
      else console.log(`${res.dimensions} dimensions\nfirst 8: ${res.values.slice(0, 8).map((v) => v.toFixed(6)).join(', ')}`);
      return 0;
    }

    if (opts.batch) {
      const prompts = readLines(opts.batch);
      if (!prompts.length) throw new UsageError('--batch file contained no prompts');
      const started = Date.now();
      const results = await generateBatch(prompts, {
        concurrency: opts.concurrency,
        chain: opts.chain,
        effort: opts.effort,
        system: opts.system,
        temperature: opts.temperature,
        maxOutputTokens: opts.maxOutputTokens,
        includeThoughts: opts.thoughts,
        onResult: opts.json ? undefined : (i, r) => {
          console.error(`# ${i + 1}/${prompts.length} ${r.ok ? r.model : 'FAILED'}`);
        },
      });
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
      if (opts.json) {
        console.log(JSON.stringify({ count: results.length, elapsedSeconds: Number(elapsed), concurrency: opts.concurrency, results }, null, 2));
      } else {
        results.forEach((r, i) => {
          console.log(`--- [${i + 1}] ${r.ok ? r.model : 'FAILED'}${r.ok ? '' : ` (${r.error})`}`);
          console.log(r.ok ? (r.text ?? '').trim() : '');
        });
        console.error(`# ${results.filter((r) => r.ok).length}/${results.length} ok in ${elapsed}s at concurrency ${opts.concurrency}`);
      }
      return results.every((r) => r.ok) ? 0 : 3;
    }

    if (opts.stream) {
      const { stream } = await import('./lib/genai-core.mjs');
      let full = '';
      for await (const piece of stream({
        prompt: text,
        model: (opts.chain ?? DEFAULT_CHAIN)[0],
        system: opts.system,
        effort: opts.effort,
        temperature: opts.temperature,
        maxOutputTokens: opts.maxOutputTokens,
        includeThoughts: opts.thoughts,
      })) {
        full += piece;
        if (!opts.json) process.stdout.write(piece);
      }
      if (opts.json) console.log(JSON.stringify({ model: (opts.chain ?? DEFAULT_CHAIN)[0], text: full }));
      else process.stdout.write('\n');
      return 0;
    }

    if (!text) throw new UsageError('a prompt is required');

    const result = await generate({
      prompt: text,
      chain: opts.chain,
      system: opts.system,
      effort: opts.effort,
      temperature: opts.temperature,
      maxOutputTokens: opts.maxOutputTokens,
      includeThoughts: opts.thoughts,
    });

    if (opts.json) {
      console.log(JSON.stringify({ model: result.model, text: result.text, thoughts: result.thoughts, usage: result.usage, attempts: result.attempts }, null, 2));
    } else {
      if (opts.thoughts && result.thoughts) console.log(`[thinking]\n${result.thoughts}\n[/thinking]\n`);
      console.log(result.text ?? '');
      if (process.env.GEMINI_VERBOSE === '1') console.error(`# ${result.model}, ${result.attempts} attempt(s)`);
    }
    return 0;
  } catch (err) {
    if (err instanceof UsageError) {
      console.error(`${err.message}\n\n${USAGE}`);
      return 1;
    }
    console.error(`error: ${explain(err)}`);
    return 3;
  }
}

class UsageError extends Error {}

process.exitCode = await main();
