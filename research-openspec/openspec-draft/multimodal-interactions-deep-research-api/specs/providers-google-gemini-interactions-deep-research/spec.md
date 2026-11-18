# Providers google gemini interactions deep research specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : multimodal-interactions-deep-research-api
     ssot       : core/providers/google/gemini-interactions-deep-research.tsp (resolves)
     binding    : specific — the contract was declared by the study author
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/multimodal-interactions-deep-research-api.md
     invariants : 2 from the .research.tsp contract, 0 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: multimodal-interactions-deep-research-api-001

The system SHALL satisfy: Deep Research runs execute asynchronously with background: true and checkpointed ThoughtSignature DAGs

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: multimodal-interactions-deep-research-api-002

The system SHALL satisfy: Per-part GeminiMediaResolution bounds PDF page tokenization (70 LOW, 280 MEDIUM, 560 HIGH, 1120 ULTRA_HIGH)

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
