# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : bimly-prioritized-research-agenda
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/bimly-prioritized-research-agenda.md
     invariants : 0 from the .research.tsp contract, 4 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: bimly-prioritized-research-agenda-001

The system SHALL satisfy: Ambiguous identity reconciliation must remain visible; proximity alone must not silently assign identity.

> Source: "Ambiguous identity reconciliation must remain visible; proximity alone must not silently assign identity."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-prioritized-research-agenda-002

The system SHALL satisfy: A geometry-kernel selection matrix and adversarial corpus covering nearly coplanar faces, tiny gaps, large coordinates, self-intersections, and feature edits that change face numbering must be delivered.

> Source: "Experiment and deliverable: a geometry-kernel selection matrix and adversarial corpus covering nearly coplanar faces, tiny gaps, large coordinates, self-intersections, and feature edits that change face numbering."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-prioritized-research-agenda-003

The system SHALL satisfy: A vendor/version/feature matrix and a round-trip loss report must be delivered for IFC fidelity.

> Source: "Experiment and deliverable: a vendor/version/feature matrix and a round-trip loss report."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-prioritized-research-agenda-004

The system SHALL satisfy: Assert model invariants and recoverability must be done when injecting reorderings, duplicated operations, network partitions, and crashes.

> Source: "Inject reorderings, duplicated operations, network partitions, and crashes. Assert model invariants and recoverability; make the scope of deterministic simulation explicit."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
