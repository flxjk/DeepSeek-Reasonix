#!/usr/bin/env node
/**
 * Merges hand-written invariants (from the .research.tsp contracts) with the
 * model-derived ones, filters obvious noise, infers a better contract binding
 * where the corpus only carries the default, ranks by invariant quality and
 * regenerates the OpenSpec draft bundles.
 *
 * Writes only inside this working directory. Nothing is written into rhex.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const TODAY = new Date('2026-11-10T00:00:00Z');
const MECHANICAL = /^Section invariant codified:/;
const OUT = 'openspec-draft';

interface GroundedSource {
  sourceId: string | null;
  title: string | null;
  originUri: string | null;
  sourceKind: string | null;
  extractedClaim: string | null;
}

interface Study {
  studyId: string | null;
  title: string | null;
  markdownPath: string | null;
  ssotContractPath: string | null;
  checkedOn: string | null;
  groundedSources: GroundedSource[];
  distilledInvariants: string[];
  markdown: { exists: boolean; bytes?: number };
  drift: { markdownPathExists: boolean; ssotContractPathExists: boolean };
}

interface ResearchIndex {
  corpus: { studies: number; distilledInvariants: number; distinctSsotTargets: number };
  ssotFanIn: Record<string, number>;
  studies: Study[];
}

interface DerivedRecord {
  studyId: string;
  ssotContractPath: string;
  checkedOn: string;
  model: string;
  wallMs: number;
  found: number;
  accepted: Array<{ statement: string; quote: string }>;
  rejected: Array<{ statement: string; reason: string }>;
}

type BindingTrust = 'specific' | 'inferred' | 'default';

interface Invariant {
  statement: string;
  source: 'contract' | 'derived';
  quote?: string;
  measurable: boolean;
  structural: boolean;
  normative: boolean;
  score: number;
}

interface Entry {
  studyId: string;
  title: string;
  ssotContractPath: string;
  originalSsotPath: string;
  bindingTrust: BindingTrust;
  bindingResolves: boolean;
  fanIn: number;
  domain: string;
  capability: string;
  checkedOn: string;
  ageDays: number | null;
  fresh: boolean;
  markdownPath: string;
  markdownBytes: number;
  groundedSources: number;
  invariants: Invariant[];
  topScore: number;
  meanScore: number;
  rank: number;
}

// ---- noise filter --------------------------------------------------------

const NOISE: Array<{ re: RegExp; why: string }> = [
  { re: /\bversion used is\b/i, why: 'version fact' },
  { re: /\bis a (benchmark )?hypothesis\b/i, why: 'hypothesis, not constraint' },
  { re: /\bis a workload count\b/i, why: 'meta-commentary' },
  { re: /\bare not the .{0,40}criterion\b/i, why: 'meta-commentary' },
  { re: /\bis a property of\b/i, why: 'definition' },
  { re: /\bis a definition\b/i, why: 'definition' },
  { re: /\bhas \d+\.\d+M\b/, why: 'garbled fact' },
  { re: /\bthe model must verify\b/i, why: 'prompt instruction, not system invariant' },
  // Some source studies replaced numeric values with image placeholders, so the
  // model emitted "executing at least adversarial inputs" with the count missing.
  // A quantifier followed by a bare noun is a hole, not a requirement. Deliberately
  // narrow: "greater than or equal to 0.97" and "between X and Y" are legitimate,
  // so only unambiguously numeric quantifiers are checked here.
  {
    re: /\b(at least|at most|no more than|no fewer than|fewer than|exactly)\s+(?!(?:\d|one\b|two\b|three\b|four\b|five\b|six\b|seven\b|eight\b|nine\b|ten\b|half\b|zero\b|a\b|an\b|the\b|its\b|their\b|any\b|one\b|or\b))/i,
    why: 'quantifier with no value',
  },
];

const noiseReason = (s: string): string | null => {
  for (const n of NOISE) if (n.re.test(s)) return n.why;
  return null;
};

// ---- scoring -------------------------------------------------------------

const MEASURABLE =
  /(<=|>=|==|<|>)\s*[\d.]|\b\d+\s*(ms|µs|us|bytes|lines|%|tokens|fps)\b|\b0 bytes\b|\bzero\b/i;
const STRUCTURAL =
  /(import|node:\*|union|matrix|route|routing|adapter|emitter|binding|catalog|policy|deny|gate|schema|contract|parser|dedup|discriminat|namespace|owner|deterministic)/i;
const NORMATIVE =
  /\b(SHALL|MUST|NEVER|ALWAYS|PROHIBITED|FORBIDDEN|REQUIRED|requires?|remains?|satisf\w*|expose\w*|reject\w*|forbid\w*)\b/i;
const PROSE_ONLY = /^(the|a|an|every|all|each)\b/i;

const daysSince = (iso: string): number | null => {
  const t = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(t)) return null;
  return Math.round((TODAY.getTime() - t) / 86400000);
};

const domainFor = (ssot: string): string => {
  if (/bimly/i.test(ssot)) return 'bimly';
  if (/^packages\//.test(ssot)) return 'platform';
  if (/^core\//.test(ssot)) return 'core';
  return 'rhex';
};

const capabilityFor = (ssot: string): string => {
  const parts = ssot.replace(/\.tsp$/, '').split('/');
  return parts.slice(1).join('-') || 'unspecified';
};

// ---- contract inference --------------------------------------------------

const STOP = new Set(['core', 'tsp', 'index', 'src', 'lib', 'the', 'and', 'for']);

const keywordsOf = (path: string): string[] =>
  path
    .replace(/\.tsp$/, '')
    .split(/[/\-_.]/)
    .map((s) => s.toLowerCase())
    .filter((s) => s.length > 2 && !STOP.has(s));

/** Pick the contract whose path keywords best match the statement, if any. */
function inferContract(statement: string, candidates: string[]): string | null {
  const text = statement.toLowerCase();
  let best: { path: string; hits: number } | null = null;
  for (const path of candidates) {
    const kws = keywordsOf(path);
    const hits = kws.filter((k) => new RegExp(`\\b${k}\\b`, 'i').test(text)).length;
    if (hits >= 2 && (!best || hits > best.hits)) best = { path, hits };
  }
  return best?.path ?? null;
}

