# Proposal: autonomous-sdlc-engine-room-features

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : autonomous-sdlc-engine-room-features
     ssot       : core/tool/ipc/ipc-kernel.tsp (MISSING ON DISK)
     binding    : specific — the contract was declared by the study author
     checkedOn  : 2026-10-02 (39 days before 2026-11-10)
     source leaf: docs/rhex/research/autonomous-sdlc-engine-room-features.md
     invariants : 1 from the .research.tsp contract, 0 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/tool/ipc/ipc-kernel.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract **does not exist on disk**, so these invariants describe a contract that must be created first.

## What changes

1. Sub-millisecond (< 0.8ms) IPC round-trip latency via pre-allocated slab BufferPool recycling

## Capabilities

| Field | Value |
| --- | --- |
| Target domain | `core` |
| Capability | `tool-ipc-ipc-kernel` |
| Bound TypeSpec contract | `core/tool/ipc/ipc-kernel.tsp` |
| Binding trust | **specific** — the contract was declared by the study author |
| Contract resolves | **no — create it** |
| Study last checked | `2026-10-02` (39d) |
| Grounded sources | 1 |
| Invariants | 1 (1 contract, 0 derived) |

## Non-Goals

- Not a rewrite of `core/tool/ipc/ipc-kernel.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/tool/ipc/ipc-kernel.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
