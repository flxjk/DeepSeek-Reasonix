# Ai tool capability registry specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : ai-tool-capabilities
     ssot       : core/ai-tool/capability-registry.tsp (resolves)
     binding    : specific — the contract was declared by the study author
     checkedOn  : 2026-09-17 (54 days before 2026-11-10)
     source leaf: docs/rhex/research/ai-tool-capabilities.md
     invariants : 2 from the .research.tsp contract, 0 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: ai-tool-capabilities-001

The system SHALL satisfy: All AI harnesses consume a single canonical TypeSpec SSOT without vendor lock-in

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: ai-tool-capabilities-002

The system SHALL satisfy: Dedicated TypeSpec emitters and pure Effect v4 services back every registered AI tool

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
