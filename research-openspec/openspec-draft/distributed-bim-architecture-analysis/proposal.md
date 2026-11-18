# Proposal: distributed-bim-architecture-analysis

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : distributed-bim-architecture-analysis
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/distributed-bim-architecture-analysis.md
     invariants : 0 from the .research.tsp contract, 6 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/workflow/deep-research-typespec-pipeline.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. Every committed database state on every replica must obey the declared invariant predicate. _(derived)_
2. Any local transaction that would violate the invariant must locally abort. _(derived)_
3. For all invariant-valid common ancestor states and all pairs of invariant-valid transaction sequences over a set of transactions, the merged state must remain invariant-valid. _(derived)_
4. Every information container ID must conform to the 7-field hyphen-delimited structure PROJECT-ORIGINATOR-VOLUME-LEVEL-TYPE-ROLE-NUMBER, containing zero whitespace characters. _(derived)_
5. Role-specific volume codes must not collide across disciplines. _(derived)_
6. Containers in the WIP state must carry status code S0 and a preliminary revision code P01..Pn. _(derived)_

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
| Invariants | 6 (0 contract, 6 derived) |

## Non-Goals

- Not a rewrite of `core/workflow/deep-research-typespec-pipeline.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/workflow/deep-research-typespec-pipeline.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
