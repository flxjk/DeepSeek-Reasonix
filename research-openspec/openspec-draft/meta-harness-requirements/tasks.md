# Tasks: meta-harness-requirements

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

- [ ] t01 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t01b Add a deterministic check for: Every contract declaration SHALL have ownership derived from the reviewed source
- [ ] t02 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t02b Add a deterministic check for: Core SHALL reject dependencies on RHEX, Platform and Bimly through imports, type
- [ ] t03 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t03b Add a deterministic check for: Compilation SHALL only generate artifacts and diagnostics.
- [ ] t04 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t04b Add a deterministic check for: The checked graph SHALL normalize into a versioned owned IR retaining source pro
- [ ] t05 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t05b Add a deterministic check for: Unknown mandatory semantics SHALL reject a target.
- [ ] t06 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t06b Add a deterministic check for: Generated artifacts SHALL be deterministic for the declared build inputs.
- [ ] t07 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t07b Add a deterministic check for: Each output path SHALL have one owner and remain inside its output root.
