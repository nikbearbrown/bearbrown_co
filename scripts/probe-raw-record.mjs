import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// Load .env.local if present (matches ingest-to-file.mjs loader exactly)
const envFile = path.join(ROOT, '.env.local')
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n')
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const token = process.env.GITHUB_READ_TOKEN
if (!token) { console.error('GITHUB_READ_TOKEN not found in .env.local'); process.exit(1) }

const API = 'https://api.github.com/repos/nikbearbrown/github-claude-plugins'
const H = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
const list = async p => { const r = await fetch(`${API}/contents/${p}`, { headers: H }); if (!r.ok) { console.error(p, r.status); return [] } return r.json() }
const newest = a => a.filter(i => i.type === 'dir').sort((x, y) => y.name.localeCompare(x.name))[0]
const get = async sha => { const j = await (await fetch(`${API}/git/blobs/${sha}`, { headers: H })).json()
  return JSON.parse(Buffer.from(String(j.content).replace(/\s/g, ''), 'base64').toString('utf8')) }

const y = newest(await list('ledger/records'))
const m = newest(await list(`ledger/records/${y.name}`))
const d = newest(await list(`ledger/records/${y.name}/${m.name}`))
console.log('newest day:', `${y.name}/${m.name}/${d.name}`)

const tr = await (await fetch(`${API}/git/trees/${d.sha}?recursive=1`, { headers: H })).json()
const blobs = tr.tree.filter(t => t.type === 'blob' && t.path.endsWith('/audit.json'))
console.log('records that day:', blobs.length)

const first = await get(blobs[0].sha)
console.log('\n--- TOP-LEVEL KEYS OF ONE RAW RECORD ---')
console.log(Object.keys(first).join('\n'))
console.log('\n--- gate1 ---'); console.log(JSON.stringify(first.gate1, null, 1)?.slice(0, 1500))
console.log('\n--- gate2 ---'); console.log(JSON.stringify(first.gate2, null, 1)?.slice(0, 1500))
console.log('\n--- gate3 ---'); console.log(JSON.stringify(first.gate3, null, 1)?.slice(0, 1500))

const by = new Map()
for (const b of blobs.slice(0, 60)) {
  const r = await get(b.sha)
  for (const t of (r.tests || [])) by.set(t.by, (by.get(t.by) || 0) + 1)
}
console.log('\n--- ALL DISTINCT test.by ACROSS THAT DAY ---')
console.log([...by.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v}\t${k}`).join('\n'))
