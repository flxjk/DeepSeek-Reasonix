# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : local-mac-pdf-to-typespec
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/local-mac-pdf-to-typespec.md
     invariants : 0 from the .research.tsp contract, 11 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: local-mac-pdf-to-typespec-001

The system SHALL satisfy: MinerU2.5 is a 1.2B-parameter domain-specific VLM.

> Source: "Its flagship accuracy engine, **MinerU2.5**, is a 1.2B-parameter domain-specific VLM that dynamically adjusts decoding parameters (frequency_penalty and presence_penalty) based on detected layout types (e.g., applying higher penalties to prose paragraphs to prevent repetition loops and lower penalties to tables where repeated numerical tokens are valid)1."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: local-mac-pdf-to-typespec-002

The system SHALL satisfy: MinerU 4.0's default non-NVIDIA installation requires roughly 0.8 GB for the basic tier.

> Source: "Crucially for macOS deployments, MinerU 4.0's default non-NVIDIA installation executes small pipeline models on ONNX CPU inference and serves its VLM engine natively over **llama.cpp**, requiring roughly 0.8 GB for the basic tier and 2 GB for the standard GGUF tier19."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: local-mac-pdf-to-typespec-003

The system SHALL satisfy: MinerU 4.0's default non-NVIDIA installation requires 2 GB for the standard GGUF tier.

> Source: "Crucially for macOS deployments, MinerU 4.0's default non-NVIDIA installation executes small pipeline models on ONNX CPU inference and serves its VLM engine natively over **llama.cpp**, requiring roughly 0.8 GB for the basic tier and 2 GB for the standard GGUF tier19."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: local-mac-pdf-to-typespec-004

The system SHALL satisfy: PaddleOCR-VL-1.6 requires only approximately 2 GB of FP16 memory or approximately 1 GB in INT8.

> Source: "PaddleOCR-VL-1.6 (0.9B) is an Apache-2.0 licensed, 0.9B-parameter model supporting over 100 languages that achieves a headline 96.33% overall score on OmniDocBench v1.6 and leads the independent Table TEDS leaderboard at 94.76% (ahead of frontier code model at 82.95%), while requiring only ~2 GB of FP16 memory or ~1 GB in INT825."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: local-mac-pdf-to-typespec-005

The system SHALL satisfy: IBM Docling requires the use of Native Metal (MPS) or mlx-vlm (version >= 0.7.0) for local execution.

> Source: "Native Metal (MPS) + mlx-vlm (>=0.7.0)24"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: local-mac-pdf-to-typespec-006

The system SHALL satisfy: TableFormer must run in accurate mode when configuring the DocumentConverter pipeline.

> Source: "pipeline_options.table_structure_options.mode = TableFormerMode.ACCURATE"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: local-mac-pdf-to-typespec-007

The system SHALL satisfy: The pipeline must be configured to generate picture images.

> Source: "pipeline_options.generate_picture_images = True"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: local-mac-pdf-to-typespec-008

The system SHALL satisfy: The pipeline must be configured to perform chart extraction.

> Source: "pipeline_options.do_chart_extraction = True"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: local-mac-pdf-to-typespec-009

The system SHALL satisfy: The local LLM must be configured to use a temperature of 0.0 when calling the local LLM endpoint.

> Source: ""temperature": 0.0,"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: local-mac-pdf-to-typespec-010

The system SHALL satisfy: The local LLM must be configured to generate a maximum of 4096 tokens.

> Source: ""max_tokens": 4096,"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: local-mac-pdf-to-typespec-011

The system SHALL satisfy: The local LLM must be retried up to 4 times if the initial compilation fails.

> Source: "for attempt in range(1, max_retries + 1):"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
