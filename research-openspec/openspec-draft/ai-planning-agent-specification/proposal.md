# Proposal: ai-planning-agent-specification

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : ai-planning-agent-specification
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/ai-planning-agent-specification.md
     invariants : 0 from the .research.tsp contract, 10 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## Why

A research study in this repository states normative constraints for
`core/workflow/deep-research-typespec-pipeline.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. Local stdio MCP servers are strictly prohibited in shared or production environments. _(derived)_
2. Every remote MCP connection must enforce mutual TLS and OAuth 2.0 token scoping. _(derived)_
3. The faithfulness threshold must be greater than or equal to 0.97 to avoid violating the mandatory hallucination bound. _(derived)_
4. The minimum statistical power bound for an evaluation dataset must be 250 samples. _(derived)_
5. Diagnostics inside a TypeSpec linter rule must always be emitted via context.reportDiagnostic({ target, ... }) rather than calling program.reportDiagnostic directly. _(derived)_
6. The rule must verify 100% EARS pSLO coverage on all agent operations. _(derived)_
7. The EARS statement must conform to the five canonical syntactic patterns. _(derived)_
8. Every operation decorated with @otelGenAiSpan("execute_tool", ...) or @mcpToolBoundary must declare a Remote HTTP MCP boundary. _(derived)_
9. Every model parameter passed into an operation must be decorated with @dualLlmIsolation. _(derived)_
10. The MCP boundary must mandate per-session identity and human oversight signatures. _(derived)_

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
| Invariants | 10 (0 contract, 10 derived) |

## Non-Goals

- Not a rewrite of `core/workflow/deep-research-typespec-pipeline.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/workflow/deep-research-typespec-pipeline.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
