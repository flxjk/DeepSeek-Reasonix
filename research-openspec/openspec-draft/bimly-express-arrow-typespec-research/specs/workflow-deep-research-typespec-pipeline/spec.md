# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : bimly-express-arrow-typespec-research
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/bimly-express-arrow-typespec-research.md
     invariants : 0 from the .research.tsp contract, 4 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: bimly-express-arrow-typespec-research-001

The system SHALL satisfy: The system must strictly preserve inheritance graphs and attribute origin slots during schema compilation.

> Source: "Compile ISO 10303-11 (EXPRESS) schemas into a semantic intermediate representation, strictly preserve their inheritance graphs and attribute origin slots, and lower that representation into immutable Apache Arrow columnar batches grouped by observed runtime type combinations (archetype batches)."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-express-arrow-typespec-research-002

The system SHALL satisfy: The RHEX core meta-framework must operate without hardcoded assumptions about building construction or IFC.

> Source: "Platform-Agnostic Substrate: RHEX has zero hardcoded assumptions about building construction or IFC."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-express-arrow-typespec-research-003

The system SHALL satisfy: Bimly client applications and BFF servers must never link or execute native C++/Python EXPRESS parsers, Arrow buffer builders, or memory mappers directly.

> Source: "Client Isolation Law: Bimly client applications and BFF servers never link or execute native C++/Python EXPRESS parsers, Arrow buffer builders, or memory mappers directly."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: bimly-express-arrow-typespec-research-004

The system SHALL satisfy: Ingestion of semantic attributes into Arrow columnar format must never invoke the geometry kernel.

> Source: "Strict Geometry Decoupling Law: Ingestion of semantic attributes into Arrow columnar format MUST NEVER invoke the geometry kernel (e.g. Open Cascade / OCCT)."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
