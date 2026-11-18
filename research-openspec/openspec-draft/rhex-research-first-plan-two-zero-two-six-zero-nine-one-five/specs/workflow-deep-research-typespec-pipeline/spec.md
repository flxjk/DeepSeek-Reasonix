# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : rhex-research-first-plan-two-zero-two-six-zero-nine-one-five
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/rhex-research-first-plan-two-zero-two-six-zero-nine-one-five.md
     invariants : 0 from the .research.tsp contract, 2 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: rhex-research-first-plan-two-zero-two-six-zero-nine-one-five-001

The system SHALL satisfy: TypeSpec remains the Single Source of Truth (SSOT); the canonical semantic IR connects independent Effect, Restate, WIT, Arrow, and evidence emitters.

> Source: "TypeSpec остаётся SSOT; canonical semantic IR соединяет независимые Effect, Restate, WIT, Arrow и evidence emitters."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: rhex-research-first-plan-two-zero-two-six-zero-nine-one-five-002

The system SHALL satisfy: Four logical agent levels do not require four sequential RPC or LLM calls.

> Source: "Четыре логических уровня агентов не требуют четырёх последовательных RPC или LLM calls."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
