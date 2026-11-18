# Proposal: notebooklm-grounded-corpus-and-audio-overview-synthesis

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : notebooklm-grounded-corpus-and-audio-overview-synthesis
     ssot       : core/providers/google/notebooklm-conversation-synthesis.tsp (resolves)
     binding    : specific — the contract was declared by the study author
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/notebooklm-grounded-corpus-and-audio-overview-synthesis.md
     invariants : 2 from the .research.tsp contract, 0 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/providers/google/notebooklm-conversation-synthesis.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. All 7 NotebookLM workspaces in NotebookLmDistilledCorpusCatalog carry populated grounded sources and BLAKE3 digests
2. NotebookLmSynthesisArtifactUnion enforces zero-envelope constrained polymorphic discrimination

## Capabilities

| Field | Value |
| --- | --- |
| Target domain | `core` |
| Capability | `providers-google-notebooklm-conversation-synthesis` |
| Bound TypeSpec contract | `core/providers/google/notebooklm-conversation-synthesis.tsp` |
| Binding trust | **specific** — the contract was declared by the study author |
| Contract resolves | yes |
| Study last checked | `2026-10-19` (22d) |
| Grounded sources | 1 |
| Invariants | 2 (2 contract, 0 derived) |

## Non-Goals

- Not a rewrite of `core/providers/google/notebooklm-conversation-synthesis.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/providers/google/notebooklm-conversation-synthesis.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
