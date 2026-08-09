// Shard-aware GitHub reader for the private results repo.
// Never uses a single recursive tree of the whole repo.
// Walk: list years → months → days (newest first) via Contents API.
//       Per-day: one git/trees call on the day's tree SHA (bounded subtree).
// Fetch: blobs in parallel batches to respect rate limits.

const RESULTS_REPO = 'nikbearbrown/github-claude-plugins'
const API_BASE = `https://api.github.com/repos/${RESULTS_REPO}`

function ghHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

export interface ContentsItem {
  name: string
  type: 'file' | 'dir' | 'symlink'
  sha: string   // tree SHA for dirs, blob SHA for files
  path: string
}

export interface AuditBlob {
  path: string  // full ledger path, e.g. ledger/records/2026/08/07/cf/slug/audit.json
  sha: string   // blob SHA for direct blob fetch
}

// List a path via the Contents API. Returns [] on error.
async function listContents(token: string, path: string): Promise<ContentsItem[]> {
  const url = `${API_BASE}/contents/${path}`
  try {
    const res = await fetch(url, { headers: ghHeaders(token) })
    if (!res.ok) {
      console.error(`[ingest] Contents API ${res.status} for ${path}`)
      return []
    }
    return res.json() as Promise<ContentsItem[]>
  } catch (e) {
    console.error(`[ingest] listContents error for ${path}:`, e)
    return []
  }
}

// Fetch all blobs (recursively) under a given tree SHA.
// Used for per-day subtrees — each day stays well under the 100k item limit.
async function getSubtreeBlobs(
  token: string,
  treeSha: string,
  dayPrefix: string,  // e.g. "ledger/records/2026/08/07" — for logging only
): Promise<AuditBlob[]> {
  const url = `${API_BASE}/git/trees/${treeSha}?recursive=1`
  try {
    const res = await fetch(url, { headers: ghHeaders(token) })
    if (!res.ok) {
      console.error(`[ingest] git/trees ${res.status} for day ${dayPrefix}`)
      return []
    }
    const json = await res.json()
    if (json.truncated) {
      console.warn(`[ingest] subtree truncated for ${dayPrefix} — some records may be missing`)
    }
    return (json.tree as { path: string; type: string; sha: string }[])
      .filter(item => item.type === 'blob' && item.path.endsWith('/audit.json'))
      .map(item => ({
        path: `${dayPrefix}/${item.path}`,  // reconstruct full path for logging
        sha: item.sha,
      }))
  } catch (e) {
    console.error(`[ingest] getSubtreeBlobs error for ${dayPrefix}:`, e)
    return []
  }
}

// Walk ledger/records/<year>/<month>/<day>/ newest-first via Contents API.
// Gets the SHA of each day directory, then calls getSubtreeBlobs on that day.
// Stops after collecting blobs from maxDays distinct days.
export async function walkLedgerNewest(
  token: string,
  maxDays = 3,
): Promise<AuditBlob[]> {
  const collected: AuditBlob[] = []
  let daysVisited = 0

  const years = await listContents(token, 'ledger/records')
  const sortedYears = years.filter(i => i.type === 'dir').sort((a, b) => b.name.localeCompare(a.name))

  outer: for (const year of sortedYears) {
    const months = await listContents(token, `ledger/records/${year.name}`)
    const sortedMonths = months.filter(i => i.type === 'dir').sort((a, b) => b.name.localeCompare(a.name))

    for (const month of sortedMonths) {
      const days = await listContents(token, `ledger/records/${year.name}/${month.name}`)
      const sortedDays = days.filter(i => i.type === 'dir').sort((a, b) => b.name.localeCompare(a.name))

      for (const day of sortedDays) {
        if (daysVisited >= maxDays) break outer

        const prefix = `ledger/records/${year.name}/${month.name}/${day.name}`
        console.log(`[ingest] fetching blobs for ${prefix} (sha ${day.sha.slice(0, 8)})`)
        const dayBlobs = await getSubtreeBlobs(token, day.sha, prefix)
        collected.push(...dayBlobs)
        daysVisited++
        console.log(`[ingest]   day ${prefix}: ${dayBlobs.length} audit.json blob(s) (total so far: ${collected.length})`)
      }
    }
  }

  return collected
}

// Decode a single blob's base64 content to a UTF-8 string.
async function fetchBlobText(token: string, sha: string): Promise<string | null> {
  const url = `${API_BASE}/git/blobs/${sha}`
  try {
    const res = await fetch(url, { headers: ghHeaders(token) })
    if (!res.ok) return null
    const json = await res.json()
    if (json.encoding !== 'base64') return null
    const clean = String(json.content ?? '').replace(/\s/g, '')
    return Buffer.from(clean, 'base64').toString('utf-8')
  } catch {
    return null
  }
}

// Fetch many blobs concurrently in batches. Batching bounds the concurrency
// so we don't hammer the API with hundreds of simultaneous requests.
export async function fetchBlobTexts(
  token: string,
  blobs: AuditBlob[],
  batchSize = 40,
): Promise<(string | null)[]> {
  const results: (string | null)[] = []
  for (let i = 0; i < blobs.length; i += batchSize) {
    const batch = blobs.slice(i, i + batchSize)
    const texts = await Promise.all(batch.map(b => fetchBlobText(token, b.sha)))
    results.push(...texts)
  }
  return results
}
