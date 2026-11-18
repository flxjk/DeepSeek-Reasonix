# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : google-ai-studio-programmatic-api-extraction
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/google-ai-studio-programmatic-api-extraction.md
     invariants : 0 from the .research.tsp contract, 1 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: google-ai-studio-programmatic-api-extraction-001

The system SHALL satisfy: Every extracted prompt is persisted into a Markdown file in `docs/rhex/research/` and a dedicated `.research.tsp` file in `core/research/studies/`.

> Source: "Channel 4 (Dual `.md` + `.research.tsp` Repository Persistence): Persists every extracted prompt and API inventory into `docs/rhex/research/*.md`, `core/research/studies/*.research.tsp`, and `generated/google-ai-studio-extracted-state.json`."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
