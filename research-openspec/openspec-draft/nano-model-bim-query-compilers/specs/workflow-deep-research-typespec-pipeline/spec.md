# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : nano-model-bim-query-compilers
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/nano-model-bim-query-compilers.md
     invariants : 0 from the .research.tsp contract, 2 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: nano-model-bim-query-compilers-001

The system SHALL satisfy: Every surface touched by the agent runtime is normalized to a canonical oneOf-of-tools JSON Schema Draft 2020-12 document.

> Source: "Every surface touched by the agent runtime is normalized to a canonical oneOf-of-tools JSON Schema Draft 2020-12 document, which serves as the floor representation from which EBNF (XGrammar), GBNF (llama.cpp and @intrinsicai/gbnfgen), Zod (typespec-mcp-server-js), and database DDLs are mechanically lowered24."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: nano-model-bim-query-compilers-002

The system SHALL satisfy: Automatically injects unevaluatedProperties: { not: {} } into all emitted object schemas when seal-object-schemas is true.

> Source: "Automatically injects unevaluatedProperties: { not: {} } into all emitted object schemas, enforcing 100% parity between vLLM/XGrammar strict mode and llguidance/INSTAGRAMMAR32."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
