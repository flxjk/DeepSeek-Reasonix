#!/usr/bin/env node
/**
 * Self-test for research-mcp.
 *
 * Two layers:
 *  1. corpus invariants — the arithmetic the index depends on must hold.
 *  2. a real MCP session — spawn the server, do the stdio handshake, list
 *     tools, call every one, and check that bad input is refused rather than
 *     silently answered.
 *
 * Run: node test/verify.mjs
 */
import { spawn } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG = resolve(HERE, '..')

let passed = 0
let failed = 0
const failures = []

const check = (name, cond, detail = '') => {
  if (cond) {
    passed += 1
    process.stdout.write(`  ok   ${name}\n`)
  } else {
    failed += 1
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
    process.stdout.write(`  FAIL ${name}${detail ? ` — ${detail}` : ''}\n`)
  }
}

const section = (t) => process.stdout.write(`\n${t}\n`)

// ── layer 1: corpus ──────────────────────────────────────────────────────────

section('corpus')

const corpusPath = join(PKG, 'data', 'corpus.json')
check('data/corpus.json exists', existsSync(corpusPath))
if (!existsSync(corpusPath)) {
  process.stdout.write('\nrun `node src/canonicalize.mjs` first\n')
  process.exit(1)
}

const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'))
const c = corpus.census

check('contract files were scanned', c.contractFilesScanned > 0, `got ${c.contractFilesScanned}`)
check('distinct studies > 0', c.distinctStudies > 0, `got ${c.distinctStudies}`)
check(
  'real + mechanical == declared',
  c.realInvariants + c.mechanicalInvariants === c.declaredInvariants,
  `${c.realInvariants} + ${c.mechanicalInvariants} != ${c.declaredInvariants}`,
)
check(
  'every verified claim has a quote',
  corpus.studies.every((s) => s.claims.filter((x) => x.verified).every((x) => typeof x.quote === 'string')),
)
check(
  'unverified claims are marked, not dropped',
  corpus.studies.some((s) => s.claims.some((x) => !x.verified)) ||
    c.derivedClaims === c.verifiedClaims,
)
check(
  'no mechanical invariant leaks into realInvariants',
  corpus.studies.every((s) => s.realInvariants.every((t) => !t.startsWith('Section invariant codified:'))),
)
check(
  'ssotFanIn sums to bound studies',
  corpus.ssotFanIn.reduce((a, e) => a + e.studies, 0) ===
    corpus.studies.filter((s) => s.ssotContractPath !== null && s.ssotContractPath !== '').length,
)
check(
  'fanIn matches per-study ssotFanIn',
  corpus.studies.every((s) => {
    if (s.ssotContractPath === null || s.ssotContractPath === '') return s.ssotFanIn === 0
    const e = corpus.ssotFanIn.find((x) => x.ssotPath === s.ssotContractPath)
    return e !== undefined && e.studies === s.ssotFanIn
  }),
)
check(
  'every study has a studyId and flags array',
  corpus.studies.every((s) => typeof s.studyId === 'string' && Array.isArray(s.flags)),
)
check('parse failures are zero', corpus.parseFailures.length === 0, `${corpus.parseFailures.length} failures`)

// ── layer 2: MCP session ─────────────────────────────────────────────────────

section('mcp session')

const child = spawn(process.execPath, [join(PKG, 'src', 'server.mjs')], {
  stdio: ['pipe', 'pipe', 'pipe'],
})
child.stderr.resume()

const pending = new Map()
let nextId = 1
let buffer = ''

child.stdout.setEncoding('utf8')
child.stdout.on('data', (chunk) => {
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
      continue
    }
    const slot = pending.get(msg.id)
    if (slot !== undefined) {
      pending.delete(msg.id)
      slot(msg)
    }
  }
})

