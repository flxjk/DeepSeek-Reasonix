# Workflow deep research typespec pipeline specification delta

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

## ADDED Requirements

### Requirement: core-hub-architect-planning-agent-prompt-001

The system SHALL satisfy: TypeSpec is the semantic source of truth; TypeSpec is the requested baseline.

> Source: "TypeSpec is the semantic source of truth; TypeSpec is the requested baseline."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: core-hub-architect-planning-agent-prompt-002

The system SHALL satisfy: Core must never import RHEX or Bimly namespaces.

> Source: "Core must never import RHEX or Bimly namespaces."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: core-hub-architect-planning-agent-prompt-003

The system SHALL satisfy: The allowed dependency direction is Core primitives → Core capabilities → Core Hub composition → RHEX policy/composition → Bimly domain composition.

> Source: "Enforce the allowed dependency direction: Core primitives → Core capabilities → Core Hub composition → RHEX policy/composition → Bimly domain composition."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: core-hub-architect-planning-agent-prompt-004

The system SHALL satisfy: UI visibility is never authorization enforcement.

> Source: "UI visibility is never authorization enforcement."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: core-hub-architect-planning-agent-prompt-005

The system SHALL satisfy: Every operation must declare its actor/context requirements, input/output, typed errors, authorization scope, side effects, concurrency behavior, idempotency, cancellation, deadline, retries, audit consequences and compensation where relevant.

> Source: "Every operation must declare its actor/context requirements, input/output, typed errors, authorization scope, side effects, concurrency behavior, idempotency, cancellation, deadline, retries, audit consequences and compensation where relevant."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
