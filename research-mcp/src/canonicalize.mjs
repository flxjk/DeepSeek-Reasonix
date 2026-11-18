#!/usr/bin/env node
/**
 * Canonicalize the rhex research corpus into one dataset.
 *
 * Sources of truth, in precedence order, are the three tree copies of the
 * `ResearchStudyContract` TypeSpec constants. Nothing here trusts a
 * previously generated index: every field is re-derived from the contracts
 * on disk, and the prior session's JSON is used only for the model-derived
 * claims (which cannot be recomputed without re-running inference).
 *
 * Output: data/corpus.json
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG = resolve(HERE, '..')
const WORKSPACE = resolve(PKG, '..')

const RHEX = process.env.RHEX_ROOT ?? '/Users/gj/git/rhex'
const PRIOR = join(WORKSPACE, 'research-openspec')

/** The three tree copies, in the order a reviewer should trust them. */
const CONTRACT_ROOTS = [
  'core/research/studies',
  'docs/research',
  'docs/rhex/research',
]

const MECHANICAL_PREFIX = 'Section invariant codified:'
const STELE = ''

// ── tiny helpers ─────────────────────────────────────────────────────────────

const readText = (p) => {
  try {
    return readFileSync(p, 'utf8')
  } catch {
    return null
  }
}

const readJson = (p) => {
  const t = readText(p)
  if (t === null) return null
  try {
    return JSON.parse(t)
  } catch {
    return null
  }
}

/** Match one `key: "..."` scalar, tolerating TypeSpec `.create("...")` wrappers. */
const scalar = (body, key) => {
  const re = new RegExp(
    `${key}\\s*:\\s*(?:[A-Za-z_][\\w.]*\\.create\\s*\\(\\s*)?"((?:[^"\\\\]|\\\\.)*)"`,
  )
  const m = re.exec(body)
  return m ? unescapeTs(m[1]) : null
}

const unescapeTs = (s) =>
  s.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\')

/** Extract the balanced `#[ ... ]` block that follows `key:`. */
const arrayBlock = (body, key) => {
  const at = body.indexOf(`${key}:`)
  if (at < 0) return null
  const open = body.indexOf('#[', at)
  if (open < 0) return null
  let depth = 0
  for (let i = open + 1; i < body.length; i += 1) {
    const c = body[i]
    if (c === '[') depth += 1
    else if (c === ']') {
      depth -= 1
      if (depth === 0) return body.slice(open + 2, i)
    }
  }
  return null
}

/** All `#{ ... }` model literals inside a block, by balanced braces. */
const modelLiterals = (block) => {
  const out = []
  let i = 0
  while (i < block.length) {
    const at = block.indexOf('#{', i)
    if (at < 0) break
    let depth = 0
    for (let j = at + 1; j < block.length; j += 1) {
      if (block[j] === '{') depth += 1
      else if (block[j] === '}') {
        depth -= 1
        if (depth === 0) {
          out.push(block.slice(at + 2, j))
          i = j + 1
          break
        }
      }
    }
    if (i <= at) break
  }
  return out
}

/** Quoted strings at the top level of a block. */
const quotedStrings = (block) => {
  const out = []
  const re = /"((?:[^"\\]|\\.)*)"/g
  let m
  while ((m = re.exec(block)) !== null) out.push(unescapeTs(m[1]))
  return out
}

/** Angle-free YAML front matter of a markdown leaf. */
const frontMatter = (text) => {
  if (text === null || !text.startsWith('---')) return {}
  const end = text.indexOf('\n---', 3)
  if (end < 0) return {}
  const out = {}
  for (const line of text.slice(4, end).split('\n')) {
    const m = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line.trim())
    if (m === null) continue
    let v = m[2].trim()
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
    out[m[1]] = v
  }
  return out
}

