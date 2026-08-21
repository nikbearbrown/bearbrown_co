#!/usr/bin/env node
/**
 * /criteria describes a PROCESS. It must not contain corpus statistics.
 *
 * Numbers on that page — how many repos were audited, how many scanners had
 * run, how many were behaviourally assessed — go stale the moment the auditor
 * runs again, and a page whose sentences expire is the exact failure this
 * project exists to catch. This guard turns "the page changes only when the
 * process changes" into a build constraint instead of a good intention.
 *
 * It scans PROSE only. Style blocks are stripped first, so px sizes,
 * line-heights and hex colours never trip it and design work is never blocked.
 *
 * Run:  node scripts/check-criteria-stats.mjs
 * Wired into `npm run build` via the `prebuild` script.
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const projectDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const TARGET = join(projectDir, 'app/criteria/page.tsx')

/** Prose allowed to contain a digit. Keep this list short and boring. */
const ALLOWED = [
  /\bGate [1-9]\b/g, // "Gate 1 — Inventory and eligibility."
]

/** Data-array keys whose values are prose a reader sees. */
const CONTENT_KEYS = ['title', 'body', 'desc', 'name', 'by', 'key', 'description']

/**
 * End index of the balanced {...} run that starts at `open`.
 * String-literal aware, so a brace inside a string cannot desync it.
 * Returns -1 if it never balances — callers must not swallow the file on -1.
 */
function matchBrace(src, open) {
  let depth = 0
  let quote = null
  for (let i = open; i < src.length; i++) {
    const c = src[i]
    if (quote) {
      if (c === '\\') { i++; continue }
      if (c === quote) quote = null
      continue
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; continue }
    if (c === '{') depth++
    else if (c === '}') { depth--; if (depth === 0) return i + 1 }
  }
  return -1
}

/** Remove every style={{ ... }} attribute and every React.CSSProperties literal. */
function stripStyles(src) {
  let out = ''
  let i = 0
  while (i < src.length) {
    const a = src.indexOf('style={', i)
    const c = src.indexOf('React.CSSProperties', i)
    const next = [a, c].filter((n) => n !== -1).sort((x, y) => x - y)[0]
    if (next === undefined) { out += src.slice(i); break }
    const brace = src.indexOf('{', next)
    const end = brace === -1 ? -1 : matchBrace(src, brace)
    out += src.slice(i, next)
    if (end === -1) { out += src.slice(next); break }
    i = end
  }
  return out
}

function lineOf(src, index) {
  return src.slice(0, index).split('\n').length
}

const raw = await readFile(TARGET, 'utf8')
const stripped = stripStyles(raw)
const chunks = []

// (1) Content strings in the page's data arrays.
const keyRe = new RegExp(
  `\\b(${CONTENT_KEYS.join('|')})\\s*:\\s*(['"\`])((?:\\\\.|(?!\\2)[^\\\\])*)\\2`,
  'gs',
)
for (const m of stripped.matchAll(keyRe)) chunks.push({ text: m[3], at: m.index })

// (2) JSX text. Take the component body, drop tags and short inline
//     expressions ({' '}, {i + 1}, {item.body}); whatever remains is text.
const bodyStart = stripped.indexOf('export default function')
if (bodyStart !== -1) {
  const jsx = stripped
    .slice(bodyStart)
    .replace(/\{[^{}\n]{0,60}\}/g, ' ')  // short single-line expressions
    .replace(/<[^>]*>/g, ' ')            // tags, with their attributes
  for (const m of jsx.matchAll(/[^\s][^\n]*/g)) {
    const t = m[0].trim()
    if (t) chunks.push({ text: t, at: bodyStart + m.index })
  }
}

const violations = []
for (const { text, at } of chunks) {
  let scan = text
  for (const rx of ALLOWED) scan = scan.replace(rx, '')
  const hits = [...new Set([...scan.matchAll(/\d[\d,._]*\s*%?/g)].map((m) => m[0].trim()).filter(Boolean))]
  if (hits.length) {
    violations.push({
      line: lineOf(stripped, at),
      hits,
      text: text.length > 140 ? text.slice(0, 140) + '…' : text,
    })
  }
}

const rel = relative(projectDir, TARGET)

if (violations.length) {
  console.error('')
  console.error(`  ✗  ${rel} contains numbers in prose.`)
  console.error('')
  console.error('     /criteria describes a PROCESS, not a scoreboard. Corpus counts,')
  console.error('     coverage percentages and "N repos so far" go stale on the next')
  console.error('     auditor run and make the page false. Per-repo facts belong in')
  console.error('     the record that each listing links to.')
  console.error('')
  for (const v of violations) {
    console.error(`     line ~${v.line}  found: ${v.hits.join('  ')}`)
    console.error(`       "${v.text}"`)
    console.error('')
  }
  console.error('     If a number really is part of the PROCESS and not the corpus')
  console.error('     (a new gate number, say), add a narrow pattern to ALLOWED in')
  console.error('     scripts/check-criteria-stats.mjs.')
  console.error('')
  process.exit(1)
}

console.log(`  ✓  ${rel}: process-only, no corpus statistics in prose.`)
