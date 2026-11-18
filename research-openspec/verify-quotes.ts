#!/usr/bin/env node
/**
 * Audit: does every accepted invariant actually carry a literal source quote?
 *
 * The extractors claim to validate each statement against a verbatim passage.
 * This re-checks that claim from the artefacts alone, without trusting the
 * extractor: the quote must appear in the study's own markdown after whitespace
 * normalisation.
 *
 * Read-only. Prints a verdict per source and a summary.
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs';

const RHEX = '/Users/gj/git/rhex';

interface Study {
  studyId: string | null;
  markdownPath: string | null;
}

const index: { studies: Study[] } = JSON.parse(readFileSync('research-index.json', 'utf8'));
const markdownById = new Map<string, string>();
for (const s of index.studies) if (s.studyId) markdownById.set(s.studyId, s.markdownPath ?? '');

const cache = new Map<string, string>();
function body(studyId: string): string {
  const hit = cache.get(studyId);
  if (hit !== undefined) return hit;
  const rel = markdownById.get(studyId);
  let text = '';
  if (rel && existsSync(`${RHEX}/${rel}`)) text = readFileSync(`${RHEX}/${rel}`, 'utf8');
  cache.set(studyId, text);
  return text;
}

/** Compare on content only: whitespace, escaping and markdown emphasis vary. */
const norm = (s: string): string =>
  s
    .replace(/\\/g, '')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

interface Pair {
  studyId: string;
  statement: string;
  quote: string;
  origin: string;
}

const pairs: Pair[] = [];

if (existsSync('derived-invariants.json')) {
  const d = JSON.parse(readFileSync('derived-invariants.json', 'utf8'));
  for (const r of d.records ?? [])
    for (const a of r.accepted ?? [])
      pairs.push({ studyId: r.studyId, statement: a.statement, quote: a.quote, origin: 'small' });
}

if (existsSync('derived-big.json')) {
  const d = JSON.parse(readFileSync('derived-big.json', 'utf8'));
  for (const r of d.records ?? [])
    for (const a of r.accepted ?? [])
      pairs.push({
        studyId: r.studyId,
        statement: a.statement,
        quote: a.quote,
        origin: `big#${r.index}`,
      });
}

let literal = 0;
let literalButShort = 0;
let emptyQuote = 0;
let unverified = 0;
let noStudy = 0;
const failures: Array<{ p: Pair; why: string }> = [];

for (const p of pairs) {
  if (!p.quote || p.quote.trim().length === 0) {
    emptyQuote++;
    failures.push({ p, why: 'empty quote' });
    continue;
  }
  const src = body(p.studyId);
  if (!src) {
    noStudy++;
    failures.push({ p, why: 'no markdown on disk for this study' });
    continue;
  }
  // Verbatim is the claim under test. Length is a separate quality signal, so it
  // must not be able to turn a real quote into a failure.
  if (norm(src).includes(norm(p.quote))) {
    literal++;
    if (norm(p.quote).length < 40) literalButShort++;
  } else {
    unverified++;
    failures.push({ p, why: 'quote not found verbatim in source' });
  }
}

console.log(`accepted invariants checked : ${pairs.length}`);
console.log(`  quote found verbatim      : ${literal}`);
console.log(`  quote NOT found           : ${unverified}`);
console.log(`  quote empty               : ${emptyQuote}`);
console.log(`  quote under 40 chars      : ${literalButShort} (verbatim, just short)`);
console.log(`  study markdown missing    : ${noStudy}`);
console.log(`verbatim rate               : ${pairs.length ? ((literal / pairs.length) * 100).toFixed(1) : '0.0'}%`);

// Hand the failures to merge.ts so a non-verbatim claim cannot reach a bundle.
writeFileSync(
  'quote-audit.json',
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      checked: pairs.length,
      literal,
      literalButShort,
      unverified,
      emptyQuote,
      failures: failures.map((f) => ({
        studyId: f.p.studyId,
        statement: f.p.statement,
        quote: f.p.quote,
        why: f.why,
        statementKey: f.p.statement.toLowerCase().replace(/\s+/g, ' ').trim(),
      })),
    },
    null,
    2,
  )}\n`,
);

if (failures.length) {
  console.log('\nfirst failures:');
  for (const f of failures.slice(0, 10))
    console.log(`  [${f.p.origin}] ${f.p.studyId}: ${f.why}\n      stmt: ${f.p.statement.slice(0, 110)}\n      quote: ${p_show(f.p.quote)}`);
}

function p_show(q: string): string {
  return q ? q.replace(/\s+/g, ' ').slice(0, 110) : '(none)';
}
