# Research corpus → OpenSpec: final coverage

Generated 2026-11-10T21:11:01.459Z. Every number below is derived from the
artefacts in this directory, not from an estimate.

## Funnel

| Stage | Count |
| --- | --- |
| Rows in the research index | 81 |
| — redundant duplicate rows (same id and markdown) | 15 |
| **Distinct studies** | **66** |
| `distilledInvariants` strings declared | 361 |
| — mechanically lifted section headings | 334 |
| — real hand-written invariants | 27 |
| Derived claims accepted, whole-file extraction | 68 |
| Derived claims accepted, chunked extraction | 79 |
| Chunk-windows actually sent to the model | 90 |
| Removed by the noise filter | 11 |
| Removed for a non-verbatim quote | 2 |
| **Invariants reaching a bundle** | **161** |
| **Studies with at least one invariant** | **56 of 66** |

## Why studies produced nothing

| Reason | Studies |
| --- | --- |
| bundled | 56 |
| mechanical contract only; no derived claim accepted | 5 |
| pre-filter kept nothing: prose carries no numeric or normative language | 2 |
| windows were sent to the model but none held a quotable claim | 1 |
| source markdown missing on disk; nothing to extract | 1 |
| derived claims existed but none survived the gates | 1 |

## By size band

| Band | Studies | Bundled | Invariants |
| --- | --- | --- | --- |
| 40-400 KB | 20 | 16 | 65 |
| over 400 KB | 10 | 7 | 32 |
| under 40 KB | 36 | 33 | 64 |

## Per study

