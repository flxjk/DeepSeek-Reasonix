#!/usr/bin/env node
/**
 * Audits the substance of `distilledInvariants` in the rhex research corpus.
 *
 * Question: are these actual normative invariants, or mechanically lifted section headings?
 */
import { readFileSync } from 'node:fs';

interface GroundedSource {
  sourceId: string | null;
  title: string | null;
  originUri: string | null;
  sourceKind: string | null;
  extractedClaim: string | null;
}

interface MarkdownInfo {
  exists: boolean;
  bytes?: number;
  headings?: string[];
  unresolvedEvidence?: string[];
}

interface Study {
  studyId: string | null;
  ssotContractPath: string | null;
  checkedOn: string | null;
  distilledInvariants: string[];
  groundedSources: GroundedSource[];
  markdown: MarkdownInfo;
}

interface ResearchIndex {
  studies: Study[];
}

interface Sample {
  study: string | null;
  inv: string;
}

const index: ResearchIndex = JSON.parse(readFileSync('research-index.json', 'utf8'));

const HEADING_RE = /^Section invariant codified:\s*\*\*(.+?)\*\*\s*$/;
const ANY_PREFIX_RE = /^Section invariant codified:\s*/;
const NORMATIVE_RE =
  /\b(SHALL|SHALL NOT|MUST|MUST NOT|NEVER|ALWAYS|PROHIBITED|FORBIDDEN|REQUIRED)\b/;

let total = 0;
let boldHeadingShaped = 0;
let plainHeadingShaped = 0;
let headingConfirmed = 0;
let headingUnconfirmed = 0;
let normative = 0;

const otherSamples: Sample[] = [];
const normativeSamples: Sample[] = [];
const unconfirmedSamples: Array<{ study: string | null; lifted: string }> = [];

for (const study of index.studies) {
  const mdHeadings = new Set(
    (study.markdown?.headings ?? []).map((h) => h.replace(/[*_`]/g, '').replace(/\\/g, '').trim()),
  );

  for (const raw of study.distilledInvariants) {
    total += 1;
    const inv = raw.trim();

    if (NORMATIVE_RE.test(inv)) {
      normative += 1;
      if (normativeSamples.length < 12) normativeSamples.push({ study: study.studyId, inv });
    }

    if (!ANY_PREFIX_RE.test(inv)) {
      if (otherSamples.length < 15) otherSamples.push({ study: study.studyId, inv });
      continue;
    }

    const bold = inv.match(HEADING_RE);
    if (bold) boldHeadingShaped += 1;
    else plainHeadingShaped += 1;

    const lifted = (bold ? (bold[1] as string) : inv.replace(ANY_PREFIX_RE, ''))
      .replace(/\\/g, '')
      .replace(/[*_`]/g, '')
      .trim();
    const key = lifted.replace(/^[\d.]+\s*/, '');
    const hit = [...mdHeadings].some((h) => h === lifted || h.replace(/^[\d.]+\s*/, '') === key);
    if (hit) headingConfirmed += 1;
    else {
      headingUnconfirmed += 1;
      if (unconfirmedSamples.length < 8) {
        unconfirmedSamples.push({ study: study.studyId, lifted });
      }
    }
  }
}

const all = index.studies.flatMap((s) => s.distilledInvariants.map((i) => i.trim()));
const counts = new Map<string, number>();
for (const i of all) counts.set(i, (counts.get(i) ?? 0) + 1);
const duplicateStrings = [...counts.values()].filter((n) => n > 1).length;

console.log(
  JSON.stringify(
    {
      total,
      mechanicallyPrefixed: boldHeadingShaped + plainHeadingShaped,
      boldHeadingShaped,
      plainHeadingShaped,
      headingConfirmedInLinkedMarkdown: headingConfirmed,
      headingNotConfirmed: headingUnconfirmed,
      realInvariants: total - (boldHeadingShaped + plainHeadingShaped),
      normative,
      duplicateStrings,
      uniqueStrings: new Set(all).size,
      normativeSamples,
      realSamples: otherSamples,
      unconfirmedSamples,
    },
    null,
    2,
  ),
);
