#!/usr/bin/env node
/**
 * Extracts the rhex research corpus into a machine-readable index.
 *
 * Input : <RHEX>/docs/research/*.research.tsp   (81 ResearchStudyContract consts)
 *         <RHEX>/docs/research/*.md             (front-matter + body headings)
 * Output: research-index.json
 *
 * Read-only against rhex. Writes only inside this working directory.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const RHEX: string = process.env['RHEX_ROOT'] ?? '/Users/gj/git/rhex';
const RESEARCH_DIR: string = join(RHEX, 'docs', 'research');

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
  frontMatter?: Record<string, string>;
  unresolvedEvidence?: string[];
  headings?: string[];
}

interface Study {
  constName: string;
  researchTspFile: string;
  studyId: string | null;
  title: string | null;
  markdownPath: string | null;
  researchTspPath: string | null;
  ssotContractPath: string | null;
  originSurface: string | null;
  checkedOn: string | null;
  groundedSources: GroundedSource[];
  distilledInvariants: string[];
  markdown: MarkdownInfo;
  drift: {
    markdownPathExists: boolean;
    ssotContractPathExists: boolean;
    researchTspPathExists: boolean;
  };
}

interface StringRead {
  value: string;
  end: number;
}

/** Walk a string literal starting at `i` (which must be the opening quote). */
function readString(src: string, i: number): StringRead | null {
  if (src[i] !== '"') return null;
  let out = '';
  i += 1;
  while (i < src.length) {
    const c = src[i] as string;
    if (c === '\\') {
      const n = src[i + 1];
      out += n === 'n' ? '\n' : n === 't' ? '\t' : (n ?? '');
      i += 2;
      continue;
    }
    if (c === '"') return { value: out, end: i + 1 };
    out += c;
    i += 1;
  }
  return null;
}

/** Return the body of the balanced `#[ ... ]` block that starts at/after `from`. */
function readArrayBlock(src: string, from: number): { body: string; end: number } | null {
  const open = src.indexOf('#[', from);
  if (open === -1) return null;
  let depth = 0;
  let i = open + 1;
  while (i < src.length) {
    const c = src[i] as string;
    if (c === '"') {
      const s = readString(src, i);
      if (!s) return null;
      i = s.end;
      continue;
    }
    if (c === '[') depth += 1;
    else if (c === ']') {
      depth -= 1;
      if (depth === 0) return { body: src.slice(open + 2, i), end: i + 1 };
    }
    i += 1;
  }
  return null;
}

/** All top-level `#{ ... }` object literal bodies inside an array block body. */
function splitObjects(body: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = -1;
  let i = 0;
  while (i < body.length) {
    const c = body[i] as string;
    if (c === '"') {
      const s = readString(body, i);
      if (!s) break;
      i = s.end;
      continue;
    }
    if (c === '#' && body[i + 1] === '{') {
      if (depth === 0) start = i + 2;
      depth += 1;
      i += 2;
      continue;
    }
    if (c === '}') {
      depth -= 1;
      if (depth === 0 && start !== -1) out.push(body.slice(start, i));
      i += 1;
      continue;
    }
    i += 1;
  }
  return out;
}

/** All top-level string literals inside an array block body. */
function splitStrings(body: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < body.length) {
    if (body[i] === '"') {
      const s = readString(body, i);
      if (!s) break;
      out.push(s.value);
      i = s.end;
      continue;
    }
    i += 1;
  }
  return out;
}

