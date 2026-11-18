# Proposal: self-healing-typespec-meta-harness-architecture

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : self-healing-typespec-meta-harness-architecture
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/self-healing-typespec-meta-harness-architecture.md
     invariants : 0 from the .research.tsp contract, 9 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/workflow/deep-research-typespec-pipeline.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. The final set of false positives must be empty after dis-unification. _(derived)_
2. The round-trip AST match must be exact modulo trivia for every episode. _(derived)_
3. The summary.md file contains the newest 20 issues in full, and older issues are listed by ID. _(derived)_
4. Precheck_file invokes the governance gate over MCP or CLI before any agent tool call (edit_file, write_file, or LLM repair prompt synthesis) is permitted to execute. _(derived)_
5. The new candidate lower bound L_new must be greater than or equal to 0. _(derived)_
6. The new candidate upper bound U_new must be less than or equal to 2147483647. _(derived)_
7. For all x in [L_new, U_new], the worst-case upper bound U_new must satisfy the linear sink predicate (<= 1024). _(derived)_
8. The `BatchIngestRequest.payload` must contain at least 1 item. _(derived)_
9. The `ingestBatch` operation must have a `maxBlastRadiusNodes` of 18 and a `latencyGateNs` of 120. _(derived)_

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
| Invariants | 9 (0 contract, 9 derived) |

## Non-Goals

- Not a rewrite of `core/workflow/deep-research-typespec-pipeline.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/workflow/deep-research-typespec-pipeline.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
