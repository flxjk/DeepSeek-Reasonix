# Tasks: core-hub-architect-planning-agent-prompt

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : core-hub-architect-planning-agent-prompt
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/core-hub-architect-planning-agent-prompt.md
     invariants : 0 from the .research.tsp contract, 5 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

- [ ] t01 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t01b Add a deterministic check for: TypeSpec is the semantic source of truth; TypeSpec is the requested baseline.
- [ ] t02 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t02b Add a deterministic check for: Core must never import RHEX or Bimly namespaces.
- [ ] t03 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t03b Add a deterministic check for: The allowed dependency direction is Core primitives → Core capabilities → Core H
- [ ] t04 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t04b Add a deterministic check for: UI visibility is never authorization enforcement.
- [ ] t05 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t05b Add a deterministic check for: Every operation must declare its actor/context requirements, input/output, typed
