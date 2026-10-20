#!/usr/bin/env node
// Turns a folder of Agent Skills (one folder per skill, each with a SKILL.md) into the
// data the /skills pages read:
//   data/skills/catalog.json              one light record per skill (search + cards + outline)
//   content/skills/<slug>/SKILL.md        the skill text, verbatim (the page shows THIS, never a summary)
//
// Run from bearbrown_co/:   node scripts/skills/ingest.mjs [path/to/skills]
// Sources: ../bear-brown-tools/skills (github.com/nikbearbrown/bear-brown-tools, copied verbatim) and
// ../nikbearbrown-skills/skills (github.com/nikbearbrown/skills: Bear Brown's refactored canonical skills, which
// carry a sources.json citing everything they were derived from).
//
// Everything derived here is read off the text: headings, slash commands, phase headings, "hard no" lists.
// Hand-written fields (job, persona, pairs-with, agents) live in data/skills/meta.json and are never
// overwritten. A derived field that the text does not support is left empty, never invented.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const root = process.cwd()
const SRC = path.resolve(root, process.argv[2] || '../bear-brown-tools/skills')
const CANON = path.resolve(root, '../nikbearbrown-skills/skills')
const CANON_URL = 'https://github.com/nikbearbrown/skills'
const REPO_URL = 'https://github.com/nikbearbrown/bear-brown-tools'
const meta = JSON.parse(fs.readFileSync(path.join(root, 'data/skills/meta.json'), 'utf8'))

const wc = s => (s.match(/\S+/g) || []).length
const clean = s => s.replace(/\*\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ').trim()

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) throw new Error('no frontmatter')
  const fm = {}
  for (const k of ['name', 'description']) {
    const r = m[1].match(new RegExp(`^${k}:\\s*(?:"((?:[^"\\\\]|\\\\.)*)"|'([^']*)'|(.*))\\s*$`, 'm'))
    if (r) fm[k] = (r[1] ?? r[2] ?? r[3] ?? '').replace(/\\"/g, '"').trim()
  }
  return { fm, body: m[2] }
}

