# Proposal: local-mac-pdf-to-typespec

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

## Why

A research study in this repository states normative constraints for
`core/workflow/deep-research-typespec-pipeline.tsp`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

The bound contract exists, so these invariants **modify** live behaviour.

## What changes

1. MinerU2.5 is a 1.2B-parameter domain-specific VLM. _(derived)_
2. MinerU 4.0's default non-NVIDIA installation requires roughly 0.8 GB for the basic tier. _(derived)_
3. MinerU 4.0's default non-NVIDIA installation requires 2 GB for the standard GGUF tier. _(derived)_
4. PaddleOCR-VL-1.6 requires only approximately 2 GB of FP16 memory or approximately 1 GB in INT8. _(derived)_
5. IBM Docling requires the use of Native Metal (MPS) or mlx-vlm (version >= 0.7.0) for local execution. _(derived)_
6. TableFormer must run in accurate mode when configuring the DocumentConverter pipeline. _(derived)_
7. The pipeline must be configured to generate picture images. _(derived)_
8. The pipeline must be configured to perform chart extraction. _(derived)_
9. The local LLM must be configured to use a temperature of 0.0 when calling the local LLM endpoint. _(derived)_
10. The local LLM must be configured to generate a maximum of 4096 tokens. _(derived)_
11. The local LLM must be retried up to 4 times if the initial compilation fails. _(derived)_

## Capabilities

| Field | Value |
| --- | --- |
| Target domain | `core` |
| Capability | `workflow-deep-research-typespec-pipeline` |
| Bound TypeSpec contract | `core/workflow/deep-research-typespec-pipeline.tsp` |
| Binding trust | **default** — the contract is the corpus default, not a real claim — assign one |
| Contract resolves | yes |
| Study last checked | `2026-10-19` (22d) |
| Grounded sources | 1 |
| Invariants | 11 (0 contract, 11 derived) |

## Non-Goals

- Not a rewrite of `core/workflow/deep-research-typespec-pipeline.tsp` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under `specs/` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in `core/workflow/deep-research-typespec-pipeline.tsp` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
