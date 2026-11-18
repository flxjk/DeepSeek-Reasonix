# Providers google notebooklm conversation synthesis specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : notebooklm-grounded-corpus-and-audio-overview-synthesis
     ssot       : core/providers/google/notebooklm-conversation-synthesis.tsp (resolves)
     binding    : specific — the contract was declared by the study author
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/notebooklm-grounded-corpus-and-audio-overview-synthesis.md
     invariants : 2 from the .research.tsp contract, 0 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: notebooklm-grounded-corpus-and-audio-overview-synthesis-001

The system SHALL satisfy: All 7 NotebookLM workspaces in NotebookLmDistilledCorpusCatalog carry populated grounded sources and BLAKE3 digests

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: notebooklm-grounded-corpus-and-audio-overview-synthesis-002

The system SHALL satisfy: NotebookLmSynthesisArtifactUnion enforces zero-envelope constrained polymorphic discrimination

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
