# Research → OpenSpec shortlist

Derived from `docs/research/*.research.tsp` on 2026-11-10.

## What the corpus actually contains

| Measure | Value |
| --- | --- |
| Studies | 81 |
| — redundant duplicate rows in the index (same id, same markdown) | 15 |
| — **distinct studies** | **66** |
| `distilledInvariants` strings in the contracts | 481 |
| — mechanically lifted section headings | 454 |
| — hand-written, checkable | 27 |
| Model-derived, accepted by the validator | 147 |
| — removed by the noise filter | 11 |
| — removed because the quote was not verbatim | 2 |
| — **kept** | **134** |
| **Total usable invariants** | **161** |
| Studies carrying at least one | 56 |
| Distinct `ssotContractPath` targets | 17 |

The contracts emit the *shape* of rigour: 454 of
481 "invariants" are the literal prefix `Section invariant codified: `
prepended to a markdown heading. The 27 hand-written ones are real; the
134 derived ones were pulled from prose by `ggml-org/gemma-4-E4B-it-GGUF:Q8_0` and each carries a quote.

## Binding trust

The corpus default `core/workflow/deep-research-typespec-pipeline.tsp` is claimed by
61 of 81 studies, so it is not a real
claim for any of them.

| Trust | Studies | Meaning |
| --- | --- | --- |
| `specific` | 22 | declared by the study author |
| `default` | 34 | corpus default, assign a real contract |

## Shortlist

