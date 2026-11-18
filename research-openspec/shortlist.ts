#!/usr/bin/env node
/**
 * Turns the *real* invariants of the rhex research corpus into a ranked shortlist
 * and a set of draft OpenSpec bundles.
 *
 * Writes only inside this working directory. Nothing is written into rhex.
 * Policy.ForbidAiOpenspecMutation: the agent prepares, the operator lands.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

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

interface InvariantScore {
  invariant: string;
  measurable: boolean;
  structural: boolean;
  proseOnly: boolean;
  score: number;
}

interface Entry {
  studyId: string;
  title: string;
  ssotContractPath: string;
  bindingResolves: boolean;
  fanIn: number;
  domain: string;
  capability: string;
  checkedOn: string;
  ageDays: number | null;
  fresh: boolean;
  markdownPath: string;
  markdownBytes: number;
  groundedSources: GroundedSource[];
  invariants: InvariantScore[];
  topScore: number;
  meanScore: number;
  rank: number;
}

const TODAY = new Date('2026-11-10T00:00:00Z');
const MECHANICAL = /^Section invariant codified:/;

const index: ResearchIndex = JSON.parse(readFileSync('research-index.json', 'utf8'));

const MEASURABLE =
  /(<=|>=|==|<|>)\s*[\d.]|\b\d+\s*(ms|µs|us|bytes|lines|%|tokens)\b|\b0 bytes\b|\bzero\b/i;
const STRUCTURAL =
  /(import|node:\*|union|matrix|route|routing|adapter|emitter|binding|catalog|policy|deny|gate|schema|contract|parser|dedup|discriminat)/i;
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

// ---- select + score ------------------------------------------------------

const entries: Entry[] = [];

for (const study of index.studies) {
  const real = study.distilledInvariants.map((s) => s.trim()).filter((s) => !MECHANICAL.test(s));
  if (real.length === 0) continue;

  const ssot = study.ssotContractPath ?? '';
  const bindingResolves = study.drift.ssotContractPathExists;
  const fanIn = index.ssotFanIn[ssot] ?? 1;
  const age = study.checkedOn ? daysSince(study.checkedOn) : null;
  const fresh = age !== null && age <= 120;

  const invariants: InvariantScore[] = real.map((inv) => {
    const measurable = MEASURABLE.test(inv);
    const structural = STRUCTURAL.test(inv);
    const proseOnly = PROSE_ONLY.test(inv) && !measurable && !structural;
    let score = 40;
    if (bindingResolves) score += 20;
    if (measurable) score += 25;
    if (structural) score += 15;
    if (proseOnly) score -= 15;
    if (fresh) score += 10;
    if (fanIn === 1) score += 10;
    else score -= Math.min(fanIn - 1, 3) * 5;
    if (study.groundedSources.length > 1) score += 5;
    return { invariant: inv, measurable, structural, proseOnly, score: Math.max(0, score) };
  });

  entries.push({
    studyId: study.studyId ?? '(unnamed)',
    title: study.title ?? '',
    ssotContractPath: ssot,
    bindingResolves,
    fanIn,
    domain: domainFor(ssot),
    capability: capabilityFor(ssot),
    checkedOn: study.checkedOn ?? '(unknown)',
    ageDays: age,
    fresh,
    markdownPath: study.markdownPath ?? '',
    markdownBytes: study.markdown?.bytes ?? 0,
    groundedSources: study.groundedSources,
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

// ---- draft OpenSpec bundles ---------------------------------------------

const OUT = 'openspec-draft';
const titleCase = (s: string): string =>
  s
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

function provenanceBlock(e: Entry): string {
  return [
    '<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.',
    `     study      : ${e.studyId}`,
    `     ssot       : ${e.ssotContractPath} (${e.bindingResolves ? 'resolves' : 'MISSING ON DISK'})`,
    `     checkedOn  : ${e.checkedOn} (${e.ageDays ?? '?'} days before 2026-11-10)`,
    `     source leaf: ${e.markdownPath}`,
    `     generated  : ${TODAY.toISOString()}`,
    '     The scenarios below are SHAPE ONLY. They carry no authority and must be',
    '     rewritten against the real contract before this change is applied. -->',
  ].join('\n');
}

function renderBundle(e: Entry): { slug: string; files: number } {
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

${e.invariants.map((i, n) => `${n + 1}. ${i.invariant}`).join('\n')}

## Capabilities

| Field | Value |
| --- | --- |
| Target domain | \`${e.domain}\` |
| Capability | \`${e.capability}\` |
| Bound TypeSpec contract | \`${e.ssotContractPath}\` |
| Contract resolves | ${e.bindingResolves ? 'yes' : '**no — create it**'} |
| Study last checked | \`${e.checkedOn}\` (${e.ageDays ?? '?'}d) |
| Grounded sources | ${e.groundedSources.length} |

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
    (i, n) => `### Requirement ${e.capability}-${String(n + 1).padStart(3, '0')}

The system SHALL satisfy: ${i.invariant}

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
      `- [ ] t${id}b Add a deterministic check for: ${i.invariant.slice(0, 80)}`
    );
  })
  .join('\n')}
`;

  const design = `# Design: ${e.studyId}

${prov}

## Context

Derived from research study \`${e.studyId}\` (checked \`${e.checkedOn}\`).
Source leaf: \`${e.markdownPath}\` (${(e.markdownBytes / 1024).toFixed(0)} KB).
Bound contract: \`${e.ssotContractPath}\`.

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
    e.fanIn > 1
      ? `**Weak binding**: ${e.fanIn} studies point at \`${e.ssotContractPath}\`, so the edge is generic rather than specific to this study.`
      : 'The binding is unique to this study.'
  }
- ${
    e.groundedSources.length <= 1
      ? '**Thin provenance**: the study grounds on a single source, so there is one citation anchor.'
      : `Grounded on ${e.groundedSources.length} sources.`
  }

## TypeSpec surface

- Contract: \`${e.ssotContractPath}\`
- Domain: \`${e.domain}\`
- Namespace: derive from the contract path; do not invent a new namespace here.
`;

  writeFileSync(join(dir, 'proposal.md'), proposal);
  writeFileSync(join(dir, 'design.md'), design);
  writeFileSync(join(dir, 'tasks.md'), tasks);
  writeFileSync(join(specDir, 'spec.md'), spec);
  return { slug: e.studyId, files: 4 };
}

const bundles = entries.map(renderBundle);

// ---- index ---------------------------------------------------------------

const realCount = entries.reduce((n, e) => n + e.invariants.length, 0);
const mechanicalCount = index.corpus.distilledInvariants - realCount;
const unresolved = entries.filter((e) => !e.bindingResolves);
const stale = entries.filter((e) => !e.fresh);
const weak = entries.filter((e) => e.fanIn > 1);

const indexMd = `# Research → OpenSpec shortlist

Derived from \`docs/research/*.research.tsp\` on ${TODAY.toISOString().slice(0, 10)}.

## What the corpus actually contains

| Measure | Value |
| --- | --- |
| Studies | ${index.corpus.studies} |
| \`distilledInvariants\` strings | ${index.corpus.distilledInvariants} |
| — mechanically lifted section headings | ${mechanicalCount} |
| — **real, checkable invariants** | **${realCount}** |
| Studies carrying a real invariant | ${entries.length} |
| Distinct \`ssotContractPath\` targets | ${index.corpus.distinctSsotTargets} |

The corpus emits the *shape* of rigour: ${mechanicalCount} of ${index.corpus.distilledInvariants}
"invariants" are the literal prefix \`Section invariant codified: \` prepended to a markdown
heading. Only the ${realCount} below are normative statements.

## Shortlist

| # | Study | Score | Inv. | Domain | Bound contract | Resolves | Checked |
| --- | --- | --- | --- | --- | --- | --- | --- |
${entries
  .map(
    (e) =>
      `| ${e.rank} | \`${e.studyId}\` | ${e.topScore} | ${e.invariants.length} | \`${e.domain}\` | \`${e.ssotContractPath}\` | ${e.bindingResolves ? 'yes' : '**no**'} | ${e.checkedOn} |`,
  )
  .join('\n')}

## Rows needing a decision before implementation

**Dangling binding (${unresolved.length})** — the contract does not exist on disk; the change must create it:
${unresolved.map((e) => `- \`${e.studyId}\` → \`${e.ssotContractPath}\``).join('\n') || '- none'}

**Stale study (${stale.length})** — \`checkedOn\` older than 120 days:
${stale.map((e) => `- \`${e.studyId}\` (${e.checkedOn}, ${e.ageDays ?? '?'}d)`).join('\n') || '- none'}

**Degenerate binding (${weak.length})** — several studies share one contract, so the edge is weak:
${weak.map((e) => `- \`${e.studyId}\` → \`${e.ssotContractPath}\` (fan-in ${e.fanIn})`).join('\n') || '- none'}

## Drafts

${bundles.length} bundles under \`${OUT}/\`, 4 files each (proposal, design, tasks, spec).
None has been validated. Nothing has been written into rhex.
`;

mkdirSync(join(OUT, '_research-shortlist'), { recursive: true });
writeFileSync(join(OUT, '_research-shortlist', 'index.md'), indexMd);
writeFileSync('shortlist.json', `${JSON.stringify({ entries, bundles }, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      studiesWithRealInvariants: entries.length,
      realInvariants: realCount,
      mechanicalInvariants: mechanicalCount,
      bundlesWritten: bundles.length,
      filesWritten: bundles.length * 4 + 1,
      unresolvedBindings: unresolved.length,
      staleStudies: stale.length,
      degenerateBindings: weak.length,
      top10: entries.slice(0, 10).map((e) => ({
        rank: e.rank,
        study: e.studyId,
        score: e.topScore,
        invariants: e.invariants.length,
        resolves: e.bindingResolves,
      })),
    },
    null,
    2,
  ),
);
