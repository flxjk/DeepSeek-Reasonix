# rhex research corpus — health and remediation

Generated 2026-11-10T23:29:06.533Z from `data/corpus.json`.
Corpus root: `/Users/gj/git/rhex`.
Every number below is derived from the contracts on disk, not estimated.

## 1. Funnel

| Quantity | Value |
| --- | --- |
| Contract `.research.tsp` files scanned | 274 |
|   in `core/research/studies` | 128 |
|   in `docs/research` | 81 |
|   in `docs/rhex/research` | 65 |
| **Distinct studies** | **66** |
| Invariant strings declared | 361 |
|   hand-written, authoritative | **27** (7.5%) |
|   mechanically lifted section headings | 334 (92.5%) |
| Grounded sources | 71 |
| Model-derived claims | 147 |
|   with a verbatim-verified quote | 145 |
| Distinct `ssotContractPath` targets | 17 |
| Markdown body bytes | 10,118,072 |

The headline defect: **92.5% of everything the corpus calls an invariant is a section heading.** A generator walked each markdown leaf and wrote `Section invariant codified: <heading>` into the contract. The index quarantines those as `section-heading`; they are searchable and never returned as norms.

## 2. Health

| Measure | Count | Share |
| --- | --- | --- |
| Studies with a real hand-written invariant | 22 | 33.3% |
| Studies with a quote-verified derived claim | 35 | 53.0% |
| Studies with either | **57** | 86.4% |
| Studies with neither | **9** | 13.6% |
| Bound to a contract that resolves | 64 | 97.0% |
| Of those, a per-study claim (`sole`/`shared`) | 20 | 30.3% |
|   corpus-default binding only | 46 | 69.7% |
| Front matter present on any leaf | 21 | 31.8% |
| Markdown leaf missing entirely | 2 |
| Unresolved evidence notes | 1 |

## 3. The binding is degenerate, and this is the real blocker

66 studies point at only 17 distinct code contracts. One of them absorbs 46 studies:

| `ssotContractPath` | Studies | On disk |
| --- | --- | --- |
| `core/workflow/deep-research-typespec-pipeline.tsp` | 46 | resolves |
| `core/agent/moe/emitter-mixture-of-agents.tsp` | 3 | resolves |
| `core/compute/apple-silicon-m5.tsp` | 2 | resolves |
| `core/effect-typespec-emitter/plugin/catalog.tsp` | 2 | resolves |
| `core/ai-tool/capability-registry.tsp` | 1 | resolves |
| `core/policy/zero-token-zta.tsp` | 1 | resolves |
| `core/tool/ipc/ipc-kernel.tsp` | 1 | **missing** |
| `core/verification/neuro-symbolic-compliance.tsp` | 1 | **missing** |
| `core/agent/moe/emitter-management-moe.tsp` | 1 | resolves |
| `core/context/architecture/levels.tsp` | 1 | resolves |
| `core/providers/google/gemini-interactions-deep-research.tsp` | 1 | resolves |
| `core/providers/google/google-ai-studio-api.tsp` | 1 | resolves |

A `fanIn` above 5 means the path is a corpus-wide placeholder rather than a statement that *this* study governs *that* contract. `research_for_path` reports such matches as `viaDefaultBinding`, separately from a study's own claim. Until these are assigned, the research-to-code edge carries almost no information.

## 4. Remediation queue

Ordered by how much each item unlocks.

### 4.1 Assign the 46 default bindings

Each needs a human decision: either a real `ssotContractPath` this study governs, or an explicit empty string meaning "no code binding yet". Empty is a legitimate answer and turns the study into a research-agenda item.

