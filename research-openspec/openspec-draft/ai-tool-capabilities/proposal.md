# Proposal: ai-tool-capabilities

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : ai-tool-capabilities
     ssot       : core/ai-tool/capability-registry.tsp (resolves)
     binding    : specific — the contract was declared by the study author
     checkedOn  : 2026-09-17 (54 days before 2026-11-10)
     source leaf: docs/rhex/research/ai-tool-capabilities.md
     invariants : 2 from the .research.tsp contract, 0 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/ai-tool/capability-registry.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. All AI harnesses consume a single canonical TypeSpec SSOT without vendor lock-in
2. Dedicated TypeSpec emitters and pure Effect v4 services back every registered AI tool

## Capabilities

| Field | Value |
| --- | --- |
| Target domain | `core` |
| Capability | `ai-tool-capability-registry` |
| Bound TypeSpec contract | `core/ai-tool/capability-registry.tsp` |
| Binding trust | **specific** — the contract was declared by the study author |
| Contract resolves | yes |
| Study last checked | `2026-09-17` (54d) |
| Grounded sources | 2 |
| Invariants | 2 (2 contract, 0 derived) |

## Non-Goals

- Not a rewrite of `core/ai-tool/capability-registry.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/ai-tool/capability-registry.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