/** Read `name:` scalar from a fragment — plain string or `<Scalar>.create("...")`. */
function field(fragment: string, name: string): string | null {
  const re = new RegExp(`(?:^|[\\s{,])${name}\\s*:\\s*`, 'm');
  const m = fragment.match(re);
  if (!m || m.index === undefined) return null;
  let i = m.index + m[0].length;
  const tail = fragment.slice(i);
  const create = tail.match(/^[A-Za-z_][\w.]*\.create\s*\(/);
  if (create) i += create[0].length;
  const s = readString(fragment, i);
  return s ? s.value : null;
}

function parseStudy(tspPath: string): Omit<Study, 'markdown' | 'drift'> | null {
  const src = readFileSync(tspPath, 'utf8');
  const constMatch = src.match(/const\s+(\w+)\s*:\s*ResearchStudyContract\s*=\s*#\{/);
  if (!constMatch) return null;
  const constName = constMatch[1] as string;

  const grounded: GroundedSource[] = [];
  const gsIdx = src.indexOf('groundedSources');
  if (gsIdx !== -1) {
    const blk = readArrayBlock(src, gsIdx);
    if (blk) {
      for (const obj of splitObjects(blk.body)) {
        grounded.push({
          sourceId: field(obj, 'sourceId'),
          title: field(obj, 'title'),
          originUri: field(obj, 'originUri'),
          sourceKind: field(obj, 'sourceKind'),
          extractedClaim: field(obj, 'extractedClaim'),
        });
      }
    }
  }

  let invariants: string[] = [];
  const diIdx = src.indexOf('distilledInvariants');
  if (diIdx !== -1) {
    const blk = readArrayBlock(src, diIdx);
    if (blk) invariants = splitStrings(blk.body);
  }

  return {
    constName,
    researchTspFile: `docs/research/${tspPath.split('/').pop() ?? ''}`,
    studyId: field(src, 'studyId'),
    title: field(src, 'title'),
    markdownPath: field(src, 'markdownPath'),
    researchTspPath: field(src, 'researchTspPath'),
    ssotContractPath: field(src, 'ssotContractPath'),
    originSurface: field(src, 'originSurface'),
    checkedOn: field(src, 'checkedOn'),
    groundedSources: grounded,
    distilledInvariants: invariants,
  };
}

/** Front-matter + unresolved-evidence notes from the human-readable leaf. */
function parseMarkdown(mdPath: string): MarkdownInfo {
  if (!existsSync(mdPath)) return { exists: false };
  const text = readFileSync(mdPath, 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  const frontMatter: Record<string, string> = {};
  if (fm?.[1]) {
    for (const line of fm[1].split('\n')) {
      const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
      if (m?.[1]) frontMatter[m[1]] = m[2] ?? '';
    }
  }
  const unresolvedEvidence: string[] = [];
  const sec = text.match(/##\s*Unresolved Evidence Notes\s*\n([\s\S]*?)(?:\n##\s|$)/);
  if (sec?.[1]) {
    for (const line of sec[1].split('\n')) {
      const m = line.match(/^\s*[-*]\s+(.+?)\s*$/);
      if (m?.[1]) unresolvedEvidence.push(m[1]);
    }
  }
  const headings = [...text.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => m[1] as string);
  return { exists: true, bytes: statSync(mdPath).size, frontMatter, unresolvedEvidence, headings };
}

const files: string[] = readdirSync(RESEARCH_DIR)
  .filter((f: string) => f.endsWith('.research.tsp'))
  .sort();

const studies: Study[] = [];
const problems: Array<{ file: string; problem: string }> = [];

for (const f of files) {
  const parsed = parseStudy(join(RESEARCH_DIR, f));
  if (!parsed) {
    problems.push({ file: f, problem: 'no ResearchStudyContract const found' });
    continue;
  }
  const mdAbs = parsed.markdownPath ? resolve(RHEX, parsed.markdownPath) : null;
  studies.push({
    ...parsed,
    markdown: mdAbs ? parseMarkdown(mdAbs) : { exists: false },
    drift: {
      markdownPathExists: mdAbs ? existsSync(mdAbs) : false,
      ssotContractPathExists: parsed.ssotContractPath
        ? existsSync(resolve(RHEX, parsed.ssotContractPath))
        : false,
      researchTspPathExists: parsed.researchTspPath
        ? existsSync(resolve(RHEX, parsed.researchTspPath))
        : false,
    },
  });
}

// ---- derived views -------------------------------------------------------

const ssotFanIn: Record<string, number> = {};
for (const s of studies) {
  const p = s.ssotContractPath ?? '(none)';
  ssotFanIn[p] = (ssotFanIn[p] ?? 0) + 1;
}

const index = {
  generatedAt: new Date().toISOString(),
  rhexRoot: RHEX,
  corpus: {
    studies: studies.length,
    researchTspFiles: files.length,
    distilledInvariants: studies.reduce((n, s) => n + s.distilledInvariants.length, 0),
    groundedSources: studies.reduce((n, s) => n + s.groundedSources.length, 0),
    distinctSsotTargets: Object.keys(ssotFanIn).length,
    markdownBytes: studies.reduce((n, s) => n + (s.markdown.bytes ?? 0), 0),
    contractBytes: files.reduce((n, f) => n + statSync(join(RESEARCH_DIR, f)).size, 0),
  },
  drift: {
    markdownMissing: studies.filter((s) => !s.drift.markdownPathExists).map((s) => s.studyId),
    ssotMissing: studies
      .filter((s) => !s.drift.ssotContractPathExists)
      .map((s) => ({ studyId: s.studyId, ssotContractPath: s.ssotContractPath })),
    researchTspMissing: studies
      .filter((s) => !s.drift.researchTspPathExists)
      .map((s) => ({ studyId: s.studyId, researchTspPath: s.researchTspPath })),
  },
  ssotFanIn,
  studies,
  problems,
};

writeFileSync('research-index.json', `${JSON.stringify(index, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      studies: index.corpus.studies,
      invariants: index.corpus.distilledInvariants,
      groundedSources: index.corpus.groundedSources,
      distinctSsotTargets: index.corpus.distinctSsotTargets,
      markdownMB: +(index.corpus.markdownBytes / 1048576).toFixed(1),
      contractKB: +(index.corpus.contractBytes / 1024).toFixed(1),
      drift: {
        markdownMissing: index.drift.markdownMissing.length,
        ssotMissing: index.drift.ssotMissing.length,
        researchTspMissing: index.drift.researchTspMissing.length,
      },
      topFanIn: Object.entries(ssotFanIn)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      problems: problems.length,
    },
    null,
    2,
  ),
);
