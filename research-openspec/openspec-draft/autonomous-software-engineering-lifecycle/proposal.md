# Proposal: autonomous-software-engineering-lifecycle

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : autonomous-software-engineering-lifecycle
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : specific — the contract was declared by the study author
     checkedOn  : 2026-10-02 (39 days before 2026-11-10)
     source leaf: docs/rhex/research/autonomous-software-engineering-lifecycle.md
     invariants : 2 from the .research.tsp contract, 0 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/workflow/deep-research-typespec-pipeline.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. Restate owns durable execution logs while Effect v4 owns local resource scoping and fiber supervision
2. Every verified fix backports transactionally into Level-0 TypeSpec contracts

## Capabilities

| Field | Value |
| --- | --- |
| Target domain | `core` |
| Capability | `workflow-deep-research-typespec-pipeline` |
| Bound TypeSpec contract | `core/workflow/deep-research-typespec-pipeline.tsp` |
| Binding trust | **specific** — the contract was declared by the study author |
| Contract resolves | yes |
| Study last checked | `2026-10-02` (39d) |
| Grounded sources | 1 |
| Invariants | 2 (2 contract, 0 derived) |

## Non-Goals

- Not a rewrite of `core/workflow/deep-research-typespec-pipeline.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/workflow/deep-research-typespec-pipeline.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