| Study | KB | Real contract | Mechanical | Small | Big | Final | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `local-mac-pdf-to-typespec` | 389 | 0 | 8 | 0 | 11 | **11** | bundled |
| `ai-planning-agent-specification` | 173 | 0 | 8 | 0 | 12 | **10** | bundled |
| `self-healing-typespec-meta-harness-architecture` | 804 | 0 | 8 | 0 | 9 | **9** | bundled |
| `udast-bidirectional-documentation-architecture` | 390 | 0 | 8 | 0 | 8 | **8** | bundled |
| `meta-harness-requirements` | 25 | 0 | 8 | 7 | 0 | **7** | bundled |
| `core-rhex-bimly-adaptive-planning-research-two-zero-two-six-zero-nine-two-one` | 145 | 0 | 8 | 0 | 6 | **6** | bundled |
| `distributed-bim-architecture-analysis` | 566 | 0 | 8 | 0 | 6 | **6** | bundled |
| `bimly-engineering-reply-deep-research` | 73 | 0 | 8 | 5 | 0 | **5** | bundled |
| `bimly-spatial-context-cost-and-realtime-optimisation` | 23 | 0 | 8 | 5 | 0 | **5** | bundled |
| `core-hub-architect-planning-agent-prompt` | 19 | 0 | 8 | 5 | 0 | **5** | bundled |
| `edge-coding-models-and-accelerators` | 4 | 0 | 6 | 5 | 0 | **5** | bundled |
| `openusd-distillation-services-typespec-effect-four-and-wit-zero-three` | 491 | 0 | 8 | 0 | 5 | **5** | bundled |
| `ai-native-bim-aec-research` | 68 | 0 | 8 | 4 | 0 | **4** | bundled |
| `bimly-express-arrow-typespec-research` | 57 | 0 | 8 | 5 | 0 | **4** | bundled |
| `bimly-prioritized-research-agenda` | 32 | 0 | 8 | 5 | 0 | **4** | bundled |
| `telemetry-arrow-abi-and-sandboxing` | 759 | 0 | 8 | 0 | 4 | **4** | bundled |
| `typespec-and-hey-api-gateway` | 426 | 0 | 8 | 0 | 4 | **4** | bundled |
| `core-rhex-bimly-rule-engine-deep-research-two-zero-two-six-zero-nine-two-one` | 135 | 0 | 8 | 0 | 3 | **3** | bundled |
| `herdr-typespec-meta-harness-architecture-two-zero-two-six-zero-nine-two-one` | 76 | 0 | 8 | 3 | 0 | **3** | bundled |
| `implementation-handoff` | 7 | 0 | 8 | 3 | 0 | **3** | bundled |
| `typespec-rhex-platform-architecture` | 116 | 0 | 8 | 0 | 3 | **3** | bundled |
| `ai-tool-capabilities` | 2 | 2 | 0 | 0 | 0 | **2** | bundled |
| `autonomous-software-engineering-lifecycle` | 2 | 2 | 0 | 0 | 0 | **2** | bundled |
| `bimly-participant-tenancy-typespec-research` | 130 | 0 | 8 | 0 | 2 | **2** | bundled |
| `google-ai-studio-workbench-and-developer-api` | 3 | 2 | 0 | 0 | 0 | **2** | bundled |
| `multimodal-interactions-deep-research-api` | 0 | 2 | 0 | 0 | 0 | **2** | bundled |
| `nano-model-bim-query-compilers` | 707 | 0 | 8 | 0 | 2 | **2** | bundled |
| `neuro-symbolic-verification-in-engineering` | 806 | 0 | 8 | 0 | 2 | **2** | bundled |
| `notebooklm-grounded-corpus-and-audio-overview-synthesis` | 2 | 2 | 0 | 0 | 0 | **2** | bundled |
| `rhex-final-architecture` | 62 | 0 | 8 | 2 | 0 | **2** | bundled |
| `rhex-research-first-plan-two-zero-two-six-zero-nine-one-five` | 19 | 0 | 8 | 5 | 0 | **2** | bundled |
| `typespec-tooling-ssot-guide` | 11 | 0 | 8 | 2 | 0 | **2** | bundled |
| `validation-record` | 5 | 0 | 4 | 2 | 0 | **2** | bundled |
| `aistudio-typespec-one-one-seven-strict-emitter-prompt` | 1 | 0 | 4 | 1 | 0 | **1** | bundled |
| `alloy-js-reactive-synthesis-architecture` | 379 | 0 | 8 | 0 | 1 | **1** | bundled |
| `apple-silicon-m-five-metal-icb-zero-gc-synthesis` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `autonomous-sdlc-advanced-core-emitters-plugins` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `autonomous-sdlc-cognitive-orchestration-features` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `autonomous-sdlc-core-emitters-plugins` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `autonomous-sdlc-cyber-resilience-features` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `autonomous-sdlc-engine-room-features` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `autonomous-sdlc-formal-verification-features` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `autonomous-sdlc-herdr-features` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `autonomous-sdlc-moe-features` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `autonomous-sdlc-ten-advanced-features` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `bimly-architecture-technical-review` | 48 | 0 | 8 | 4 | 0 | **1** | bundled |
| `bimly-core-contracts-deep-research` | 103 | 0 | 8 | 0 | 1 | **1** | bundled |
| `birkhoff-moe-condorcet-moa-consensus-synthesis` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `context-retrieval-memory-tools` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `google-ai-studio-programmatic-api-extraction` | 4 | 0 | 4 | 1 | 0 | **1** | bundled |
| `google-colab-vertex-jupyter-notebook-distillation` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `jev-oss-alternatives-effect-four-typespec-research-two-zero-two-six-zero-nine-two-two` | 40 | 0 | 8 | 2 | 0 | **1** | bundled |
| `runtime-adapters` | 1 | 1 | 0 | 0 | 0 | **1** | bundled |
| `scalable-mixture-of-experts-architectures` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `structural-eurocode-en-one-nine-nine-two-distillation` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `web-gui-cdp-harvester-architecture-synthesis` | 2 | 1 | 0 | 0 | 0 | **1** | bundled |
| `agentic-sdlc-and-mutation-memory` | 893 | 0 | 8 | 0 | 0 | **0** | pre-filter kept nothing: prose carries no numeric or normative language |
| `aistudio-eurocode-en-one-nine-nine-two-smt-verifier-prompt` | 1 | 0 | 4 | 2 | 0 | **0** | derived claims existed but none survived the gates |
| `bimly-zero-token-mcp-architecture` | 88 | 0 | 8 | 0 | 0 | **0** | mechanical contract only; no derived claim accepted |
| `core-rhex-bimly-research-ingestion-agent-prompt` | 19 | 0 | 8 | 0 | 0 | **0** | mechanical contract only; no derived claim accepted |
| `rhex-open-source-adoption-research` | 84 | 0 | 8 | 0 | 0 | **0** | mechanical contract only; no derived claim accepted |
| `rhex-performance-research-two-zero-two-six-zero-nine-one-five` | 66 | 0 | 8 | 0 | 0 | **0** | mechanical contract only; no derived claim accepted |
| `typespec-and-hey-api-gateway-copy` | 0 | 0 | 8 | 0 | 0 | **0** | source markdown missing on disk; nothing to extract |
| `typespec-package-governance-architecture` | 624 | 0 | 8 | 0 | 0 | **0** | windows were sent to the model but none held a quotable claim |
| `typespec-zero-advanced-research` | 48 | 0 | 8 | 0 | 0 | **0** | mechanical contract only; no derived claim accepted |
| `webgpu-ui-and-monorepo-fabric` | 926 | 0 | 8 | 0 | 0 | **0** | pre-filter kept nothing: prose carries no numeric or normative language |

## Caveats

- Scenarios in the generated bundles are labelled SHAPE ONLY. They are
  templates, not reviewed acceptance criteria.
- Two of three invariant sources are model output. Every derived statement
  carries a source quote and was re-checked verbatim; contract statements
  are authoritative, model statements are not.
- Most contracts carry no usable invariant, and most bindings point at the
  corpus default rather than a real claim. Those need a human decision.

