# Proposal: runtime-adapters

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : runtime-adapters
     ssot       : core/tool/harness/harness.tsp (resolves)
     binding    : specific — the contract was declared by the study author
     checkedOn  : 2026-09-17 (54 days before 2026-11-10)
     source leaf: docs/rhex/research/runtime-adapters.md
     invariants : 1 from the .research.tsp contract, 0 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/tool/harness/harness.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. All runtime adapters route through @core/bootstrap and @core/ipc-kernel with zero raw Node built-in leaks

## Capabilities

| Field | Value |
| --- | --- |
| Target domain | `core` |
| Capability | `tool-harness-harness` |
| Bound TypeSpec contract | `core/tool/harness/harness.tsp` |
| Binding trust | **specific** — the contract was declared by the study author |
| Contract resolves | yes |
| Study last checked | `2026-09-17` (54d) |
| Grounded sources | 1 |
| Invariants | 1 (1 contract, 0 derived) |

## Non-Goals

- Not a rewrite of `core/tool/harness/harness.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/tool/harness/harness.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
