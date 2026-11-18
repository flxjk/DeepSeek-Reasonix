#!/usr/bin/env node
/**
 * CLI for the `@google/genai` JS path.
 *
 *   node src/cli.mjs auth                 show every credential source and why it lost
 *   node src/cli.mjs models               list models visible to this credential
 *   node src/cli.mjs ask "…"              single generateContent round-trip
 *   node src/cli.mjs stream "…"           streaming round-trip
 *   node src/cli.mjs embed "…"            embedContent
 *   node src/cli.mjs count "…"            countTokens
 *
 * Exit codes: 0 ok, 1 usage error, 2 no credential, 3 upstream/API error.
 */
import { AuthError, createClient, DEFAULT_MODEL, explain } from './client.mjs';
import { describe, resolve } from './auth.mjs';

const [, , command, ...rest] = process.argv;

function parseArgs(argv) {
  const opts = { positional: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') opts.json = true;
    else if (arg === '--model') opts.model = argv[++i];
    else if (arg === '--system') opts.system = argv[++i];
    else opts.positional.push(arg);
  }
  return opts;
}

const USAGE = `usage: gemini-js <command> [options]

commands
  auth              inspect credential sources
  models            list available models
  ask <prompt>      one-shot generation
  stream <prompt>   streaming generation
  embed <text>      embed content
  count <text>      count tokens

options
  --model <id>      model id (default ${DEFAULT_MODEL})
  --system <text>   system instruction
  --json            machine-readable output`;

async function cmdAuth(opts) {
  const resolution = await resolve();
  if (opts.json) {
    console.log(JSON.stringify({ ok: resolution.ok, mode: resolution.mode ?? null, report: resolution.report }, null, 2));
    return resolution.ok ? 0 : 2;
  }
  console.log(`credential: ${describe(resolution)}\n`);
  console.log('sources, in precedence order:');
  for (const row of resolution.report) {
    const mark = row.selected ? '->' : '  ';
    console.log(`${mark} [${row.state.padEnd(11)}] ${row.label}`);
    if (row.note) console.log(`       ${row.note}`);
  }
  return resolution.ok ? 0 : 2;
}

async function withClient(opts) {
  const session = await createClient({ model: opts.model });
  if (!opts.json && process.env.GEMINI_JS_QUIET !== '1') {
    console.error(`# ${describe({ ok: true, mode: session.mode, sourceLabel: session.source, note: session.note })}`);
  }
  return session;
}

async function cmdModels(opts) {
  const { ai, model } = await withClient(opts);
  const names = [];
  for await (const m of await ai.models.list()) {
    names.push({ name: m.name, displayName: m.displayName ?? null });
  }
  if (opts.json) console.log(JSON.stringify({ model, count: names.length, models: names }, null, 2));
  else {
    console.log(`${names.length} models visible to this credential`);
    for (const m of names) console.log(`  ${m.name}`);
  }
  return 0;
}

async function cmdAsk(opts) {
  const prompt = opts.positional.join(' ').trim();
  if (!prompt) throw new UsageError('ask needs a prompt');
  const { ai, model } = await withClient(opts);
  const res = await ai.models.generateContent({
    model,
    contents: prompt,
    ...(opts.system ? { config: { systemInstruction: opts.system } } : {}),
  });
  const text = res.text ?? '';
  if (opts.json) {
    console.log(JSON.stringify({ model, text, usage: res.usageMetadata ?? null }, null, 2));
  } else {
    console.log(text);
  }
  return 0;
}

async function cmdStream(opts) {
  const prompt = opts.positional.join(' ').trim();
  if (!prompt) throw new UsageError('stream needs a prompt');
  const { ai, model } = await withClient(opts);
  const stream = await ai.models.generateContentStream({
    model,
    contents: prompt,
    ...(opts.system ? { config: { systemInstruction: opts.system } } : {}),
  });
  const chunks = [];
  for await (const chunk of stream) {
    const text = chunk.text ?? '';
    chunks.push(text);
    if (!opts.json) process.stdout.write(text);
  }
  if (opts.json) console.log(JSON.stringify({ model, chunks: chunks.length, text: chunks.join('') }, null, 2));
  else process.stdout.write('\n');
  return 0;
}

async function cmdEmbed(opts) {
  const text = opts.positional.join(' ').trim();
  if (!text) throw new UsageError('embed needs text');
  const { ai, model } = await withClient(opts);
  const res = await ai.models.embedContent({ model, contents: text });
  const first = res.embeddings?.[0];
  const values = first?.values ?? [];
  if (opts.json) {
    console.log(JSON.stringify({ model, dimensions: values.length, preview: values.slice(0, 8) }, null, 2));
  } else {
    console.log(`${values.length} dimensions`);
    console.log(`first 8: ${values.slice(0, 8).map((v) => v.toFixed(6)).join(', ')}`);
  }
  return 0;
}

async function cmdCount(opts) {
  const text = opts.positional.join(' ').trim();
  if (!text) throw new UsageError('count needs text');
  const { ai, model } = await withClient(opts);
  const res = await ai.models.countTokens({ model, contents: text });
  if (opts.json) console.log(JSON.stringify({ model, totalTokens: res.totalTokens }, null, 2));
  else console.log(`${res.totalTokens} tokens`);
  return 0;
}

class UsageError extends Error {}

const COMMANDS = {
  auth: cmdAuth,
  models: cmdModels,
  ask: cmdAsk,
  stream: cmdStream,
  embed: cmdEmbed,
  count: cmdCount,
};

async function main() {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(USAGE);
    return command ? 0 : 1;
  }
  const handler = COMMANDS[command];
  if (!handler) {
    console.error(`unknown command '${command}'\n\n${USAGE}`);
    return 1;
  }
  try {
    return await handler(parseArgs(rest));
  } catch (err) {
    if (err instanceof UsageError) {
      console.error(`${err.message}\n\n${USAGE}`);
      return 1;
    }
    if (err instanceof AuthError) {
      console.error(`${err.message}\n\nrun: node src/cli.mjs auth`);
      return 2;
    }
    console.error(`error: ${explain(err)}`);
    return 3;
  }
}

process.exitCode = await main();
