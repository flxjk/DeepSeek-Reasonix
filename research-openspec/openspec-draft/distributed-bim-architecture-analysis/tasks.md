# Tasks: distributed-bim-architecture-analysis

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : distributed-bim-architecture-analysis
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/distributed-bim-architecture-analysis.md
     invariants : 0 from the .research.tsp contract, 6 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

- [ ] t01 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t01b Add a deterministic check for: Every committed database state on every replica must obey the declared invariant
- [ ] t02 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t02b Add a deterministic check for: Any local transaction that would violate the invariant must locally abort.
- [ ] t03 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t03b Add a deterministic check for: For all invariant-valid common ancestor states and all pairs of invariant-valid 
- [ ] t04 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t04b Add a deterministic check for: Every information container ID must conform to the 7-field hyphen-delimited stru
- [ ] t05 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t05b Add a deterministic check for: Role-specific volume codes must not collide across disciplines.
- [ ] t06 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t06b Add a deterministic check for: Containers in the WIP state must carry status code S0 and a preliminary revision
