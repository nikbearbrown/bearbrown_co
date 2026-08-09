// Transform a raw schema_version:2 audit record into an AuditEntry.
// Conforms to the EXACT on-disk key names from the gomarble-ai/marketing-agent record
// (commit 52c93262). Never fabricates a missing field — absent data renders as absent.

import {
  AuditEntry,
  AuditEntryType,
  AuditPortability,
  ComponentConfidence,
  recordTypeToUrlSlug,
  idToUrlSlug,
} from '@/data/catalog/audit-entry'

// ── Field taxonomy (keyword-based enrichment at ingest time) ──────────────────

const FIELD_TAXONOMY: Record<string, string[]> = {
  devops:      ['deploy', 'kubernetes', 'k8s', 'docker', 'container', 'terraform',
                 'helm', 'ci/cd', 'pipeline', 'grafana', 'prometheus', 'infrastructure', 'cloud sql'],
  security:    ['security', 'auth', 'authentication', 'secret', 'credential', 'vulnerability',
                 'cve', 'pentest', 'scan', 'compliance', 'rbac', 'oauth', 'jwt', 'encryption'],
  data:        ['database', 'sql', 'postgres', 'postgresql', 'mysql', 'redis', 'mongodb',
                 'analytics', 'etl', 'dataframe', 'pandas', 'query', 'bigquery', 'snowflake',
                 'warehouse', 'spark'],
  docs:        ['documentation', 'readme', 'wiki', 'changelog', 'api reference',
                 'docstring', 'jsdoc', 'openapi', 'swagger'],
  testing:     ['test', 'spec', 'coverage', 'jest', 'pytest', 'mock', 'assert',
                 'tdd', 'bdd', 'cypress', 'playwright'],
  design:      ['design', 'figma', 'ui', 'ux', 'css', 'sass', 'tailwind',
                 'storybook', 'accessibility', 'a11y'],
  finance:     ['finance', 'billing', 'payment', 'stripe', 'invoice', 'accounting',
                 'revenue', 'budget', 'expense'],
  legal:       ['legal', 'compliance', 'gdpr', 'privacy', 'license', 'contract',
                 'terms of service', 'policy'],
  education:   ['education', 'learning', 'course', 'lesson', 'student', 'teacher',
                 'curriculum', 'quiz', 'tutor'],
  research:    ['research', 'paper', 'arxiv', 'pubmed', 'literature', 'citation',
                 'academic', 'scientific', 'experiment'],
  marketing:   ['marketing', 'campaign', 'seo', 'ads', 'google ads', 'meta ads',
                 'facebook ads', 'social media', 'email', 'brand', 'conversion', 'audience'],
  productivity: ['productivity', 'calendar', 'task management', 'project management',
                  'kanban', 'slack', 'linear', 'jira', 'notion', 'scheduling', 'automation'],
}

const STACK_MAP: Record<string, string[]> = {
  typescript:  ['typescript'],
  javascript:  ['javascript', 'node', 'nodejs'],
  python:      ['python'],
  go:          ['golang'],
  rust:        ['rust'],
  postgresql:  ['postgres', 'postgresql', 'cloud-sql', 'cloud sql'],
  kubernetes:  ['kubernetes', 'k8s'],
  docker:      ['docker', 'container'],
  graphql:     ['graphql'],
  rest:        ['rest api', 'openapi', 'swagger'],
}

function detectFields(text: string): string[] {
  const lower = text.toLowerCase()
  return Object.entries(FIELD_TAXONOMY)
    .filter(([, kws]) => kws.some(kw => lower.includes(kw)))
    .map(([field]) => field)
}

function detectStack(keywords: string[]): string[] {
  const lower = keywords.map(k => k.toLowerCase())
  return Object.entries(STACK_MAP)
    .filter(([, kws]) => kws.some(kw => lower.some(k => k.includes(kw))))
    .map(([stack]) => stack)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function str(v: unknown, fallback = ''): string {
  return v !== undefined && v !== null ? String(v) : fallback
}

function num(v: unknown): number | null {
  const n = Number(v)
  return isNaN(n) ? null : n
}

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? v as T[] : []
}

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

