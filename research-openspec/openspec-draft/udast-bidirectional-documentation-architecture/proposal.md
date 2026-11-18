# Proposal: udast-bidirectional-documentation-architecture

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : udast-bidirectional-documentation-architecture
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/udast-bidirectional-documentation-architecture.md
     invariants : 0 from the .research.tsp contract, 8 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/workflow/deep-research-typespec-pipeline.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. The plugin itself accepts no runtime parameters and does not transform directives into rendered output. _(derived)_
2. resolveCompilerOptions must bind strictly to the virtual SystemHost without fallback to disk-based NodeHost resolution. _(derived)_
3. directiveToMarkdown must be configured with preferShortcut: true and collapseEmptyAttributes: true to guarantee zero syntactic churn during agentic round-trips. _(derived)_
4. A LoroDoc instance must never share a PeerID across concurrent tabs, worker threads, or coding agent processes. _(derived)_
5. @bimly/udast-engine initializes all sub-containers (attributes map and content LoroText) upfront when a LoroTreeNode is instantiated. _(derived)_
6. Relational rules and composite rules must use all when subsequent rules depend on meta-variables captured by an earlier pattern. _(derived)_
7. The TypeScript project must be initialized with zero disk I/O. _(derived)_
8. The Loro CRDT document must have its change merge interval set to 50. _(derived)_

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
| Invariants | 8 (0 contract, 8 derived) |

## Non-Goals

- Not a rewrite of `core/workflow/deep-research-typespec-pipeline.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/workflow/deep-research-typespec-pipeline.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
