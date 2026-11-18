# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : bimly-engineering-reply-deep-research
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/bimly-engineering-reply-deep-research.md
     invariants : 0 from the .research.tsp contract, 5 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: bimly-engineering-reply-deep-research-001

The system SHALL satisfy: The reply's correction rule for a complete scheduled-arrival trace is to record the actual schedule-to-outcome observations without generating another population of synthetic requests.

> Source: "Keep the reply's correction rule for a complete scheduled-arrival trace: record the actual schedule-to-outcome observations without generating another population of synthetic requests."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-engineering-reply-deep-research-002

The system SHALL satisfy: A maximum watermark does not prove every required object and consumer is ready.

> Source: "A maximum watermark does not prove every required object and consumer is ready."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-engineering-reply-deep-research-003

The system SHALL satisfy: Implementation gate requires demonstrating bounded peak memory under an enforced process limit, with source dependencies larger than RAM where that is a requirement.

> Source: "Implementation gate: demonstrate bounded peak memory under an enforced process limit, with source dependencies larger than RAM where that is a requirement."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-engineering-reply-deep-research-004

The system SHALL satisfy: Every accepted revision must refer to a logically complete entity-version map, implemented with shared immutable chunks, a persistent map, or a materialized snapshot plus a bounded delta chain.

> Source: "Recommended baseline: every accepted revision refers to a logically complete entity-version map, implemented with shared immutable chunks, a persistent map, or a materialized snapshot plus a bounded delta chain."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-engineering-reply-deep-research-005

The system SHALL satisfy: A complete spatial predicate must name the query and version, geometry/clearance envelope, frame, units, tolerances, semantic filters, temporal scope if relevant, and the revision against which it was evaluated.

> Source: "A complete spatial predicate names the query and version, geometry/clearance envelope, frame, units, tolerances, semantic filters, temporal scope if relevant, and the revision against which it was evaluated."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
