#!/usr/bin/env bash
#
# Verify all three Gemini paths end to end.
#
#   scripts/verify-gemini-paths.sh          # offline structure checks
#   scripts/verify-gemini-paths.sh --live   # adds real API calls
#
# Offline checks run everywhere. Live checks cost tokens and need a working
# credential, so they are opt-in.
#
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1
ROOT="$PWD"
LIVE=0
[ "${1:-}" = "--live" ] && LIVE=1

PASS=0
FAIL=0
declare -a FAILURES=()

ok()   { PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }
bad()  { FAIL=$((FAIL+1)); FAILURES+=("$1"); printf '  FAIL  %s — %s\n' "$1" "${2:-}"; }
head_() { printf '\n%s\n' "$1"; }

# expect <name> <expected-substring> <command...>
expect() {
  local name="$1" want="$2"; shift 2
  local out
  out="$("$@" 2>&1)"
  if printf '%s' "$out" | grep -qF -- "$want"; then
    ok "$name"
  else
    bad "$name" "wanted '$want', got: $(printf '%s' "$out" | tail -1 | cut -c1-120)"
  fi
}

# expect_re <name> <regex> <command...>
expect_re() {
  local name="$1" want="$2"; shift 2
  local out
  out="$("$@" 2>&1)"
  if printf '%s' "$out" | grep -qE -- "$want"; then
    ok "$name"
  else
    bad "$name" "wanted /$want/, got: $(printf '%s' "$out" | tail -1 | cut -c1-120)"
  fi
}

# expect_absent <name> <substring> <command...>
expect_absent() {
  local name="$1" unwanted="$2"; shift 2
  local out
  out="$("$@" 2>&1)"
  if printf '%s' "$out" | grep -qF -- "$unwanted"; then
    bad "$name" "did not expect '$unwanted'"
  else
    ok "$name"
  fi
}

# expect_code <name> <code> <command...>
expect_code() {
  local name="$1" want="$2"; shift 2
  "$@" >/dev/null 2>&1
  local got=$?
  if [ "$got" -eq "$want" ]; then ok "$name"; else bad "$name" "expected exit $want, got $got"; fi
}

printf 'gemini path verification\n'
printf 'root: %s\n' "$ROOT"

head_ 'structure'
for f in scripts/lib/gemini-key.mjs scripts/lib/genai.mjs scripts/gemini-genai.mjs \
         scripts/lib/gemini_key.py scripts/antigravity-agent.py scripts/agy-agent.sh; do
  if [ -e "$f" ]; then ok "$f present"; else bad "$f present" "missing"; fi
done
if [ -x scripts/agy-agent.sh ]; then ok "agy-agent.sh executable"; else bad "agy-agent.sh executable" "chmod +x needed"; fi
if [ -d gemini-js/node_modules/@google/genai ]; then ok "@google/genai installed"; else bad "@google/genai installed" "run npm install in gemini-js/"; fi
if [ -x .venv/bin/python ]; then ok "python venv present"; else bad "python venv present" "python3 -m venv .venv"; fi
if .venv/bin/python -c "import google.antigravity" 2>/dev/null; then
  ok "google-antigravity importable"
else
  bad "google-antigravity importable" ".venv/bin/pip install google-antigravity"
fi

head_ 'key resolution'
node -e "
import('$ROOT/scripts/lib/gemini-key.mjs').then(m => {
  const r = m.loadKey();
  console.log('js:', r.origin, m.hint ? '' : '');
}).catch(e => { console.log('js: FAILED', e.message); process.exit(1); });
" >/tmp/js-key.$$ 2>&1
if grep -q 'js: ' /tmp/js-key.$$; then ok "JS loader resolved: $(cat /tmp/js-key.$$ | sed 's/^js: //')"; else bad "JS key loader" "$(cat /tmp/js-key.$$ | head -1)"; fi
rm -f /tmp/js-key.$$

.venv/bin/python -c "
import sys; sys.path.insert(0,'$ROOT/scripts/lib')
import gemini_key
v,o = gemini_key.load_key()
print('py:', o, gemini_key.hint(v))
" >/tmp/py-key.$$ 2>&1
if grep -q '^py: ' /tmp/py-key.$$; then ok "Python loader resolved: $(cat /tmp/py-key.$$ | sed 's/^py: //')"; else bad "Python key loader" "$(cat /tmp/py-key.$$ | head -1)"; fi
rm -f /tmp/py-key.$$

head_ 'redaction'
out="$(node scripts/gemini-genai.mjs --show-source "hi" 2>&1 || true)"
if printf '%s' "$out" | grep -qE 'AQ\.[A-Za-z0-9_-]{10,}|AIza[A-Za-z0-9_-]{10,}'; then
  bad "no key in output" "a credential value leaked"
else
  ok "no key value in --show-source output"
fi

