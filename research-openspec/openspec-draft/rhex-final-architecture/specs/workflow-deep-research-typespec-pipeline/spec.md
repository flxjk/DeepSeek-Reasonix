# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : rhex-final-architecture
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/rhex-final-architecture.md
     invariants : 0 from the .research.tsp contract, 2 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: rhex-final-architecture-001

The system SHALL satisfy: The native host must have a lifetime lock for its duration.

> Source: "The host acquires a nonblocking kernel lock on a stable file and holds the descriptor until shutdown."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: rhex-final-architecture-002

The system SHALL satisfy: The compiler process must run at most one active compilation per compiler instance.

> Source: "The compiler process owns a native host adapter, parse cache, bounded SourceFile cache, configuration results, and at most one reusable Program per active compilation key."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
