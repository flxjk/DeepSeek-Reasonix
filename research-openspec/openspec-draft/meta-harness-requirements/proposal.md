# Proposal: meta-harness-requirements

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : meta-harness-requirements
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/meta-harness-requirements.md
     invariants : 0 from the .research.tsp contract, 7 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/workflow/deep-research-typespec-pipeline.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. Every contract declaration SHALL have ownership derived from the reviewed source package. _(derived)_
2. Core SHALL reject dependencies on RHEX, Platform and Bimly through imports, types, defaults or critical metadata. _(derived)_
3. Compilation SHALL only generate artifacts and diagnostics. _(derived)_
4. The checked graph SHALL normalize into a versioned owned IR retaining source provenance. _(derived)_
5. Unknown mandatory semantics SHALL reject a target. _(derived)_
6. Generated artifacts SHALL be deterministic for the declared build inputs. _(derived)_
7. Each output path SHALL have one owner and remain inside its output root. _(derived)_

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
| Invariants | 7 (0 contract, 7 derived) |

## Non-Goals

- Not a rewrite of `core/workflow/deep-research-typespec-pipeline.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/workflow/deep-research-typespec-pipeline.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
