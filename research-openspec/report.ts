#!/usr/bin/env node
/**
 * Final coverage report across the rhex research corpus.
 *
 * Answers one question honestly: of every study in the corpus, which ones
 * produced usable OpenSpec invariants and which did not — and for the ones that
 * did not, exactly why.
 *
 * Reads only artefacts already produced in this directory. Writes coverage.md.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const MECHANICAL = /^Section invariant codified:/;

interface Study {
  studyId: string | null;
  title: string | null;
  markdownPath: string | null;
  markdown: { exists: boolean; bytes?: number };
  ssotContractPath: string | null;
  distilledInvariants: string[];
}

const index: { corpus: Record<string, number>; studies: Study[] } = JSON.parse(
  readFileSync('research-index.json', 'utf8'),
);

const read = <T,>(f: string, fallback: T): T =>
  existsSync(f) ? (JSON.parse(readFileSync(f, 'utf8')) as T) : fallback;

const small = read<{ records: Array<{ studyId: string; found: number; accepted: unknown[] }> }>(
  'derived-invariants.json',
  { records: [] },
);
const big = read<{
  records: Array<{ studyId: string; found: number; accepted: unknown[]; heading: string }>;
}>('derived-big.json', { records: [] });
const shortlist = read<{
  entries: Array<{ studyId: string; invariants: Array<{ source: string }> }>;
  filteredOut: unknown[];
  rejectedInference: unknown[];
}>('shortlist.json', { entries: [], filteredOut: [], rejectedInference: [] });
const audit = read<{ checked: number; literal: number; failures: unknown[] }>('quote-audit.json', {
  checked: 0,
  literal: 0,
  failures: [],
});
// The chunker's own plan: without it, a study whose windows all failed the
// pre-filter looks identical to one that was never targeted at all.
const plan = read<{
  keptChunks: number;
  perStudy: Array<{ study: string; kb: number; chunks: number; kept: number }>;
}>('chunk-plan.json', { keptChunks: 0, perStudy: [] });
const planByStudy = new Map<string, { chunks: number; kept: number }>();
for (const p of plan.perStudy) planByStudy.set(p.study, { chunks: p.chunks, kept: p.kept });

// ---- collapse the redundant index rows -----------------------------------

const seen = new Set<string>();
const studies: Study[] = [];
let duplicateRows = 0;
for (const s of index.studies) {
  const id = s.studyId ?? '(unnamed)';
  if (seen.has(id)) {
    duplicateRows++;
    continue;
  }
  seen.add(id);
  studies.push(s);
}

const smallByStudy = new Map<string, number>();
for (const r of small.records) smallByStudy.set(r.studyId, (smallByStudy.get(r.studyId) ?? 0) + r.accepted.length);
const bigByStudy = new Map<string, number>();
const bigChunksByStudy = new Map<string, number>();
for (const r of big.records) {
  bigChunksByStudy.set(r.studyId, (bigChunksByStudy.get(r.studyId) ?? 0) + 1);
  if (r.accepted.length > 0)
    bigByStudy.set(r.studyId, (bigByStudy.get(r.studyId) ?? 0) + r.accepted.length);
}
const bundledByStudy = new Map<string, { total: number; contract: number; derived: number }>();
for (const e of shortlist.entries) {
  const contract = e.invariants.filter((i) => i.source === 'contract').length;
  bundledByStudy.set(e.studyId, {
    total: e.invariants.length,
    contract,
    derived: e.invariants.length - contract,
  });
}

// The small extractor ran with a byte ceiling; recover the effective one.
let smallCeiling = 0;
for (const r of small.records) {
  const s = studies.find((x) => x.studyId === r.studyId);
  if (s) smallCeiling = Math.max(smallCeiling, s.markdown.bytes ?? 0);
}

interface Row {
  studyId: string;
  kb: number;
  realContract: number;
  mechanicalContract: number;
  smallAccepted: number;
  bigAccepted: number;
  bigChunks: number;
  final: number;
  status: string;
}

const rows: Row[] = [];
for (const s of studies) {
  const id = s.studyId ?? '(unnamed)';
  const real = s.distilledInvariants.filter((i) => !MECHANICAL.test(i.trim())).length;
  const mech = s.distilledInvariants.length - real;
  const finalEntry = bundledByStudy.get(id);
  const sa = smallByStudy.get(id) ?? 0;
  const ba = bigByStudy.get(id) ?? 0;
  const bc = bigChunksByStudy.get(id) ?? 0;

  const planRow = planByStudy.get(id);
  const markdownMissing = !s.markdown.exists;
  let status: string;
  if (finalEntry && finalEntry.total > 0) status = 'bundled';
  else if (markdownMissing) status = 'source markdown missing on disk; nothing to extract';
  else if (real > 0) status = 'contract-only, all removed by noise filter';
  else if (mech === 0) status = 'no invariants declared at all';
  else if (planRow && planRow.kept === 0)
    status = 'pre-filter kept nothing: prose carries no numeric or normative language';
  else if (planRow && planRow.kept > 0 && ba === 0)
    status = 'windows were sent to the model but none held a quotable claim';
  else if (sa > 0 || ba > 0) status = 'derived claims existed but none survived the gates';
  else if (smallCeiling > 0 && (s.markdown.bytes ?? 0) <= smallCeiling)
    status = 'mechanical contract only; no derived claim accepted';
  else status = 'mechanical contract only; never targeted';

  rows.push({
    studyId: id,
    kb: Math.round((s.markdown.bytes ?? 0) / 1024),
    realContract: real,
    mechanicalContract: mech,
    smallAccepted: sa,
    bigAccepted: ba,
    bigChunks: bc,
    final: finalEntry?.total ?? 0,
    status,
  });
}

const bundled = rows.filter((r) => r.final > 0);
const byStatus = new Map<string, number>();
for (const r of rows) byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1);

const band = (kb: number): string =>
  kb < 40 ? 'under 40 KB' : kb < 400 ? '40-400 KB' : 'over 400 KB';
const byBand = new Map<string, { studies: number; bundled: number; invariants: number }>();
for (const r of rows) {
  const b = band(r.kb);
  const cur = byBand.get(b) ?? { studies: 0, bundled: 0, invariants: 0 };
  cur.studies++;
  if (r.final > 0) cur.bundled++;
  cur.invariants += r.final;
  byBand.set(b, cur);
}

const totalFinal = rows.reduce((n, r) => n + r.final, 0);
const fromContract = rows.reduce((n, r) => n + Math.min(r.realContract, r.final), 0);

const summary = {
  indexRows: index.studies.length,
  duplicateRows,
  distinctStudies: studies.length,
  sourceMarkdownMissing: rows.filter((r) => r.status.startsWith('source markdown missing')).length,
  studiesBundled: bundled.length,
  studiesWithoutBundle: rows.length - bundled.length,
  contractInvariantsDeclared: rows.reduce((n, r) => n + r.realContract + r.mechanicalContract, 0),
  realContractInvariants: rows.reduce((n, r) => n + r.realContract, 0),
  mechanicalContractInvariants: rows.reduce((n, r) => n + r.mechanicalContract, 0),
  derivedAcceptedSmall: rows.reduce((n, r) => n + r.smallAccepted, 0),
  derivedAcceptedBig: rows.reduce((n, r) => n + r.bigAccepted, 0),
  bigChunksProcessed: big.records.length,
  finalInvariants: totalFinal,
  removedByNoiseFilter: shortlist.filteredOut.length,
  droppedNonVerbatim: audit.failures.length,
  quoteAudit: { checked: audit.checked, literal: audit.literal },
  byStatus: Object.fromEntries([...byStatus.entries()].sort((a, b) => b[1] - a[1])),
  byBand: Object.fromEntries([...byBand.entries()]),
};

console.log(JSON.stringify(summary, null, 2));

// ---- coverage.md ----------------------------------------------------------

const md: string[] = [];
md.push('# Research corpus → OpenSpec: final coverage');
md.push('');
md.push(`Generated ${new Date().toISOString()}. Every number below is derived from the`);
md.push('artefacts in this directory, not from an estimate.');
md.push('');
md.push('## Funnel');
md.push('');
md.push('| Stage | Count |');
md.push('| --- | --- |');
md.push(`| Rows in the research index | ${summary.indexRows} |`);
md.push(`| — redundant duplicate rows (same id and markdown) | ${summary.duplicateRows} |`);
md.push(`| **Distinct studies** | **${summary.distinctStudies}** |`);
md.push(`| \`distilledInvariants\` strings declared | ${summary.contractInvariantsDeclared} |`);
md.push(`| — mechanically lifted section headings | ${summary.mechanicalContractInvariants} |`);
md.push(`| — real hand-written invariants | ${summary.realContractInvariants} |`);
md.push(`| Derived claims accepted, whole-file extraction | ${summary.derivedAcceptedSmall} |`);
md.push(`| Derived claims accepted, chunked extraction | ${summary.derivedAcceptedBig} |`);
md.push(`| Chunk-windows actually sent to the model | ${summary.bigChunksProcessed} |`);
md.push(`| Removed by the noise filter | ${summary.removedByNoiseFilter} |`);
md.push(`| Removed for a non-verbatim quote | ${summary.droppedNonVerbatim} |`);
md.push(`| **Invariants reaching a bundle** | **${summary.finalInvariants}** |`);
md.push(`| **Studies with at least one invariant** | **${bundled.length} of ${rows.length}** |`);
md.push('');
md.push('## Why studies produced nothing');
md.push('');
md.push('| Reason | Studies |');
md.push('| --- | --- |');
for (const [k, v] of [...byStatus.entries()].sort((a, b) => b[1] - a[1]))
  md.push(`| ${k} | ${v} |`);
md.push('');
md.push('## By size band');
md.push('');
md.push('| Band | Studies | Bundled | Invariants |');
md.push('| --- | --- | --- | --- |');
for (const [k, v] of byBand.entries())
  md.push(`| ${k} | ${v.studies} | ${v.bundled} | ${v.invariants} |`);
md.push('');
md.push('## Per study');
md.push('');
md.push('| Study | KB | Real contract | Mechanical | Small | Big | Final | Status |');
md.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
for (const r of [...rows].sort((a, b) => b.final - a.final || a.studyId.localeCompare(b.studyId)))
  md.push(
    `| \`${r.studyId}\` | ${r.kb} | ${r.realContract} | ${r.mechanicalContract} | ${r.smallAccepted} | ${r.bigAccepted} | **${r.final}** | ${r.status} |`,
  );
md.push('');
md.push('## Caveats');
md.push('');
md.push('- Scenarios in the generated bundles are labelled SHAPE ONLY. They are');
md.push('  templates, not reviewed acceptance criteria.');
md.push('- Two of three invariant sources are model output. Every derived statement');
md.push('  carries a source quote and was re-checked verbatim; contract statements');
md.push('  are authoritative, model statements are not.');
md.push('- Most contracts carry no usable invariant, and most bindings point at the');
md.push('  corpus default rather than a real claim. Those need a human decision.');
md.push('');

writeFileSync('coverage.md', `${md.join('\n')}\n`);
console.log('\nwrote coverage.md');
