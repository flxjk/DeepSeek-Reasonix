# Tasks: implementation-handoff

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : implementation-handoff
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/implementation-handoff.md
     invariants : 0 from the .research.tsp contract, 3 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

- [ ] t01 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t01b Add a deterministic check for: The IR schema must contain no compiler objects or product/provider imports.
- [ ] t02 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t02b Add a deterministic check for: Missing or bypassed policy blocks must cause candidate admission to fail.
- [ ] t03 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t03b Add a deterministic check for: A consumer that bypasses the TypeSpec validator must still be unable to publish 
