/**
 * Ingest paste-form artifacts from the bear-brown-tools repo into a committed
 * catalog file, following the ingest-to-file pattern: run locally, commit the
 * JSON, the site builds from it. No runtime dependency on the sibling repo.
 *
 * Source:  ../bear-brown-tools/artifacts/*.md   (plain markdown + frontmatter)
 * Output:  data/catalog/artifact-pages.json
 *
 * Markdown -> semantic HTML happens HERE, at ingest time, because the site
 * deliberately carries no markdown dependency. Tags only — no classes, no
 * inline styles; the site's stylesheet owns presentation.
 *
 * Usage: node scripts/ingest-artifact-pages.mjs [path-to-artifacts-dir]
 */
import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const SRC = process.argv[2] ?? join(process.cwd(), '..', 'bear-brown-tools', 'artifacts')
const OUT = join(process.cwd(), 'data', 'catalog', 'artifact-pages.json')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>')

function mdToHtml(md) {
  const out = []
  const lines = md.split('\n')
  let i = 0, para = [], list = null, table = null

  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = [] } }
  const flushList = () => { if (list) { out.push(`<ul>${list.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`); list = null } }
  const flushTable = () => {
    if (table) {
      const rows = table.map((cells, r) => {
        const tag = r === 0 ? 'th' : 'td'
        return `<tr>${cells.map((c) => `<${tag}>${inline(c)}</${tag}>`).join('')}</tr>`
      })
      out.push(`<table>${rows.join('')}</table>`)
      table = null
    }
  }
  const flushAll = () => { flushPara(); flushList(); flushTable() }

  while (i < lines.length) {
    const line = lines[i]
    if (line.trim().startsWith('```')) {
      flushAll()
      const code = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) { code.push(lines[i]); i++ }
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`)
      i++
      continue
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) { flushAll(); const n = h[1].length; out.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue }
    if (/^\s*-\s+/.test(line)) { flushPara(); flushTable(); (list ??= []).push(line.replace(/^\s*-\s+/, '')); i++; continue }
    if (line.includes(' | ') && line.trim() !== '') {
      flushPara(); flushList()
      const cells = line.split(' | ').map((c) => c.trim()).filter((c, idx, a) => !(c === '' && (idx === 0 || idx === a.length - 1)))
      if (cells.length >= 2) { (table ??= []).push(cells); i++; continue }
    }
    if (line.trim() === '') { flushAll(); i++; continue }
    flushList(); flushTable()
    para.push(line.trim())
    i++
  }
  flushAll()
  return out.join('\n')
}

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) return [{}, text]
  const fm = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (kv) fm[kv[1]] = kv[2].replace(/^"|"$/g, '')
  }
  return [fm, text.slice(m[0].length)]
}

const pages = []
for (const f of readdirSync(SRC).filter((f) => f.endsWith('.md')).sort()) {
  const [fm, body] = frontmatter(readFileSync(join(SRC, f), 'utf-8'))
  const raw = body.trim()
  pages.push({
    slug: f.replace(/\.md$/, ''),
    title: fm.title ?? f.replace(/\.md$/, ''),
    description: fm.description ?? '',
    chars: raw.length,
    tokensApprox: Math.round(raw.length / 4),
    source: fm.source ?? '',
    html: mdToHtml(raw),
    raw,
  })
}

writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), pages }, null, 1))
console.log(`${pages.length} artifact pages -> ${OUT}`)
