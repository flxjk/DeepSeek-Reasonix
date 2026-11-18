# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : bimly-spatial-context-cost-and-realtime-optimisation
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/bimly-spatial-context-cost-and-realtime-optimisation.md
     invariants : 0 from the .research.tsp contract, 5 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: bimly-spatial-context-cost-and-realtime-optimisation-001

The system SHALL satisfy: Camera movement and navigation must achieve 60 FPS on supported desktop fixtures, with a 30 FPS fallback for constrained devices.

> Source: "Camera movement and navigation | 60 FPS on supported desktop fixture; 30 FPS constrained-device fallback"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-spatial-context-cost-and-realtime-optimisation-002

The system SHALL satisfy: High-refresh interaction must operate with an 8.33 ms frame budget.

> Source: "High-refresh interaction | Optional 120 FPS on qualified hardware | An 8.33 ms frame budget; do not promise across devices or charge for unattainable performance"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-spatial-context-cost-and-realtime-optimisation-003

The system SHALL satisfy: Selection and immediate feedback must have a visible acknowledgement within 100 ms p95.

> Source: "Selection and immediate feedback | Visible acknowledgement within 100 ms p95 | Use local scene/index data; label provisional results"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-spatial-context-cost-and-realtime-optimisation-004

The system SHALL satisfy: Warm contextual queries must complete end-to-end within 250 ms p95 on the declared fixture.

> Source: "Warm contextual query | ≤250 ms p95 end-to-end on declared fixture | Indexed bounds, authorised caches and bounded results"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-spatial-context-cost-and-realtime-optimisation-005

The system SHALL satisfy: A B2C occasional project must have an explicit import and retention limit.

> Source: "B2C occasional project | Understand one site and inspect clear findings | Small active-project allowance, standard display quality, explicit import/retention limits, refresh on request, spending off by default"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
