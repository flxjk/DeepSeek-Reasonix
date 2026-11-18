#!/usr/bin/env node
/**
 * Verification for the gemini-js path.
 *
 * Almost everything here runs offline. The load-bearing check is `auth plumbing`:
 * it stubs `globalThis.fetch`, drives a real `generateContent` call, and asserts
 * which header the SDK emitted. That proves the credential mode actually reaches
 * the wire rather than merely being constructed.
 *
 * `--live` adds network checks that need a real credential.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { AuthError, createClient, explain, DEFAULT_MODEL } from '../src/client.mjs';
import { describe, resolve } from '../src/auth.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(ROOT, 'src', 'cli.mjs');
const LIVE = process.argv.includes('--live');

let passed = 0;
let failed = 0;
const failures = [];

function check(name, fn) {
  try {
    const detail = fn();
    passed += 1;
    console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (err) {
    failed += 1;
    failures.push({ name, message: err.message });
    console.log(`  FAIL  ${name} — ${err.message}`);
  }
}

async function checkAsync(name, fn) {
  try {
    const detail = await fn();
    passed += 1;
    console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (err) {
    failed += 1;
    failures.push({ name, message: err.message });
    console.log(`  FAIL  ${name} — ${err.message}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function runCli(args, env = {}) {
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...args], {
      encoding: 'utf8',
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, stdout };
  } catch (err) {
    return { code: err.status ?? -1, stdout: err.stdout ?? '', stderr: err.stderr ?? '' };
  }
}

/** Installs a fetch stub that records the last request and replies with a canned body. */
function stubFetch(bodyFor = () => ({ candidates: [{ content: { parts: [{ text: 'stub-ok' }] } }] })) {
  const original = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url, init = {}) => {
    const headers = {};
    if (init.headers) {
      const h = init.headers instanceof Headers ? init.headers : new Headers(init.headers);
      for (const [k, v] of h) headers[k.toLowerCase()] = v;
    }
    seen.push({ url: String(url), headers });
    return new Response(JSON.stringify(bodyFor(String(url))), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
  return {
    seen,
    restore() {
      globalThis.fetch = original;
    },
  };
}

const clearCredentialEnv = () => {
  for (const k of [
    'GOOGLE_GENAI_API_KEY',
    'GEMINI_API_KEY',
    'GOOGLE_API_KEY',
    'GOOGLE_GENAI_ACCESS_TOKEN',
    'GOOGLE_OAUTH_CLIENT_ID',
    'GOOGLE_OAUTH_CLIENT_SECRET',
  ]) {
    delete process.env[k];
  }
};

console.log('gemini-js verification\n');
console.log(`node ${process.version}  model default ${DEFAULT_MODEL}`);

// ---------------------------------------------------------------- package
console.log('\npackage');
check('@google/genai resolves at the pinned version', () => {
  const pkgPath = join(ROOT, 'node_modules', '@google', 'genai', 'package.json');
  assert(existsSync(pkgPath), 'node_modules/@google/genai is missing — run npm install');
  const version = JSON.parse(readFileSync(pkgPath, 'utf8')).version;
  assert(version === '3.1.0', `expected 3.1.0, found ${version}`);
  return `v${version}`;
});

check('@google/genai is a direct dependency, not transitive', () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert(manifest.dependencies?.['@google/genai'], 'not listed in dependencies');
  return manifest.dependencies['@google/genai'];
});

// ---------------------------------------------------------------- auth model
console.log('\nauth resolution');
await checkAsync('every known source is reported, in precedence order', async () => {
  clearCredentialEnv();
  const { report } = await resolve();
  const ids = report.map((r) => r.id);
  assert(ids.length === 5, `expected 5 sources, got ${ids.length}`);
  assert(ids[0] === 'env:api-key', `api key must outrank everything, got ${ids[0]}`);
  assert(ids[1] === 'env:access-token', `env token must be second, got ${ids[1]}`);
  assert(ids.at(-1) === 'file:gcloud-adc', `ADC must be last, got ${ids.at(-1)}`);
  return ids.join(' > ');
});