// ---- load ----------------------------------------------------------------

const index: ResearchIndex = JSON.parse(readFileSync('research-index.json', 'utf8'));
const derived: { model: string; records: DerivedRecord[] } = JSON.parse(
  readFileSync('derived-invariants.json', 'utf8'),
);

const derivedByStudy = new Map<string, DerivedRecord>();
for (const r of derived.records) derivedByStudy.set(r.studyId, r);

// Large studies are extracted chunk-by-chunk, so one study owns many records.
// Fold them back into a single per-study list.
interface BigRecord {
  key: string;
  studyId: string;
  heading: string;
  found: number;
  accepted: Array<{ statement: string; quote: string }>;
}
const big: { model: string; records: BigRecord[] } = existsSync('derived-big.json')
  ? (JSON.parse(readFileSync('derived-big.json', 'utf8')) as { model: string; records: BigRecord[] })
  : { model: 'n/a', records: [] };

const bigByStudy = new Map<string, Array<{ statement: string; quote: string }>>();
for (const r of big.records) {
  const list = bigByStudy.get(r.studyId) ?? [];
  list.push(...(r.accepted ?? []));
  bigByStudy.set(r.studyId, list);
}
let bigChunks = 0;
for (const r of big.records) if ((r.accepted ?? []).length > 0) bigChunks++;

// A quote that is not verbatim in the source means the model paraphrased or
// corrupted the passage, so the claim is not trustworthy. verify-quotes.ts
// re-derives that check from the artefacts alone; merge honours its verdict.
interface QuoteAudit {
  failures: Array<{ studyId: string; statementKey: string; why: string }>;
}
const audit: QuoteAudit = existsSync('quote-audit.json')
  ? (JSON.parse(readFileSync('quote-audit.json', 'utf8')) as QuoteAudit)
  : { failures: [] };
const nonVerbatim = new Set(audit.failures.map((f) => `${f.studyId}\u0000${f.statementKey}`));
let droppedNonVerbatim = 0;

const knownContracts = Object.keys(index.ssotFanIn).filter((p) => p !== '(none)');
const DEFAULT_CONTRACT = 'core/workflow/deep-research-typespec-pipeline.tsp';

let derivedTotal = 0;
let derivedKept = 0;
const filteredOut: Array<{ study: string; statement: string; why: string }> = [];
const rejectedInference: Array<{ study: string; wouldHaveBeen: string; kept: string }> = [];

const entries: Entry[] = [];

