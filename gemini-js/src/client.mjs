/**
 * Builds a `GoogleGenAI` instance from a resolved credential.
 *
 * The three construction shapes are not interchangeable, so this module exists
 * rather than each call site guessing:
 *
 *   api_key       new GoogleGenAI({ apiKey })
 *   access_token  new GoogleGenAI({ httpOptions: { headers: { Authorization } } })
 *   vertex        new GoogleGenAI({ vertexai, project, location, googleAuthOptions })
 *
 * The bearer form works because the SDK's transport reads `Authorization` out of
 * `httpOptions.headers` and reclassifies it as `access_token`, which `applyAuth`
 * then re-emits as a bearer header. Passing the token as `apiKey` would instead
 * send `x-goog-api-key` and fail.
 */
import { GoogleGenAI } from '@google/genai';
import { MODE, resolve } from './auth.mjs';

export class AuthError extends Error {
  constructor(resolution) {
    const states = resolution.report.map((r) => `${r.label} [${r.state}]`).join(', ');
    super(`no usable Google credential. Checked ${resolution.report.length} sources: ${states}`);
    this.name = 'AuthError';
    this.report = resolution.report;
  }
}

/**
 * @param {{ fetchImpl?: typeof fetch, model?: string }} [opts]
 * @returns {Promise<{ ai: GoogleGenAI, mode: string, source: string, model?: string }>}
 */
export async function createClient(opts = {}) {
  const resolution = await resolve({ fetchImpl: opts.fetchImpl });
  if (!resolution.ok) throw new AuthError(resolution);

  let ai;
  if (resolution.mode === MODE.API_KEY) {
    ai = new GoogleGenAI({ apiKey: resolution.credential });
  } else if (resolution.mode === MODE.ACCESS_TOKEN) {
    ai = new GoogleGenAI({
      httpOptions: { headers: { Authorization: `Bearer ${resolution.credential}` } },
    });
  } else if (resolution.mode === MODE.VERTEX) {
    const project = process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'us-central1';
    if (!project) {
      throw new Error(
        'vertex mode needs a project — set GOOGLE_CLOUD_PROJECT (ADC has no default project)',
      );
    }
    ai = new GoogleGenAI({
      vertexai: true,
      project,
      location,
      ...(resolution.vertex?.quotaProjectId
        ? { googleAuthOptions: { quotaProjectId: resolution.vertex.quotaProjectId } }
        : {}),
    });
  } else {
    throw new Error(`unhandled credential mode: ${resolution.mode}`);
  }

  return {
    ai,
    mode: resolution.mode,
    source: resolution.sourceLabel,
    note: resolution.note,
    model: opts.model ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL,
  };
}

/** Current text models worth defaulting to, cheapest-capable first. */
export const DEFAULT_MODEL = 'gemini-2.5-flash';

/** Reduces any SDK error to a short, printable line without leaking a key. */
export function explain(err) {
  if (!err) return 'unknown error';
  let message = String(err.message ?? err);

  // The API surfaces failures as a JSON envelope; unwrap it to the human sentence.
  const brace = message.indexOf('{');
  if (brace !== -1) {
    try {
      const parsed = JSON.parse(message.slice(brace));
      const inner = parsed?.error ?? parsed;
      const parts = [inner?.message, inner?.status].filter(Boolean);
      if (parts.length) {
        const reason = inner?.details?.find((d) => d?.reason)?.reason;
        message = [parts.join(' — '), reason].filter(Boolean).join(' | ');
      }
    } catch {
      /* not JSON after all; keep the original text */
    }
  }

  return message.replace(/([A-Za-z0-9_-]{20,})/g, (m) => `${m.slice(0, 4)}…redacted`);
}
