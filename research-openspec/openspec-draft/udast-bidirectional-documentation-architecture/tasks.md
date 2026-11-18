# Tasks: udast-bidirectional-documentation-architecture

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

- [ ] t01 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t01b Add a deterministic check for: The plugin itself accepts no runtime parameters and does not transform directive
- [ ] t02 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t02b Add a deterministic check for: resolveCompilerOptions must bind strictly to the virtual SystemHost without fall
- [ ] t03 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t03b Add a deterministic check for: directiveToMarkdown must be configured with preferShortcut: true and collapseEmp
- [ ] t04 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t04b Add a deterministic check for: A LoroDoc instance must never share a PeerID across concurrent tabs, worker thre
- [ ] t05 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t05b Add a deterministic check for: @bimly/udast-engine initializes all sub-containers (attributes map and content L
- [ ] t06 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t06b Add a deterministic check for: Relational rules and composite rules must use all when subsequent rules depend o
- [ ] t07 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t07b Add a deterministic check for: The TypeScript project must be initialized with zero disk I/O.
- [ ] t08 Confirm in `core/workflow/deep-research-typespec-pipeline.tsp` whether the invariant currently holds
- [ ] t08b Add a deterministic check for: The Loro CRDT document must have its change merge interval set to 50.
