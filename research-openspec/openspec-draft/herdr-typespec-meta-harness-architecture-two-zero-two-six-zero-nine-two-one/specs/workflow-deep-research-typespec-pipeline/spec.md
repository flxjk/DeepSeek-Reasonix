# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : herdr-typespec-meta-harness-architecture-two-zero-two-six-zero-nine-two-one
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/herdr-typespec-meta-harness-architecture-two-zero-two-six-zero-nine-two-one.md
     invariants : 0 from the .research.tsp contract, 3 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: herdr-typespec-meta-harness-architecture-two-zero-two-six-zero-nine-two-one-001

The system SHALL satisfy: A successful TypeSpec compilation must never start agents, install plugins, grant capabilities, publish an SDK, or modify a CAD model.

> Source: "A successful TypeSpec compilation must never start agents, install plugins, grant capabilities, publish an SDK, or modify a CAD model."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: herdr-typespec-meta-harness-architecture-two-zero-two-six-zero-nine-two-one-002

The system SHALL satisfy: Core must not import RHEX.

> Source: "Core must not import RHEX."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: herdr-typespec-meta-harness-architecture-two-zero-two-six-zero-nine-two-one-003

The system SHALL satisfy: RHEX must not import a platform instance or Bimly.

> Source: "RHEX must not import a platform instance or Bimly."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
