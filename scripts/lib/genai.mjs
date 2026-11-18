/**
 * Locates `@google/genai` without requiring a root `node_modules`.
 *
 * This repo root is a Go module, so installing the SDK here would mean
 * committing a root `package.json` and `node_modules` that have nothing to do
 * with the Go build. Instead the SDK lives in `gemini-js/`, and this resolves it
 * from there, falling back to a normal import when run from inside that package.
 */
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');

/** Directories that might own a node_modules containing the SDK. */
const HOMES = [REPO, join(REPO, 'gemini-js'), join(REPO, 'scripts')];

let cached = null;

/**
 * @returns {Promise<{ GoogleGenAI: any, version: string, from: string }>}
 */
export async function loadGenAI() {
  if (cached) return cached;

  // Preferred: a plain import when the caller already sits next to the SDK.
  try {
    const mod = await import('@google/genai');
    cached = { ...mod, version: readVersion(REPO), from: 'node resolution' };
    return cached;
  } catch (err) {
    if (err?.code !== 'ERR_MODULE_NOT_FOUND') throw err;
  }

  for (const home of HOMES) {
    const manifest = join(home, 'package.json');
    if (!existsSync(manifest)) continue;
    let entry;
    try {
      entry = createRequire(manifest).resolve('@google/genai');
    } catch {
      continue;
    }
    const mod = await import(pathToFileURL(entry).href);
    cached = { ...mod, version: readVersion(home), from: home };
    return cached;
  }

  throw new Error(
    `@google/genai is not installed. Run:\n  cd ${join(REPO, 'gemini-js')} && npm install`,
  );
}

function readVersion(home) {
  try {
    const pkg = JSON.parse(
      readFileSync(join(home, 'node_modules', '@google', 'genai', 'package.json'), 'utf8'),
    );
    return pkg.version;
  } catch {
    return 'unknown';
  }
}
