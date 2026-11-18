# Gemini paths

Four working ways to reach Gemini from this repo, all sharing one credential
resolver: `$GEMINI_API_KEY` / `$GOOGLE_GENAI_API_KEY` / `$GOOGLE_API_KEY` from the
environment, then `~/.zshrc`, `~/.zshenv`, `~/.zprofile`, `~/.bashrc`,
`~/.bash_profile`, `~/.profile`. DSH and cron never source those files, which is
why a key that works in your terminal is invisible to a script. Profiles are
parsed, never executed, and values are never printed.

```bash
scripts/verify-gemini-paths.sh          # 26 offline checks
scripts/verify-gemini-paths.sh --live   # 40 checks, real API calls
```

## Full-power defaults

| setting | value | why |
|---|---|---|
| model chain | `gemini-4-argon` → `gemini-4-carbon` → `gemini-3.8-flash` → `gemini-2.5-flash` | 4.x are the strongest on this key; the rest catch 429s |
| thinking | `thinkingBudget: -1` (automatic, uncapped) | `--effort max` is the default |
| retries | 2 per model, exponential backoff | 429/5xx only; hard errors fail fast |
| batch concurrency | 4 (raise with `--concurrency`) | 6 prompts in 17s at 6 |

`deep-research-max-preview-*` and `antigravity-preview-*` are deliberately **not**
in the chain: the API rejects them with `This model only supports Interactions API.`

Effort levels map to thinking budgets: `minimal` 0, `low` 1024, `medium` 8192,
`high` 24576, `max` −1. Only `thinkingBudget` **or** `thinkingLevel` may be sent —
the API rejects both together with *"You can only set only one of thinking budget
and thinking level"*, so the budget is used.

## 1. `scripts/gemini-genai.mjs` — `@google/genai` CLI

```bash
node scripts/gemini-genai.mjs "your prompt"
node scripts/gemini-genai.mjs --effort minimal "quick question"
node scripts/gemini-genai.mjs --thoughts "hard problem"        # show the reasoning
node scripts/gemini-genai.mjs --model gemini-3.8-flash "hi"    # pin one model
node scripts/gemini-genai.mjs --chain gemini-4-carbon,gemini-2.5-flash "hi"
node scripts/gemini-genai.mjs --stream "count to five"
node scripts/gemini-genai.mjs --batch prompts.txt --concurrency 8
echo "one prompt per line" | node scripts/gemini-genai.mjs --batch -
node scripts/gemini-genai.mjs models
node scripts/gemini-genai.mjs count "some text"
node scripts/gemini-genai.mjs embed "some text"
node scripts/gemini-genai.mjs chain                            # fallback order
```

`--json` on any command. Embeddings use `gemini-embedding-001` (3072 dims);
`gemini-3.8-flash` does not implement `embedContent`. The SDK lives in
`gemini-js/`, not the repo root — this is a Go module and should not grow a root
`package.json`. `scripts/lib/genai.mjs` resolves it from there.

## 2. `scripts/gemini-api-server.mjs` — MCP server (registered in DSH)

Six tools over stdio, already wired into `~/.dsh/profiles/web/cordis.patch.yml`
as `serverName: gemini-api`, so they appear as `mcp__gemini-api__*`:

| tool | purpose |
|---|---|
| `gemini_generate` | one prompt through the chain, max thinking |
| `gemini_batch` | many prompts, bounded concurrency, per-item ok/failed |
| `gemini_embed` | embeddings |
| `gemini_count_tokens` | token accounting before you spend them |
| `gemini_models` | what the key can reach |
| `gemini_chain` | fallback order and thinking budget in force |

Test it standalone:

```bash
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node scripts/gemini-api-server.mjs
```

## 3. `scripts/antigravity-agent.py` — `google-antigravity` SDK

```bash
.venv/bin/python scripts/antigravity-agent.py "your prompt"
.venv/bin/python scripts/antigravity-agent.py --system "be terse" "your prompt"
.venv/bin/python scripts/antigravity-agent.py --workspace . "list the files here"
.venv/bin/python scripts/antigravity-agent.py --openviking "what do you remember?"
.venv/bin/python scripts/antigravity-agent.py --json "your prompt"
```

`--openviking` attaches the MCP server at `http://127.0.0.1:1933/mcp`; verified —
the agent reads `entities`, `events`, `notes`, `preferences`, `identity`,
`profile`, `soul`.

Two SDK details that fail confusingly:

- `Agent` is an **async context manager**. `Agent(cfg).chat(p)` raises
  `Agent session not started. Use 'async with Agent(...)'`.
- `ChatResponse.text` is an **async method**: `await response.text()` drains the
  stream and joins the chunks.

Setup: `python3 -m venv .venv && .venv/bin/pip install google-antigravity`
(0.1.23, plus `google-genai` and `mcp`).

## 4. `scripts/agy-agent.sh` — the `agy` CLI

```bash
scripts/agy-agent.sh "your prompt"
scripts/agy-agent.sh --model claude-sonnet-4-6 "your prompt"
scripts/agy-agent.sh --json "your prompt"
scripts/agy-agent.sh models
scripts/agy-agent.sh acp                    # ACP server on stdio
```

Needs **no API key** — `agy` authenticates over OAuth-personal, so it still works
when the key is missing or expired. It is the fallback.

`--disable-telemetry` is accepted by `agy acp` only. Passing it with `-p` makes
`agy` print its help and exit without running the prompt, so the wrapper applies
it to `acp` alone.

## Credential notes

An `AQ.A…` token works as `apiKey` for both SDKs, as does a normal `AIza…` key.
Setting `GOOGLE_API_KEY` *and* `GEMINI_API_KEY` makes the SDK warn
`Both GOOGLE_API_KEY and GEMINI_API_KEY are set`, so the loaders populate only
`GEMINI_API_KEY` and `GOOGLE_GENAI_API_KEY`.

`gemini-2.0-flash` is retired. The two OAuth files under `~/.gemini/` are both
expired and cannot be refreshed from `agy`'s embedded clients — Google rejects a
refresh from any client other than the issuing one. Use `~/.zshrc`'s key, `agy`,
or finish `gcloud auth application-default login`.
