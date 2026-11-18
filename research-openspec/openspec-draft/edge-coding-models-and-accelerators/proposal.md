# Proposal: edge-coding-models-and-accelerators

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : edge-coding-models-and-accelerators
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/edge-coding-models-and-accelerators.md
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

1. On 8GB/12GB devices (iPhone 16 Pro / iPad Pro), models $\le 3\text{B}$ parameters fit comfortably with remaining headroom for app state. _(derived)_
2. On macOS SDK 27.2 (24GB+ unified memory baseline on M-series chips), models up to $16\text{B}$ MoE run with zero paging. _(derived)_
3. Gradients are computed for low-rank adapter matrices $A \in \mathbb{R}^{r \times d}$ and $B \in \mathbb{R}^{k \times r}$ where $r=8$ or $r=16$. _(derived)_
4. Training memory overhead is $\sim 45\text{ MB}$ additional VRAM for rank-16 adapters on a 1.5B model. _(derived)_
5. Model execution engines expose standard WIT 0.3 interfaces. _(derived)_

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
