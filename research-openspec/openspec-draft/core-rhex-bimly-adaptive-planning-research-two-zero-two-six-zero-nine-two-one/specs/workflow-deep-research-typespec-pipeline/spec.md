# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : core-rhex-bimly-adaptive-planning-research-two-zero-two-six-zero-nine-two-one
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/core-rhex-bimly-adaptive-planning-research-two-zero-two-six-zero-nine-two-one.md
     invariants : 0 from the .research.tsp contract, 6 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: core-rhex-bimly-adaptive-planning-research-two-zero-two-six-zero-nine-two-one-001

The system SHALL satisfy: Basis points must be integers between 0 and 10,000.

> Source: "Basis points are integers in 0..10,000"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: core-rhex-bimly-adaptive-planning-research-two-zero-two-six-zero-nine-two-one-002

The system SHALL satisfy: Exactly one entry must exist per principal route, and the desired shares must total 10,000.

> Source: "Exactly one entry per principal route; desired shares total 10,000"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: core-rhex-bimly-adaptive-planning-research-two-zero-two-six-zero-nine-two-one-003

The system SHALL satisfy: External-disabled profiles must have external desired, lower, and upper set to 0.

> Source: "External-disabled profiles have external desired/lower/upper = 0"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: core-rhex-bimly-adaptive-planning-research-two-zero-two-six-zero-nine-two-one-004

The system SHALL satisfy: Route selection must have a p99 latency of 5 ms or less.

> Source: "Route selection | p99 ≤ 5 ms | Warm deterministic policy, cached metadata, ≤32 routes; excludes durable reservation"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: core-rhex-bimly-adaptive-planning-research-two-zero-two-six-zero-nine-two-one-005

The system SHALL satisfy: Dispatch admission must have a p95 latency of 50 ms or less.

> Source: "Dispatch admission | p95 ≤ 50 ms | Same-region small-work profile including required ledger transaction"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: core-rhex-bimly-adaptive-planning-research-two-zero-two-six-zero-nine-two-one-006

The system SHALL satisfy: Adaptive overhead must be less than or equal to 1% of accounted worker compute in the measured profile.

> Source: "Adaptive overhead | ≤1% of accounted worker compute in the measured profile | Includes router and controller; verify separately from fixed-cost services"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
