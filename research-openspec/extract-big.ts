#!/usr/bin/env node
/**
 * Chunked invariant extraction for studies that exceed the model context.
 *
 * Phase 1 (--dry): split every remaining study into section/paragraph windows,
 * apply the deterministic pre-filter, and report how much text and how many
 * chunks survive — plus a wall-clock estimate from measured throughput.
 *
 * Phase 2 (default): send surviving chunks to the local model, validate each
 * statement against a literal source quote, and save incrementally so a long
 * run can be interrupted.
 *
 * Writes only inside this working directory.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const MODEL: string = process.env['MODEL'] ?? 'ggml-org/gemma-4-E4B-it-GGUF:Q8_0';
const HOST: string = process.env['OLLAMA'] ?? 'http://127.0.0.1:11434';
const RHEX = '/Users/gj/git/rhex';
const OUT = 'derived-big.json';

const MAX_CHARS = Number(process.env['MAXCHARS'] ?? 24000);
const OVERLAP = Number(process.env['OVERLAP'] ?? 2000);
const MIN_CHARS = 400;

// measured on this machine with gemma-4-E4B Q8_0
const PREFILL_TOK_PER_SEC = 454;
const GEN_TOK_PER_SEC = 13;
const GEN_TOKENS_PER_CHUNK = 400;

const DRY = process.argv.includes('--dry');
const LIMIT = (() => {
  const i = process.argv.indexOf('--limit');
  return i === -1 ? Number.POSITIVE_INFINITY : Number(process.argv[i + 1]);
})();
// Restrict a run to named studies, e.g. --studies a,b — used to recover studies
// whose contract carried a stale markdownPath after the main sweep had finished.
const STUDY_FILTER: Set<string> | null = (() => {
  const i = process.argv.indexOf('--studies');
  if (i === -1) return null;
  return new Set(
    process.argv[i + 1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
})();

interface Study {
  studyId: string | null;
  markdownPath: string | null;
  researchTspFile?: string | null;
  ssotContractPath: string | null;
  checkedOn: string | null;
  distilledInvariants: string[];
  markdown: { exists: boolean; bytes?: number };
}

interface ResearchIndex {
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

interface Chunk {
  studyId: string;
  index: number;
  heading: string;
  start: number;
  chars: number;
  text: string;
  keep: boolean;
  reason: string;
}

const MECHANICAL = /^Section invariant codified:/;

const KEEP_MODAL = /\b(shall|must|never|always|prohibited|forbidden)\b/i;
const KEEP_UNIT =
  /(\b\d+(\.\d+)?\s*(ms|µs|us|ns|%|bytes|kb|mb|gb|fps|lines|tokens|cycles)\b)|(<=|>=|==|≤|≥)/;
const KEEP_HEADING = /(invariant|constraint|requirement|policy|rule|gate|guarantee|non-goal|acceptance)/i;

// These papers carry base64 payloads (fetched pages, artifact dumps) that dwarf
// the prose. Any window that is mostly one long encoded run carries no invariant.
const ENCODED_RUN = /[A-Za-z0-9+/]{120,}={0,2}/g;
function looksEncoded(s: string): boolean {
  let encoded = 0;
  for (const m of s.match(ENCODED_RUN) ?? []) encoded += m.length;
  return encoded > s.length * 0.4;
}

const norm = (s: string): string =>
  s.toLowerCase().replace(/\\/g, '').replace(/[*_`$]/g, '').replace(/\s+/g, ' ').trim();

/** Split a document into heading-delimited sections, then into windows. */
function chunkDocument(studyId: string, text: string): Chunk[] {
  const lines = text.split('\n');
  const sections: Array<{ heading: string; body: string }> = [];
  let heading = '(preamble)';
  let buf: string[] = [];

  for (const line of lines) {
    const m = line.match(/^#{1,4}\s+(.+?)\s*$/);
    if (m) {
      if (buf.length) sections.push({ heading, body: buf.join('\n') });
      heading = (m[1] as string).replace(/[*_`\\]/g, '').trim();
      buf = [];
      continue;
    }
    buf.push(line);
  }
  if (buf.length) sections.push({ heading, body: buf.join('\n') });

  const chunks: Chunk[] = [];
  let index = 0;

  for (const section of sections) {
    const body = section.body.trim();
    if (body.length === 0) continue;
    // Bibliography-like sections never carry invariants. Do NOT match
    // `appendix`/`sources` here: in this corpus the real research body often
    // lives under an `## Appendix` heading.
    if (/^(works cited|references|bibliography|citations|further reading)\b/i.test(section.heading))
      continue;

    const pieces: string[] = [];
    if (body.length <= MAX_CHARS) {
      pieces.push(body);
    } else {
      const paras = body.split(/\n{2,}/);
      let cur = '';
      for (const p of paras) {
        // A single paragraph can dwarf MAX_CHARS: these papers carry one-line
        // blobs of 400 KB+. Hard-wrap those so no piece ever exceeds budget.
        if (p.length > MAX_CHARS) {
          if (cur.trim()) pieces.push(cur);
          cur = '';
          let rest = p;
          while (rest.length > MAX_CHARS) {
            const window = rest.slice(0, MAX_CHARS);
            const cut = Math.max(window.lastIndexOf('\n'), window.lastIndexOf('. '));
            const at = cut > MAX_CHARS * 0.6 ? cut + 1 : MAX_CHARS;
            pieces.push(rest.slice(0, at));
            rest = rest.slice(Math.max(0, at - OVERLAP));
          }
          cur = rest;
          continue;
        }
        if (cur.length + p.length + 2 > MAX_CHARS && cur.length > 0) {
          pieces.push(cur);
          cur = cur.slice(Math.max(0, cur.length - OVERLAP));
        }
        cur += (cur ? '\n\n' : '') + p;
      }
      if (cur.trim()) pieces.push(cur);
    }

    for (const piece of pieces) {
      if (piece.trim().length < MIN_CHARS) continue;
      if (looksEncoded(piece)) continue;
      const keepHeading = KEEP_HEADING.test(section.heading);
      const keepMeasured = KEEP_MODAL.test(piece) && KEEP_UNIT.test(piece);
      const keepUnit = KEEP_UNIT.test(piece);
      const keep = keepHeading || keepMeasured || keepUnit;
      const reason = keep
        ? keepHeading
          ? 'heading'
          : keepMeasured
            ? 'modal+unit'
            : 'unit'
        : 'descriptive';
      chunks.push({
        studyId,
        index: index++,
        heading: section.heading,
        start: 0,
        chars: piece.length,
        text: piece,
        keep,
        reason,
      });
    }
  }
  return chunks;
}

// ---- load ----------------------------------------------------------------

/**
 * Some contracts declare a markdownPath that is no longer on disk while the body
 * still sits beside the contract in docs/research. Two studies hit this: one body
 * is a byte-identical duplicate of a study already extracted, the other is real.
 * Resolve by declared path first, then by the contract's own stem.
 */
function resolveMarkdown(s: Study): string | null {
  if (s.markdownPath) {
    const declared = `${RHEX}/${s.markdownPath}`;
    if (existsSync(declared)) return declared;
  }
  const stems = [
    (s.markdownPath ?? '').split('/').pop()?.replace(/\.md$/, ''),
    (s.researchTspFile ?? '').split('/').pop()?.replace(/\.research\.tsp$/, ''),
  ];
  for (const stem of stems) {
    if (!stem) continue;
    for (const root of ['docs/research', 'docs/rhex/research']) {
      const candidate = `${RHEX}/${root}/${stem}.md`;
      if (existsSync(candidate)) return candidate;
    }
  }
  return null;
}

const index: ResearchIndex = JSON.parse(readFileSync('research-index.json', 'utf8'));
const small: { records: DerivedRecord[] } = existsSync('derived-invariants.json')
  ? (JSON.parse(readFileSync('derived-invariants.json', 'utf8')) as { records: DerivedRecord[] })
  : { records: [] };
const doneSmall = new Set(small.records.map((r) => r.studyId));

const targets = index.studies.filter(
  (s) =>
    s.distilledInvariants.length > 0 &&
    s.distilledInvariants.every((i) => MECHANICAL.test(i)) &&
    !doneSmall.has(s.studyId ?? '') &&
    resolveMarkdown(s) !== null &&
    (STUDY_FILTER === null || STUDY_FILTER.has(s.studyId ?? '')),
);

// The corpus carries TitleCase/kebab twins of the same study. Hash the markdown
// and keep one per distinct body, preferring the kebab-case identifier.
const seenHash = new Map<string, string>();
const duplicates: Array<{ dropped: string; duplicateOf: string; kb: number }> = [];
const uniqueTargets: Study[] = [];

for (const s of [...targets].sort((a, b) => (a.studyId ?? '').localeCompare(b.studyId ?? ''))) {
  const path = resolveMarkdown(s);
  if (!path) continue;
  const body = readFileSync(path, 'utf8');
  const hash = createHash('sha256').update(body).digest('hex').slice(0, 16);
  const prior = seenHash.get(hash);
  if (prior) {
    duplicates.push({
      dropped: s.studyId ?? '',
      duplicateOf: prior,
      kb: Math.round(body.length / 1024),
    });
    continue;
  }
  seenHash.set(hash, s.studyId ?? '');
  uniqueTargets.push(s);
}

// ---- phase 1: dry --------------------------------------------------------

const allChunks: Chunk[] = [];
const perStudy: Array<{ study: string; kb: number; chunks: number; kept: number; keptKb: number }> = [];

for (const s of uniqueTargets) {
  const id = s.studyId ?? '';
  const path = resolveMarkdown(s);
  if (!path) continue;
  const text = readFileSync(path, 'utf8');
  const chunks = chunkDocument(id, text);
  allChunks.push(...chunks);
  const kept = chunks.filter((c) => c.keep);
  perStudy.push({
    study: id,
    kb: Math.round(text.length / 1024),
    chunks: chunks.length,
    kept: kept.length,
    keptKb: Math.round(kept.reduce((n, c) => n + c.chars, 0) / 1024),
  });
}

const totalChars = allChunks.reduce((n, c) => n + c.chars, 0);
const keptChunks = allChunks.filter((c) => c.keep);
const keptChars = keptChunks.reduce((n, c) => n + c.chars, 0);

const prefillTokens = Math.round(keptChars / 4);
const estSeconds = prefillTokens / PREFILL_TOK_PER_SEC + (keptChunks.length * GEN_TOKENS_PER_CHUNK) / GEN_TOK_PER_SEC;

const byReason = new Map<string, number>();
for (const c of keptChunks) byReason.set(c.reason, (byReason.get(c.reason) ?? 0) + 1);

console.log(
  JSON.stringify(
    {
      dry: DRY,
      model: MODEL,
      targetsBeforeDedupe: targets.length,
      targets: uniqueTargets.length,
      duplicatesDropped: duplicates.length,
      duplicateKbSaved: Math.round(duplicates.reduce((n, d) => n + d.kb, 0)),
      duplicates: duplicates.slice(0, 15),
      totalMB: +(totalChars / 1048576).toFixed(1),
      chunks: allChunks.length,
      maxChunkChars: allChunks.reduce((n, c) => Math.max(n, c.chars), 0),
      keptMaxChars: keptChunks.reduce((n, c) => Math.max(n, c.chars), 0),
      keptChunks: keptChunks.length,
      keptPct: +((keptChunks.length / allChunks.length) * 100).toFixed(1),
      keptMB: +(keptChars / 1048576).toFixed(1),
      keptPctBytes: +((keptChars / totalChars) * 100).toFixed(1),
      keepReasons: Object.fromEntries([...byReason.entries()].sort((a, b) => b[1] - a[1])),
      estimate: {
        prefillTokens,
        prefillMinutes: Math.round(prefillTokens / PREFILL_TOK_PER_SEC / 60),
        generationMinutes: Math.round((keptChunks.length * GEN_TOKENS_PER_CHUNK) / GEN_TOK_PER_SEC / 60),
        totalHours: +(estSeconds / 3600).toFixed(1),
      },
      biggest: perStudy.sort((a, b) => b.kb - a.kb).slice(0, 10),
    },
    null,
    2,
  ),
);

// Persist the plan so the coverage report can attribute a study that yielded
// zero kept chunks, instead of mislabelling it as never targeted.
writeFileSync(
  'chunk-plan.json',
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      model: MODEL,
      maxChars: MAX_CHARS,
      overlap: OVERLAP,
      minChars: MIN_CHARS,
      targets: perStudy.length,
      chunks: allChunks.length,
      keptChunks: keptChunks.length,
      perStudy: [...perStudy].sort((a, b) => b.kb - a.kb),
    },
    null,
    2,
  )}\n`,
);

if (DRY) process.exit(0);

// ---- phase 2: extraction -------------------------------------------------

const SYSTEM = `You extract normative invariants from engineering research prose.

An invariant is a statement that is:
- checkable: it names a number, a threshold, a structural constraint, or a prohibition
- about the system being built, not about the document
- expressible as one sentence

GOOD examples:
- Doubly-stochastic routing matrix P satisfies rowSum(P) == 1 and colSum(P) == 1
- Zero raw node:* imports in emitter adapters; 100% programmatic emission from TypeSpec contracts
- CLI shims remain <= 30 lines and emit 0 bytes on exit code 0
- Selection and immediate feedback must have a visible acknowledgement within 100 ms p95

BAD examples (not invariants):
- "The Node version used is 26.8.2."
- "A million simulated cycles is a workload count, not a correctness proof."
- "Zero-copy is a property of a particular transfer."

Rules:
- Every statement must be supported by an exact quote copied from the text.
- Do not invent numbers. If the text gives no number, do not add one.
- If this excerpt contains no real invariant, return an empty list. That is a good answer.
- Return at most 3 invariants. Quality over quantity.

Return JSON only: {"invariants":[{"statement":"...","quote":"..."}]}`;

function validate(d: { statement?: string; quote?: string }, source: string): string | null {
  const st = (d.statement ?? '').trim();
  const q = (d.quote ?? '').trim();
  if (st.length < 20) return 'statement too short';
  if (/^section invariant/i.test(st) || MECHANICAL.test(st)) return 'mechanical heading';
  if (!q) return 'no quote';
  if (!norm(source).includes(norm(q).slice(0, 60))) return 'quote not found in source';
  if (
    !/\b(is|are|must|shall|requires?|remains?|satisf\w*|expose\w*|run|fit|emit|reject|forbid|never|zero|no )\b/i.test(
      st,
    )
  )
    return 'no normative verb';
  return null;
}

async function ask(text: string): Promise<{ content: string; wallMs: number }> {
  const t0 = Date.now();
  const res = await fetch(`${HOST}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      format: 'json',
      think: false,
      options: { temperature: 0, num_ctx: 12288, num_predict: 350 },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `EXCERPT:\n\n${text}` },
      ],
    }),
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

  let content = '';
  const decoder = new TextDecoder();
  let buffer = '';
  for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const p = JSON.parse(line) as { message?: { content?: string } };
        if (p.message?.content) content += p.message.content;
      } catch {
        /* partial line */
      }
    }
  }
  return { content, wallMs: Date.now() - t0 };
}

