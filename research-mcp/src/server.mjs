#!/usr/bin/env node
/**
 * research-mcp — a Model Context Protocol server over the rhex research corpus.
 *
 * The corpus is a set of `ResearchStudyContract` TypeSpec constants. Each one
 * declares what a study binds to in code (`ssotContractPath`), its grounded
 * sources, and its distilled invariants. This server makes that binding
 * traversable and queryable instead of leaving it as prose on disk.
 *
 * Index: in-memory SQLite FTS5 built from `data/corpus.json` at startup.
 * Bodies are never indexed — they are returned by citation, on demand.
 *
 * Two ways to run:
 *   node src/server.mjs                       # MCP over stdio
 *   node src/server.mjs --tool <name> [json]  # one call, printed, for testing
 */
import { readFileSync, existsSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG = resolve(HERE, '..')
const CORPUS_PATH = join(PKG, 'data', 'corpus.json')

const SERVER_NAME = 'research'
const SERVER_VERSION = '0.1.1'
const MAX_LIMIT = 50
const DEFAULT_LIMIT = 10

// ── corpus + index ───────────────────────────────────────────────────────────

if (!existsSync(CORPUS_PATH)) {
  process.stderr.write(
    `research-mcp: ${CORPUS_PATH} missing — run \`node src/canonicalize.mjs\` first\n`,
  )
  process.exit(1)
}

/**
 * Rebuilt whenever `corpus.json` changes on disk. The corpus is small (tens of
 * studies, a few hundred atoms), so a rebuild costs milliseconds and buying
 * freshness with it is cheaper than any invalidation scheme — and it removes
 * the whole class of "the server is answering from a corpus that no longer
 * exists" bugs.
 */
let corpus = null
let RHEX = null
let byId = new Map()
let db = null
let atomCount = 0
let loadedMtimeMs = -1

const buildIndex = () => {
  corpus = JSON.parse(readFileSync(CORPUS_PATH, 'utf8'))
  RHEX = corpus.rhexRoot
  byId = new Map(corpus.studies.map((s) => [s.studyId, s]))

  db = new DatabaseSync(':memory:')
  db.exec(`
    CREATE TABLE study(
      study_id TEXT PRIMARY KEY,
      title TEXT,
      origin_surface TEXT,
      checked_on TEXT,
      ssot_path TEXT,
      ssot_resolved INT,
      ssot_fan_in INT,
      binding_kind TEXT,
      markdown_resolved TEXT,
      real_invariants INT,
      verified_claims INT,
      flags TEXT,
      json TEXT
    );
    CREATE VIRTUAL TABLE atom USING fts5(
      text, study_id UNINDEXED, kind UNINDEXED, atom_key UNINDEXED,
      tokenize = 'porter unicode61'
    );
  `)

  const insertStudy = db.prepare(`INSERT INTO study VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
  const insertAtom = db.prepare(`INSERT INTO atom(text, study_id, kind, atom_key) VALUES (?,?,?,?)`)

  db.exec('BEGIN')
  for (const s of corpus.studies) {
    insertStudy.run(
      s.studyId,
      s.title ?? '',
      s.originSurface ?? '',
      s.checkedOn ?? '',
      s.ssotContractPath ?? '',
      s.ssotResolved ? 1 : 0,
      s.ssotFanIn,
      s.bindingKind,
      s.markdownResolved ?? '',
      s.realInvariants.length,
      s.claims.filter((c) => c.verified).length,
      s.flags.join(','),
      JSON.stringify(s),
    )
    s.realInvariants.forEach((t, i) => insertAtom.run(t, s.studyId, 'contract-invariant', `ri${i}`))
    s.mechanicalInvariants.forEach((t, i) =>
      insertAtom.run(t, s.studyId, 'section-heading', `mh${i}`),
    )
    s.claims.forEach((c, i) => {
      insertAtom.run(
        c.statement,
        s.studyId,
        c.verified ? 'derived-claim' : 'unverified-claim',
        `dc${i}`,
      )
      if (typeof c.quote === 'string' && c.quote.length > 0) {
        insertAtom.run(c.quote, s.studyId, 'source-quote', `dq${i}`)
      }
    })
    s.groundedSources.forEach((g, i) => {
      if (typeof g.extractedClaim === 'string' && g.extractedClaim.length > 0) {
        insertAtom.run(g.extractedClaim, s.studyId, 'grounded-claim', `gc${i}`)
      }
    })
  }
  db.exec('COMMIT')

  atomCount = db.prepare('SELECT count(*) AS n FROM atom').get().n
  loadedMtimeMs = statSync(CORPUS_PATH).mtimeMs
}

/** Rebuild only when the corpus file actually changed. */
const ensureFresh = () => {
  let mtimeMs
  try {
    mtimeMs = statSync(CORPUS_PATH).mtimeMs
  } catch {
    return
  }
  if (mtimeMs === loadedMtimeMs) return
  buildIndex()
  process.stderr.write(
    `research-mcp: reloaded corpus (${corpus.studies.length} studies, ${atomCount} atoms)\n`,
  )
}

buildIndex()

// ── query helpers ────────────────────────────────────────────────────────────

/**
 * Escape a user query into a safe FTS5 MATCH expression.
 * Each whitespace-separated token becomes a quoted prefix term, AND-joined,
 * so punctuation in a query can never be read as FTS5 syntax.
 */
const ftsQuery = (q) =>
  String(q)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 12)
    .map((t) => `"${t.replace(/"/g, '""')}"*`)
    .join(' AND ')

const limitOf = (n) => {
  const v = Number.isInteger(n) ? n : DEFAULT_LIMIT
  return Math.max(1, Math.min(v, MAX_LIMIT))
}

const digest = (t) => createHash('sha256').update(t, 'utf8').digest('hex')

/** Resolve the study's markdown leaf and read it, or null. */
const readLeaf = (s) => {
  if (s.markdownResolved === null) return null
  const abs = join(RHEX, s.markdownResolved)
  try {
    return { abs, text: readFileSync(abs, 'utf8') }
  } catch {
    return null
  }
}

const cite = (s, startLine, endLine) => {
  const leaf = readLeaf(s)
  if (leaf === null) return null
  const lines = leaf.text.split('\n')
  const a = Math.max(1, Number.isInteger(startLine) ? startLine : 1)
  const b = Math.min(lines.length, Number.isInteger(endLine) ? endLine : a + 40)
  return {
    studyId: s.studyId,
    path: s.markdownResolved,
    lineStart: a,
    lineEnd: b,
    totalLines: lines.length,
    sha256: digest(leaf.text),
    text: lines.slice(a - 1, b).join('\n'),
  }
}

const brief = (s) => ({
  studyId: s.studyId,
  title: s.title,
  checkedOn: s.checkedOn,
  ssotContractPath: s.ssotContractPath,
  ssotResolved: s.ssotResolved,
  bindingKind: s.bindingKind,
  ssotFanIn: s.ssotFanIn,
  markdownResolved: s.markdownResolved,
  realInvariants: s.realInvariants.length,
  verifiedClaims: s.claims.filter((c) => c.verified).length,
  flags: s.flags,
})

/** Prepared per call: the index is rebuilt in place when the corpus changes. */
const ftsRows = (match, n) =>
  db
    .prepare(
      `SELECT study_id, kind, atom_key, text, bm25(atom) AS score
       FROM atom
       WHERE atom MATCH ?
       ORDER BY score
       LIMIT ?`,
    )
    .all(match, n)

// ── tools ────────────────────────────────────────────────────────────────────

const TOOLS = {
  research_stats: {
    description:
      'Corpus census and health for the rhex research corpus: how many studies exist, how many carry a real hand-written invariant versus a mechanically lifted section heading, how many are bound to a code contract that actually resolves, and which defect flags are present. Call this first to know whether a query is worth running.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: () => ({
      generatedAt: corpus.generatedAt,
      rhexRoot: corpus.rhexRoot,
      census: corpus.census,
      health: corpus.health,
      flagTally: corpus.flagTally,
      topSsotTargets: corpus.ssotFanIn.slice(0, 10),
      indexAtoms: atomCount,
      notes: [
        'realInvariants are hand-written in the .research.tsp contract and are authoritative.',
        'mechanicalInvariants are section headings lifted by a generator; they are searchable but carry no normative weight.',
        'claims are model-extracted, each with a source quote; they are NOT authoritative and need human confirmation.',
        'bindingKind "default" means many studies share one ssotContractPath, so the binding is a corpus-wide placeholder rather than a per-study claim.',
      ],
    }),
  },

  research_search: {
    description:
      'Full-text search across every searchable atom of the corpus: contract invariants, derived claims, their source quotes, grounded-source claims, and section headings. Returns ranked hits with the study they belong to and the atom kind, so an authoritative invariant is never confused with a section heading.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search terms; all must match (AND).' },
        kind: {
          type: 'string',
          description:
            'Optional filter. One of: contract-invariant, derived-claim, unverified-claim, source-quote, grounded-claim, section-heading.',
        },
        limit: { type: 'integer', description: `Max hits, 1..${MAX_LIMIT}. Default ${DEFAULT_LIMIT}.` },
      },
      required: ['query'],
      additionalProperties: false,
    },
    run: ({ query, kind, limit }) => {
      if (typeof query !== 'string' || query.trim() === '') {
        return { error: 'query must be a non-empty string' }
      }
      const rows = ftsRows(ftsQuery(query), kind === undefined ? MAX_LIMIT : MAX_LIMIT * 3)
      const filtered =
        kind === undefined ? rows : rows.filter((r) => r.kind === kind)
      const hits = filtered.slice(0, limitOf(limit)).map((r) => {
        const s = byId.get(r.study_id)
        return {
          studyId: r.study_id,
          title: s?.title ?? null,
          kind: r.kind,
          text: r.text,
          ssotContractPath: s?.ssotContractPath ?? null,
          bindingKind: s?.bindingKind ?? null,
          checkedOn: s?.checkedOn ?? null,
          markdownPath: s?.markdownResolved ?? null,
        }
      })
      return { query, kind: kind ?? null, total: filtered.length, returned: hits.length, hits }
    },
  },

  research_study: {
    description:
      'Read one study in full: its authoritative contract invariants, its quarantined section headings, every model-derived claim with the source quote and whether that quote was verified verbatim, its grounded sources, and its defect flags. Use after research_search or research_for_path names a study.',
    inputSchema: {
      type: 'object',
      properties: {
        studyId: { type: 'string' },
        includeHeadings: {
          type: 'boolean',
          description: 'Include the mechanical section headings. Default false.',
        },
      },
      required: ['studyId'],
      additionalProperties: false,
    },
    run: ({ studyId, includeHeadings }) => {
      const s = byId.get(studyId)
      if (s === undefined) {
        const near = [...byId.keys()].filter((k) => k.includes(String(studyId))).slice(0, 8)
        return { error: `unknown studyId: ${studyId}`, didYouMean: near }
      }
      return {
        ...brief(s),
        originSurface: s.originSurface,
        checkedAgeDays: s.checkedAgeDays,
        markdownPath: s.markdownPath,
        markdownBytes: s.markdownBytes,
        researchTspPath: s.researchTspPath,
        researchTspResolved: s.researchTspResolved,
        contractFiles: s.contractFiles,
        frontMatter: s.frontMatter,
        realInvariants: s.realInvariants,
        mechanicalInvariantCount: s.mechanicalInvariants.length,
        ...(includeHeadings === true ? { mechanicalInvariants: s.mechanicalInvariants } : {}),
        claims: s.claims,
        groundedSources: s.groundedSources,
        unresolvedEvidence: s.unresolvedEvidence,
      }
    },
  },

  research_for_path: {
    description:
      'Reverse the research-to-code binding: given a repository path (a TypeSpec contract, a source file, or a directory prefix), return every study that declares it, and say whether that binding is that study\'s own claim or the corpus-wide default. This is the tool to call before editing code, to find out what the corpus has already decided about it.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Repo-relative path, or a prefix such as "core/effect".' },
      },
      required: ['path'],
      additionalProperties: false,
    },
    run: ({ path }) => {
      if (typeof path !== 'string' || path.trim() === '') {
        return { error: 'path must be a non-empty string' }
      }
      const needle = path.replace(/^\.\//, '').trim()
      const matched = corpus.studies.filter((s) => {
        if (s.ssotContractPath !== null && s.ssotContractPath.startsWith(needle)) return true
        if (s.contractFiles.some((f) => f.startsWith(needle))) return true
        if (s.markdownResolved !== null && s.markdownResolved.startsWith(needle)) return true
        return s.groundedSources.some(
          (g) => typeof g.originUri === 'string' && g.originUri.startsWith(needle),
        )
      })
      const own = matched.filter((s) => s.bindingKind !== 'default')
      const viaDefault = matched.filter((s) => s.bindingKind === 'default')
      return {
        path: needle,
        matched: matched.length,
        ownBinding: own.map(brief),
        viaDefaultBinding: viaDefault.map((s) => ({ studyId: s.studyId, title: s.title })),
        note:
          viaDefault.length > 0
            ? `${viaDefault.length} of these match only because they share the corpus default ssotContractPath (${corpus.ssotFanIn[0]?.ssotPath ?? 'n/a'}), which is not a per-study claim.`
            : 'Every match is a per-study claim.',
      }
    },
  },

  research_invariants: {
    description:
      'Return the normative statements that apply to a path or match a query, authority-ranked: hand-written contract invariants first, then quote-verified model claims, then unverified claims. Section headings are never returned. This is the "what must hold here" tool.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Repo-relative path or prefix.' },
        query: { type: 'string', description: 'Free-text topic, used when path is absent or as a filter.' },
        includeUnverified: { type: 'boolean', description: 'Include claims whose quote failed verbatim verification. Default false.' },
        limit: { type: 'integer' },
      },
      additionalProperties: false,
    },
    run: ({ path, query, includeUnverified, limit }) => {
      let pool = corpus.studies
      let how = 'whole corpus'
      if (typeof path === 'string' && path.trim() !== '') {
        const needle = path.replace(/^\.\//, '').trim()
        const exact = corpus.studies.filter(
          (s) => s.ssotContractPath !== null && s.ssotContractPath.startsWith(needle),
        )
        const loose = corpus.studies.filter((s) =>
          s.contractFiles.some((f) => f.startsWith(needle)),
        )
        pool = exact.length > 0 ? exact : loose
        how = exact.length > 0 ? 'ssot binding' : 'contract file location'
      }
      const q = typeof query === 'string' && query.trim() !== '' ? query.trim().toLowerCase() : null
      if (q !== null) {
        const matched = pool.filter((s) => {
          const hay = [
            s.title ?? '',
            ...s.realInvariants,
            ...s.claims.filter((c) => includeUnverified === true || c.verified).map((c) => c.statement),
          ]
            .join(' \n ')
            .toLowerCase()
          return q.split(/\s+/).every((t) => hay.includes(t))
        })
        if (matched.length > 0) pool = matched
        how += ' + text filter'
      }

      const out = []
      for (const s of pool) {
        for (const text of s.realInvariants) {
          out.push({ authority: 'contract', studyId: s.studyId, ssotContractPath: s.ssotContractPath, text })
        }
        for (const c of s.claims) {
          if (c.verified !== true && includeUnverified !== true) continue
          out.push({
            authority: c.verified ? 'derived-verified' : 'derived-unverified',
            studyId: s.studyId,
            ssotContractPath: s.ssotContractPath,
            text: c.statement,
            quote: c.quote,
          })
        }
      }
      const rank = { contract: 0, 'derived-verified': 1, 'derived-unverified': 2 }
      out.sort((a, b) => rank[a.authority] - rank[b.authority])
      const n = limitOf(limit ?? 20)
      return {
        resolvedBy: how,
        studiesConsidered: pool.length,
        total: out.length,
        returned: Math.min(out.length, n),
        invariants: out.slice(0, n),
        caveat:
          'derived-* entries are model output, not the repository\'s own statement. Treat contract entries as the authority.',
      }
    },
  },

  research_gaps: {
    description:
      'List the studies that need attention, filtered by defect flag: no-real-invariant, binding-default, ssot-unbound, ssot-missing, markdown-missing, no-derived-claim, unresolved-evidence, front-matter-absent, stale-over-180d. This is the research agenda generator.',
    inputSchema: {
      type: 'object',
      properties: {
        flag: { type: 'string', description: 'One flag name; omit to get the tally plus the worst offenders.' },
        limit: { type: 'integer' },
      },
      additionalProperties: false,
    },
    run: ({ flag, limit }) => {
      const n = limitOf(limit ?? 20)
      if (typeof flag === 'string' && flag.trim() !== '') {
        const hit = corpus.studies.filter((s) => s.flags.includes(flag.trim()))
        return {
          flag,
          count: hit.length,
          studies: hit.slice(0, n).map((s) => ({
            studyId: s.studyId,
            title: s.title,
            ssotContractPath: s.ssotContractPath,
            bindingKind: s.bindingKind,
            realInvariants: s.realInvariants.length,
            flags: s.flags,
          })),
        }
      }
      const empty = corpus.studies
        .filter((s) => s.flags.includes('no-real-invariant') && s.flags.includes('no-derived-claim'))
        .map((s) => s.studyId)
      return { flagTally: corpus.flagTally, noSubstanceAtAll: empty, health: corpus.health }
    },
  },

  research_drift: {
    description:
      'Report corpus drift: studies whose markdown leaf is missing, whose ssot contract no longer exists on disk, whose declared research .tsp path does not resolve, or whose last check is old. Nothing here is fixed automatically.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: () => ({
      markdownMissing: corpus.studies.filter((s) => s.flags.includes('markdown-missing')).map((s) => ({
        studyId: s.studyId,
        declared: s.markdownPath,
      })),
      ssotMissing: corpus.studies.filter((s) => s.flags.includes('ssot-missing')).map((s) => ({
        studyId: s.studyId,
        ssotContractPath: s.ssotContractPath,
      })),
      researchTspMissing: corpus.studies
        .filter((s) => s.researchTspPath !== null && !s.researchTspResolved)
        .map((s) => ({ studyId: s.studyId, researchTspPath: s.researchTspPath })),
      frontMatterAbsent: corpus.studies
        .filter((s) => s.flags.includes('front-matter-absent'))
        .map((s) => s.studyId),
      oldestChecks: corpus.studies
        .filter((s) => s.checkedAgeDays !== null)
        .sort((a, b) => b.checkedAgeDays - a.checkedAgeDays)
        .slice(0, 10)
        .map((s) => ({ studyId: s.studyId, checkedOn: s.checkedOn, ageDays: s.checkedAgeDays })),
      degenerateBindings: corpus.ssotFanIn.filter((e) => e.studies > 5),
    }),
  },

  research_cite: {
    description:
      'Return a verifiable citation for a study: its markdown leaf path, a line range, the verbatim text of that range, and the SHA-256 of the whole leaf. Use this instead of restating corpus prose, so a downstream reader can check the quote.',
    inputSchema: {
      type: 'object',
      properties: {
        studyId: { type: 'string' },
        startLine: { type: 'integer' },
        endLine: { type: 'integer' },
      },
      required: ['studyId'],
      additionalProperties: false,
    },
    run: ({ studyId, startLine, endLine }) => {
      const s = byId.get(studyId)
      if (s === undefined) return { error: `unknown studyId: ${studyId}` }
      const c = cite(s, startLine, endLine)
      if (c === null) {
        return { error: `no markdown leaf on disk for ${studyId}`, declared: s.markdownPath }
      }
      return c
    },
  },
}

