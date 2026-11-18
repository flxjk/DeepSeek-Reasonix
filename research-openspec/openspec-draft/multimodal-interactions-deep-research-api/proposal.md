# Proposal: multimodal-interactions-deep-research-api

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : multimodal-interactions-deep-research-api
     ssot       : core/providers/google/gemini-interactions-deep-research.tsp (resolves)
     binding    : specific — the contract was declared by the study author
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/multimodal-interactions-deep-research-api.md
     invariants : 2 from the .research.tsp contract, 0 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/providers/google/gemini-interactions-deep-research.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. Deep Research runs execute asynchronously with background: true and checkpointed ThoughtSignature DAGs
2. Per-part GeminiMediaResolution bounds PDF page tokenization (70 LOW, 280 MEDIUM, 560 HIGH, 1120 ULTRA_HIGH)

## Capabilities

| Field | Value |
| --- | --- |
| Target domain | `core` |
| Capability | `providers-google-gemini-interactions-deep-research` |
| Bound TypeSpec contract | `core/providers/google/gemini-interactions-deep-research.tsp` |
| Binding trust | **specific** — the contract was declared by the study author |
| Contract resolves | yes |
| Study last checked | `2026-10-19` (22d) |
| Grounded sources | 2 |
| Invariants | 2 (2 contract, 0 derived) |

## Non-Goals

- Not a rewrite of `core/providers/google/gemini-interactions-deep-research.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/providers/google/gemini-interactions-deep-research.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
