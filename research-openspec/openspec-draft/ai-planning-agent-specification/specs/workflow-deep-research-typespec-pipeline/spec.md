# Workflow deep research typespec pipeline specification delta

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

## ADDED Requirements

### Requirement: ai-planning-agent-specification-001

The system SHALL satisfy: Local stdio MCP servers are strictly prohibited in shared or production environments.

> Source: "Local stdio MCP servers inherit the host process's operating system permissions and are strictly prohibited in shared or production environments"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: ai-planning-agent-specification-002

The system SHALL satisfy: Every remote MCP connection must enforce mutual TLS and OAuth 2.0 token scoping.

> Source: "Every remote MCP connection enforces mutual TLS and OAuth 2.0 token scoping with automated token rotation and revocation, rejecting unauthenticated tool discovery or invocation"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: ai-planning-agent-specification-003

The system SHALL satisfy: The faithfulness threshold must be greater than or equal to 0.97 to avoid violating the mandatory hallucination bound.

> Source: "hallucinationBoundExceeded: paramMessage`Faithfulness threshold on "${"targetName"}" is ${"actualValue"}, violating the mandatory < 3% hallucination bound (faithfulnessMin >= 0.97).`"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: ai-planning-agent-specification-004

The system SHALL satisfy: The minimum statistical power bound for an evaluation dataset must be 250 samples.

> Source: "sampleSizeTooSmall: paramMessage`Evaluation dataset "${"datasetUrn"}" specifies minSampleSize=${"actualSize"}, which is below the minimum statistical power bound of 250 samples.`"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: ai-planning-agent-specification-005

The system SHALL satisfy: Diagnostics inside a TypeSpec linter rule must always be emitted via context.reportDiagnostic({ target, ... }) rather than calling program.reportDiagnostic directly.

> Source: "Critically, inside a TypeSpec linter rule, diagnostics must always be emitted via context.reportDiagnostic({ target, ... }) rather than calling program.reportDiagnostic directly57."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: ai-planning-agent-specification-006

The system SHALL satisfy: The rule must verify 100% EARS pSLO coverage on all agent operations.

> Source: "This rule visits every operation in the AST to verify 100% EARS pSLO coverage"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: ai-planning-agent-specification-007

The system SHALL satisfy: The EARS statement must conform to the five canonical syntactic patterns.

> Source: "verify that the EARS statement conforms to the five canonical syntactic patterns"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: ai-planning-agent-specification-008

The system SHALL satisfy: Every operation decorated with @otelGenAiSpan("execute_tool", ...) or @mcpToolBoundary must declare a Remote HTTP MCP boundary.

> Source: "It inspects every operation decorated with @otelGenAiSpan("execute_tool", ...) or @mcpToolBoundary and verifies that the operation declares a Remote HTTP MCP boundary"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: ai-planning-agent-specification-009

The system SHALL satisfy: Every model parameter passed into an operation must be decorated with @dualLlmIsolation.

> Source: "that every model parameter passed into the operation is decorated with @dualLlmIsolation proving it was sanitized by the QuarantinedReader or verified by the SymbolicDomainCore"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: ai-planning-agent-specification-010

The system SHALL satisfy: The MCP boundary must mandate per-session identity and human oversight signatures.

> Source: "and that the MCP boundary mandates per-session identity and human oversight signatures"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