const TOOL_LIST = Object.entries(TOOLS).map(([name, t]) => ({
  name,
  description: t.description,
  inputSchema: t.inputSchema,
}))

const callTool = (name, args) => {
  const t = TOOLS[name]
  if (t === undefined) return { error: `unknown tool: ${name}` }
  ensureFresh()
  const a = args !== null && typeof args === 'object' ? args : {}
  for (const k of Object.keys(a)) {
    if (!(k in (t.inputSchema.properties ?? {}))) {
      return { error: `unexpected argument "${k}" for ${name}` }
    }
  }
  for (const k of t.inputSchema.required ?? []) {
    if (!(k in a)) return { error: `missing required argument "${k}" for ${name}` }
  }
  try {
    return t.run(a)
  } catch (err) {
    return { error: `${name} failed: ${String(err?.message ?? err)}` }
  }
}

// ── CLI mode ─────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
if (argv[0] === '--tool') {
  const name = argv[1]
  let args = {}
  if (argv[2] !== undefined) {
    try {
      args = JSON.parse(argv[2])
    } catch (err) {
      process.stderr.write(`bad JSON args: ${String(err)}\n`)
      process.exit(2)
    }
  }
  if (name === '--list') {
    process.stdout.write(`${JSON.stringify(TOOL_LIST, null, 2)}\n`)
    process.exit(0)
  }
  process.stdout.write(`${JSON.stringify(callTool(name, args), null, 2)}\n`)
  process.exit(0)
}

