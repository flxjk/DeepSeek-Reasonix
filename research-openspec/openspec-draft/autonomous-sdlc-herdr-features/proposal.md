# Proposal: autonomous-sdlc-herdr-features

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : autonomous-sdlc-herdr-features
     ssot       : core/compute/apple-silicon-m5.tsp (resolves)
     binding    : specific — the contract was declared by the study author
     checkedOn  : 2026-10-02 (39 days before 2026-11-10)
     source leaf: docs/rhex/research/autonomous-sdlc-herdr-features.md
     invariants : 1 from the .research.tsp contract, 0 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/compute/apple-silicon-m5.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. Epoch fencing tokens (leaseGeneration) reject stale zombie worker writes deterministically

## Capabilities

| Field | Value |
| --- | --- |
| Target domain | `core` |
| Capability | `compute-apple-silicon-m5` |
| Bound TypeSpec contract | `core/compute/apple-silicon-m5.tsp` |
| Binding trust | **specific** — the contract was declared by the study author |
| Contract resolves | yes |
| Study last checked | `2026-10-02` (39d) |
| Grounded sources | 1 |
| Invariants | 1 (1 contract, 0 derived) |

## Non-Goals

- Not a rewrite of `core/compute/apple-silicon-m5.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/compute/apple-silicon-m5.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
