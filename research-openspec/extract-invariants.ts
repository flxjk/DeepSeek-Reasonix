#!/usr/bin/env node
/**
 * Derives normative invariants from research prose with a local Ollama model.
 *
 * Resumable: already-processed studies are skipped, so a long run can be
 * interrupted and restarted. Every accepted invariant must carry a quote that
 * actually occurs in the source text — that is the only anti-hallucination gate
 * that does not need a second model.
 *
 * Usage:
 *   node extract-invariants.ts --max-bytes 20000
 *   node extract-invariants.ts --studies a,b,c
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const MODEL: string = process.env['MODEL'] ?? 'ggml-org/gemma-4-E4B-it-GGUF:Q8_0';
const HOST: string = process.env['OLLAMA'] ?? 'http://127.0.0.1:11434';
const RHEX: string = '/Users/gj/git/rhex';
const OUT = 'derived-invariants.json';
const MECHANICAL = /^Section invariant codified:/;

interface Study {
  studyId: string | null;
  markdownPath: string | null;
  ssotContractPath: string | null;
  checkedOn: string | null;
  distilledInvariants: string[];
  markdown: { exists: boolean; bytes?: number };
}

interface ResearchIndex {
  studies: Study[];
}

interface Derived {
  statement: string;
  quote: string;
}

interface Record_ {
  studyId: string;
  ssotContractPath: string;
  checkedOn: string;
  model: string;
  wallMs: number;
  found: number;
  accepted: Derived[];
  rejected: Array<{ statement: string; reason: string }>;
}

const GOLD = [
  'Doubly-stochastic routing matrix P satisfies rowSum(P) == 1 and colSum(P) == 1',
  'Zero raw node:* imports in emitter adapters; 100% programmatic emission from TypeSpec contracts',
  'CLI shims remain <= 30 lines and emit 0 bytes on exit code 0',
  'Sub-millisecond (< 0.8ms) IPC round-trip latency via pre-allocated slab BufferPool recycling',
];

const SYSTEM = `You extract normative invariants from engineering research prose.

An invariant is a statement that is:
- checkable: it names a number, a threshold, a structural constraint, or a prohibition
- about the system being built, not about the document
- expressible as one sentence

GOOD examples:
${GOLD.map((g) => `- ${g}`).join('\n')}

BAD examples (section headings, not invariants):
- "Section invariant codified: Executive assessment"
- "Section invariant codified: Role: user"

Rules:
- Every statement must be supported by an exact quote copied from the text.
- Do not invent numbers. If the text gives no number, do not add one.
- If the text contains no real invariant, return an empty list.
- Prefer 0 to 5 invariants. Quality over quantity.

Return JSON only: {"invariants":[{"statement":"...","quote":"..."}]}`;

const norm = (s: string): string =>
  s
    .toLowerCase()
    .replace(/\\/g, '')
    .replace(/[*_`$]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function validate(d: Derived, source: string): string | null {
  const st = (d.statement ?? '').trim();
  const q = (d.quote ?? '').trim();
  if (st.length < 20) return 'statement too short';
  if (MECHANICAL.test(st)) return 'mechanical heading';
  if (/^section invariant/i.test(st)) return 'mechanical heading';
  if (!q) return 'no quote';
  if (!norm(source).includes(norm(q).slice(0, 60))) return 'quote not found in source';
  if (!/\b(is|are|must|shall|requires?|remains?|satisf|expose|run|fit|emit|reject|forbid|never|zero|no )\b/i.test(st))
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
      options: { temperature: 0, num_ctx: 16384, num_predict: 700 },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `TEXT:\n\n${text}` },
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
        /* ignore partial */
      }
    }
  }
  return { content, wallMs: Date.now() - t0 };
}

// ---- args ----------------------------------------------------------------

const argv = process.argv.slice(2);
const maxBytesArg = argv.indexOf('--max-bytes');
const studiesArg = argv.indexOf('--studies');
const maxBytes = maxBytesArg !== -1 ? Number(argv[maxBytesArg + 1]) : Number.POSITIVE_INFINITY;
const only = studiesArg !== -1 ? (argv[studiesArg + 1] ?? '').split(',').filter(Boolean) : null;

const index: ResearchIndex = JSON.parse(readFileSync('research-index.json', 'utf8'));

const targets = index.studies.filter((s) => {
  const mechanical =
    s.distilledInvariants.length > 0 && s.distilledInvariants.every((i) => MECHANICAL.test(i));
  if (!mechanical) return false;
  if (only) return only.includes(s.studyId ?? '');
  return (s.markdown.bytes ?? 0) <= maxBytes;
});

const done: Record_[] = existsSync(OUT)
  ? (JSON.parse(readFileSync(OUT, 'utf8')) as { records: Record_[] }).records
  : [];
const doneIds = new Set(done.map((r) => r.studyId));

console.error(`targets=${targets.length} alreadyDone=${doneIds.size} model=${MODEL}`);

let processed = 0;
for (const s of targets) {
  const id = s.studyId ?? '';
  if (doneIds.has(id)) continue;
  const path = `${RHEX}/${s.markdownPath}`;
  if (!existsSync(path)) {
    console.error(`skip ${id}: markdown missing`);
    continue;
  }
  const text = readFileSync(path, 'utf8');
  let content = '';
  let wallMs = 0;
  try {
    const r = await ask(text);
    content = r.content;
    wallMs = r.wallMs;
  } catch (e) {
    console.error(`fail ${id}: ${String(e)}`);
    continue;
  }

  let parsed: { invariants?: Derived[] } | null = null;
  try {
    parsed = JSON.parse(content) as { invariants?: Derived[] };
  } catch {
    parsed = null;
  }
  const found = Array.isArray(parsed?.invariants) ? parsed.invariants : [];

  const accepted: Derived[] = [];
  const rejected: Array<{ statement: string; reason: string }> = [];
  for (const d of found) {
    const reason = validate(d, text);
    if (reason) rejected.push({ statement: (d.statement ?? '').slice(0, 120), reason });
    else accepted.push({ statement: d.statement.trim(), quote: d.quote.trim() });
  }

  done.push({
    studyId: id,
    ssotContractPath: s.ssotContractPath ?? '',
    checkedOn: s.checkedOn ?? '',
    model: MODEL,
    wallMs,
    found: found.length,
    accepted,
    rejected,
  });
  processed += 1;
  writeFileSync(OUT, `${JSON.stringify({ model: MODEL, records: done }, null, 2)}\n`);
  console.error(
    `[${processed}/${targets.length}] ${id}: found=${found.length} accepted=${accepted.length} ${Math.round(wallMs / 1000)}s`,
  );
}

const totalAccepted = done.reduce((n, r) => n + r.accepted.length, 0);
const totalFound = done.reduce((n, r) => n + r.found, 0);
console.log(
  JSON.stringify(
    {
      model: MODEL,
      studiesProcessed: done.length,
      invariantsFound: totalFound,
      invariantsAccepted: totalAccepted,
      acceptanceRate: totalFound > 0 ? +(totalAccepted / totalFound).toFixed(2) : 0,
      totalWallMinutes: +(done.reduce((n, r) => n + r.wallMs, 0) / 60000).toFixed(1),
      perStudy: done.map((r) => ({
        study: r.studyId,
        found: r.found,
        accepted: r.accepted.length,
        seconds: Math.round(r.wallMs / 1000),
      })),
    },
    null,
    2,
  ),
);
