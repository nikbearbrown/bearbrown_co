// AuditEntry — a real audited plugin/skill from the 24/7 auditor pipeline.
// Schema version 2 records only. Read from github.com/nikbearbrown/github-claude-plugins.

export type AuditEntryType =
  | 'skill' | 'agent' | 'command' | 'hook'
  | 'mcp-server' | 'lsp-server' | 'output-style'
  | 'theme' | 'monitor' | 'workflow' | 'plugin'

export type AuditPortability = 'claude-only' | 'mcp-portable' | 'agent-agnostic'
export type TestState = 'ran' | 'deferred' | 'na'
export type ComponentConfidence = 'high' | 'medium' | 'low'

export interface AuditComponent {
  type: string
  path: string
  confidence: ComponentConfidence
  description?: string
}

export interface AuditTest {
  name: string
  by: string
  state: TestState
  result_or_reason: string
}

export interface AuditCoverage {
  label: string
  assessed: string[]
  not_assessed: string[]
}

export interface AuditReceipts {
  commit_sha: string | null
  audited_date: string   // YYYY-MM-DD
  sandbox: boolean
}

export interface AuditAdoption {
  forks: number | null
  last_commit: string | null  // ISO timestamp
}

export interface AuditEntry {
  // Identity
  id: string           // "owner__repo" from the record
  urlSlug: string      // "owner--repo" — safe for URL path segments
  typeSlug: string     // pluralized: "skills" | "agents" | ... (matches CLAUDE_TYPES)
  owner: string
  repo: string
  repoUrl: string

  // Manifest fields
  name: string
  description: string
  version: string
  author: string
  license: string

  // Audit shape (schema_version:2)
  type: AuditEntryType
  components: AuditComponent[]
  tests: AuditTest[]
  coverage: AuditCoverage
  receipts: AuditReceipts
  portability: AuditPortability
  adoption: AuditAdoption
  grade: string        // e.g. "CLEARED_STATIC"

  // Enriched at ingest time
  tags: string[]       // field[] + stack[] keywords
  readmeHead: string   // first ~4KB of README (from text_digest)

  // Meta
  auditedAt: string    // ISO timestamp
}

// Map record type to the URL slug used in /claude/[type]/
export const TYPE_SLUG_MAP: Record<string, string> = {
  'skill':        'skills',
  'agent':        'agents',
  'command':      'commands',
  'hook':         'hooks',
  'mcp-server':   'mcp-servers',
  'lsp-server':   'lsp-servers',
  'output-style': 'output-styles',
  'theme':        'themes',
  'monitor':      'monitors',
  'workflow':     'workflows',
  'plugin':       'skills',  // multi-type bundles appear under dominant type
}

export function recordTypeToUrlSlug(type: string): string {
  return TYPE_SLUG_MAP[type] ?? 'skills'
}

export function idToUrlSlug(id: string): string {
  return id.replace('__', '--')
}
