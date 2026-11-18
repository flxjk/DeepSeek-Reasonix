/**
 * Resolves a Gemini credential without ever printing it.
 *
 * DSH and most non-interactive shells do not source `~/.zshrc`, so a key that
 * works in your terminal is invisible to a script run from the harness. This
 * module closes that gap: it checks the process environment first, then falls
 * back to the shell profiles on disk.
 *
 * `AQ.…` tokens (Antigravity OAuth) and `AIza…` keys (AI Studio) are both
 * accepted by `@google/genai` when passed as `apiKey`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HOME = homedir();

/** Variables checked in order. */
const NAMES = ['GEMINI_API_KEY', 'GOOGLE_GENAI_API_KEY', 'GOOGLE_API_KEY'];

/** Shell profiles scanned when the environment has nothing. */
const PROFILES = [
  join(HOME, '.zshrc'),
  join(HOME, '.zshenv'),
  join(HOME, '.zprofile'),
  join(HOME, '.bashrc'),
  join(HOME, '.bash_profile'),
  join(HOME, '.profile'),
];

/**
 * Reads `NAME=value` out of a shell profile. Handles `export`, single quotes,
 * double quotes and a trailing comment. Intentionally does not evaluate the
 * file -- nothing in it gets executed.
 */
function readFromProfile(path, names) {
  if (!existsSync(path)) return null;
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return null;
  }
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);
    if (!match) continue;
    const [, name, rawValue] = match;
    if (!names.includes(name)) continue;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      value = value.split(/\s+#/)[0].trim();
    }
    // Expand a leading $HOME / ${HOME} so profiles that indirect still work.
    value = value.replace(/^\$(?:\{HOME\}|HOME)\//, `${HOME}/`);
    if (value) return { value, name };
  }
  return null;
}

/**
 * @returns {{ value: string, origin: string }}
 * @throws when nothing is found, with the list of places checked.
 */
export function loadKey() {
  for (const name of NAMES) {
    const value = process.env[name];
    if (value) return { value, origin: `$${name}` };
  }
  for (const profile of PROFILES) {
    const hit = readFromProfile(profile, NAMES);
    if (hit) {
      return {
        value: hit.value,
        origin: `${profile.replace(HOME, '~')} ($${hit.name})`,
      };
    }
  }
  throw new Error(
    `no Gemini key found. Checked ${NAMES.map((n) => `$${n}`).join(', ')} and ` +
      `${PROFILES.map((p) => p.replace(HOME, '~')).join(', ')}. ` +
      'Set GEMINI_API_KEY in your environment or in ~/.zshrc.',
  );
}

/** Exports the resolved key into `process.env` so the SDK sees it too. */
export function installKey() {
  const { value, origin } = loadKey();
  // Deliberately sets only these two. Populating GOOGLE_API_KEY as well makes
  // the SDK warn "Both GOOGLE_API_KEY and GEMINI_API_KEY are set", because it
  // reads every alias it knows and complains about the ambiguity.
  for (const name of ['GEMINI_API_KEY', 'GOOGLE_GENAI_API_KEY']) {
    if (!process.env[name]) process.env[name] = value;
  }
  return { origin, hint: `${value.slice(0, 4)}…${value.length} chars` };
}
