"""Resolve a Gemini credential without ever printing it.

DSH and cron never source ``~/.zshrc``, so a key that works in your terminal is
invisible to a script. This checks the environment first, then the shell
profiles on disk. Nothing in the profiles is executed -- they are parsed.

Both ``AQ.…`` Antigravity OAuth tokens and ``AIza…`` AI Studio keys work.
"""

from __future__ import annotations

import os
import re
from pathlib import Path

HOME = Path.home()

NAMES = ("GEMINI_API_KEY", "GOOGLE_GENAI_API_KEY", "GOOGLE_API_KEY")

PROFILES = (
    HOME / ".zshrc",
    HOME / ".zshenv",
    HOME / ".zprofile",
    HOME / ".bashrc",
    HOME / ".bash_profile",
    HOME / ".profile",
)

_ASSIGN = re.compile(r"^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$")


class MissingKey(RuntimeError):
    """Raised when no credential can be found anywhere."""


def _parse_profile(path: Path, names: tuple[str, ...]) -> tuple[str, str] | None:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None

    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        match = _ASSIGN.match(stripped)
        if not match:
            continue
        name, raw = match.groups()
        if name not in names:
            continue
        value = raw.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        else:
            value = value.split(" #")[0].strip()
        value = re.sub(r"^\$\{?HOME\}?/", f"{HOME}/", value)
        if value:
            return name, value
    return None


def load_key() -> tuple[str, str]:
    """Return ``(value, origin)``. ``origin`` is safe to print; ``value`` is not."""
    for name in NAMES:
        value = os.environ.get(name)
        if value:
            return value, f"${name}"

    for profile in PROFILES:
        found = _parse_profile(profile, NAMES)
        if found:
            name, value = found
            return value, f"{str(profile).replace(str(HOME), '~')} (${name})"

    raise MissingKey(
        "no Gemini key found. Checked "
        + ", ".join(f"${n}" for n in NAMES)
        + " and "
        + ", ".join(str(p).replace(str(HOME), "~") for p in PROFILES)
        + ". Set GEMINI_API_KEY in your environment or in ~/.zshrc."
    )


def install_key() -> str:
    """Export the key into ``os.environ`` and return a printable origin hint."""
    value, origin = load_key()
    # Only these two. Setting GOOGLE_API_KEY as well makes the SDKs warn about
    # an ambiguous credential because they read every alias they know.
    for name in ("GEMINI_API_KEY", "GOOGLE_GENAI_API_KEY"):
        os.environ.setdefault(name, value)
    return origin


def hint(value: str) -> str:
    """A display form that never reveals the credential."""
    return f"{value[:4]}…{len(value)} chars"
