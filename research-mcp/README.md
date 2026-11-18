# research-mcp

A Model Context Protocol server over the **rhex research corpus**.

The corpus is not a folder of prose. Each study carries a
`ResearchStudyContract` TypeSpec constant that declares three things worth
querying:

| Field | Meaning |
| --- | --- |
| `ssotContractPath` | the code contract the study governs — the research-to-code edge |
| `groundedSources[]` | provenance: `sourceId`, `originUri`, `extractedClaim` |
| `distilledInvariants[]` | the normative statements the study asserts |

This server makes that binding **traversable**, and separates what is
authoritative from what merely looks like it.

## What it refuses to conflate

The corpus declares 361 invariant strings. Only **27** are hand-written
normative statements. The other **334** are section headings that a generator
lifted and prefixed with `Section invariant codified:`.

Those 334 are still searchable — they are real headings and useful for
finding a passage — but they are tagged `section-heading` and are **never**
returned as an invariant. Authority is explicit in every response:

| `authority` / `kind` | Source | Trust |
| --- | --- | --- |
| `contract-invariant` | hand-written in the `.research.tsp` | **authoritative** |
| `derived-claim` | local model, quote re-checked verbatim | needs human confirmation |
| `unverified-claim` | local model, quote failed verbatim check | do not rely on |
| `grounded-claim` | the study's own `extractedClaim` | provenance, not norm |
| `source-quote` | the quote backing a derived claim | evidence |
| `section-heading` | mechanically lifted heading | navigation only |

## Tools

| Tool | Use |
| --- | --- |
| `research_stats` | corpus census and health. Call this first. |
| `research_search` | FTS5 over every atom, filtered by kind. |
| `research_study` | one study: invariants, claims with quotes, sources, flags. |
| `research_for_path` | **reverse binding** — what has the corpus already decided about this path? |
| `research_invariants` | authority-ranked "what must hold here". |
| `research_gaps` | studies by defect flag — the research agenda. |
| `research_drift` | missing leaves, dangling contract paths, stale checks. |
| `research_cite` | verifiable citation: path, line range, verbatim text, SHA-256. |

## Run

```sh
node src/canonicalize.mjs   # rebuild data/corpus.json from the rhex tree
node src/server.mjs         # MCP over stdio
node test/verify.mjs        # 49 checks, including a real MCP handshake
```

Test one tool without MCP:

```sh
node src/server.mjs --tool research_for_path '{"path":"core/effect"}'
node src/server.mjs --tool --list
```

No dependencies. The index is in-memory SQLite FTS5 via `node:sqlite`, built
from `data/corpus.json` at startup, so it can never be staler than the file.
Markdown bodies are **never indexed** — they are returned on demand by
`research_cite`, with a digest, so a reader can check the quote.

## Consume from DSH

Add a row to `$DSH_HOME/profiles/<name>/cordis.patch.yml`:

```yaml
- insert:
    - id: mcp-rhex-research
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: rhex-research
        transport: stdio
        command: node
        args: [ /abs/path/research-mcp/src/server.mjs ]
        cwd: /abs/path/research-mcp
```

Tools then appear as `mcp__rhex-research__research_search` and friends.

## Rebuild against another tree

```sh
RHEX_ROOT=/path/to/rhex node src/canonicalize.mjs
```

## Contract for new studies

If you are assembling more research into this corpus, the minimum that makes a
study queryable is a sibling pair:

```
<id>.md                  # body; front matter optional but recommended
<id>.research.tsp        # ResearchStudyContract — this is the index
```

```yaml
---
id: "lowercase-kebab-stable"
title: "..."
originSurface: "architectural-research"
ssotContractPath: ""          # empty is valid: it means "no code binding yet"
researchTspPath: "..."
checkedOn: "YYYY-MM-DD"
groundedSourceCount: 0
---
```

```typespec
const myStudy: ResearchStudyContract = #{
  studyId: ResearchLeafId.create("lowercase-kebab-stable"),
  title: "...",
  markdownPath: "...",
  ssotContractPath: "",
  originSurface: "architectural-research",
  checkedOn: ResearchCheckDate.create("YYYY-MM-DD"),
  groundedSources: #[ #{ sourceId, title, originUri, sourceKind, extractedClaim } ],
  distilledInvariants: #[ "one checkable statement per string" ],
};
```

Four rules that are cheap now and impossible to retrofit at a gigabyte:

1. **`ssotContractPath` empty is not an error.** It means "no code binding
   yet", and `research_gaps` turns the set of those into a research agenda.
2. **One study per file.** Concatenating kills citation granularity and diffs.
3. **`checkedOn` is mandatory.** It is the only thing that later distinguishes
   live research from stale research.
4. **Do not put raw sources in the corpus.** Distil into studies; keep
   transcripts and raw captures elsewhere and cite them by `originUri`.
