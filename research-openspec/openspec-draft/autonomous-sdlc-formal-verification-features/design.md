# Design: autonomous-sdlc-formal-verification-features

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : autonomous-sdlc-formal-verification-features
     ssot       : core/verification/neuro-symbolic-compliance.tsp (MISSING ON DISK)
     binding    : specific — the contract was declared by the study author
     checkedOn  : 2026-10-02 (39 days before 2026-11-10)
     source leaf: docs/rhex/research/autonomous-sdlc-formal-verification-features.md
     invariants : 1 from the .research.tsp contract, 0 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Context

Derived from research study `autonomous-sdlc-formal-verification-features` (checked `2026-10-02`).
Source leaf: `docs/rhex/research/autonomous-sdlc-formal-verification-features.md` (2 KB).
Bound contract: `core/verification/neuro-symbolic-compliance.tsp` (binding trust: **specific**).

## Decisions

1. The invariant is expressed against the existing TypeSpec contract, not a new leaf,
   unless the bound contract is missing.
2. The check is deterministic — an ast-grep rule, a cite-test, or a numeric gate —
   never a model judgement.
3. The research leaf stays the authority for *why*; the contract stays the authority
   for *what*. This change only connects them.

## Trade-offs

- Creating the missing contract first expands scope: the contract itself becomes part of this change.
- The binding is declared by the study author.
- **Thin provenance**: the study grounds on a single source, so there is one citation anchor.
- All statements come from the hand-written contract.

## TypeSpec surface

- Contract: `core/verification/neuro-symbolic-compliance.tsp`
- Domain: `core`
- Namespace: derive from the contract path; do not invent a new namespace here.

## Effect services

The research corpus does not name an effect service, and guessing one produced
confidently wrong bindings when it was tried, so this is left as an explicit
assignment for the reviewer:

- Owning service: **unassigned** — choose the service under
  `packages/core/effect/services/` that already owns `core/verification/neuro-symbolic-compliance.tsp`.
- Enforcement surface: a pure Effect v4 cite-test, an ast-grep rule, or a numeric
  gate — never a model judgement.
- If no service owns the contract yet, this change must create one before any
  requirement here can be verified.
