# Workflow deep research typespec pipeline specification delta

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

## ADDED Requirements

### Requirement: udast-bidirectional-documentation-architecture-001

The system SHALL satisfy: The plugin itself accepts no runtime parameters and does not transform directives into rendered output.

> Source: "A critical operational nuance of remark-directive (v3.0.0 and v4.0.0) is that the plugin itself accepts no runtime parameters and does not transform directives into rendered output; it solely makes directive syntax parseable into mdast nodes and serializable back to Markdown11."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: udast-bidirectional-documentation-architecture-002

The system SHALL satisfy: resolveCompilerOptions must bind strictly to the virtual SystemHost without fallback to disk-based NodeHost resolution.

> Source: "Ensure resolveCompilerOptions binds strictly to the virtual SystemHost without fallback to disk-based NodeHost resolution."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: udast-bidirectional-documentation-architecture-003

The system SHALL satisfy: directiveToMarkdown must be configured with preferShortcut: true and collapseEmptyAttributes: true to guarantee zero syntactic churn during agentic round-trips.

> Source: "By explicitly configuring directiveToMarkdown with preferShortcut: true and collapseEmptyAttributes: true, #step-chg006-02 and .critical-path serialize identically to their authored shorthand rather than expanding into verbose id="step-chg006-02" class="critical-path" strings, guaranteeing zero syntactic churn during agentic round-trips11."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: udast-bidirectional-documentation-architecture-004

The system SHALL satisfy: A LoroDoc instance must never share a PeerID across concurrent tabs, worker threads, or coding agent processes.

> Source: "First, a LoroDoc instance must never share a PeerID across concurrent tabs, worker threads, or coding agent processes, nor should fixed PeerIDs be assigned to specific users or agent roles, as doing so causes permanent document divergence14."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: udast-bidirectional-documentation-architecture-005

The system SHALL satisfy: @bimly/udast-engine initializes all sub-containers (attributes map and content LoroText) upfront when a LoroTreeNode is instantiated.

> Source: "Consequently, @bimly/udast-engine initializes all sub-containers (attributes map and content LoroText) upfront when a LoroTreeNode is instantiated, and uses mergeable primitives such as node.data.ensureMergeableList("diagnostics") whenever a child list may be lazily populated by concurrent compiler workers13."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: udast-bidirectional-documentation-architecture-006

The system SHALL satisfy: Relational rules and composite rules must use all when subsequent rules depend on meta-variables captured by an earlier pattern.

> Source: "when composing complex structural queries in NapiConfig, relational rules (inside, has with field) and composite rules (all, any, not) must use all whenever subsequent rules depend on meta-variables ($VAR or $$$ARGS) captured by an earlier pattern"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: udast-bidirectional-documentation-architecture-007

The system SHALL satisfy: The TypeScript project must be initialized with zero disk I/O.

> Source: "1\. Initialize in-RAM ts-morph project with zero disk I/O"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: udast-bidirectional-documentation-architecture-008

The system SHALL satisfy: The Loro CRDT document must have its change merge interval set to 50.

> Source: "this.loroDoc.setChangeMergeInterval(50);"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
