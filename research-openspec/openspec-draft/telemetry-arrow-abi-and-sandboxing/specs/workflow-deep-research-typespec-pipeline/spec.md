# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : telemetry-arrow-abi-and-sandboxing
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/telemetry-arrow-abi-and-sandboxing.md
     invariants : 0 from the .research.tsp contract, 4 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: telemetry-arrow-abi-and-sandboxing-001

The system SHALL satisfy: At-recording correction (recordValueWithExpectedInterval) and post-recording correction (copyCorrectedForCoordinatedOmission) are mutually exclusive.

> Source: "A strict operational invariant governs this mechanism: **at-recording correction** (recordValueWithExpectedInterval) and **post-recording correction** (copyCorrectedForCoordinatedOmission) are mutually exclusive15."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: telemetry-arrow-abi-and-sandboxing-002

The system SHALL satisfy: Any BIM graph indexer or multi-tenant analytical store using IfcProject.GlobalId as a primary partition key will suffer catastrophic cross-tenant graph merging and silent entity overwrites unless records are namespaced by content-addressable file digest (sha256).

> Source: "Consequently, any BIM graph indexer (such as pipelines indexing IFC files into ChromaDB, BM25, and Neo4j55) or multi-tenant analytical store that uses IfcProject.GlobalId as a primary partition key will suffer catastrophic cross-tenant graph merging and silent entity overwrites unless records are namespaced by content-addressable file digest (sha256)"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: telemetry-arrow-abi-and-sandboxing-003

The system SHALL satisfy: Every chunk yielded by get_next must reside on the mandatory stream-level device type.

> Source: "Mandatory stream-level device type; every chunk yielded by get_next must reside on this device type3"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: telemetry-arrow-abi-and-sandboxing-004

The system SHALL satisfy: get_next signals end-of-stream when its return value is 0 and out->array.release is NULL.

> Source: "end-of-stream is signaled when return is 0 and out->array.release == NULL [cite: 3, 18]"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
