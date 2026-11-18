#!/usr/bin/env bash
#
# Drive the Antigravity CLI (`agy`).
#
# `agy` authenticates over OAuth-personal, so it needs no API key at all -- it
# works even when GEMINI_API_KEY is absent or expired. That makes it the fallback
# path when the SDKs are unavailable.
#
# Usage
#   scripts/agy-agent.sh "your prompt"
#   scripts/agy-agent.sh --model claude-sonnet-4-6 "your prompt"
#   scripts/agy-agent.sh --json "your prompt"
#   scripts/agy-agent.sh --stream "count to five"
#   scripts/agy-agent.sh models
#   scripts/agy-agent.sh acp          # ACP server on stdio, telemetry disabled
#
# Note on telemetry: `--disable-telemetry` is accepted only by `agy acp`. Passing
# it alongside `-p` makes agy print its help and exit, so it is applied to the
# ACP path alone. For one-shot prompts, telemetry is governed by the settings
# files under ~/.gemini/.
#
set -euo pipefail

AGY="${AGY_BIN:-$HOME/.local/bin/agy}"
if [ ! -x "$AGY" ]; then
  AGY="$(command -v agy || true)"
fi
if [ -z "${AGY:-}" ] || [ ! -x "$AGY" ]; then
  echo "agy not found. Install it, or set AGY_BIN to the binary." >&2
  exit 2
fi

MODEL="${AGY_MODEL:-}"
OUTPUT_FORMAT="text"

case "${1:-}" in
  models|agents|plugin|plugins|mcp|changelog|update)
    exec "$AGY" "$@"
    ;;
  acp)
    shift
    exec "$AGY" acp --disable-telemetry "$@"
    ;;
  --help|-h)
    sed -n '3,17p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
    ;;
esac

while [ $# -gt 0 ]; do
  case "$1" in
    --model) MODEL="${2:?--model needs a value}"; shift 2 ;;
    --json) OUTPUT_FORMAT="json"; shift ;;
    --stream) OUTPUT_FORMAT="stream-json"; shift ;;
    --) shift; break ;;
    -*) echo "unknown option: $1" >&2; exit 1 ;;
    *) break ;;
  esac
done

if [ "$#" -eq 0 ]; then
  echo "usage: agy-agent.sh [--model <id>] [--json|--stream] <prompt>" >&2
  echo "       agy-agent.sh models|acp" >&2
  exit 1
fi

ARGS=(-p "$*" --output-format "$OUTPUT_FORMAT")
if [ -n "$MODEL" ]; then
  ARGS+=(--model "$MODEL")
fi

exec "$AGY" "${ARGS[@]}"
