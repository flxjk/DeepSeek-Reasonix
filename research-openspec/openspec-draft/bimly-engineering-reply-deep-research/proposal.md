# Proposal: bimly-engineering-reply-deep-research

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : bimly-engineering-reply-deep-research
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/bimly-engineering-reply-deep-research.md
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

1. The reply's correction rule for a complete scheduled-arrival trace is to record the actual schedule-to-outcome observations without generating another population of synthetic requests. _(derived)_
2. A maximum watermark does not prove every required object and consumer is ready. _(derived)_
3. Implementation gate requires demonstrating bounded peak memory under an enforced process limit, with source dependencies larger than RAM where that is a requirement. _(derived)_
4. Every accepted revision must refer to a logically complete entity-version map, implemented with shared immutable chunks, a persistent map, or a materialized snapshot plus a bounded delta chain. _(derived)_
5. A complete spatial predicate must name the query and version, geometry/clearance envelope, frame, units, tolerances, semantic filters, temporal scope if relevant, and the revision against which it was evaluated. _(derived)_

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
