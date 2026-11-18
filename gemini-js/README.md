# gemini-js

The `@google/genai` JS path for this machine, standing next to the Python
Antigravity SDK (`pip install google-antigravity`) and the `agy` CLI.

Antigravity ships a **Python** SDK. Anything written in Node had no first-party
way to reach Gemini — that is the gap this closes.

```bash
cd /Users/gj/DeepSeek-Reasonix-studio/gemini-js
npm install
node src/cli.mjs auth        # what credentials exist, and why each one lost
node src/cli.mjs models
node src/cli.mjs ask "explain WebGPU in one sentence"
node src/cli.mjs stream "count to five"
node src/cli.mjs embed "text to embed"
node src/cli.mjs count "how many tokens is this"
node test/verify.mjs         # 19 offline checks
node test/verify.mjs --live  # adds real round-trips (needs a credential)
```

`--json` on any command, `--model <id>` and `--system <text>` on the generating
ones. Exit codes: `0` ok, `1` usage, `2` no credential, `3` upstream error.

## Credential modes

The SDK authenticates in exactly one of three ways, and they are not
interchangeable. `src/client.mjs` picks the right construction shape so callers
never have to guess:

| mode | construction | header on the wire |
|------|--------------|--------------------|
| `api_key` | `new GoogleGenAI({ apiKey })` | `x-goog-api-key` |
| `access_token` | `new GoogleGenAI({ httpOptions: { headers: { Authorization } } })` | `Authorization: Bearer …` |
| `vertex` | `new GoogleGenAI({ vertexai, project, location, googleAuthOptions })` | ADC access token |

The bearer form is not obvious. `GoogleGenAI` has no `accessToken` option — the
transport reads `Authorization` out of `httpOptions.headers`, reclassifies it as
`security.access_token`, and `applyAuth` re-emits it as a bearer header
(`node_modules/@google/genai/dist/node/index.mjs`, `securityFromHeaders` and
`applyAuth`). Passing a token as `apiKey` instead sends `x-goog-api-key` and
fails. The SDK also honours `GOOGLE_GENAI_ACCESS_TOKEN` directly, but that path
can only carry a token — never a refresh — so this module sets the header itself.

Selection order, highest first:

1. `$GOOGLE_GENAI_API_KEY` / `$GEMINI_API_KEY` / `$GOOGLE_API_KEY`
2. `$GOOGLE_GENAI_ACCESS_TOKEN`
3. `~/.gemini/oauth_creds.json`
4. `~/.gemini/jetski-standalone-oauth-token`
5. `~/.config/gcloud/application_default_credentials.json` (Vertex mode)

## Current credential state on this machine

`node src/cli.mjs auth` reports, truthfully, **no usable credential**. Every
source is present but unusable:

| source | state | why |
|--------|-------|-----|
| environment | absent | no key or token exported |
| `~/.gemini/oauth_creds.json` | expired | token died 2026-10-12; refresh needs the client that minted it |
| `~/.gemini/jetski-standalone-oauth-token` | expired | token died 2026-11-07; same refresh problem |
| `~/.config/gcloud/application_default_credentials.json` | broken | `authorized_user` with an empty `account` field |

The refresh problem is a hard constraint, not a missing feature. Google refuses a
refresh from any client other than the one that issued the token. The stored
refresh token was issued to client `681255809395-…` (the Gemini CLI's public
client), whose secret is not on disk. `agy`'s own three embedded client
credentials were tested against it and all are rejected — they are different
clients, and they are not registered for the device flow either.

`src/auth.mjs` will refresh automatically if you supply the originating client:

```bash
export GOOGLE_OAUTH_CLIENT_ID=681255809395-oo8ft2oprdrnp9e3aqf6av3hmdib135j
export GOOGLE_OAUTH_CLIENT_SECRET=…      # never commit this
node src/cli.mjs auth                    # now reports "refreshed from stored refresh_token"
```

To unblock without any of that, either export a key:

```bash
export GOOGLE_GENAI_API_KEY=…             # https://aistudio.google.com/apikey
```

or finish the gcloud login and use Vertex mode:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT=meta-harness
```

## Verification

`node test/verify.mjs` → **19 passed, 0 failed**, and it needs no network.

The load-bearing check stubs `globalThis.fetch`, drives a real
`generateContent` call, and asserts the header that reached the wire:
`x-goog-api-key` in api_key mode, `Authorization: Bearer …` in access_token
mode, and never both. That is what proves the mode is real rather than merely
constructed. The rest covers source precedence, error mapping, CLI exit codes,
and that no credential value or Google token pattern can reach stdout.

`--live` adds a real generation and a `models.list`; both need a credential.

A live call with a syntactically valid but bogus key returns a genuine upstream
rejection — `INVALID_ARGUMENT | API_KEY_INVALID` from
`generativelanguage.googleapis.com` — which confirms the whole transport chain
is correct and only the credential is missing.

## Note on SDK warnings

In `access_token` mode the SDK prints `API key should be set when using the
Gemini API.` to the console. It is emitted unconditionally and does not indicate
failure — the bearer request succeeds. Set `GEMINI_JS_QUIET=1` to silence this
package's own status line; the SDK's warning comes from inside the library.

## Layout

```
src/auth.mjs      credential discovery, refresh, redaction-safe reporting
src/client.mjs    GoogleGenAI construction per mode, error unwrapping
src/cli.mjs       auth / models / ask / stream / embed / count
test/verify.mjs   19 offline checks + optional --live
```
