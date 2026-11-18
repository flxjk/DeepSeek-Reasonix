# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : distributed-bim-architecture-analysis
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/distributed-bim-architecture-analysis.md
     invariants : 0 from the .research.tsp contract, 6 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: distributed-bim-architecture-analysis-001

The system SHALL satisfy: Every committed database state on every replica must obey the declared invariant predicate.

> Source: "global validity, ensuring every committed database state on every replica obeys the declared invariant predicate ![][image1];"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: distributed-bim-architecture-analysis-002

The system SHALL satisfy: Any local transaction that would violate the invariant must locally abort.

> Source: "meaning any local transaction that would violate ![][image1] locally aborts3."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: distributed-bim-architecture-analysis-003

The system SHALL satisfy: For all invariant-valid common ancestor states and all pairs of invariant-valid transaction sequences over a set of transactions, the merged state must remain invariant-valid.

> Source: "for all ![][image1]\-valid common ancestor states ![][image19] and all pairs of ![][image1]\-valid transaction sequences ![][image20] over ![][image13] starting from ![][image21], the merged state remains ![][image1]\-valid20:"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: distributed-bim-architecture-analysis-004

The system SHALL satisfy: Every information container ID must conform to the 7-field hyphen-delimited structure PROJECT-ORIGINATOR-VOLUME-LEVEL-TYPE-ROLE-NUMBER, containing zero whitespace characters.

> Source: "First, every information container ID must conform to the 7-field hyphen-delimited structure PROJECT-ORIGINATOR-VOLUME-LEVEL-TYPE-ROLE-NUMBER (for example, 123-ARUP-A1-ZZ-M3-A-0001 for an architectural 3D model in Zone A1, or WZ1-ZIG-V4-01-M1-A-001 with status and revision metadata S01-P01), containing zero whitespace characters5."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: distributed-bim-architecture-analysis-005

The system SHALL satisfy: Role-specific volume codes must not collide across disciplines.

> Source: "Second, as required by BS 1192 and ISO 19650 numbering guidelines, role-specific volume codes must not collide across disciplines—for instance, if the structural engineering team (Role == "S") reserves volume code "S1", the security engineering team (Role == "Y" or "E") is prohibited from assigning "S1" to a security volume5."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: distributed-bim-architecture-analysis-006

The system SHALL satisfy: Containers in the WIP state must carry status code S0 and a preliminary revision code P01..Pn.

> Source: "Containers in the WIP state must carry status code S0 and a preliminary revision code P01..Pn29."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
