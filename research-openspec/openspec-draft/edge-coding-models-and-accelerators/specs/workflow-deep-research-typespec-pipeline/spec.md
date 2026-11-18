# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : edge-coding-models-and-accelerators
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/edge-coding-models-and-accelerators.md
     invariants : 0 from the .research.tsp contract, 5 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: edge-coding-models-and-accelerators-001

The system SHALL satisfy: On 8GB/12GB devices (iPhone 16 Pro / iPad Pro), models $\le 3\text{B}$ parameters fit comfortably with remaining headroom for app state.

> Source: "On 8GB/12GB devices (iPhone 16 Pro / iPad Pro), models $\le 3\text{B}$ parameters fit comfortably with remaining headroom for app state."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: edge-coding-models-and-accelerators-002

The system SHALL satisfy: On macOS SDK 27.2 (24GB+ unified memory baseline on M-series chips), models up to $16\text{B}$ MoE run with zero paging.

> Source: "On macOS SDK 27.2 (24GB+ unified memory baseline on M-series chips), models up to $16\text{B}$ MoE run with zero paging."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: edge-coding-models-and-accelerators-003

The system SHALL satisfy: Gradients are computed for low-rank adapter matrices $A \in \mathbb{R}^{r \times d}$ and $B \in \mathbb{R}^{k \times r}$ where $r=8$ or $r=16$.

> Source: "Gradients computed for low-rank adapter matrices $A \in \mathbb{R}^{r \times d}$ and $B \in \mathbb{R}^{k \times r}$ ($r=8$ or $r=16$) while keeping base model weights quantized in 4-bit integer buffers."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: edge-coding-models-and-accelerators-004

The system SHALL satisfy: Training memory overhead is $\sim 45\text{ MB}$ additional VRAM for rank-16 adapters on a 1.5B model.

> Source: "Training memory overhead: $\sim 45\text{ MB}$ additional VRAM for rank-16 adapters on a 1.5B model."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: edge-coding-models-and-accelerators-005

The system SHALL satisfy: Model execution engines expose standard WIT 0.3 interfaces.

> Source: "Model execution engines expose standard WIT 0.3 interfaces (`interface model-runner { tokenize, infer-step, train-lora }`), enabling compilation into standard WebAssembly component modules."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