// The index carries redundant rows: 14 studies appear two or three times with an
// identical studyId, contract and markdown path. Counting each row inflated every
// figure in this report, so collapse to one row per study before merging.
const seenStudyId = new Set<string>();
const studies: Study[] = [];
let duplicateIndexRows = 0;
for (const s of index.studies) {
  const id = s.studyId ?? '(unnamed)';
  if (seenStudyId.has(id)) {
    duplicateIndexRows++;
    continue;
  }
  seenStudyId.add(id);
  studies.push(s);
}

for (const study of studies) {
  const id = study.studyId ?? '(unnamed)';
  const originalSsot = study.ssotContractPath ?? '';

  const handWritten = study.distilledInvariants
    .map((s) => s.trim())
    .filter((s) => !MECHANICAL.test(s));

  const rec = derivedByStudy.get(id);
  const derivedAccepted = [...(rec?.accepted ?? []), ...(bigByStudy.get(id) ?? [])];
  derivedTotal += derivedAccepted.length;

  const keptDerived: Array<{ statement: string; quote: string }> = [];
  const seenStatement = new Set<string>();
  for (const d of derivedAccepted) {
    // Chunked extraction revisits overlapping windows, so the same claim can
    // arrive several times for one study.
    const dedupeKey = d.statement.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seenStatement.has(dedupeKey)) continue;
    seenStatement.add(dedupeKey);
    if (nonVerbatim.has(`${id}\u0000${dedupeKey}`)) {
      droppedNonVerbatim++;
      continue;
    }
    const why = noiseReason(d.statement);
    if (why) {
      filteredOut.push({ study: id, statement: d.statement, why });
      continue;
    }
    keptDerived.push(d);
  }
  derivedKept += keptDerived.length;

  if (handWritten.length === 0 && keptDerived.length === 0) continue;

  // Binding: hand-written studies carry a specific contract. Derived studies
  // inherited the corpus default, so try to infer a better one from the text.
  // Keyword inference was tried and rejected: it produced confident but wrong
  // matches (e.g. an edge-inference study bound to the MoE emitter contract).
  // A wrong binding is worse than an admitted default, so derived studies keep
  // the default and are flagged for a human to assign.
  const ssot = originalSsot;
  let bindingTrust: BindingTrust = 'specific';
  if (handWritten.length === 0) {
    bindingTrust = originalSsot === DEFAULT_CONTRACT ? 'default' : 'specific';
    const guess = inferContract(keptDerived.map((d) => d.statement).join(' '), knownContracts);
    if (guess && guess !== originalSsot) {
      rejectedInference.push({ study: id, wouldHaveBeen: guess, kept: originalSsot });
    }
  }

  const bindingResolves = existsSync(`/Users/gj/git/rhex/${ssot}`);
  const fanIn = index.ssotFanIn[ssot] ?? 1;
  const age = study.checkedOn ? daysSince(study.checkedOn) : null;
  const fresh = age !== null && age <= 120;

  const scoreOne = (statement: string, source: 'contract' | 'derived'): Invariant => {
    const measurable = MEASURABLE.test(statement);
    const structural = STRUCTURAL.test(statement);
    const normative = NORMATIVE.test(statement);
    const proseOnly = PROSE_ONLY.test(statement) && !measurable && !structural;
    let score = 30;
    if (measurable) score += 25;
    if (structural) score += 20;
    if (normative) score += 15;
    if (proseOnly) score -= 15;
    if (source === 'contract') score += 15;
    if (fresh) score += 10;
    if (bindingResolves) score += 10;
    if (bindingTrust === 'specific') score += 5;
    if (bindingTrust === 'default') score -= 5;
    return { statement, source, measurable, structural, normative, score: Math.max(0, score) };
  };

  const invariants: Invariant[] = [
    ...handWritten.map((s) => scoreOne(s, 'contract')),
    ...keptDerived.map((d) => ({ ...scoreOne(d.statement, 'derived'), quote: d.quote })),
  ];

  entries.push({
    studyId: id,
    title: study.title ?? '',
    ssotContractPath: ssot,
    originalSsotPath: originalSsot,
    bindingTrust,
    bindingResolves,
    fanIn,
    domain: domainFor(ssot),
    capability: capabilityFor(ssot),
    checkedOn: study.checkedOn ?? '(unknown)',
    ageDays: age,
    fresh,
    markdownPath: study.markdownPath ?? '',
    markdownBytes: study.markdown?.bytes ?? 0,
    groundedSources: study.groundedSources.length,
    invariants,
    topScore: Math.max(...invariants.map((i) => i.score)),
    meanScore: Math.round(invariants.reduce((n, i) => n + i.score, 0) / invariants.length),
    rank: 0,
  });
}

