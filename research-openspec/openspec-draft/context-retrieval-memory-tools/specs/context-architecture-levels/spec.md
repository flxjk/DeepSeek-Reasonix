# Context architecture levels specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : context-retrieval-memory-tools
     ssot       : core/context/architecture/levels.tsp (resolves)
     binding    : specific — the contract was declared by the study author
     checkedOn  : 2026-10-02 (39 days before 2026-11-10)
     source leaf: docs/rhex/research/context-retrieval-memory-tools.md
     invariants : 1 from the .research.tsp contract, 0 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: context-retrieval-memory-tools-001

The system SHALL satisfy: Conversation share remains <= 0.10 via token-tools slice retrieval and artifact citations

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