const headingsOf = (text) =>
  text === null
    ? []
    : text
        .split('\n')
        .filter((l) => /^#{1,6}\s+\S/.test(l))
        .map((l) => l.replace(/^#{1,6}\s+/, '').trim())

// ── contract parsing ─────────────────────────────────────────────────────────

/**
 * Parse one `.research.tsp` leaf into a partial study record.
 * @param absolute path of the contract file
 * @param rel repo-relative path of the contract file
 */
const parseContract = (absolute, rel) => {
  const body = readText(absolute)
  if (body === null) return null
  const studyId = scalar(body, 'studyId')
  if (studyId === null) return null

  const sourcesBlock = arrayBlock(body, 'groundedSources')
  const groundedSources =
    sourcesBlock === null
      ? []
      : modelLiterals(sourcesBlock).map((lit) => ({
          sourceId: scalar(lit, 'sourceId'),
          title: scalar(lit, 'title'),
          originUri: scalar(lit, 'originUri'),
          sourceKind: scalar(lit, 'sourceKind'),
          extractedClaim: scalar(lit, 'extractedClaim'),
        }))

  const invariantsBlock = arrayBlock(body, 'distilledInvariants')
  const declared = invariantsBlock === null ? [] : quotedStrings(invariantsBlock)

  const mechanical = declared.filter((s) => s.startsWith(MECHANICAL_PREFIX))
  const real = declared.filter((s) => !s.startsWith(MECHANICAL_PREFIX))

  return {
    studyId,
    constName: (/const\s+(\w+)\s*:/.exec(body) ?? [, null])[1],
    title: scalar(body, 'title'),
    markdownPath: scalar(body, 'markdownPath'),
    researchTspPath: scalar(body, 'researchTspPath'),
    ssotContractPath: scalar(body, 'ssotContractPath'),
    originSurface: scalar(body, 'originSurface'),
    checkedOn: scalar(body, 'checkedOn'),
    groundedSources,
    declaredInvariants: declared,
    realInvariants: real,
    mechanicalInvariants: mechanical,
    contractFile: rel,
  }
}

const contractExists = (rel) => existsSync(join(RHEX, rel))

/**
 * Every place the study's markdown leaf is known to live, existing ones first.
 *
 * The contract's own `markdownPath` points at the `docs/rhex/research/` copy,
 * but the authored front matter often sits only on the `docs/research/`
 * original. Resolving just the declared path would report front matter as
 * absent for most of the corpus, so all copies are inspected.
 */
const resolveMarkdown = (rec) => {
  const candidates = []
  if (rec.markdownPath !== null) candidates.push(rec.markdownPath)
  candidates.push(`docs/rhex/research/${rec.studyId}.md`)
  candidates.push(`docs/research/${rec.studyId}.md`)
  const seen = new Set()
  const found = []
  for (const rel of candidates) {
    if (seen.has(rel)) continue
    seen.add(rel)
    const abs = join(RHEX, rel)
    if (existsSync(abs)) found.push({ rel, abs })
  }
  return found
}

// ── main ─────────────────────────────────────────────────────────────────────

const warn = (msg) => process.stderr.write(`canonicalize: ${msg}\n`)

if (!existsSync(RHEX)) {
  warn(`rhex root not found: ${RHEX}`)
  process.exit(1)
}

/** studyId -> merged record */
const studies = new Map()
const contractFiles = []
const parseFailures = []

for (const root of CONTRACT_ROOTS) {
  const dir = join(RHEX, root)
  if (!existsSync(dir)) continue
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.research.tsp')) continue
    const rel = `${root}/${name}`
    contractFiles.push(rel)
    let rec
    try {
      rec = parseContract(join(RHEX, rel), rel)
    } catch (err) {
      parseFailures.push({ file: rel, error: String(err) })
      continue
    }
    if (rec === null) {
      parseFailures.push({ file: rel, error: 'no studyId scalar' })
      continue
    }
    const prior = studies.get(rec.studyId)
    if (prior === undefined) {
      studies.set(rec.studyId, { ...rec, contractFiles: [rel] })
      continue
    }
    // Merge: keep the first non-null scalar, union the declarations.
    for (const key of Object.keys(rec)) {
      if (key === 'contractFiles') continue
      const cur = prior[key]
      const empty =
        cur === null ||
        cur === undefined ||
        (Array.isArray(cur) && cur.length === 0) ||
        cur === ''
      if (empty && rec[key] !== null && rec[key] !== undefined) prior[key] = rec[key]
    }
    prior.contractFiles.push(rel)
    prior.declaredInvariants = [...new Set([...prior.declaredInvariants, ...rec.declaredInvariants])]
    prior.realInvariants = [...new Set([...prior.realInvariants, ...rec.realInvariants])]
    prior.mechanicalInvariants = [
      ...new Set([...prior.mechanicalInvariants, ...rec.mechanicalInvariants]),
    ]
    if (prior.groundedSources.length === 0) prior.groundedSources = rec.groundedSources
    else {
      const seen = new Set(prior.groundedSources.map((g) => `${g.sourceId}|${g.originUri}`))
      for (const g of rec.groundedSources) {
        const k = `${g.sourceId}|${g.originUri}`
        if (seen.has(k)) continue
        seen.add(k)
        prior.groundedSources.push(g)
      }
    }
  }
}

// ── model-derived claims ─────────────────────────────────────────────────────

const claimsByStudy = new Map()
const addClaim = (studyId, claim) => {
  const list = claimsByStudy.get(studyId) ?? []
  const key = claim.statement.toLowerCase().replace(/\s+/g, ' ').slice(0, 200)
  if (!list.some((c) => c.key === key)) list.push({ ...claim, key })
  claimsByStudy.set(studyId, list)
}

const derivedBig = readJson(join(PRIOR, 'derived-big.json'))
const derivedSmall = readJson(join(PRIOR, 'derived-invariants.json'))
const audit = readJson(join(PRIOR, 'quote-audit.json'))

const auditIndex = new Map()
for (const f of audit?.failures ?? []) {
  auditIndex.set(`${f.studyId}::${f.statementKey}`, f.why)
}

const ingestDerived = (doc, run) => {
  for (const rec of doc?.records ?? []) {
    for (const a of rec.accepted ?? []) {
      const key = String(a.statement ?? '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .slice(0, 200)
      const why = auditIndex.get(`${rec.studyId}::${key}`)
      addClaim(rec.studyId, {
        statement: a.statement,
        quote: a.quote,
        origin: a.origin ?? a.kind ?? null,
        run,
        model: rec.model ?? doc.model ?? null,
        verified: why === undefined,
        unverifiedWhy: why ?? null,
      })
    }
  }
}

ingestDerived(derivedBig, 'chunked-big')
ingestDerived(derivedSmall, 'chunked-small')

// ── prior index, used only for cross-checking ────────────────────────────────

const priorIndex = readJson(join(PRIOR, 'research-index.json'))
const priorById = new Map((priorIndex?.studies ?? []).map((s) => [s.studyId, s]))

// ── ssot fan-in and binding trust ────────────────────────────────────────────

const fanIn = new Map()
for (const rec of studies.values()) {
  const p = rec.ssotContractPath
  if (p === null || p === STELE) continue
  fanIn.set(p, (fanIn.get(p) ?? 0) + 1)
}

const bindingKind = (n) => {
  if (n <= 1) return 'sole'
  if (n <= 5) return 'shared'
  return 'default'
}

// ── assemble ─────────────────────────────────────────────────────────────────

const NOW = Date.now()
const DAY_MS = 86_400_000

/**
 * Estimate the age of a study's last check. Returns null when the contract
 * carries no usable date rather than guessing one.
 */
const ageDays = (checkedOn) => {
  if (checkedOn === null || !/^\d{4}-\d{2}-\d{2}$/.test(checkedOn)) return null
  const t = Date.parse(`${checkedOn}T00:00:00Z`)
  if (Number.isNaN(t)) return null
  return Math.round((NOW - t) / DAY_MS)
}

const records = []
for (const rec of [...studies.values()].sort((a, b) => a.studyId.localeCompare(b.studyId))) {
  const leaves = resolveMarkdown(rec)
  const md = leaves[0] ?? null
  const mdText = md === null ? null : readText(md.abs)
  const prior = priorById.get(rec.studyId)

  // Front matter may sit on any copy of the leaf; record which one carried it
  // so a mismatch between the declared leaf and the authored leaf is visible.
  let fm = {}
  let fmSource = null
  for (const leaf of leaves) {
    const parsed = frontMatter(readText(leaf.abs))
    if (Object.keys(parsed).length > 0) {
      fm = parsed
      fmSource = leaf.rel
      break
    }
  }
  const leafBytes = leaves.map((leaf) => {
    const t = readText(leaf.abs)
    return { path: leaf.rel, bytes: t === null ? 0 : Buffer.byteLength(t, 'utf8') }
  })

  const claims = claimsByStudy.get(rec.studyId) ?? []
  const verifiedClaims = claims.filter((c) => c.verified)

  const ssot = rec.ssotContractPath
  const ssotExists = ssot !== null && ssot !== STELE ? contractExists(ssot) : false
  const n = ssot === null || ssot === STELE ? 0 : (fanIn.get(ssot) ?? 0)

  const unresolved = Array.isArray(prior?.markdown?.unresolvedEvidence)
    ? prior.markdown.unresolvedEvidence
    : []

  const flags = []
  if (md === null) flags.push('markdown-missing')
  if (fmSource === null) flags.push('front-matter-absent')
  else if (md !== null && fmSource !== md.rel) flags.push('front-matter-offleaf')
  if (ssot === null || ssot === STELE) flags.push('ssot-unbound')
  else if (!ssotExists) flags.push('ssot-missing')
  else if (bindingKind(n) === 'default') flags.push('binding-default')
  if (rec.realInvariants.length === 0) flags.push('no-real-invariant')
  if (claims.length === 0) flags.push('no-derived-claim')
  if (verifiedClaims.length === 0 && claims.length > 0) flags.push('no-verified-claim')
  if (unresolved.length > 0) flags.push('unresolved-evidence')
  const age = ageDays(rec.checkedOn)
  if (age !== null && age > 180) flags.push('stale-over-180d')

  records.push({
    studyId: rec.studyId,
    title: rec.title,
    constName: rec.constName,
    originSurface: rec.originSurface,
    checkedOn: rec.checkedOn,
    checkedAgeDays: age,

    markdownPath: rec.markdownPath,
    markdownResolved: md === null ? null : md.rel,
    markdownBytes: mdText === null ? 0 : Buffer.byteLength(mdText, 'utf8'),
    markdownLeaves: leafBytes,
    frontMatterSource: fmSource,

    researchTspPath: rec.researchTspPath,
    researchTspResolved: rec.researchTspPath !== null && contractExists(rec.researchTspPath),
    contractFiles: rec.contractFiles,

    ssotContractPath: ssot,
    ssotResolved: ssotExists,
    ssotFanIn: n,
    bindingKind: bindingKind(n),

    frontMatter: fm,
    headings: headingsOf(mdText),
    unresolvedEvidence: unresolved,

    groundedSources: rec.groundedSources,

    /** Authoritative: hand-written in the contract. */
    realInvariants: rec.realInvariants,
    /** Quarantined: section headings lifted mechanically by a generator. */
    mechanicalInvariants: rec.mechanicalInvariants,
    declaredInvariantCount: rec.declaredInvariants.length,

    /** Model-extracted, each carrying a source quote; not authoritative. */
    claims,

    flags,
  })
}

// ── corpus census ────────────────────────────────────────────────────────────

const sum = (f) => records.reduce((a, r) => a + f(r), 0)
const count = (f) => records.filter(f).length

const bySsot = [...fanIn.entries()]
  .map(([ssotPath, studies]) => ({ ssotPath, studies, resolves: contractExists(ssotPath) }))
  .sort((a, b) => b.studies - a.studies)

const flagTally = {}
for (const r of records) for (const f of r.flags) flagTally[f] = (flagTally[f] ?? 0) + 1

const corpus = {
  generatedAt: new Date().toISOString(),
  rhexRoot: RHEX,
  generator: 'research-mcp/src/canonicalize.mjs',

  census: {
    contractFilesScanned: contractFiles.length,
    contractFilesByRoot: Object.fromEntries(
      CONTRACT_ROOTS.map((root) => [
        root,
        contractFiles.filter((f) => f.startsWith(`${root}/`)).length,
      ]),
    ),
    distinctStudies: records.length,
    markdownBytes: sum((r) => r.markdownBytes),
    realInvariants: sum((r) => r.realInvariants.length),
    mechanicalInvariants: sum((r) => r.mechanicalInvariants.length),
    declaredInvariants: sum((r) => r.declaredInvariantCount),
    groundedSources: sum((r) => r.groundedSources.length),
    derivedClaims: sum((r) => r.claims.length),
    verifiedClaims: sum((r) => r.claims.filter((c) => c.verified).length),
    distinctSsotTargets: bySsot.length,
  },

  health: {
    studiesWithRealInvariant: count((r) => r.realInvariants.length > 0),
    studiesWithVerifiedClaim: count((r) => r.claims.some((c) => c.verified)),
    studiesWithEither: count(
      (r) => r.realInvariants.length > 0 || r.claims.some((c) => c.verified),
    ),
    studiesWithNoSubstance: count(
      (r) => r.realInvariants.length === 0 && !r.claims.some((c) => c.verified),
    ),
    studiesWithDefaultBinding: count((r) => r.bindingKind === 'default'),
    studiesSoleBound: count((r) => r.bindingKind === 'sole'),
    ssotUnbound: count((r) => r.flags.includes('ssot-unbound')),
    ssotMissing: count((r) => r.flags.includes('ssot-missing')),
    markdownMissing: count((r) => r.flags.includes('markdown-missing')),
    frontMatterAbsent: count((r) => r.flags.includes('front-matter-absent')),
    frontMatterOffLeaf: count((r) => r.flags.includes('front-matter-offleaf')),
    staleOver180d: count((r) => r.flags.includes('stale-over-180d')),
    withUnresolvedEvidence: count((r) => r.flags.includes('unresolved-evidence')),
  },

  flagTally,
  ssotFanIn: bySsot,
  parseFailures,
  studies: records,
}

const out = join(PKG, 'data', 'corpus.json')
writeFileSync(out, `${JSON.stringify(corpus, null, 1)}\n`)

// ── console report ───────────────────────────────────────────────────────────

const c = corpus.census
process.stdout.write(
  [
    `contract files scanned : ${c.contractFilesScanned}`,
    `  ` + Object.entries(c.contractFilesByRoot).map(([k, v]) => `${k}=${v}`).join('  '),
    `distinct studies       : ${c.distinctStudies}`,
    `real invariants        : ${c.realInvariants}`,
    `mechanical (quarantine): ${c.mechanicalInvariants}`,
    `derived claims         : ${c.derivedClaims} (${c.verifiedClaims} quote-verified)`,
    `distinct ssot targets  : ${c.distinctSsotTargets}`,
    ``,
    `studies w/ real inv    : ${corpus.health.studiesWithRealInvariant}`,
    `studies w/ verified    : ${corpus.health.studiesWithVerifiedClaim}`,
    `studies w/ substance   : ${corpus.health.studiesWithEither}`,
    `studies w/ NO substance: ${corpus.health.studiesWithNoSubstance}`,
    `default binding        : ${corpus.health.studiesWithDefaultBinding}`,
    `sole binding           : ${corpus.health.studiesSoleBound}`,
    `ssot unbound/missing   : ${corpus.health.ssotUnbound}/${corpus.health.ssotMissing}`,
    `markdown missing       : ${corpus.health.markdownMissing}`,
    `front matter absent    : ${corpus.health.frontMatterAbsent}`,
    `front matter off-leaf  : ${corpus.health.frontMatterOffLeaf}`,
    `stale >180d            : ${corpus.health.staleOver180d}`,
    ``,
    `parse failures         : ${parseFailures.length}`,
    `written                : ${out}`,
  ].join('\n') + '\n',
)