| Study | Real invariants | Verified claims |
| --- | --- | --- |
| `agentic-sdlc-and-mutation-memory` | 0 | 0 |
| `ai-native-bim-aec-research` | 0 | 4 |
| `ai-planning-agent-specification` | 0 | 11 |
| `aistudio-eurocode-en-one-nine-nine-two-smt-verifier-prompt` | 0 | 2 |
| `aistudio-typespec-one-one-seven-strict-emitter-prompt` | 0 | 1 |
| `alloy-js-reactive-synthesis-architecture` | 0 | 1 |
| `autonomous-sdlc-ten-advanced-features` | 1 | 0 |
| `autonomous-software-engineering-lifecycle` | 2 | 0 |
| `bimly-architecture-technical-review` | 0 | 4 |
| `bimly-core-contracts-deep-research` | 0 | 1 |
| `bimly-engineering-reply-deep-research` | 0 | 5 |
| `bimly-express-arrow-typespec-research` | 0 | 4 |
| `bimly-participant-tenancy-typespec-research` | 0 | 2 |
| `bimly-prioritized-research-agenda` | 0 | 5 |
| `bimly-spatial-context-cost-and-realtime-optimisation` | 0 | 5 |

…and 31 more. Full list: `research_gaps { "flag": "binding-default" }`.

### 4.2 Strip the 334 mechanical invariants from the contracts

These are not norms and they are currently mixed into the same `distilledInvariants` array as the real ones, which is why any naive reader of the corpus over-counts its normative content by 13×.

Two options, both mechanical:

1. Delete them from `distilledInvariants` — they are recoverable from the markdown headings at any time, and `research_study` already reports headings separately.
2. Keep them but move them to a distinct field, so the array means one thing.

Regenerate the affected contracts through the repo's own emitter; do not hand-edit 274 TypeSpec files.

### 4.3 Add front matter to 45 studies

The researched front matter is the only place `companionResearchTspPath` and `groundedSourceCount` are recorded, and it is what a future ingest reads. The 21 studies that have it can serve as the template.

### 4.4 Close the drift


**Markdown leaf missing** — 2

- `multimodal-interactions-deep-research-api` → `docs/rhex/research/multimodal-interactions-deep-research-api.md`
- `typespec-and-hey-api-gateway-copy` → `docs/rhex/research/typespec-and-hey-api-gateway-copy.md`

**`ssotContractPath` does not resolve** — 2

- `autonomous-sdlc-engine-room-features` → `core/tool/ipc/ipc-kernel.tsp`
- `autonomous-sdlc-formal-verification-features` → `core/verification/neuro-symbolic-compliance.tsp`

**Declared `researchTspPath` does not resolve** — 2

- `autonomous-sdlc-ten-advanced-features` → `core/research/studies/research.studies.autonomous-sdlc-ten-advanced-features.research.tsp`
- `typespec-and-hey-api-gateway-copy` → `core/research/studies/research.studies.typespec-and-hey-api-gateway-copy.research.tsp`

### 4.5 9 studies carry nothing at all

No hand-written invariant and no accepted derived claim. Some are link stubs — `typespec-and-hey-api-gateway-copy` has no markdown on disk. Each needs either real extraction or deletion.

- `agentic-sdlc-and-mutation-memory` — 913,983 bytes
- `bimly-zero-token-mcp-architecture` — 89,662 bytes
- `core-rhex-bimly-research-ingestion-agent-prompt` — 19,954 bytes
- `rhex-open-source-adoption-research` — 86,079 bytes
- `rhex-performance-research-two-zero-two-six-zero-nine-one-five` — 67,663 bytes
- `typespec-and-hey-api-gateway-copy` — 0 bytes
- `typespec-package-governance-architecture` — 638,695 bytes
- `typespec-zero-advanced-research` — 48,921 bytes
- `webgpu-ui-and-monorepo-fabric` — 948,427 bytes

## 5. What is authoritative

| Kind | Origin | Trust |
| --- | --- | --- |
| `contract-invariant` | hand-written in `.research.tsp` | **authoritative** |
| `grounded-claim` | the study's own `extractedClaim` | provenance, not norm |
| `derived-claim` | local model, quote re-checked verbatim | needs human confirmation |
| `unverified-claim` | local model, quote failed the verbatim check | do not rely on |
| `source-quote` | the quote backing a derived claim | evidence |
| `section-heading` | mechanically lifted heading | navigation only |

The 145 verified claims were extracted by `ggml-org/gemma-4-E4B-it-GGUF:Q8_0` running locally over 90 chunk-windows drawn from the 19 largest studies. 2 failed the verbatim quote check and are retained as `unverified-claim` rather than deleted, so the failure rate stays visible.