await checkAsync('an API key in the environment wins and marks itself selected', async () => {
  clearCredentialEnv();
  process.env.GOOGLE_GENAI_API_KEY = 'unit-test-key';
  const res = await resolve();
  assert(res.ok, 'expected a usable credential');
  assert(res.mode === 'api_key', `expected api_key, got ${res.mode}`);
  assert(res.sourceId === 'env:api-key', `expected env:api-key, got ${res.sourceId}`);
  assert(res.report.filter((r) => r.selected).length === 1, 'exactly one source may be selected');
  clearCredentialEnv();
  return res.sourceId;
});

await checkAsync('a bearer token is used when no API key exists', async () => {
  clearCredentialEnv();
  process.env.GOOGLE_GENAI_ACCESS_TOKEN = 'unit-test-token';
  const res = await resolve();
  assert(res.ok, 'expected a usable credential');
  assert(res.mode === 'access_token', `expected access_token, got ${res.mode}`);
  assert(res.sourceId === 'env:access-token', `expected env:access-token, got ${res.sourceId}`);
  clearCredentialEnv();
  return res.sourceId;
});

await checkAsync('no credential produces a full diagnostic, not a throw', async () => {
  clearCredentialEnv();
  const res = await resolve();
  if (res.ok) return 'a real credential is present; absence path not exercised';
  assert(res.report.length === 5, 'report must still list all sources');
  assert(!res.mode, 'mode must be unset when nothing resolved');
  return 'ok=false with 5-row report';
});

// ---------------------------------------------------------------- the wire
console.log('\nauth plumbing (stubbed fetch, no network)');

await checkAsync('api_key mode emits x-goog-api-key and no Authorization', async () => {
  clearCredentialEnv();
  process.env.GOOGLE_GENAI_API_KEY = 'unit-test-key';
  const stub = stubFetch();
  try {
    const { ai } = await createClient();
    await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'hi' });
  } finally {
    stub.restore();
    clearCredentialEnv();
  }
  assert(stub.seen.length === 1, `expected 1 request, saw ${stub.seen.length}`);
  const h = stub.seen[0].headers;
  assert(h['x-goog-api-key'] === 'unit-test-key', `x-goog-api-key was ${h['x-goog-api-key'] ?? 'absent'}`);
  assert(!h.authorization, `Authorization must not be set, saw ${h.authorization}`);
  return 'x-goog-api-key present, Authorization absent';
});

await checkAsync('access_token mode emits Authorization: Bearer and no x-goog-api-key', async () => {
  clearCredentialEnv();
  process.env.GOOGLE_GENAI_ACCESS_TOKEN = 'unit-test-token';
  const stub = stubFetch();
  try {
    const { ai } = await createClient();
    await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'hi' });
  } finally {
    stub.restore();
    clearCredentialEnv();
  }
  assert(stub.seen.length === 1, `expected 1 request, saw ${stub.seen.length}`);
  const h = stub.seen[0].headers;
  assert(
    h.authorization === 'Bearer unit-test-token',
    `Authorization was ${h.authorization ?? 'absent'}`,
  );
  assert(!h['x-goog-api-key'], `x-goog-api-key must be absent, saw ${h['x-goog-api-key']}`);
  return 'Bearer header present, api-key header absent';
});

await checkAsync('a valid stub response is parsed back into text', async () => {
  clearCredentialEnv();
  process.env.GOOGLE_GENAI_ACCESS_TOKEN = 'unit-test-token';
  const stub = stubFetch();
  try {
    const { ai } = await createClient();
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'hi' });
    assert(res.text === 'stub-ok', `expected stub-ok, got ${JSON.stringify(res.text)}`);
  } finally {
    stub.restore();
    clearCredentialEnv();
  }
  return 'round-trip ok';
});

await checkAsync('the request targets generativelanguage, not a proxy', async () => {
  clearCredentialEnv();
  process.env.GOOGLE_GENAI_ACCESS_TOKEN = 'unit-test-token';
  const stub = stubFetch();
  try {
    const { ai } = await createClient();
    await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'hi' });
  } finally {
    stub.restore();
    clearCredentialEnv();
  }
  const url = stub.seen[0].url;
  assert(url.includes('generativelanguage.googleapis.com'), `unexpected host: ${url}`);
  assert(!/openrouter/i.test(url), 'must not route through OpenRouter');
  return new URL(url).host;
});

// ---------------------------------------------------------------- errors
console.log('\nerror handling');