// ── MCP over stdio ───────────────────────────────────────────────────────────

const PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05']

const send = (msg) => {
  process.stdout.write(`${JSON.stringify(msg)}\n`)
}

const reply = (id, result) => send({ jsonrpc: '2.0', id, result })
const fail = (id, code, message) => send({ jsonrpc: '2.0', id, error: { code, message } })

const handle = (msg) => {
  const { id, method, params } = msg
  const isNotification = id === undefined || id === null

  switch (method) {
    case 'initialize': {
      const asked = params?.protocolVersion
      const version = PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0]
      reply(id, {
        protocolVersion: version,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        instructions:
          `Research corpus of the rhex repository: ${corpus.census.distinctStudies} studies, ` +
          `${corpus.census.realInvariants} hand-written invariants, ${corpus.census.derivedClaims} model-derived claims. ` +
          'Contract invariants are authoritative; section headings are not; derived claims carry a quote and need human confirmation. ' +
          'Call research_stats before trusting any count.',
      })
      return
    }
    case 'notifications/initialized':
    case 'notifications/cancelled':
      return
    case 'ping':
      if (!isNotification) reply(id, {})
      return
    case 'tools/list':
      reply(id, { tools: TOOL_LIST })
      return
    case 'tools/call': {
      const name = params?.name
      const out = callTool(name, params?.arguments)
      const isError = typeof out?.error === 'string'
      reply(id, {
        content: [{ type: 'text', text: JSON.stringify(out, null, 2) }],
        isError,
      })
      return
    }
    default:
      if (!isNotification) fail(id, -32601, `method not found: ${String(method)}`)
  }
}

let buffer = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => {
  buffer += chunk
  let nl
  while ((nl = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, nl).trim()
    buffer = buffer.slice(nl + 1)
    if (line === '') continue
    let msg
    try {
      msg = JSON.parse(line)
    } catch {
      fail(null, -32700, 'parse error')
      continue
    }
    try {
      handle(msg)
    } catch (err) {
      if (msg?.id !== undefined && msg?.id !== null) {
        fail(msg.id, -32603, `internal error: ${String(err?.message ?? err)}`)
      }
    }
  }
})
process.stdin.on('end', () => process.exit(0))
process.stderr.write(
  `research-mcp ${SERVER_VERSION}: ${corpus.census.distinctStudies} studies, ${atomCount} atoms, ${TOOL_LIST.length} tools\n`,
)
