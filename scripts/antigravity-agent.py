#!/usr/bin/env python3
"""Run a prompt through the Antigravity SDK (``google-antigravity``).

The Python counterpart to ``scripts/gemini-genai.mjs``. Both resolve the key the
same way, so either works from DSH or cron where ``~/.zshrc`` is never sourced.

Usage
    .venv/bin/python scripts/antigravity-agent.py "your prompt"
    .venv/bin/python scripts/antigravity-agent.py --model gemini-3.8-flash "your prompt"
    .venv/bin/python scripts/antigravity-agent.py --system "be terse" "your prompt"
    .venv/bin/python scripts/antigravity-agent.py --workspace . "list the files here"
    .venv/bin/python scripts/antigravity-agent.py --openviking "what do you remember?"
    .venv/bin/python scripts/antigravity-agent.py --conversation demo "first"
    .venv/bin/python scripts/antigravity-agent.py --conversation demo "second"
    .venv/bin/python scripts/antigravity-agent.py --show-source "hi"

Exit codes: 0 ok, 1 usage, 2 no key, 3 upstream error.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "lib"))

import gemini_key  # noqa: E402

DEFAULT_MODEL = "gemini-3.8-flash"
OPENVIKING_URL = "http://127.0.0.1:1933/mcp"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="antigravity-agent.py",
        description="Run a prompt through the Antigravity SDK.",
    )
    parser.add_argument("prompt", nargs="*", help="the prompt text")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"default {DEFAULT_MODEL}")
    parser.add_argument("--system", default=None, help="system instructions")
    parser.add_argument(
        "--workspace",
        action="append",
        default=[],
        help="workspace directory the agent may read (repeatable)",
    )
    parser.add_argument(
        "--openviking",
        action="store_true",
        help=f"attach the OpenViking MCP server at {OPENVIKING_URL}",
    )
    parser.add_argument("--conversation", default=None, help="conversation id, to continue a session")
    parser.add_argument("--save-dir", default=None, help="where conversation state is kept")
    parser.add_argument("--show-source", action="store_true", help="print key origin (never the key)")
    parser.add_argument("--json", action="store_true", help="machine-readable output")
    parser.add_argument("--timeout", type=float, default=120.0, help="MCP timeout seconds")
    return parser


async def extract_text(response) -> str:
    """Resolve a ChatResponse to plain text.

    ``ChatResponse.text`` is an async method, not an attribute: it drains the
    underlying stream via ``resolve()`` and joins the ``Text`` chunks.
    """
    candidate = getattr(response, "text", None)
    if callable(candidate):
        try:
            value = await candidate()
            if isinstance(value, str) and value.strip():
                return value
        except Exception:  # noqa: BLE001 - fall through to the dump below
            pass
    elif isinstance(candidate, str) and candidate.strip():
        return candidate
    return str(response)


async def _chat(config_kwargs: dict, prompt: str) -> str:
    """The Agent is an async context manager; the session must be started."""
    from google.antigravity import Agent, LocalAgentConfig

    async with Agent(LocalAgentConfig(**config_kwargs)) as agent:
        return await extract_text(await agent.chat(prompt))


def main() -> int:
    args = build_parser().parse_args()

    try:
        origin = gemini_key.install_key()
    except gemini_key.MissingKey as exc:
        print(exc, file=sys.stderr)
        return 2

    try:
        from google.antigravity import Agent, LocalAgentConfig
        from google.antigravity.types import McpStreamableHttpServer
    except ImportError:
        print(
            "google-antigravity is not installed.\n"
            "  python3 -m venv .venv && .venv/bin/pip install google-antigravity",
            file=sys.stderr,
        )
        return 2

    prompt = " ".join(args.prompt).strip() or "Reply with exactly: OK"

    mcp_servers = []
    if args.openviking:
        mcp_servers.append(
            McpStreamableHttpServer(
                name="openviking",
                url=OPENVIKING_URL,
                timeout_seconds=args.timeout,
            )
        )

    config_kwargs = {
        "api_key": gemini_key.load_key()[0],
        "model": args.model,
        "mcp_servers": mcp_servers,
    }
    if args.system:
        config_kwargs["system_instructions"] = args.system
    if args.workspace:
        config_kwargs["workspaces"] = [str(Path(w).expanduser().resolve()) for w in args.workspace]
    if args.conversation:
        config_kwargs["conversation_id"] = args.conversation
    if args.save_dir:
        config_kwargs["save_dir"] = str(Path(args.save_dir).expanduser().resolve())

    if args.show_source:
        print(f"# key: {origin} ({gemini_key.hint(config_kwargs['api_key'])})", file=sys.stderr)
        print(f"# model: {args.model}", file=sys.stderr)

    try:
        text = asyncio.run(_chat(config_kwargs, prompt))
    except Exception as exc:  # noqa: BLE001 - surface whatever the SDK raised
        print(f"error: {exc}", file=sys.stderr)
        return 3

    if args.json:
        print(json.dumps({"model": args.model, "text": text}, indent=2))
    else:
        print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