head_ 'usage and exit codes'
expect_code "genai: no prompt exits 1"      1 node scripts/gemini-genai.mjs
expect_code "genai: --help exits 0"         0 node scripts/gemini-genai.mjs --help
expect_code "agy: unknown option exits 1"   1 ./scripts/agy-agent.sh --bogus x
expect_code "agy: no prompt exits 1"        1 ./scripts/agy-agent.sh

head_ 'agy (OAuth, no API key needed)'
if [ "$LIVE" -eq 1 ]; then
  expect "agy one-shot returns OK" "OK" ./scripts/agy-agent.sh "Reply with exactly one word: OK"
  expect "agy accepts --model" "OK" ./scripts/agy-agent.sh --model claude-sonnet-4-6 "Reply with exactly one word: OK"
  expect "agy --json emits SUCCESS" '"status":"SUCCESS"' ./scripts/agy-agent.sh --json "Reply with exactly one word: OK"
else
  printf '  SKIP  (pass --live)\n'
fi

head_ 'gemini-genai.mjs (@google/genai)'
if [ "$LIVE" -eq 1 ]; then
  expect "generateContent returns OK" "OK" node scripts/gemini-genai.mjs "Reply with exactly one word: OK"
  expect "stream returns digits" "1 2 3" node scripts/gemini-genai.mjs --stream "Print the digits 1 2 3 separated by spaces. Nothing else."
  expect "count reports tokens" "tokens" node scripts/gemini-genai.mjs count "hello world"
  expect "embed reports dimensions" "dimensions" node scripts/gemini-genai.mjs embed "hello world"
  expect "models lists gemini-2.5-flash" "gemini-2.5-flash" node scripts/gemini-genai.mjs models
else
  printf '  SKIP  (pass --live)\n'
fi

head_ 'antigravity-agent.py (google-antigravity SDK)'
if [ "$LIVE" -eq 1 ]; then
  expect "Agent.chat returns OK" "OK" .venv/bin/python scripts/antigravity-agent.py "Reply with exactly one word: OK"
  expect "json output parses" '"text"' .venv/bin/python scripts/antigravity-agent.py --json "Reply with exactly one word: OK"
else
  printf '  SKIP  (pass --live)\n'
fi

head_ 'full-power defaults'
expect "chain leads with gemini-4-argon" "gemini-4-argon" node scripts/gemini-genai.mjs chain
expect "chain reports max thinking" '"thinkingBudget": -1' node scripts/gemini-genai.mjs chain --json
expect_code "bad effort exits 1" 1 node scripts/gemini-genai.mjs --effort bogus "hi"
if [ "$LIVE" -eq 1 ]; then
  expect_re "max effort spends thought tokens" '"thoughtsTokenCount": [1-9]' node scripts/gemini-genai.mjs --json --effort max "Reply with exactly one word: OK"
  expect_absent "minimal effort omits the thinking field" 'thoughtsTokenCount' node scripts/gemini-genai.mjs --json --effort minimal "Reply with exactly one word: OK"
  printf 'a) one word: red\nb) one word: green\n' > /tmp/gemini-batch.$$.txt
  expect "batch runs every prompt" "2/2 ok" node scripts/gemini-genai.mjs --batch /tmp/gemini-batch.$$.txt --concurrency 2 --effort minimal
  rm -f /tmp/gemini-batch.$$.txt
else
  printf '  SKIP  live effort/batch checks (pass --live)\n'
fi

head_ 'MCP server (scripts/gemini-api-server.mjs)'
mcp_probe() {
  printf '%s\n' \
    '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"verify","version":"1"}}}' \
    '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
    "$1" | node scripts/gemini-api-server.mjs 2>&1
}
expect "initialize reports gemini-api" '"name":"gemini-api"' mcp_probe '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
expect "all six tools listed" 'gemini_count_tokens' mcp_probe '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
expect "unknown tool is an MCP error" '"isError":true' mcp_probe '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"nope","arguments":{}}}'
expect "chain tool answers" 'gemini-4-argon' mcp_probe '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"gemini_chain","arguments":{}}}'
if [ "$LIVE" -eq 1 ]; then
  expect_re "generate tool returns OK" '\\"text\\": \\"OK\\"' mcp_probe '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"gemini_generate","arguments":{"prompt":"Reply with exactly one word: OK","effort":"low"}}}'
else
  printf '  SKIP  live MCP generation (pass --live)\n'
fi

head_ 'DSH registration'
expect "profile declares gemini-api" "serverName: gemini-api" grep "serverName: gemini-api" /Users/gj/.dsh/profiles/web/cordis.patch.yml
if pgrep -f 'gemini-api-server.mjs' >/dev/null 2>&1; then
  ok "DSH spawned the server"
else
  bad "DSH spawned the server" "no gemini-api-server.mjs process found"
fi

printf '\n%d passed, %d failed\n' "$PASS" "$FAIL"
if [ "$FAIL" -gt 0 ]; then
  printf '\nfailures:\n'
  for f in "${FAILURES[@]}"; do printf '  - %s\n' "$f"; done
  exit 1
fi
exit 0