// ── Main transformer ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformRecord(raw: Record<string, unknown>): AuditEntry | null {
  if (raw.schema_version !== 2) return null

  const meta        = obj(raw.meta)
  const gate1       = obj(raw.gate1)
  const checks      = obj(gate1.checks)
  const manifest    = obj(checks.manifest_data)
  const gate3       = obj(raw.gate3)
  const gradeObj    = obj(raw.grade)
  const textDigest  = obj(raw.text_digest)
  const coverageObj = obj(raw.coverage)
  const receiptsObj = obj(raw.receipts)
  const adoptionObj = obj(raw.adoption)

  const owner = str(meta.owner)
  const repo  = str(meta.repo)
  if (!owner || !repo) return null

  const id       = str(raw.id, `${owner}__${repo}`)
  const urlSlug  = idToUrlSlug(id)
  const recType  = str(raw.type, 'skill')
  const typeSlug = recordTypeToUrlSlug(recType)

  // Manifest fields
  const name        = str(manifest.name, repo)
  const description = str(manifest.description)
  const version     = str(manifest.version)
  const license     = str(manifest.license)
  const authorRaw   = manifest.author
  const author      = typeof authorRaw === 'string'
    ? authorRaw
    : str(obj(authorRaw).name)
  const keywords = arr<string>(manifest.keywords).map(String)

  // Components (schema_version:2 top-level field)
  const components = arr<Record<string, unknown>>(raw.components).map(c => ({
    type:        str(c.type),
    path:        str(c.path),
    confidence:  str(c.confidence, 'low') as ComponentConfidence,
    description: c.description !== undefined ? str(c.description) : undefined,
  }))

  // Tests — emit exactly as recorded; never alter state
  const tests = arr<Record<string, unknown>>(raw.tests).map(t => ({
    name:             str(t.name),
    by:               str(t.by),
    state:            str(t.state, 'na') as 'ran' | 'deferred' | 'na',
    result_or_reason: str(t.result_or_reason),
  }))

  // Coverage
  const coverage = {
    label:        str(coverageObj.label),
    assessed:     arr<string>(coverageObj.assessed).map(String),
    not_assessed: arr<string>(coverageObj.not_assessed).map(String),
  }

  // Receipts
  const receipts = {
    commit_sha:   receiptsObj.commit_sha !== null ? str(receiptsObj.commit_sha) : null,
    audited_date: str(receiptsObj.audited_date),
    sandbox:      Boolean(receiptsObj.sandbox),
  }

  // Portability
  const portability = str(raw.portability, 'claude-only') as AuditPortability

  // Adoption — forks and last_commit from gate1 (Wave-1 captured fields)
  const adoption = {
    forks:       num(adoptionObj.forks),
    last_commit: adoptionObj.last_commit !== null ? str(adoptionObj.last_commit) || null : null,
  }

  // Grade
  const grade = str(gradeObj.grade)

  // README head from text_digest
  const readmeHead = str(textDigest.readme_head)

  // Enrich tags: field detection + stack from manifest keywords
  const digestComponents = arr<Record<string, unknown>>(textDigest.components)
  const enrichText = [
    description,
    readmeHead.slice(0, 2000), // use first 2KB to bound cost
    ...digestComponents.map(c => str(c.description)),
  ].join(' ')
  const fields = detectFields(enrichText)
  const stack  = detectStack(keywords)
  const tags   = [...new Set([...fields, ...stack])]

  return {
    id,
    urlSlug,
    typeSlug,
    owner,
    repo,
    repoUrl:   `https://github.com/${owner}/${repo}`,
    name,
    description,
    version,
    author,
    license,
    type:        recType as AuditEntryType,
    components,
    tests,
    coverage,
    receipts,
    portability,
    adoption,
    grade,
    tags,
    readmeHead,
    auditedAt: str(meta.audited_at),
  }
}
