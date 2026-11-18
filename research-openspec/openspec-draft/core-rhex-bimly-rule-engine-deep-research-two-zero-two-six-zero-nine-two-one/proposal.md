# Proposal: core-rhex-bimly-rule-engine-deep-research-two-zero-two-six-zero-nine-two-one

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : core-rhex-bimly-rule-engine-deep-research-two-zero-two-six-zero-nine-two-one
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/core-rhex-bimly-rule-engine-deep-research-two-zero-two-six-zero-nine-two-one.md
     invariants : 0 from the .research.tsp contract, 3 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/workflow/deep-research-typespec-pipeline.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. Small local predicate group p99 must be less than or equal to 1 ms under warm in-process evaluation with declared bounded input and no external I/O. _(derived)_
2. Request authorization p99 must be less than or equal to 5 ms on a same-host path including fact assembly/serialization. _(derived)_
3. Expensive engineering validation must have an interactive acknowledgement less than or equal to 100 ms. _(derived)_

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
| Invariants | 3 (0 contract, 3 derived) |

## Non-Goals

- Not a rewrite of `core/workflow/deep-research-typespec-pipeline.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/workflow/deep-research-typespec-pipeline.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
