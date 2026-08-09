#!/usr/bin/env node
// Fetch all schema_version:2 audit records from the private results repo
// and write them to data/catalog/audit-entries.json for use at build time.
//
// Run locally (with GITHUB_READ_TOKEN in environment or .env.local):
//   node scripts/ingest-to-file.mjs
//
// The output file is read by lib/ingest/index.ts at build time,
// avoiding GitHub API calls during the Next.js static build.

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// Load .env.local if present
const envFile = path.join(ROOT, '.env.local')
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n')
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const token = process.env.GITHUB_READ_TOKEN
if (!token) {
  console.error('GITHUB_READ_TOKEN not set')
  process.exit(1)
}

const REPO    = 'nikbearbrown/github-claude-plugins'
const API     = `https://api.github.com/repos/${REPO}`
const HEADERS = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}
const MAX_DAYS   = 3
const BATCH_SIZE = 20   // conservative concurrency to avoid secondary rate limits

// ── GitHub helpers ──────────────────────────────────────────────────────────

async function ghGet(path) {
  const r = await fetch(`${API}${path}`, { headers: HEADERS })
  if (!r.ok) { console.error(`GitHub ${r.status} for ${path}`); return null }
  return r.json()
}

async function listContents(p) {
  const data = await ghGet(`/contents/${p}`)
  return Array.isArray(data) ? data : []
}

async function getSubtreeAuditBlobs(treeSha, label) {
  const data = await ghGet(`/git/trees/${treeSha}?recursive=1`)
  if (!data) return []
  if (data.truncated) console.warn(`WARNING: subtree truncated for ${label}`)
  return (data.tree ?? [])
    .filter(i => i.type === 'blob' && i.path.endsWith('/audit.json'))
    .map(i => ({ sha: i.sha, label }))
}

async function fetchBlobText(sha) {
  const data = await ghGet(`/git/blobs/${sha}`)
  if (!data || data.encoding !== 'base64') return null
  return Buffer.from(data.content.replace(/\s/g, ''), 'base64').toString('utf-8')
}

// ── Field + stack enrichment (mirrors transform.ts) ────────────────────────

const FIELD_TAXONOMY = {
  devops:      ['deploy','kubernetes','k8s','docker','container','terraform','helm','ci/cd','pipeline','grafana','prometheus','infrastructure','cloud sql'],
  security:    ['security','auth','authentication','secret','credential','vulnerability','cve','pentest','scan','compliance','rbac','oauth','jwt','encryption'],
  data:        ['database','sql','postgres','postgresql','mysql','redis','mongodb','analytics','etl','dataframe','pandas','query','bigquery','snowflake','warehouse','spark'],
  docs:        ['documentation','readme','wiki','changelog','api reference','docstring','jsdoc','openapi','swagger'],
  testing:     ['test','spec','coverage','jest','pytest','mock','assert','tdd','bdd','cypress','playwright'],
  design:      ['design','figma','ui','ux','css','sass','tailwind','storybook','accessibility','a11y'],
  finance:     ['finance','billing','payment','stripe','invoice','accounting','revenue','budget','expense'],
  legal:       ['legal','compliance','gdpr','privacy','license','contract','terms of service','policy'],
  education:   ['education','learning','course','lesson','student','teacher','curriculum','quiz','tutor'],
  research:    ['research','paper','arxiv','pubmed','literature','citation','academic','scientific','experiment'],
  marketing:   ['marketing','campaign','seo','ads','google ads','meta ads','social media','email','brand','conversion','audience'],
  productivity: ['productivity','calendar','task management','project management','kanban','slack','linear','jira','notion','scheduling','automation'],
}
const STACK_MAP = {
  typescript: ['typescript'],
  javascript: ['javascript','node','nodejs'],
  python:     ['python'],
  go:         ['golang'],
  rust:       ['rust'],
  postgresql: ['postgres','postgresql','cloud-sql','cloud sql'],
  kubernetes: ['kubernetes','k8s'],
  docker:     ['docker','container'],
  graphql:    ['graphql'],
  rest:       ['rest api','openapi','swagger'],
}
const TYPE_SLUG_MAP = {
  skill: 'skills', agent: 'agents', command: 'commands', hook: 'hooks',
  'mcp-server': 'mcp-servers', 'lsp-server': 'lsp-servers',
  'output-style': 'output-styles', theme: 'themes', monitor: 'monitors',
  workflow: 'workflows', plugin: 'skills',
}

function detectFields(text) {
  const lower = text.toLowerCase()
  return Object.entries(FIELD_TAXONOMY).filter(([,kws]) => kws.some(kw => lower.includes(kw))).map(([f]) => f)
}
function detectStack(keywords) {
  const lower = keywords.map(k => k.toLowerCase())
  return Object.entries(STACK_MAP).filter(([,kws]) => kws.some(kw => lower.some(k => k.includes(kw)))).map(([s]) => s)
}
function str(v, fb = '') { return v !== undefined && v !== null ? String(v) : fb }
function num(v) { const n = Number(v); return isNaN(n) ? null : n }
function arr(v) { return Array.isArray(v) ? v : [] }
function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {} }