entries.sort(
  (a, b) => b.topScore - a.topScore || b.meanScore - a.meanScore || a.studyId.localeCompare(b.studyId),
);
entries.forEach((e, i) => {
  e.rank = i + 1;
});

// ---- bundles -------------------------------------------------------------

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });

const titleCase = (s: string): string =>
  s.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^\w/, (c) => c.toUpperCase());

const TRUST_NOTE: Record<BindingTrust, string> = {
  specific: 'the contract was declared by the study author',
  inferred: 'the contract was inferred from the invariant text — verify it',
  default: 'the contract is the corpus default, not a real claim — assign one',
};

function provenanceBlock(e: Entry): string {
  const hand = e.invariants.filter((i) => i.source === 'contract').length;
  const der = e.invariants.filter((i) => i.source === 'derived').length;
  return [
    '<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.',
    `     study      : ${e.studyId}`,
    `     ssot       : ${e.ssotContractPath} (${e.bindingResolves ? 'resolves' : 'MISSING ON DISK'})`,
    `     binding    : ${e.bindingTrust} — ${TRUST_NOTE[e.bindingTrust]}`,
    `     checkedOn  : ${e.checkedOn} (${e.ageDays ?? '?'} days before 2026-11-10)`,
    `     source leaf: ${e.markdownPath}`,
    `     invariants : ${hand} from the .research.tsp contract, ${der} derived by a local model`,
    `     generated  : ${TODAY.toISOString()}`,
    '     Derived statements carry a quote; contract statements are authoritative.',
    '     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->',
  ].join('\n');
}

function renderBundle(e: Entry): void {
  const dir = join(OUT, e.studyId);
  const specDir = join(dir, 'specs', e.capability);
  mkdirSync(specDir, { recursive: true });
  const prov = provenanceBlock(e);

  const proposal = `# Proposal: ${e.studyId}

${prov}

## Why

A research study in this repository states normative constraints for
\`${e.ssotContractPath}\`, but nothing in the OpenSpec tree carries them: the
constraints live only in prose and no change enforces them.

${
  e.bindingResolves
    ? 'The bound contract exists, so these invariants **modify** live behaviour.'
    : 'The bound contract **does not exist on disk**, so these invariants describe a contract that must be created first.'
}

## What changes

${e.invariants.map((i, n) => `${n + 1}. ${i.statement}${i.source === 'derived' ? ' _(derived)_' : ''}`).join('\n')}

## Capabilities

| Field | Value |
| --- | --- |
| Target domain | \`${e.domain}\` |
| Capability | \`${e.capability}\` |
| Bound TypeSpec contract | \`${e.ssotContractPath}\` |
| Binding trust | **${e.bindingTrust}** — ${TRUST_NOTE[e.bindingTrust]} |
| Contract resolves | ${e.bindingResolves ? 'yes' : '**no — create it**'} |
| Study last checked | \`${e.checkedOn}\` (${e.ageDays ?? '?'}d) |
| Grounded sources | ${e.groundedSources} |
| Invariants | ${e.invariants.length} (${e.invariants.filter((i) => i.source === 'contract').length} contract, ${e.invariants.filter((i) => i.source === 'derived').length} derived) |

## Non-Goals

- Not a rewrite of \`${e.ssotContractPath}\` beyond the statements above.
- Not an implementation plan for unrelated domains.
- The scenarios under \`specs/\` are placeholders and carry no authority.

## Acceptance

- Each statement above is observable in \`${e.ssotContractPath}\` or fails a named check.
- The change stays within the 12-file ChangeSlice ceiling.
`;

  const spec = `# ${titleCase(e.capability)} specification delta

${prov}

## ADDED Requirements

${e.invariants
  .map(
    // Requirement names must be unique inside a capability, and 28 studies bind
    // to the same default contract. Naming them from the capability produced 93
    // collisions across bundles, so name them from the study instead — which also
    // keeps every requirement traceable to the research it came from.
    (i, n) => `### Requirement: ${e.studyId}-${String(n + 1).padStart(3, '0')}

The system SHALL satisfy: ${i.statement}
${i.quote ? `\n> Source: "${i.quote}"\n` : ''}
#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated
`,
  )
  .join('\n')}`;

  const tasks = `# Tasks: ${e.studyId}

${prov}

${e.invariants
  .map((i, n) => {
    const id = String(n + 1).padStart(2, '0');
    return (
      `- [ ] t${id} Confirm in \`${e.ssotContractPath}\` whether the invariant currently holds\n` +
      `- [ ] t${id}b Add a deterministic check for: ${i.statement.slice(0, 80)}`
    );
  })
  .join('\n')}
