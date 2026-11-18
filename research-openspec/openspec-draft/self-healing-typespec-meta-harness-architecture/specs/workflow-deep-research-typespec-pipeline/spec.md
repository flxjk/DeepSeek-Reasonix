# Workflow deep research typespec pipeline specification delta

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

## ADDED Requirements

### Requirement: self-healing-typespec-meta-harness-architecture-001

The system SHALL satisfy: The final set of false positives must be empty after dis-unification.

> Source: "assert(falsePositives.length === 0, "Dis-unification failed to eliminate all false positives");"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: self-healing-typespec-meta-harness-architecture-002

The system SHALL satisfy: The round-trip AST match must be exact modulo trivia for every episode.

> Source: "assert(astEqualModuloTrivia(patched, ep.afterRedNode.text()), "Round-trip AST mismatch");"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: self-healing-typespec-meta-harness-architecture-003

The system SHALL satisfy: The summary.md file contains the newest 20 issues in full, and older issues are listed by ID.

> Source: "Surfaced in summary.md (newest 20 in full, older by ID) and triggers precheck_file warnings regardless of age1."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: self-healing-typespec-meta-harness-architecture-004

The system SHALL satisfy: Precheck_file invokes the governance gate over MCP or CLI before any agent tool call (edit_file, write_file, or LLM repair prompt synthesis) is permitted to execute.

> Source: "Before any agent tool call (edit_file, write_file, or LLM repair prompt synthesis) is permitted to execute, the meta-harness invokes the precheck_file(file_path) governance gate over MCP or CLI (pjm precheck)1."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: self-healing-typespec-meta-harness-architecture-005

The system SHALL satisfy: The new candidate lower bound L_new must be greater than or equal to 0.

> Source: "(assert (\! (>= L_new 0) :named H_non_negative_domain))"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: self-healing-typespec-meta-harness-architecture-006

The system SHALL satisfy: The new candidate upper bound U_new must be less than or equal to 2147483647.

> Source: "(assert (\! (<= U_new 2147483647) :named H_int32_max))"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: self-healing-typespec-meta-harness-architecture-007

The system SHALL satisfy: For all x in [L_new, U_new], the worst-case upper bound U_new must satisfy the linear sink predicate (<= 1024).

> Source: "(assert (\! (<= (+ (* 4 U_new) 64) 1024) :named H_cpg_sink_safety))"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: self-healing-typespec-meta-harness-architecture-008

The system SHALL satisfy: The `BatchIngestRequest.payload` must contain at least 1 item.

> Source: "@minItems(1)  payload: int32\[\];"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: self-healing-typespec-meta-harness-architecture-009

The system SHALL satisfy: The `ingestBatch` operation must have a `maxBlastRadiusNodes` of 18 and a `latencyGateNs` of 120.

> Source: "@agentCapability(\#{  allowedCpgSinks: #["RingBuffer::pushBounded", "Metrics::recordIngest"],  maxBlastRadiusNodes: 18,  latencyGateNs: 120  })  op ingestBatch(@body body: BatchIngestRequest): { acceptedFrames: int32 } | {  @statusCode statusCode: 422;  errorCode: "TSP_ERR_FRAME_COUNT_OVERFLOW";  };"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
