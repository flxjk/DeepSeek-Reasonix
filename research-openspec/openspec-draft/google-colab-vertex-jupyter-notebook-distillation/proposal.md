# Proposal: google-colab-vertex-jupyter-notebook-distillation

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : google-colab-vertex-jupyter-notebook-distillation
     ssot       : core/google/notebook-models.tsp (resolves)
     binding    : specific — the contract was declared by the study author
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/google-colab-vertex-jupyter-notebook-distillation.md
     invariants : 1 from the .research.tsp contract, 0 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/google/notebook-models.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. NotebookResearchPersistenceBinding links every distilled .ipynb notebook to its saved .md and dedicated .research.tsp files

## Capabilities

| Field | Value |
| --- | --- |
| Target domain | `core` |
| Capability | `google-notebook-models` |
| Bound TypeSpec contract | `core/google/notebook-models.tsp` |
| Binding trust | **specific** — the contract was declared by the study author |
| Contract resolves | yes |
| Study last checked | `2026-10-19` (22d) |
| Grounded sources | 1 |
| Invariants | 1 (1 contract, 0 derived) |

## Non-Goals

- Not a rewrite of `core/google/notebook-models.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/google/notebook-models.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