const request = (method, params) =>
  new Promise((res, rej) => {
    const id = nextId++
    const timer = setTimeout(() => {
      pending.delete(id)
      rej(new Error(`timeout waiting for ${method}`))
    }, 10_000)
    pending.set(id, (msg) => {
      clearTimeout(timer)
      res(msg)
    })
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`)
  })

const notify = (method, params) =>
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`)

try {
  const init = await request('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'research-mcp-verify', version: '1' },
  })
  check('initialize returns a result', init.result !== undefined, JSON.stringify(init).slice(0, 200))
  check('protocolVersion is negotiated', typeof init.result?.protocolVersion === 'string')
  check('serverInfo.name is research', init.result?.serverInfo?.name === 'research')
  check('capabilities declare tools', init.result?.capabilities?.tools !== undefined)

  notify('notifications/initialized', {})

  const list = await request('tools/list', {})
  const tools = list.result?.tools ?? []
  check('tools/list returns tools', tools.length > 0, `got ${tools.length}`)
  check(
    'every tool has a name and a JSON schema',
    tools.every((t) => typeof t.name === 'string' && typeof t.inputSchema?.type === 'string'),
  )

  const expected = [
    'research_stats',
    'research_search',
    'research_study',
    'research_for_path',
    'research_invariants',
    'research_gaps',
    'research_drift',
    'research_cite',
  ]
  const names = tools.map((t) => t.name).sort()
  check(
    'the full tool surface is exposed',
    expected.every((n) => names.includes(n)),
    `missing: ${expected.filter((n) => !names.includes(n)).join(', ')}`,
  )

  const callTool = async (name, args) => {
    const r = await request('tools/call', { name, arguments: args })
    const text = r.result?.content?.[0]?.text
    let parsed = null
    try {
      parsed = JSON.parse(text)
    } catch {
      /* keep null */
    }
    return { isError: r.result?.isError === true, parsed, raw: text }
  }

  // Every tool must answer a valid call without error.
  const sampleStudy = corpus.studies.find((s) => s.realInvariants.length > 0)?.studyId
  const validCalls = [
    ['research_stats', {}],
    ['research_search', { query: 'latency', limit: 3 }],
    ['research_study', { studyId: sampleStudy }],
    ['research_for_path', { path: 'core' }],
    ['research_invariants', { limit: 3 }],
    ['research_gaps', {}],
    ['research_drift', {}],
    ['research_cite', { studyId: sampleStudy, startLine: 1, endLine: 5 }],
  ]
  for (const [name, args] of validCalls) {
    const r = await callTool(name, args)
    check(
      `${name} answers without error`,
      r.isError === false && r.parsed !== null && r.parsed.error === undefined,
      r.parsed?.error ?? r.raw?.slice(0, 120),
    )
  }

  const stats = (await callTool('research_stats', {})).parsed
  check(
    'research_stats reports the same census as the corpus file',
    stats?.census?.distinctStudies === c.distinctStudies,
  )

  const search = (await callTool('research_search', { query: 'latency', limit: 5 })).parsed
  check('research_search returns hits', (search?.hits?.length ?? 0) > 0)
  check(
    'search hits carry their study binding',
    search.hits.every((h) => typeof h.studyId === 'string' && 'kind' in h),
  )

  const kindFiltered = (
    await callTool('research_search', { query: 'latency', kind: 'contract-invariant' })
  ).parsed
  check(
    'kind filter is honoured',
    (kindFiltered?.hits ?? []).every((h) => h.kind === 'contract-invariant'),
  )

  const inv = (await callTool('research_invariants', { includeUnverified: true, limit: 50 })).parsed
  check(
    'contract invariants rank before derived ones',
    (() => {
      const rank = { contract: 0, 'derived-verified': 1, 'derived-unverified': 2 }
      const seq = (inv?.invariants ?? []).map((i) => rank[i.authority])
      return seq.every((v, i) => i === 0 || seq[i - 1] <= v)
    })(),
  )
  check(
    'no section heading is ever returned as an invariant',
    (inv?.invariants ?? []).every((i) => i.authority !== 'section-heading'),
  )

  const study = (await callTool('research_study', { studyId: sampleStudy })).parsed
  check('research_study withholds headings by default', study?.mechanicalInvariants === undefined)
  const studyWith = (
    await callTool('research_study', { studyId: sampleStudy, includeHeadings: true })
  ).parsed
  check(
    'research_study can include headings on request',
    Array.isArray(studyWith?.mechanicalInvariants),
  )

  // Bad input must be refused, not guessed.
  const bad = [
    ['research_search', {}, 'missing query'],
    ['research_search', { query: '' }, 'empty query'],
    ['research_study', { studyId: 'no-such-study' }, 'unknown study'],
    ['research_for_path', { path: '' }, 'empty path'],
    ['research_cite', { studyId: 'no-such-study' }, 'unknown study'],
  ]
  for (const [name, args, label] of bad) {
    const r = await callTool(name, args)
    check(`refuses ${label}`, r.parsed?.error !== undefined || r.isError === true)
  }

  const unknownTool = await callTool('research_nope', {})
  check('refuses an unknown tool', unknownTool.isError === true)

  const extraArg = await callTool('research_stats', { bogus: 1 })
  check('refuses an unexpected argument', extraArg.parsed?.error !== undefined)

  // The query must survive FTS5 metacharacters rather than crashing the server.
  for (const nasty of ['AND OR NOT', '"unclosed', 'a*b(c)', 'NEAR(x y)', '---', '   ']) {
    const r = await callTool('research_search', { query: nasty })
    check(
      `survives query ${JSON.stringify(nasty)}`,
      r.parsed !== null && (r.parsed.error !== undefined || Array.isArray(r.parsed.hits)),
      r.raw?.slice(0, 100),
    )
  }

  const ping = await request('ping', {})
  check('responds to ping', ping.result !== undefined)

  const bogus = await request('no/such/method', {})
  check('unknown method returns an error object', bogus.error?.code === -32601)
} catch (err) {
  failed += 1
  failures.push(`session threw: ${String(err?.message ?? err)}`)
  process.stdout.write(`  FAIL session — ${String(err?.message ?? err)}\n`)
} finally {
  child.stdin.end()
  child.kill()
}

// ── summary ──────────────────────────────────────────────────────────────────

section('summary')
process.stdout.write(`  ${passed} passed, ${failed} failed\n`)
if (failed > 0) {
  process.stdout.write('\nfailures:\n')
  for (const f of failures) process.stdout.write(`  - ${f}\n`)
}
process.exit(failed === 0 ? 0 : 1)