// Headings outside code fences, with the word count of what follows each one.
function sectionsOf(body) {
  const lines = body.split('\n')
  let fence = false
  const marks = []
  lines.forEach((l, i) => {
    if (/^```/.test(l)) fence = !fence
    if (fence) return
    const h = l.match(/^(#{1,3})\s+(.+?)\s*$/)
    if (h) marks.push({ i, level: h[1].length, title: clean(h[2]) })
  })
  const level = marks.some(m => m.level === 2) ? 2 : marks.some(m => m.level === 1) ? 1 : marks.some(m => m.level === 3) ? 3 : 0
  if (!level) return { level, sections: [], marks, lines }
  const top = marks.filter(m => m.level === level)
  const sections = top.map((m, n) => {
    const end = n + 1 < top.length ? top[n + 1].i : lines.length
    return { title: m.title, words: wc(lines.slice(m.i + 1, end).join(' ')) }
  })
  return { level, sections, marks, lines }
}

const SKIP_CMDS = new Set(['/silent'])
const MODIFIERS = new Set(['silent'])
function commandsOf(lines) {
  const found = new Map()
  const add = (name, desc) => {
    if (SKIP_CMDS.has(name)) return
    let d = desc ? clean(desc).replace(/^[—–:-]\s*/, '') : ''
    // a fragment that starts mid-sentence or leaves a bracket open was cut by the line split: drop it
    if (!/^[A-Za-z]/.test(d) || (d.match(/\(/g) || []).length !== (d.match(/\)/g) || []).length) d = ''
    if (!found.has(name)) found.set(name, d)
    else if (!found.get(name) && d) found.set(name, d)
  }
  let fence = false
  for (const l of lines) {
    if (/^```/.test(l)) { fence = !fence; continue }
    if (fence) continue
    let m
    // table row: | `/cmd ...` | what it does |
    if ((m = l.match(/^\|\s*`?(\/[a-z][a-z0-9-]*)(?:[^|`]*)`?\s*\|\s*([^|]+)\|/i))) { add(m[1].toLowerCase(), m[2]); continue }
    // heading or bare line:  ## /cmd — what it does    or   /cmd — what it does
    if ((m = l.match(/^(?:#{1,4}\s+)?\*{0,2}`?(\/[a-z][a-z0-9-]*)\b[^—–\n]*?`?\*{0,2}\s*(?:[—–]|:\s)\s*(.+)$/i))) { add(m[1].toLowerCase(), m[2]); continue }
    if ((m = l.match(/^(?:#{1,4}\s+)?\*{0,2}`?(\/[a-z][a-z0-9-]*)\b/i))) add(m[1].toLowerCase(), '')
    // "## COMMAND: name"
    if ((m = l.match(/^#{1,4}\s+COMMAND:\s*\/?([a-z][a-z0-9-]*)/i))) add(m[1].toLowerCase(), '')
  }
  return [...found].map(([name, desc]) => ({ name, desc: desc.slice(0, 220) }))
}

function phasesOf(marks) {
  const out = []
  for (const m of marks) {
    const r = m.title.match(/^(?:PHASE|Phase|STAGE|Stage)\s*(\d+)\s*[:—–·.-]?\s*(.*)$/)
    if (r && r[2] && !out.some(p => p.n === +r[1])) out.push({ n: +r[1], title: r[2].replace(/\s*\(.*$/, '').trim() })
  }
  return out.slice(0, 10)
}

const RULE_HEAD = /(hard nos?|never|forbidden|non-?negotiable|what .* (does not|doesn.t|won.t)|no fabrication|rules that apply|operating principles)/i
function rulesOf(lines, marks) {
  const out = []
  for (const m of marks) {
    if (!RULE_HEAD.test(m.title)) continue
    const start = m.i + 1
    const next = marks.find(x => x.i > m.i && x.level <= m.level)
    const end = next ? next.i : lines.length
    for (const l of lines.slice(start, end)) {
      const b = l.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/)
      if (b) {
        const t = clean(b[1])
        if (t.length > 8 && t.length < 260) out.push(t)
      }
      if (out.length >= 8) break
    }
    if (out.length) return { from: m.title, items: out }
  }
  return null
}

function git(slug, fmt, srcdir = SRC) {
  try {
    const repo = path.resolve(srcdir, '..')
    return execFileSync('git', ['-C', repo, 'log', '-1', `--format=${fmt}`, '--', `skills/${slug}`], { encoding: 'utf8' }).trim() || null
  } catch { return null }
}
const sha = t => crypto.createHash('sha256').update(t).digest('hex')

// Read-only checks on the text. They flag; they never change the skill.
function auditOf({ fm, slug, sections, commands, useWhen, words }) {
  const f = []
  if (fm.name !== slug) f.push('name-differs-from-folder')
  if (!useWhen) f.push('description-has-no-use-when')
  if (!sections.length) f.push('no-headings')
  if (words > 10000) f.push('very-long-body')
  if (commands.length && commands.filter(c => c.desc).length < commands.length / 2) f.push('commands-mostly-undescribed')
  return f
}

const entries = []
function ingest(SRCDIR, canonical) {
for (const slug of fs.readdirSync(SRCDIR).sort()) {
  const dir = path.join(SRCDIR, slug)
  const file = path.join(dir, 'SKILL.md')
  if (!fs.statSync(dir).isDirectory() || !fs.existsSync(file)) continue
  const sourceRaw = fs.readFileSync(file, 'utf8')
  const m = meta[slug] || {}
  // An authored skill is one Bear rewrote or merged: its text lives in content/skills/<slug>/SKILL.md
  // and this script leaves it alone. Every other skill is copied verbatim from its source.
  const siteFile = path.join(root, 'content/skills', slug, 'SKILL.md')
  const authored = !canonical && !!m.authored && fs.existsSync(siteFile)
  const cite = canonical ? JSON.parse(fs.readFileSync(path.join(dir, 'sources.json'), 'utf8')) : null
  const raw = authored ? fs.readFileSync(siteFile, 'utf8') : sourceRaw
  const { fm, body } = frontmatter(raw)
  if (fm.name !== slug) console.warn(`NOTE ${slug}: frontmatter name is "${fm.name}"`)
  const split = (fm.description || '').split(/\s+(?=Use\b)/)
  const does = split[0].trim()
  const useWhen = split.slice(1).join(' ').trim()
  const { sections, marks, lines } = sectionsOf(body)
  const commands = commandsOf(lines)
  const phases = phasesOf(marks)
  const rules = rulesOf(lines, marks)
  const kind = m.kind || (slug.startsWith('tone-') ? 'voice' : commands.length >= 3 ? 'commands' : 'protocol')
  const others = fs.readdirSync(dir).filter(f => f !== 'SKILL.md')
  entries.push({
    slug,
    name: fm.name || slug,
    description: fm.description || '',
    does,
    useWhen,
    kind,
    job: m.job || null,
    persona: m.persona || null,
    starts: m.starts || (/\/help\b/.test(body) ? '/help' : commands.find(c => c.name === 'help') ? 'help' : null),
    pairs: m.pairs || [],
    agents: m.agents || [],
    words: wc(body),
    descWords: wc(fm.description || ''),
    sections,
    commands,
    phases,
    rules,
    extraFiles: others,
    sha256: sha(raw),
    changed: git(slug, '%cs', SRCDIR),
    // Where this skill came from. A merged skill lists every source; a rewrite says it is a rewrite.
    derivedFrom: cite ? cite.derivedFrom : (m.derivedFrom || [{
      repo: 'nikbearbrown/bear-brown-tools',
      path: `skills/${slug}/SKILL.md`,
      commit: git(slug, '%h', SRCDIR),
      sha256: sha(sourceRaw),
      url: `${REPO_URL}/tree/main/skills/${slug}`,
    }]),
    canonical: !!cite,
    path: `skills/${slug}/SKILL.md`,
    repoUrl: canonical ? `${CANON_URL}/tree/main/skills/${slug}` : `${REPO_URL}/tree/main/skills/${slug}`,
    refactor: cite ? { summary: cite.summary, changed: cite.changed, dropped: cite.dropped, findings: cite.findings, examined: cite.examined, excluded: cite.excluded, date: cite.refactored } : null,
    verbatim: !authored && !cite,
    note: m.note || null,
    audit: auditOf({ fm, slug, sections, commands, useWhen, words: wc(body) }),
  })
  if (!authored) {
    const out = path.join(root, 'content/skills', slug)
    fs.mkdirSync(out, { recursive: true })
    fs.writeFileSync(path.join(out, 'SKILL.md'), raw)
  }
}
}
ingest(SRC, false)
if (fs.existsSync(CANON)) ingest(CANON, true)

entries.sort((a, b) => a.name.localeCompare(b.name))
fs.writeFileSync(path.join(root, 'data/skills/catalog.json'), JSON.stringify(entries, null, 1) + '\n')
console.log(`${entries.length} skills → data/skills/catalog.json`)
for (const e of entries) {
  console.log(`${e.slug.padEnd(30)} ${e.kind.padEnd(9)} w=${String(e.words).padStart(5)} sec=${String(e.sections.length).padStart(2)} cmd=${String(e.commands.length).padStart(2)} desc=${e.commands.filter(c => c.desc).length} ph=${e.phases.length} rules=${e.rules ? e.rules.items.length : 0} audit=${e.audit.join(',') || '-'}`)
}
