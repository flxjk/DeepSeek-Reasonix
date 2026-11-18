/**
 * Credential resolution for the `@google/genai` JS path.
 *
 * Three modes are supported, matching how the SDK actually authenticates:
 *
 *   api_key       -> sent as `x-goog-api-key`
 *   access_token  -> sent as `Authorization: Bearer …`
 *   vertex        -> google-auth-library via Application Default Credentials
 *
 * The SDK resolves auth in this order (dist/node/index.mjs:19921 `applyAuth`):
 * `api_key` wins, otherwise `access_token`. A bearer token therefore only works
 * when no API key is configured anywhere.
 *
 * Nothing in this module returns a credential to a caller that prints it. Every
 * public shape is a `describe` string with the value already redacted.
 */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HOME = homedir();

/** API-key environment variables, in precedence order. */
const API_KEY_VARS = ['GOOGLE_GENAI_API_KEY', 'GEMINI_API_KEY', 'GOOGLE_API_KEY'];

export const MODE = {
  API_KEY: 'api_key',
  ACCESS_TOKEN: 'access_token',
  VERTEX: 'vertex',
};

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/** Normalises `expiry_date` (ms), `expiry` (ISO) and `expires_in` into epoch ms. */
function expiryMs(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1e11 ? value : value * 1000;
  }
  if (typeof value === 'string') {
    const t = Date.parse(value);
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

function isValid(ms) {
  return ms === null || ms > Date.now();
}

function human(ms) {
  if (ms === null) return 'no expiry recorded';
  const days = (ms - Date.now()) / 86_400_000;
  const stamp = new Date(ms).toISOString().replace('.000Z', 'Z');
  return days >= 0
    ? `expires ${stamp} (in ${days.toFixed(1)}d)`
    : `expired ${stamp} (${Math.abs(days).toFixed(1)}d ago)`;
}

/**
 * Attempts an OAuth refresh. Only possible when the caller supplies the client
 * that minted the token, because Google requires the original client_id.
 * Returns null when it cannot be attempted, and never throws.
 */
async function tryRefresh(refreshToken, { fetchImpl = fetch } = {}) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!refreshToken) return { attempted: false, reason: 'no refresh_token in the credential file' };
  if (!clientId || !clientSecret) {
    return {
      attempted: false,
      reason:
        'set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to the client that minted ' +
        'this token; Google refuses a refresh from any other client',
    };
  }
  try {
    const res = await fetchImpl('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.access_token) {
      return { attempted: true, reason: `refresh rejected: ${json.error ?? res.status}` };
    }
    return {
      attempted: true,
      accessToken: json.access_token,
      expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
    };
  } catch (err) {
    return { attempted: true, reason: `refresh failed: ${err.message}` };
  }
}

function inspectOauthCreds(path) {
  if (!existsSync(path)) return { state: 'absent' };
  const data = readJson(path);
  if (!data) return { state: 'unreadable', note: 'not valid JSON' };

  const expiresAt = expiryMs(data.expiry_date ?? data.expiry);
  const token = typeof data.access_token === 'string' ? data.access_token : null;
  const refreshToken = typeof data.refresh_token === 'string' ? data.refresh_token : null;

  if (token && isValid(expiresAt)) {
    return { state: 'live', credential: token, expiresAt };
  }
  return {
    state: 'expired',
    expiresAt,
    refreshToken,
    note: token ? 'stored access token is past its expiry' : 'no access_token field',
  };
}

/**
 * The Antigravity standalone token nests its payload under `token`, which is why
 * naive redaction of top-level string fields lets it through.
 */
function inspectJetski(path) {
  if (!existsSync(path)) return { state: 'absent' };
  const data = readJson(path);
  if (!data) return { state: 'unreadable', note: 'not valid JSON' };
  const inner = data.token && typeof data.token === 'object' ? data.token : data;

  const expiresAt = expiryMs(inner.expiry ?? inner.expiry_date);
  const token = typeof inner.access_token === 'string' ? inner.access_token : null;
  const refreshToken = typeof inner.refresh_token === 'string' ? inner.refresh_token : null;

  if (token && isValid(expiresAt)) {
    return { state: 'live', credential: token, expiresAt };
  }
  return {
    state: 'expired',
    expiresAt,
    refreshToken,
    note: token ? 'stored access token is past its expiry' : 'no access_token field',
  };
}