| # | Study | Score | Inv. | C/D | Binding | Contract | Resolves | Checked |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `autonomous-sdlc-moe-features` | 130 | 1 | 1/0 | specific | `core/agent/moe/emitter-management-moe.tsp` | yes | 2026-10-02 |
| 2 | `birkhoff-moe-condorcet-moa-consensus-synthesis` | 130 | 1 | 1/0 | specific | `core/agent/moe/emitter-mixture-of-agents.tsp` | yes | 2026-10-19 |
| 3 | `autonomous-sdlc-core-emitters-plugins` | 115 | 1 | 1/0 | specific | `core/effect-typespec-emitter/plugin/catalog.tsp` | yes | 2026-10-02 |
| 4 | `runtime-adapters` | 115 | 1 | 1/0 | specific | `core/tool/harness/harness.tsp` | yes | 2026-09-17 |
| 5 | `structural-eurocode-en-one-nine-nine-two-distillation` | 115 | 1 | 1/0 | specific | `core/research/structural-eurocode.tsp` | yes | 2026-10-19 |
| 6 | `notebooklm-grounded-corpus-and-audio-overview-synthesis` | 115 | 2 | 2/0 | specific | `core/providers/google/notebooklm-conversation-synthesis.tsp` | yes | 2026-10-19 |
| 7 | `autonomous-sdlc-advanced-core-emitters-plugins` | 110 | 1 | 1/0 | specific | `core/effect-typespec-emitter/plugin/catalog.tsp` | yes | 2026-10-02 |
| 8 | `context-retrieval-memory-tools` | 110 | 1 | 1/0 | specific | `core/context/architecture/levels.tsp` | yes | 2026-10-02 |
| 9 | `aistudio-typespec-one-one-seven-strict-emitter-prompt` | 105 | 1 | 0/1 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 10 | `autonomous-sdlc-herdr-features` | 105 | 1 | 1/0 | specific | `core/compute/apple-silicon-m5.tsp` | yes | 2026-10-02 |
| 11 | `core-rhex-bimly-adaptive-planning-research-two-zero-two-six-zero-nine-two-one` | 105 | 6 | 0/6 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 12 | `apple-silicon-m-five-metal-icb-zero-gc-synthesis` | 95 | 1 | 1/0 | specific | `core/compute/apple-silicon-m5.tsp` | yes | 2026-10-19 |
| 13 | `autonomous-sdlc-cyber-resilience-features` | 90 | 1 | 1/0 | specific | `core/policy/zero-token-zta.tsp` | yes | 2026-10-02 |
| 14 | `autonomous-sdlc-ten-advanced-features` | 90 | 1 | 1/0 | specific | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-02 |
| 15 | `google-colab-vertex-jupyter-notebook-distillation` | 90 | 1 | 1/0 | specific | `core/google/notebook-models.tsp` | yes | 2026-10-19 |
| 16 | `scalable-mixture-of-experts-architectures` | 90 | 1 | 1/0 | specific | `core/agent/moe/emitter-mixture-of-agents.tsp` | yes | 2026-10-19 |
| 17 | `autonomous-software-engineering-lifecycle` | 90 | 2 | 2/0 | specific | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-02 |
| 18 | `ai-tool-capabilities` | 90 | 2 | 2/0 | specific | `core/ai-tool/capability-registry.tsp` | yes | 2026-09-17 |
| 19 | `google-ai-studio-workbench-and-developer-api` | 90 | 2 | 2/0 | specific | `core/providers/google/google-ai-studio-api.tsp` | yes | 2026-10-19 |
| 20 | `autonomous-sdlc-engine-room-features` | 85 | 1 | 1/0 | specific | `core/tool/ipc/ipc-kernel.tsp` | **no** | 2026-10-02 |
| 21 | `core-rhex-bimly-rule-engine-deep-research-two-zero-two-six-zero-nine-two-one` | 85 | 3 | 0/3 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 22 | `web-gui-cdp-harvester-architecture-synthesis` | 85 | 1 | 1/0 | specific | `core/providers/google/gemini-web-gui-harvester.tsp` | yes | 2026-10-19 |
| 23 | `bimly-spatial-context-cost-and-realtime-optimisation` | 85 | 5 | 0/5 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 24 | `typespec-and-hey-api-gateway` | 85 | 4 | 0/4 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 25 | `typespec-tooling-ssot-guide` | 85 | 2 | 0/2 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 26 | `distributed-bim-architecture-analysis` | 85 | 6 | 0/6 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 27 | `local-mac-pdf-to-typespec` | 85 | 11 | 0/11 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 28 | `openusd-distillation-services-typespec-effect-four-and-wit-zero-three` | 85 | 5 | 0/5 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 29 | `udast-bidirectional-documentation-architecture` | 85 | 8 | 0/8 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 30 | `self-healing-typespec-meta-harness-architecture` | 85 | 9 | 0/9 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 31 | `ai-native-bim-aec-research` | 85 | 4 | 0/4 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 32 | `bimly-participant-tenancy-typespec-research` | 80 | 2 | 0/2 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 33 | `bimly-prioritized-research-agenda` | 80 | 4 | 0/4 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 34 | `rhex-research-first-plan-two-zero-two-six-zero-nine-one-five` | 80 | 2 | 0/2 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 35 | `validation-record` | 80 | 2 | 0/2 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 36 | `meta-harness-requirements` | 80 | 7 | 0/7 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 37 | `herdr-typespec-meta-harness-architecture-two-zero-two-six-zero-nine-two-one` | 80 | 3 | 0/3 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 38 | `implementation-handoff` | 80 | 3 | 0/3 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 39 | `bimly-express-arrow-typespec-research` | 80 | 4 | 0/4 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 40 | `core-hub-architect-planning-agent-prompt` | 80 | 5 | 0/5 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 41 | `bimly-engineering-reply-deep-research` | 80 | 5 | 0/5 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 42 | `autonomous-sdlc-cognitive-orchestration-features` | 70 | 1 | 1/0 | specific | `core/agent/moe/emitter-mixture-of-agents.tsp` | yes | 2026-10-02 |
| 43 | `multimodal-interactions-deep-research-api` | 70 | 2 | 2/0 | specific | `core/providers/google/gemini-interactions-deep-research.tsp` | yes | 2026-10-19 |
| 44 | `edge-coding-models-and-accelerators` | 70 | 5 | 0/5 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 45 | `nano-model-bim-query-compilers` | 65 | 2 | 0/2 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 46 | `typespec-rhex-platform-architecture` | 65 | 3 | 0/3 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 47 | `telemetry-arrow-abi-and-sandboxing` | 65 | 4 | 0/4 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 48 | `alloy-js-reactive-synthesis-architecture` | 60 | 1 | 0/1 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 49 | `autonomous-sdlc-formal-verification-features` | 60 | 1 | 1/0 | specific | `core/verification/neuro-symbolic-compliance.tsp` | **no** | 2026-10-02 |
| 50 | `bimly-architecture-technical-review` | 60 | 1 | 0/1 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 51 | `bimly-core-contracts-deep-research` | 60 | 1 | 0/1 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 52 | `jev-oss-alternatives-effect-four-typespec-research-two-zero-two-six-zero-nine-two-two` | 60 | 1 | 0/1 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 53 | `ai-planning-agent-specification` | 60 | 10 | 0/10 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 54 | `rhex-final-architecture` | 45 | 2 | 0/2 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 55 | `neuro-symbolic-verification-in-engineering` | 45 | 2 | 0/2 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |
| 56 | `google-ai-studio-programmatic-api-extraction` | 30 | 1 | 0/1 | default | `core/workflow/deep-research-typespec-pipeline.tsp` | yes | 2026-10-19 |

## Rows needing a decision before implementation

**Dangling binding (2)** — the contract does not exist on disk; the change must create it:
- `autonomous-sdlc-engine-room-features` → `core/tool/ipc/ipc-kernel.tsp`
- `autonomous-sdlc-formal-verification-features` → `core/verification/neuro-symbolic-compliance.tsp`