`;

  const design = `# Design: ${e.studyId}

${prov}

## Context

Derived from research study \`${e.studyId}\` (checked \`${e.checkedOn}\`).
Source leaf: \`${e.markdownPath}\` (${(e.markdownBytes / 1024).toFixed(0)} KB).
Bound contract: \`${e.ssotContractPath}\` (binding trust: **${e.bindingTrust}**).

## Decisions

1. The invariant is expressed against the existing TypeSpec contract, not a new leaf,
   unless the bound contract is missing.
2. The check is deterministic — an ast-grep rule, a cite-test, or a numeric gate —
   never a model judgement.
3. The research leaf stays the authority for *why*; the contract stays the authority
   for *what*. This change only connects them.

## Trade-offs

- ${
    e.bindingResolves
      ? 'Modifying live behaviour risks regressing code that satisfies the invariant implicitly today.'
      : 'Creating the missing contract first expands scope: the contract itself becomes part of this change.'
  }
- ${
    e.bindingTrust === 'specific'
      ? 'The binding is declared by the study author.'
      : e.bindingTrust === 'inferred'
        ? `**Inferred binding**: the corpus only carried the default, so \`${e.ssotContractPath}\` was matched from the invariant text. Verify before implementing.`
        : `**Default binding**: the corpus points at \`${e.originalSsotPath}\` for ${e.fanIn} studies, which is not a real claim. Assign the correct contract first.`
  }
- ${
    e.groundedSources <= 1
      ? '**Thin provenance**: the study grounds on a single source, so there is one citation anchor.'
      : `Grounded on ${e.groundedSources} sources.`
  }
- ${
    e.invariants.some((i) => i.source === 'derived')
      ? 'Some statements were derived by a local model from prose and carry a quote; they need human confirmation before they are treated as authoritative.'
      : 'All statements come from the hand-written contract.'
  }

## TypeSpec surface

- Contract: \`${e.ssotContractPath}\`
- Domain: \`${e.domain}\`
- Namespace: derive from the contract path; do not invent a new namespace here.

## Effect services

The research corpus does not name an effect service, and guessing one produced
confidently wrong bindings when it was tried, so this is left as an explicit
assignment for the reviewer:

- Owning service: **unassigned** — choose the service under
  \`packages/core/effect/services/\` that already owns \`${e.ssotContractPath}\`.
- Enforcement surface: a pure Effect v4 cite-test, an ast-grep rule, or a numeric
  gate — never a model judgement.
- If no service owns the contract yet, this change must create one before any
  requirement here can be verified.
`;

  writeFileSync(join(dir, 'proposal.md'), proposal);
  writeFileSync(join(dir, 'design.md'), design);
  writeFileSync(join(dir, 'tasks.md'), tasks);
  writeFileSync(join(specDir, 'spec.md'), spec);
}

for (const e of entries) renderBundle(e);

// ---- index ---------------------------------------------------------------

const totalInvariants = entries.reduce((n, e) => n + e.invariants.length, 0);
const fromContract = entries.reduce(
  (n, e) => n + e.invariants.filter((i) => i.source === 'contract').length,
  0,
);
const fromDerived = totalInvariants - fromContract;
const unresolved = entries.filter((e) => !e.bindingResolves);
const stale = entries.filter((e) => !e.fresh);
const defaultBound = entries.filter((e) => e.bindingTrust === 'default');

