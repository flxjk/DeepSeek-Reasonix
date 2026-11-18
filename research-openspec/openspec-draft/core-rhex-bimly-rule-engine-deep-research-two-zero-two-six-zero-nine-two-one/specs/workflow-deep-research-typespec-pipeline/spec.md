# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : core-rhex-bimly-rule-engine-deep-research-two-zero-two-six-zero-nine-two-one
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/core-rhex-bimly-rule-engine-deep-research-two-zero-two-six-zero-nine-two-one.md
     invariants : 0 from the .research.tsp contract, 3 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: core-rhex-bimly-rule-engine-deep-research-two-zero-two-six-zero-nine-two-one-001

The system SHALL satisfy: Small local predicate group p99 must be less than or equal to 1 ms under warm in-process evaluation with declared bounded input and no external I/O.

> Source: "Small local predicate group | p99 ≤ 1 ms | Warm in-process evaluation, declared bounded input, no external I/O"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: core-rhex-bimly-rule-engine-deep-research-two-zero-two-six-zero-nine-two-one-002

The system SHALL satisfy: Request authorization p99 must be less than or equal to 5 ms on a same-host path including fact assembly/serialization.

> Source: "Request authorization | p99 ≤ 5 ms | Same-host path including fact assembly/serialization; separate distributed profile"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: core-rhex-bimly-rule-engine-deep-research-two-zero-two-six-zero-nine-two-one-003

The system SHALL satisfy: Expensive engineering validation must have an interactive acknowledgement less than or equal to 100 ms.

> Source: "Expensive engineering validation | Interactive acknowledgement ≤ 100 ms | Actual completion is asynchronous and measured separately"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
