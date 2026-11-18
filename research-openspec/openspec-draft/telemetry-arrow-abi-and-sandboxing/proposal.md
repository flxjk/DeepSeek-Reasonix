# Proposal: telemetry-arrow-abi-and-sandboxing

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : telemetry-arrow-abi-and-sandboxing
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/telemetry-arrow-abi-and-sandboxing.md
     invariants : 0 from the .research.tsp contract, 4 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/workflow/deep-research-typespec-pipeline.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. At-recording correction (recordValueWithExpectedInterval) and post-recording correction (copyCorrectedForCoordinatedOmission) are mutually exclusive. _(derived)_
2. Any BIM graph indexer or multi-tenant analytical store using IfcProject.GlobalId as a primary partition key will suffer catastrophic cross-tenant graph merging and silent entity overwrites unless records are namespaced by content-addressable file digest (sha256). _(derived)_
3. Every chunk yielded by get_next must reside on the mandatory stream-level device type. _(derived)_
4. get_next signals end-of-stream when its return value is 0 and out->array.release is NULL. _(derived)_

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
| Invariants | 4 (0 contract, 4 derived) |

## Non-Goals

- Not a rewrite of `core/workflow/deep-research-typespec-pipeline.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/workflow/deep-research-typespec-pipeline.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
