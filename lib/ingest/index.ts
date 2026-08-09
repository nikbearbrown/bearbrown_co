// Entry point: returns schema_version:2 audit entries for the /claude/[type] pages.
//
// PRIMARY source: data/catalog/audit-entries.json — pre-generated locally via
//   node scripts/ingest-to-file.mjs
// This file is committed and deployed with the site; no GitHub API calls at build time.
//
// FALLBACK (when the static file is absent — dev or first-run):
//   Walk ledger/records/<year>/<month>/<day>/ newest-first via the GitHub Contents API
//   (shard-aware; never a single recursive tree of the whole repo), fetch blobs in
//   parallel batches of 40. Requires GITHUB_READ_TOKEN. Degrades to empty array when
//   token is absent — illustrative examples still render.
//
// Multi-worker cache: a /tmp file ensures only the first worker hits GitHub if the
//   static file is absent. Subsequent workers read the temp file.

import * as fs from 'fs'
import * as path from 'path'
import { walkLedgerNewest, fetchBlobTexts } from './github'
import { transformRecord } from './transform'
import type { AuditEntry } from '@/data/catalog/audit-entry'

// Module-level cache: valid within a single worker process.
let _cache: AuditEntry[] | null = null

// Pre-generated static file — committed to the repo, present in every deployment.
// Regenerate with: node scripts/ingest-to-file.mjs
const STATIC_FILE = path.join(process.cwd(), 'data', 'catalog', 'audit-entries.json')

// Cross-worker temp file: written by first GitHub-fetch worker so others don't re-fetch.
const TEMP_CACHE_FILE = path.join('/tmp', 'bearbrown-audit-entries.json')

// How many days of ledger history to walk when falling back to GitHub.
const MAX_DAYS = 3

function readJsonFile(filePath: string, label: string): AuditEntry[] | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)
    if (Array.isArray(data) && data.length > 0) {
      console.log(`[ingest] Loaded ${data.length} entries from ${label}`)
      return data as AuditEntry[]
    }
  } catch {
    // Not present or unreadable — try next source
  }
  return null
}

function writeTempCache(entries: AuditEntry[]): void {
  try {
    fs.writeFileSync(TEMP_CACHE_FILE, JSON.stringify(entries))
  } catch (e) {
    console.warn('[ingest] Could not write build cache:', e)
  }
}

export async function getAllAuditEntries(): Promise<AuditEntry[]> {
  // 1. Process-level cache
  if (_cache !== null) return _cache

  // 2. Pre-generated static file (primary — zero API calls)
  const staticEntries = readJsonFile(STATIC_FILE, 'data/catalog/audit-entries.json')
  if (staticEntries) {
    _cache = staticEntries
    return _cache
  }

  // 3. Cross-worker temp file (written by the first worker that did a GitHub fetch)
  const tempEntries = readJsonFile(TEMP_CACHE_FILE, '/tmp build cache')
  if (tempEntries) {
    _cache = tempEntries
    return _cache
  }

  // 4. No token — degrade gracefully
  const token = process.env.GITHUB_READ_TOKEN
  if (!token) {
    console.warn('[ingest] GITHUB_READ_TOKEN not set and no static file — audit entries disabled; pages show illustrative examples only')
    _cache = []
    return _cache
  }

  // 5. Full GitHub fetch (last resort — runs once per build, first worker to arrive)
  console.log(`[ingest] No static file found; walking ledger newest-first, max ${MAX_DAYS} day(s)...`)
  const t0 = Date.now()

  const blobs = await walkLedgerNewest(token, MAX_DAYS)
  console.log(`[ingest] Found ${blobs.length} audit.json blob(s) across ${MAX_DAYS} day(s)`)

  const texts = await fetchBlobTexts(token, blobs, 40)

  const entries: AuditEntry[] = []
  let v1Count = 0
  let parseErrors = 0

  for (const text of texts) {
    if (!text) continue
    let raw: Record<string, unknown>
    try {
      raw = JSON.parse(text)
    } catch {
      parseErrors++
      continue
    }
    if (raw.schema_version !== 2) { v1Count++; continue }
    const entry = transformRecord(raw)
    // Only list entries that cleared all static checks — REJECTs/DEFERREDs must not appear.
    if (entry && entry.grade === 'CLEARED_STATIC') entries.push(entry)
  }

  const elapsed = Date.now() - t0
  console.log(
    `[ingest] Done in ${elapsed}ms: ${entries.length} v2 entr${entries.length === 1 ? 'y' : 'ies'}` +
    (v1Count     > 0 ? `, ${v1Count} v1 skipped`       : '') +
    (parseErrors > 0 ? `, ${parseErrors} parse errors`  : ''),
  )

  writeTempCache(entries)
  _cache = entries
  return _cache
}

// Get entries for a given type URL slug (e.g. "skills", "agents")
export async function getAuditEntriesByType(typeSlug: string): Promise<AuditEntry[]> {
  const all = await getAllAuditEntries()
  return all.filter(e => e.typeSlug === typeSlug)
}

// Get a single entry by type slug + url slug
export async function getAuditEntry(typeSlug: string, urlSlug: string): Promise<AuditEntry | null> {
  const all = await getAllAuditEntries()
  return all.find(e => e.typeSlug === typeSlug && e.urlSlug === urlSlug) ?? null
}