await checkAsync('missing credential raises AuthError carrying the report', async () => {
  clearCredentialEnv();
  const res = await resolve();
  if (res.ok) return 'a real credential is present; skipped';
  let threw = null;
  try {
    await createClient();
  } catch (err) {
    threw = err;
  }
  assert(threw instanceof AuthError, `expected AuthError, got ${threw?.name ?? 'nothing'}`);
  assert(Array.isArray(threw.report) && threw.report.length === 5, 'AuthError must carry the 5-row report');
  return 'AuthError with report';
});

check('explain() truncates long token-like strings', () => {
  const secret = 'AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
  const out = explain(new Error(`bad key ${secret}`));
  assert(!out.includes(secret), 'the raw secret survived redaction');
  assert(out.includes('redacted'), `expected a redaction marker, got: ${out}`);
  return 'secrets shortened';
});

// ---------------------------------------------------------------- redaction
console.log('\nredaction');

check('no credential value appears in the auth report', () => {
  const secret = 'unit-test-key-do-not-print-0123456789';
  const out = runCli(['auth', '--json'], { GOOGLE_GENAI_API_KEY: secret });
  assert(!out.stdout.includes(secret), 'the API key leaked into `auth --json` output');
  return 'api key absent from output';
});

check('the on-disk OAuth token never reaches stdout', () => {
  const out = runCli(['auth', '--json']);
  assert(!/ya29\./.test(out.stdout), 'a Google access token pattern appeared in output');
  assert(!/1\/\/0/.test(out.stdout), 'a Google refresh token pattern appeared in output');
  return 'no token patterns';
});

// ---------------------------------------------------------------- cli contract
console.log('\ncli contract');

check('`auth --json` emits parseable JSON', () => {
  const out = runCli(['auth', '--json']);
  const parsed = JSON.parse(out.stdout);
  assert(typeof parsed.ok === 'boolean', 'ok must be boolean');
  assert(Array.isArray(parsed.report), 'report must be an array');
  return `${parsed.report.length} rows, ok=${parsed.ok}`;
});

check('`auth` exits 2 when nothing resolves (or 0 when it does)', () => {
  const out = runCli(['auth']);
  const resolution = runCli(['auth', '--json']);
  const ok = JSON.parse(resolution.stdout).ok;
  assert(out.code === (ok ? 0 : 2), `expected exit ${ok ? 0 : 2}, got ${out.code}`);
  return `exit ${out.code}`;
});

check('unknown command exits 1', () => {
  const out = runCli(['definitely-not-a-command']);
  assert(out.code === 1, `expected exit 1, got ${out.code}`);
  return `exit ${out.code}`;
});

check('`ask` with an empty prompt exits 1 before touching the network', () => {
  const out = runCli(['ask'], { GOOGLE_GENAI_API_KEY: 'unit-test-key' });
  assert(out.code === 1, `expected exit 1, got ${out.code}`);
  return `exit ${out.code}`;
});

check('`help` exits 0 and lists every command', () => {
  const out = runCli(['help']);
  assert(out.code === 0, `expected exit 0, got ${out.code}`);
  for (const cmd of ['auth', 'models', 'ask', 'stream', 'embed', 'count']) {
    assert(out.stdout.includes(cmd), `help omits '${cmd}'`);
  }
  return '6 commands documented';
});

// ---------------------------------------------------------------- live
console.log('\nlive checks');
if (!LIVE) {
  console.log('  SKIP  --live not requested');
} else {
  await checkAsync('a real round-trip succeeds', async () => {
    const { ai, model } = await createClient();
    const res = await ai.models.generateContent({ model, contents: 'Reply with exactly one word: OK' });
    assert(res.text, 'no text came back');
    return `${model} -> ${res.text.trim().slice(0, 20)}`;
  });
  await checkAsync('models.list works with this credential', async () => {
    const { ai } = await createClient();
    let count = 0;
    for await (const _ of await ai.models.list()) count += 1;
    assert(count > 0, 'no models listed');
    return `${count} models`;
  });
}

// ---------------------------------------------------------------- summary
console.log(`\n${passed} passed, ${failed} failed`);
if (failed) {
  console.log('\nfailures:');
  for (const f of failures) console.log(`  - ${f.name}: ${f.message}`);
}
process.exitCode = failed ? 1 : 0;
