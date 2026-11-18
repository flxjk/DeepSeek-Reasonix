# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : alloy-js-reactive-synthesis-architecture
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/alloy-js-reactive-synthesis-architecture.md
     invariants : 0 from the .research.tsp contract, 1 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: alloy-js-reactive-synthesis-architecture-001

The system SHALL satisfy: User-defined types that reference third-party library constructs or shared runtime validators must emit a standalone declaration for the referenced construct on demand and subsequently link all call sites to that emitted declaration.

> Source: "In complex multi-pass emitters like typespec-zod, user-defined types that reference third-party library constructs or shared runtime validators must emit a standalone declaration for the referenced construct on demand and subsequently link all call sites to that emitted declaration5."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