const indexMd = `# Research → OpenSpec shortlist

Derived from \`docs/research/*.research.tsp\` on ${TODAY.toISOString().slice(0, 10)}.

## What the corpus actually contains

| Measure | Value |
| --- | --- |
| Studies | ${index.corpus.studies} |
| — redundant duplicate rows in the index (same id, same markdown) | ${duplicateIndexRows} |
| — **distinct studies** | **${studies.length}** |
| \`distilledInvariants\` strings in the contracts | ${index.corpus.distilledInvariants} |
| — mechanically lifted section headings | ${index.corpus.distilledInvariants - fromContract} |
| — hand-written, checkable | ${fromContract} |
| Model-derived, accepted by the validator | ${derivedTotal} |
| — removed by the noise filter | ${filteredOut.length} |
| — removed because the quote was not verbatim | ${droppedNonVerbatim} |
| — **kept** | **${fromDerived}** |
| **Total usable invariants** | **${totalInvariants}** |
| Studies carrying at least one | ${entries.length} |
| Distinct \`ssotContractPath\` targets | ${index.corpus.distinctSsotTargets} |

The contracts emit the *shape* of rigour: ${index.corpus.distilledInvariants - fromContract} of
${index.corpus.distilledInvariants} "invariants" are the literal prefix \`Section invariant codified: \`
prepended to a markdown heading. The ${fromContract} hand-written ones are real; the
${fromDerived} derived ones were pulled from prose by \`${derived.model}\` and each carries a quote.

## Binding trust

The corpus default \`${DEFAULT_CONTRACT}\` is claimed by
${index.ssotFanIn[DEFAULT_CONTRACT] ?? 0} of ${index.corpus.studies} studies, so it is not a real
claim for any of them.

| Trust | Studies | Meaning |
| --- | --- | --- |
| \`specific\` | ${entries.length - defaultBound.length} | declared by the study author |
| \`default\` | ${defaultBound.length} | corpus default, assign a real contract |

## Shortlist

| # | Study | Score | Inv. | C/D | Binding | Contract | Resolves | Checked |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${entries
  .map((e) => {
    const c = e.invariants.filter((i) => i.source === 'contract').length;
    const d = e.invariants.length - c;
    return `| ${e.rank} | \`${e.studyId}\` | ${e.topScore} | ${e.invariants.length} | ${c}/${d} | ${e.bindingTrust} | \`${e.ssotContractPath}\` | ${e.bindingResolves ? 'yes' : '**no**'} | ${e.checkedOn} |`;
  })
  .join('\n')}

## Rows needing a decision before implementation

**Dangling binding (${unresolved.length})** — the contract does not exist on disk; the change must create it:
${unresolved.map((e) => `- \`${e.studyId}\` → \`${e.ssotContractPath}\``).join('\n') || '- none'}

**Stale study (${stale.length})** — \`checkedOn\` older than 120 days:
${stale.map((e) => `- \`${e.studyId}\` (${e.checkedOn}, ${e.ageDays ?? '?'}d)`).join('\n') || '- none'}

**Default binding (${defaultBound.length})** — no real contract claim; assign one before implementing:
${defaultBound.map((e) => `- \`${e.studyId}\``).join('\n') || '- none'}

**Rejected keyword inference (${rejectedInference.length})** — the matcher proposed these and was overruled, because a wrong binding is worse than an admitted default:
${rejectedInference.map((r) => `- \`${r.study}\` — would have bound to \`${r.wouldHaveBeen}\`, kept \`${r.kept}\``).join('\n') || '- none'}

## Removed by the noise filter

${filteredOut.length} derived statements were dropped as facts, definitions or meta-commentary:

${filteredOut.map((f) => `- \`${f.study}\` — _${f.why}_: ${f.statement.slice(0, 110)}`).join('\n') || '- none'}

## Drafts

${entries.length} bundles under \`${OUT}/\`, 4 files each (proposal, design, tasks, spec).
None has been validated. Nothing has been written into rhex.
`;

mkdirSync(join(OUT, '_research-shortlist'), { recursive: true });
writeFileSync(join(OUT, '_research-shortlist', 'index.md'), indexMd);
writeFileSync(
  'shortlist.json',
  `${JSON.stringify({ generatedAt: TODAY.toISOString(), entries, filteredOut, rejectedInference }, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      studies: entries.length,
      duplicateIndexRows,
      totalInvariants,
      fromContract,
      fromDerived,
      model: derived.model,
      modelBig: big.model,
      chunkedWindowsWithAccepted: bigChunks,
      chunkedRecords: big.records.length,
      droppedNonVerbatim,
      removedByNoiseFilter: filteredOut.length,
      bindingTrust: {
        specific: entries.length - defaultBound.length,
        default: defaultBound.length,
      },
      rejectedInference: rejectedInference.length,
      bundles: entries.length,
      files: entries.length * 4 + 1,
      unresolvedBindings: unresolved.length,
      top12: entries.slice(0, 12).map((e) => ({
        rank: e.rank,
        study: e.studyId,
        score: e.topScore,
        inv: e.invariants.length,
        binding: e.bindingTrust,
      })),
    },
    null,
    2,
  ),
);