interface ChunkRecord {
  key: string;
  studyId: string;
  index: number;
  heading: string;
  wallMs: number;
  found: number;
  accepted: Array<{ statement: string; quote: string }>;
  rejected: Array<{ statement: string; reason: string }>;
}

const state: { model: string; records: ChunkRecord[] } = existsSync(OUT)
  ? (JSON.parse(readFileSync(OUT, 'utf8')) as { model: string; records: ChunkRecord[] })
  : { model: MODEL, records: [] };
const doneKeys = new Set(state.records.map((r) => r.key));

const work = keptChunks.filter((c) => !doneKeys.has(`${c.studyId}#${c.index}`));
const budget = Math.min(work.length, LIMIT === Number.POSITIVE_INFINITY ? work.length : LIMIT);

console.error(
  `phase2 chunks=${allChunks.length} kept=${keptChunks.length} remaining=${work.length} doing=${budget}`,
);

let processed = 0;
for (const c of work.slice(0, budget)) {
  const key = `${c.studyId}#${c.index}`;
  let content = '';
  let wallMs = 0;
  try {
    const r = await ask(c.text);
    content = r.content;
    wallMs = r.wallMs;
  } catch (e) {
    console.error(`fail ${key}: ${String(e)}`);
    continue;
  }

  let parsed: { invariants?: Array<{ statement?: string; quote?: string }> } | null = null;
  try {
    parsed = JSON.parse(content) as { invariants?: Array<{ statement?: string; quote?: string }> };
  } catch {
    parsed = null;
  }
  const found = Array.isArray(parsed?.invariants) ? parsed.invariants : [];

  const accepted: Array<{ statement: string; quote: string }> = [];
  const rejected: Array<{ statement: string; reason: string }> = [];
  for (const d of found) {
    const reason = validate(d, c.text);
    if (reason) rejected.push({ statement: (d.statement ?? '').slice(0, 140), reason });
    else
      accepted.push({
        statement: (d.statement ?? '').trim(),
        quote: (d.quote ?? '').trim(),
      });
  }

  state.records.push({
    key,
    studyId: c.studyId,
    index: c.index,
    heading: c.heading,
    wallMs,
    found: found.length,
    accepted,
    rejected,
  });
  processed += 1;
  writeFileSync(OUT, `${JSON.stringify({ model: MODEL, records: state.records }, null, 2)}\n`);

  const totalAcc = state.records.reduce((n, r) => n + r.accepted.length, 0);
  console.error(
    `[${processed}/${budget}] ${key} "${c.heading.slice(0, 40)}" found=${found.length} acc=${accepted.length} totalAcc=${totalAcc} ${Math.round(wallMs / 1000)}s`,
  );
}

const finalAcc = state.records.reduce((n, r) => n + r.accepted.length, 0);
console.log(
  JSON.stringify(
    {
      model: MODEL,
      chunksProcessed: state.records.length,
      chunksRemaining: keptChunks.length - state.records.length,
      invariantsAccepted: finalAcc,
      statementsFound: state.records.reduce((n, r) => n + r.found, 0),
      rejections: state.records.reduce((n, r) => n + r.rejected.length, 0),
      wallMinutes: +(state.records.reduce((n, r) => n + r.wallMs, 0) / 60000).toFixed(1),
    },
    null,
    2,
  ),
);
