# Proposal: bimly-express-arrow-typespec-research

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : bimly-express-arrow-typespec-research
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/bimly-express-arrow-typespec-research.md
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

1. The system must strictly preserve inheritance graphs and attribute origin slots during schema compilation. _(derived)_
2. The RHEX core meta-framework must operate without hardcoded assumptions about building construction or IFC. _(derived)_
3. Bimly client applications and BFF servers must never link or execute native C++/Python EXPRESS parsers, Arrow buffer builders, or memory mappers directly. _(derived)_
4. Ingestion of semantic attributes into Arrow columnar format must never invoke the geometry kernel. _(derived)_

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
