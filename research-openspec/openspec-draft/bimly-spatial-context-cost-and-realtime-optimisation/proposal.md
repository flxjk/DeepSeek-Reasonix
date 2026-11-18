# Proposal: bimly-spatial-context-cost-and-realtime-optimisation

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : bimly-spatial-context-cost-and-realtime-optimisation
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/bimly-spatial-context-cost-and-realtime-optimisation.md
     invariants : 0 from the .research.tsp contract, 5 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/workflow/deep-research-typespec-pipeline.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. Camera movement and navigation must achieve 60 FPS on supported desktop fixtures, with a 30 FPS fallback for constrained devices. _(derived)_
2. High-refresh interaction must operate with an 8.33 ms frame budget. _(derived)_
3. Selection and immediate feedback must have a visible acknowledgement within 100 ms p95. _(derived)_
4. Warm contextual queries must complete end-to-end within 250 ms p95 on the declared fixture. _(derived)_
5. A B2C occasional project must have an explicit import and retention limit. _(derived)_

## Capabilities

| Field | Value |
| --- | --- |
| Target domain | `core` |
| Capability | `workflow-deep-research-typespec-pipeline` |
| Bound TypeSpec contract | `core/workflow/deep-research-typespec-pipeline.tsp` |
| Binding trust | **default** — the contract is the corpus default, not a real claim — assign one |
| Contract resolves | yes |
| Study last checked | `2026-10-19` (22d) |
| Grounded sources | 1 |
| Invariants | 5 (0 contract, 5 derived) |

## Non-Goals

- Not a rewrite of `core/workflow/deep-research-typespec-pipeline.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/workflow/deep-research-typespec-pipeline.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
