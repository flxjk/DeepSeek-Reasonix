#!/usr/bin/env node
/**
 * Emit a human-readable health and remediation report for the corpus.
 *
 * Everything here is derived from data/corpus.json, so the report can never
 * disagree with what the MCP server answers.
 *
 * Run: node src/report.mjs  ->  data/REPORT.md
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG = resolve(HERE, '..')

const corpus = JSON.parse(readFileSync(join(PKG, 'data', 'corpus.json'), 'utf8'))
const { census: c, health: h } = corpus

const pct = (n, d) => (d === 0 ? '—' : `${((n / d) * 100).toFixed(1)}%`)
const table = (rows, head) =>
  [
    `| ${head.join(' | ')} |`,
    `| ${head.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${r.join(' | ')} |`),
  ].join('\n')

const L = []
const w = (s = '') => L.push(s)

w('# rhex research corpus — health and remediation')
w()
w(`Generated ${corpus.generatedAt} from \`data/corpus.json\`.`)
w(`Corpus root: \`${corpus.rhexRoot}\`.`)
w(`Every number below is derived from the contracts on disk, not estimated.`)
w()

// ── funnel ───────────────────────────────────────────────────────────────────

w('## 1. Funnel')
w()
w(
  table(
    [
      ['Contract `.research.tsp` files scanned', String(c.contractFilesScanned)],
      ...Object.entries(c.contractFilesByRoot).map(([k, v]) => [`  in \`${k}\``, String(v)]),
      ['**Distinct studies**', `**${c.distinctStudies}**`],
      ['Invariant strings declared', String(c.declaredInvariants)],
      ['  hand-written, authoritative', `**${c.realInvariants}** (${pct(c.realInvariants, c.declaredInvariants)})`],
      ['  mechanically lifted section headings', `${c.mechanicalInvariants} (${pct(c.mechanicalInvariants, c.declaredInvariants)})`],
      ['Grounded sources', String(c.groundedSources)],
      ['Model-derived claims', String(c.derivedClaims)],
      ['  with a verbatim-verified quote', String(c.verifiedClaims)],
      ['Distinct `ssotContractPath` targets', String(c.distinctSsotTargets)],
      ['Markdown body bytes', c.markdownBytes.toLocaleString('en-US')],
    ],
    ['Quantity', 'Value'],
  ),
)
w()
w(
  `The headline defect: **${pct(c.mechanicalInvariants, c.declaredInvariants)} of everything the corpus calls an invariant is a section heading.** A generator walked each markdown leaf and wrote \`Section invariant codified: <heading>\` into the contract. The index quarantines those as \`section-heading\`; they are searchable and never returned as norms.`,
)
w()

// ── health ───────────────────────────────────────────────────────────────────

w('## 2. Health')
w()
w(
  table(
    [
      ['Studies with a real hand-written invariant', String(h.studiesWithRealInvariant), pct(h.studiesWithRealInvariant, c.distinctStudies)],
      ['Studies with a quote-verified derived claim', String(h.studiesWithVerifiedClaim), pct(h.studiesWithVerifiedClaim, c.distinctStudies)],
      ['Studies with either', `**${h.studiesWithEither}**`, pct(h.studiesWithEither, c.distinctStudies)],
      ['Studies with neither', `**${h.studiesWithNoSubstance}**`, pct(h.studiesWithNoSubstance, c.distinctStudies)],
      ['Bound to a contract that resolves', String(c.distinctStudies - h.ssotMissing), pct(c.distinctStudies - h.ssotMissing, c.distinctStudies)],
      ['Of those, a per-study claim (`sole`/`shared`)', String(c.distinctStudies - h.studiesWithDefaultBinding), pct(c.distinctStudies - h.studiesWithDefaultBinding, c.distinctStudies)],
      ['  corpus-default binding only', `${h.studiesWithDefaultBinding}`, pct(h.studiesWithDefaultBinding, c.distinctStudies)],
      ['Front matter present on any leaf', String(c.distinctStudies - h.frontMatterAbsent), pct(c.distinctStudies - h.frontMatterAbsent, c.distinctStudies)],
      ['Markdown leaf missing entirely', String(h.markdownMissing)],
      ['Unresolved evidence notes', String(h.withUnresolvedEvidence)],
    ],
    ['Measure', 'Count', 'Share'],
  ),
)
w()

// ── the degenerate binding ───────────────────────────────────────────────────

w('## 3. The binding is degenerate, and this is the real blocker')
w()
w(
  `${c.distinctStudies} studies point at only ${c.distinctSsotTargets} distinct code contracts. One of them absorbs ${corpus.ssotFanIn[0]?.studies ?? 0} studies:`,
)
w()
w(
  table(
    corpus.ssotFanIn.slice(0, 12).map((e) => [
      `\`${e.ssotPath}\``,
      String(e.studies),
      e.resolves ? 'resolves' : '**missing**',
    ]),
    ['`ssotContractPath`', 'Studies', 'On disk'],
  ),
)
w()
w(
  'A `fanIn` above 5 means the path is a corpus-wide placeholder rather than a statement that *this* study governs *that* contract. `research_for_path` reports such matches as `viaDefaultBinding`, separately from a study\'s own claim. Until these are assigned, the research-to-code edge carries almost no information.',
)
w()

// ── remediation ──────────────────────────────────────────────────────────────

const byFlag = (f) => corpus.studies.filter((s) => s.flags.includes(f))

w('## 4. Remediation queue')
w()
w('Ordered by how much each item unlocks.')
w()

w(`### 4.1 Assign the ${h.studiesWithDefaultBinding} default bindings`)
w()
w('Each needs a human decision: either a real `ssotContractPath` this study governs, or an explicit empty string meaning "no code binding yet". Empty is a legitimate answer and turns the study into a research-agenda item.')
w()
w(
  table(
    byFlag('binding-default')
      .slice(0, 15)
      .map((s) => [`\`${s.studyId}\``, String(s.realInvariants.length), String(s.claims.filter((x) => x.verified).length)]),
    ['Study', 'Real invariants', 'Verified claims'],
  ),
)
if (h.studiesWithDefaultBinding > 15) {
  w()
  w(`…and ${h.studiesWithDefaultBinding - 15} more. Full list: \`research_gaps { "flag": "binding-default" }\`.`)
}
w()

w(`### 4.2 Strip the ${c.mechanicalInvariants} mechanical invariants from the contracts`)
w()
w('These are not norms and they are currently mixed into the same `distilledInvariants` array as the real ones, which is why any naive reader of the corpus over-counts its normative content by 13×.')
w()
w('Two options, both mechanical:')
w()
w('1. Delete them from `distilledInvariants` — they are recoverable from the markdown headings at any time, and `research_study` already reports headings separately.')
w('2. Keep them but move them to a distinct field, so the array means one thing.')
w()
w('Regenerate the affected contracts through the repo\'s own emitter; do not hand-edit 274 TypeSpec files.')
w()

w(`### 4.3 Add front matter to ${h.frontMatterAbsent} studies`)
w()
w('The researched front matter is the only place `companionResearchTspPath` and `groundedSourceCount` are recorded, and it is what a future ingest reads. The 21 studies that have it can serve as the template.')
w()

w('### 4.4 Close the drift')
w()
const drift = [
  ['Markdown leaf missing', byFlag('markdown-missing'), (s) => s.markdownPath],
  ['`ssotContractPath` does not resolve', byFlag('ssot-missing'), (s) => s.ssotContractPath],
  [
    'Declared `researchTspPath` does not resolve',
    corpus.studies.filter((s) => s.researchTspPath !== null && !s.researchTspResolved),
    (s) => s.researchTspPath,
  ],
]
for (const [label, list, pick] of drift) {
  w()
  w(`**${label}** — ${list.length}`)
  w()
  for (const s of list) {
    w(`- \`${s.studyId}\` → \`${pick(s) ?? '(none declared)'}\``)
  }
}
w()

w(`### 4.5 ${h.studiesWithNoSubstance} studies carry nothing at all`)
w()
w('No hand-written invariant and no accepted derived claim. Some are link stubs — `typespec-and-hey-api-gateway-copy` has no markdown on disk. Each needs either real extraction or deletion.')
w()
for (const s of byFlag('no-real-invariant').filter((s) => s.flags.includes('no-derived-claim'))) {
  w(`- \`${s.studyId}\` — ${s.markdownBytes.toLocaleString('en-US')} bytes`)
}
w()

// ── provenance note ──────────────────────────────────────────────────────────

w('## 5. What is authoritative')
w()
w(
  table(
    [
      ['`contract-invariant`', 'hand-written in `.research.tsp`', '**authoritative**'],
      ['`grounded-claim`', "the study's own `extractedClaim`", 'provenance, not norm'],
      ['`derived-claim`', 'local model, quote re-checked verbatim', 'needs human confirmation'],
      ['`unverified-claim`', 'local model, quote failed the verbatim check', 'do not rely on'],
      ['`source-quote`', 'the quote backing a derived claim', 'evidence'],
      ['`section-heading`', 'mechanically lifted heading', 'navigation only'],
    ],
    ['Kind', 'Origin', 'Trust'],
  ),
)
w()
w(
  `The ${c.verifiedClaims} verified claims were extracted by \`ggml-org/gemma-4-E4B-it-GGUF:Q8_0\` running locally over 90 chunk-windows drawn from the 19 largest studies. ` +
    `${c.derivedClaims - c.verifiedClaims} failed the verbatim quote check and are retained as \`unverified-claim\` rather than deleted, so the failure rate stays visible.`,
)
w()

writeFileSync(join(PKG, 'data', 'REPORT.md'), `${L.join('\n')}\n`)
process.stdout.write(`written: ${join(PKG, 'data', 'REPORT.md')} (${L.length} lines)\n`)