function transform(raw) {
  if (raw.schema_version !== 2) return null
  const meta = obj(raw.meta), gate1 = obj(raw.gate1), checks = obj(gate1.checks)
  const manifest = obj(checks.manifest_data), gate3 = obj(raw.gate3)
  const gradeObj = obj(raw.grade), textDigest = obj(raw.text_digest)
  const owner = str(meta.owner), repo = str(meta.repo)
  if (!owner || !repo) return null
  const id = str(raw.id, `${owner}__${repo}`)
  const recType = str(raw.type, 'skill')
  const authorRaw = manifest.author
  const author = typeof authorRaw === 'string' ? authorRaw : str(obj(authorRaw).name)
  const keywords = arr(manifest.keywords).map(String)
  const digestComponents = arr(textDigest.components)
  const enrichText = [str(manifest.description), str(textDigest.readme_head).slice(0,2000), ...digestComponents.map(c => str(c.description))].join(' ')
  const tags = [...new Set([...detectFields(enrichText), ...detectStack(keywords)])]
  return {
    id, urlSlug: id.replace('__', '--'),
    typeSlug: TYPE_SLUG_MAP[recType] ?? 'skills',
    owner, repo, repoUrl: `https://github.com/${owner}/${repo}`,
    name: str(manifest.name, repo), description: str(manifest.description),
    version: str(manifest.version), author, license: str(manifest.license),
    type: recType,
    components: arr(raw.components).map(c => ({ type: str(c.type), path: str(c.path), confidence: str(c.confidence,'low'), description: c.description !== undefined ? str(c.description) : undefined })),
    tests: arr(raw.tests).map(t => ({ name: str(t.name), by: str(t.by), state: str(t.state,'na'), result_or_reason: str(t.result_or_reason) })),
    coverage: { label: str(obj(raw.coverage).label), assessed: arr(obj(raw.coverage).assessed).map(String), not_assessed: arr(obj(raw.coverage).not_assessed).map(String) },
    receipts: { commit_sha: obj(raw.receipts).commit_sha !== null ? str(obj(raw.receipts).commit_sha) : null, audited_date: str(obj(raw.receipts).audited_date), sandbox: Boolean(obj(raw.receipts).sandbox) },
    portability: str(raw.portability, 'claude-only'),
    adoption: { forks: num(obj(raw.adoption).forks), last_commit: obj(raw.adoption).last_commit !== null ? str(obj(raw.adoption).last_commit) || null : null },
    grade: str(gradeObj.grade), tags,
    readmeHead: str(textDigest.readme_head),
    auditedAt: str(meta.audited_at),
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

const t0 = Date.now()
console.log(`Fetching audit entries from ${REPO} (max ${MAX_DAYS} days)...`)

// Walk shard structure newest-first
const blobs = []
let daysVisited = 0
outer: for (const year of (await listContents('ledger/records')).filter(i => i.type === 'dir').sort((a,b) => b.name.localeCompare(a.name))) {
  for (const month of (await listContents(`ledger/records/${year.name}`)).filter(i => i.type === 'dir').sort((a,b) => b.name.localeCompare(a.name))) {
    for (const day of (await listContents(`ledger/records/${year.name}/${month.name}`)).filter(i => i.type === 'dir').sort((a,b) => b.name.localeCompare(a.name))) {
      if (daysVisited >= MAX_DAYS) break outer
      const prefix = `ledger/records/${year.name}/${month.name}/${day.name}`
      const dayBlobs = await getSubtreeAuditBlobs(day.sha, prefix)
      blobs.push(...dayBlobs)
      daysVisited++
      console.log(`  ${prefix}: ${dayBlobs.length} audits (total: ${blobs.length})`)
    }
  }
}

// Fetch blobs in conservative batches (avoid secondary rate limit)
console.log(`\nFetching ${blobs.length} blobs in batches of ${BATCH_SIZE}...`)
const entries = []
let v1 = 0, errs = 0
for (let i = 0; i < blobs.length; i += BATCH_SIZE) {
  const batch = blobs.slice(i, i + BATCH_SIZE)
  const texts = await Promise.all(batch.map(b => fetchBlobText(b.sha)))
  for (const text of texts) {
    if (!text) { errs++; continue }
    let raw
    try { raw = JSON.parse(text) } catch { errs++; continue }
    if (raw.schema_version !== 2) { v1++; continue }
    const entry = transform(raw)
    // Only list entries that cleared all static checks — REJECTs and DEFERREDs
    // failed eligibility/dedup/secret gates and must not appear in the directory.
    if (entry && entry.grade === 'CLEARED_STATIC') entries.push(entry)
  }
  if ((i + BATCH_SIZE) % 200 === 0) process.stdout.write(`  ${i + BATCH_SIZE}/${blobs.length}...\n`)
  // Small pause between batches to respect secondary rate limits
  if (i + BATCH_SIZE < blobs.length) await new Promise(r => setTimeout(r, 50))
}

const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
console.log(`\nDone in ${elapsed}s: ${entries.length} v2 entries, ${v1} v1 skipped, ${errs} errors`)

// Check for gomarble
const gm = entries.find(e => e.id === 'gomarble-ai__marketing-agent')
console.log(gm ? `gomarble-ai/marketing-agent: FOUND (${gm.typeSlug}/${gm.urlSlug})` : `gomarble-ai/marketing-agent: NOT in range`)

// Write output
const outPath = path.join(ROOT, 'data', 'catalog', 'audit-entries.json')
fs.writeFileSync(outPath, JSON.stringify(entries, null, 2))
console.log(`\nWrote ${entries.length} entries to ${outPath}`)
console.log('Type distribution:', Object.fromEntries(Object.entries(entries.reduce((acc, e) => { acc[e.typeSlug] = (acc[e.typeSlug]||0)+1; return acc }, {})).sort((a,b)=>b[1]-a[1])))
