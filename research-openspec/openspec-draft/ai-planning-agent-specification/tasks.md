# Tasks: ai-planning-agent-specification

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

- [ ] t01 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t01b Add a deterministic check for: Local stdio MCP servers are strictly prohibited in shared or production environm
- [ ] t02 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t02b Add a deterministic check for: Every remote MCP connection must enforce mutual TLS and OAuth 2.0 token scoping.
- [ ] t03 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t03b Add a deterministic check for: The faithfulness threshold must be greater than or equal to 0.97 to avoid violat
- [ ] t04 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t04b Add a deterministic check for: The minimum statistical power bound for an evaluation dataset must be 250 sample
- [ ] t05 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t05b Add a deterministic check for: Diagnostics inside a TypeSpec linter rule must always be emitted via context.rep
- [ ] t06 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t06b Add a deterministic check for: The rule must verify 100% EARS pSLO coverage on all agent operations.
- [ ] t07 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t07b Add a deterministic check for: The EARS statement must conform to the five canonical syntactic patterns.
- [ ] t08 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t08b Add a deterministic check for: Every operation decorated with @otelGenAiSpan("execute_tool", ...) or @mcpToolBo
- [ ] t09 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t09b Add a deterministic check for: Every model parameter passed into an operation must be decorated with @dualLlmIs
- [ ] t10 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t10b Add a deterministic check for: The MCP boundary must mandate per-session identity and human oversight signature