function inspectAdc(path) {
  if (!existsSync(path)) return { state: 'absent' };
  const data = readJson(path);
  if (!data) return { state: 'unreadable', note: 'not valid JSON' };
  if (data.type !== 'authorized_user') {
    return { state: 'unsupported', note: `type=${data.type ?? 'unknown'} (expected authorized_user)` };
  }
  if (!data.account) {
    return {
      state: 'broken',
      note: 'authorized_user with an empty `account` field — gcloud never completed the login; run `gcloud auth application-default login`',
    };
  }
  return { state: 'live', vertex: { quotaProjectId: data.quota_project_id ?? null } };
}

function readEnvAccessToken() {
  const value = process.env.GOOGLE_GENAI_ACCESS_TOKEN;
  return value ? { state: 'live', credential: value } : { state: 'absent' };
}

function readEnvApiKey() {
  for (const name of API_KEY_VARS) {
    if (process.env[name]) {
      return { state: 'live', credential: process.env[name], note: `from $${name}` };
    }
  }
  return { state: 'absent' };
}

/**
 * Every source we know how to read, in precedence order.
 * `check()` is async so a source can refresh itself.
 */
export function sources() {
  return [
    {
      id: 'env:api-key',
      label: `$${API_KEY_VARS.join(' / $')}`,
      mode: MODE.API_KEY,
      check: async () => readEnvApiKey(),
    },
    {
      id: 'env:access-token',
      label: '$GOOGLE_GENAI_ACCESS_TOKEN',
      mode: MODE.ACCESS_TOKEN,
      check: async () => readEnvAccessToken(),
    },
    {
      id: 'file:gemini-oauth',
      label: '~/.gemini/oauth_creds.json',
      mode: MODE.ACCESS_TOKEN,
      check: async () => inspectOauthCreds(join(HOME, '.gemini', 'oauth_creds.json')),
    },
    {
      id: 'file:jetski-oauth',
      label: '~/.gemini/jetski-standalone-oauth-token',
      mode: MODE.ACCESS_TOKEN,
      check: async () => inspectJetski(join(HOME, '.gemini', 'jetski-standalone-oauth-token')),
    },
    {
      id: 'file:gcloud-adc',
      label: '~/.config/gcloud/application_default_credentials.json',
      mode: MODE.VERTEX,
      check: async () => inspectAdc(join(HOME, '.config', 'gcloud', 'application_default_credentials.json')),
    },
  ];
}

/**
 * Resolves a usable credential, refreshing an expired OAuth source when the
 * caller has supplied the originating client. Returns `{ ok: false, report }`
 * rather than throwing, so callers can print the full diagnostic.
 */
export async function resolve({ fetchImpl = fetch } = {}) {
  const report = [];
  let found = null;

  for (const source of sources()) {
    let result;
    try {
      result = await source.check();
    } catch (err) {
      result = { state: 'error', note: err.message };
    }

    const row = {
      id: source.id,
      label: source.label,
      mode: source.mode,
      state: result.state,
      note: result.note ?? null,
    };

    if (result.expiresAt !== undefined) row.note = [human(result.expiresAt), result.note].filter(Boolean).join(' — ');

    if (result.state === 'expired' && result.refreshToken && !found) {
      const refreshed = await tryRefresh(result.refreshToken, { fetchImpl });
      if (refreshed.accessToken) {
        row.state = 'live';
        row.note = `refreshed from stored refresh_token — ${human(refreshed.expiresAt)}`;
        result.state = 'live';
        result.credential = refreshed.accessToken;
      } else {
        row.note = `${row.note} — ${refreshed.reason}`;
      }
    }

    if (result.state === 'live' && !found) {
      found = {
        mode: source.mode,
        credential: result.credential ?? null,
        vertex: result.vertex ?? null,
        sourceId: source.id,
        sourceLabel: source.label,
        note: row.note,
      };
      row.selected = true;
    }

    report.push(row);
  }

  return found ? { ok: true, ...found, report } : { ok: false, report };
}

/** A one-line description that is safe to print. */
export function describe(resolution) {
  if (!resolution.ok) return 'no usable credential';
  const where = resolution.note ? `${resolution.sourceLabel} (${resolution.note})` : resolution.sourceLabel;
  return `${resolution.mode} via ${where}`;
}