**Stale study (0)** — `checkedOn` older than 120 days:
- none

**Default binding (34)** — no real contract claim; assign one before implementing:
- `aistudio-typespec-one-one-seven-strict-emitter-prompt`
- `core-rhex-bimly-adaptive-planning-research-two-zero-two-six-zero-nine-two-one`
- `core-rhex-bimly-rule-engine-deep-research-two-zero-two-six-zero-nine-two-one`
- `bimly-spatial-context-cost-and-realtime-optimisation`
- `typespec-and-hey-api-gateway`
- `typespec-tooling-ssot-guide`
- `distributed-bim-architecture-analysis`
- `local-mac-pdf-to-typespec`
- `openusd-distillation-services-typespec-effect-four-and-wit-zero-three`
- `udast-bidirectional-documentation-architecture`
- `self-healing-typespec-meta-harness-architecture`
- `ai-native-bim-aec-research`
- `bimly-participant-tenancy-typespec-research`
- `bimly-prioritized-research-agenda`
- `rhex-research-first-plan-two-zero-two-six-zero-nine-one-five`
- `validation-record`
- `meta-harness-requirements`
- `herdr-typespec-meta-harness-architecture-two-zero-two-six-zero-nine-two-one`
- `implementation-handoff`
- `bimly-express-arrow-typespec-research`
- `core-hub-architect-planning-agent-prompt`
- `bimly-engineering-reply-deep-research`
- `edge-coding-models-and-accelerators`
- `nano-model-bim-query-compilers`
- `typespec-rhex-platform-architecture`
- `telemetry-arrow-abi-and-sandboxing`
- `alloy-js-reactive-synthesis-architecture`
- `bimly-architecture-technical-review`
- `bimly-core-contracts-deep-research`
- `jev-oss-alternatives-effect-four-typespec-research-two-zero-two-six-zero-nine-two-two`
- `ai-planning-agent-specification`
- `rhex-final-architecture`
- `neuro-symbolic-verification-in-engineering`
- `google-ai-studio-programmatic-api-extraction`

**Rejected keyword inference (2)** — the matcher proposed these and was overruled, because a wrong binding is worse than an admitted default:
- `edge-coding-models-and-accelerators` — would have bound to `core/agent/moe/emitter-management-moe.tsp`, kept `core/workflow/deep-research-typespec-pipeline.tsp`
- `rhex-research-first-plan-two-zero-two-six-zero-nine-one-five` — would have bound to `core/effect-typespec-emitter/plugin/catalog.tsp`, kept `core/workflow/deep-research-typespec-pipeline.tsp`

## Removed by the noise filter

11 derived statements were dropped as facts, definitions or meta-commentary:

- `ai-planning-agent-specification` — _quantifier with no value_: Every refusal boundary must be verified by executing at least adversarial inputs that must trigger a refusal a
- `aistudio-eurocode-en-one-nine-nine-two-smt-verifier-prompt` — _prompt instruction, not system invariant_: The model must verify Clause 6.2.2 shear resistance V_Rd,c against the uploaded Eurocode PDF in File Search St
- `aistudio-eurocode-en-one-nine-nine-two-smt-verifier-prompt` — _prompt instruction, not system invariant_: The model must verify C_Rd,c = 0.18 / gamma_c with gamma_c = 1.50.
- `bimly-architecture-technical-review` — _definition_: Zero-copy is a property of a particular transfer with compatible ownership and layout.
- `bimly-architecture-technical-review` — _hypothesis, not constraint_: A 2 GB cap for 100 million source triangles is a benchmark hypothesis.
- `bimly-architecture-technical-review` — _meta-commentary_: A million simulated cycles is a workload count, not a correctness proof.
- `bimly-prioritized-research-agenda` — _meta-commentary_: Byte-identical exports are not the general interoperability criterion.
- `jev-oss-alternatives-effect-four-typespec-research-two-zero-two-six-zero-nine-two-two` — _garbled fact_: The ModernBERT zero-shot model has 149.6M encoder cross-encoder.
- `rhex-research-first-plan-two-zero-two-six-zero-nine-one-five` — _version fact_: The Node version used is 26.8.2.
- `rhex-research-first-plan-two-zero-two-six-zero-nine-one-five` — _version fact_: The npm version used is 12.0.2.
- `rhex-research-first-plan-two-zero-two-six-zero-nine-one-five` — _version fact_: The TypeScript version used is 7.0.2.

## Drafts

56 bundles under `openspec-draft/`, 4 files each (proposal, design, tasks, spec).
None has been validated. Nothing has been written into rhex.
