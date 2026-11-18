# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : openusd-distillation-services-typespec-effect-four-and-wit-zero-three
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/openusd-distillation-services-typespec-effect-four-and-wit-zero-three.md
     invariants : 0 from the .research.tsp contract, 5 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: openusd-distillation-services-typespec-effect-four-and-wit-zero-three-001

The system SHALL satisfy: The core budget for formalizing the underlying algebraic structures of OpenUSD must be between 50 and 250 lines of code.

> Source: "Distilling the monolithic PixarAnimationStudios/OpenUSD C++ repository into a modern, type-safe, cross-boundary software stack—comprising a TypeSpec interface definition layer7, an Effect 4.0 runtime validation and functional effect system9, and a WebAssembly Component Model WIT 0.3.1 binary contract11—requires formalizing the underlying algebraic structures of OpenUSD so that 1:1 semantic parity can be achieved within a strict 50–250 lines-of-code (LOC) core budget."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: openusd-distillation-services-typespec-effect-four-and-wit-zero-three-002

The system SHALL satisfy: The runtime must be decomposed into eight orthogonal services.

> Source: "the runtime must be decomposed into eight orthogonal services that mirror the internal module boundaries of PixarAnimationStudios/OpenUSD."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: openusd-distillation-services-typespec-effect-four-and-wit-zero-three-003

The system SHALL satisfy: The submodule's native C++ core must not violate the 50–250 LOC constraint.

> Source: "which would violate both the 50–250 LOC constraint and strict behavioral parity"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: openusd-distillation-services-typespec-effect-four-and-wit-zero-three-004

The system SHALL satisfy: The Host Runtime must target Wasmtime 46+.

> Source: "Rust + C++20 Host Runtime targeting Wasmtime 46+"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: openusd-distillation-services-typespec-effect-four-and-wit-zero-three-005

The system SHALL satisfy: The compiler module is 46 lines of code

> Source: "// File: packages/core-openusd/emitter.ts (46 LOC)"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
