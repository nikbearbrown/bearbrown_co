import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CLAUDE_TYPES, getType, getTypeSample, sampleSlug } from '@/data/claude-types'
import { getAllAuditEntries, getAuditEntry } from '@/lib/ingest'
import type { AuditEntry, AuditTest } from '@/data/catalog/audit-entry'

interface Props {
  params: Promise<{ type: string; slug: string }>
}

interface TypeGuide {
  unit: string
  contents: string[]
  flow: string[]
  audit: string[]
  example: string
}

const GUIDES: Record<string, TypeGuide> = {
  skills: {
    unit: 'SKILL.md capability',
    contents: ['YAML frontmatter describing when the skill should load', 'Task instructions and decision rules in SKILL.md', 'Optional scripts, references, templates, or assets'],
    flow: ['The user asks for a relevant task', 'The agent recognizes the skill description', 'The skill instructions enter context', 'The agent follows the workflow and verifies the result'],
    audit: ['Trigger description is specific and reliable', 'Instructions are complete without hidden assumptions', 'Bundled scripts declare dependencies and avoid unsafe execution'],
    example: `---\nname: document-builder\ndescription: Create or revise structured documents when layout and visual verification matter.\nallowed-tools: Read, Write, Bash\n---\n\n# Document Builder\n\n1. Inspect the source material.\n2. Build the document from the approved template.\n3. Render a preview.\n4. Verify every page before delivery.`,
  },
  agents: {
    unit: 'delegable role',
    contents: ['A focused role and delegation description', 'A system prompt defining responsibilities and boundaries', 'An explicit tool grant and optional model choice'],
    flow: ['The parent agent identifies a bounded subtask', 'It delegates with the minimum required context', 'The subagent works within its tool scope', 'It returns evidence in a defined response format'],
    audit: ['Tool grants match the job', 'The role has clear stop conditions', 'Outputs cite evidence instead of asserting success'],
    example: `---\nname: code-reviewer\ndescription: Review completed changes for correctness, security, and maintainability.\ntools: Read, Grep, Glob\nmodel: inherit\n---\n\nReview the requested diff. Report only actionable findings, ordered by severity, with file and line references. Do not edit files.`,
  },
  commands: {
    unit: 'named canned action',
    contents: ['A Markdown command file', 'A concise purpose and argument contract', 'A repeatable prompt or execution recipe'],
    flow: ['The user invokes the command by name', 'Arguments are parsed and validated', 'The command performs its defined action', 'A stable result or status is returned'],
    audit: ['Arguments cannot silently expand scope', 'Prompt text resists instruction injection', 'Side effects are explicit before execution'],
    example: `---\ndescription: Review the current diff and return prioritized findings.\nargument-hint: [base-branch]\nallowed-tools: Read, Grep, Glob, Bash(git diff:*)\n---\n\nReview the diff against the requested base branch. Return findings first, then a short coverage summary.`,
  },
  hooks: {
    unit: 'event-triggered script',
    contents: ['An event name and optional matcher', 'A command, prompt, or HTTP action', 'Timeout, dependency, and failure behavior'],
    flow: ['Claude Code emits a lifecycle event', 'The matcher decides whether the hook applies', 'The configured action runs automatically', 'Its result allows, blocks, or annotates the event'],
    audit: ['Automatic execution is visible and justified', 'Shell input is quoted and validated', 'Timeouts, dependencies, and failure modes are declared'],
    example: `{\n  "hooks": {\n    "PreToolUse": [{\n      "matcher": "Bash|Write",\n      "hooks": [{\n        "type": "command",\n        "command": "python3 scripts/check_secrets.py",\n        "timeout": 10\n      }]\n    }]\n  }\n}`,
  },
  'mcp-servers': {
    unit: 'tool or service connector',
    contents: ['A local stdio command or remote server URL', 'A tool and resource surface exposed to the agent', 'Credential, environment, and network configuration'],
    flow: ['The client starts or connects to the server', 'The server advertises tools and resources', 'The agent calls a selected tool', 'The server returns structured results'],
    audit: ['Credentials remain outside prompts and source files', 'Egress destinations and write capabilities are clear', 'Tool schemas constrain dangerous parameters'],
    example: `{\n  "mcpServers": {\n    "example-service": {\n      "command": "node",\n      "args": ["dist/server.js"],\n      "env": { "API_TOKEN": "\${EXAMPLE_API_TOKEN}" }\n    }\n  }\n}`,
  },
  'lsp-servers': {
    unit: 'language-server integration',
    contents: ['A language identifier and file-extension mapping', 'The language-server command and arguments', 'Initialization or workspace configuration'],
    flow: ['A supported source file is opened', 'The language server indexes the workspace', 'The client requests diagnostics or symbol information', 'Structured language intelligence returns to the agent'],
    audit: ['The executable and version are documented', 'Workspace scope is constrained', 'Initialization does not run unexpected project code'],
    example: `{\n  "language": "typescript",\n  "extensions": [".ts", ".tsx", ".js", ".jsx"],\n  "command": "typescript-language-server",\n  "args": ["--stdio"]\n}`,
  },
  'output-styles': {
    unit: 'response-format contract',
    contents: ['YAML frontmatter with a name and description', 'Tone, structure, and formatting instructions', 'A choice about preserving coding instructions'],
    flow: ['The user selects an output style', 'The style modifies the session response contract', 'Claude formats subsequent answers consistently', 'The user can switch back to another style'],
    audit: ['Frontmatter is valid', 'Instructions change presentation rather than authority', 'The style does not conceal uncertainty or safety warnings'],
    example: `---\nname: Evidence First\ndescription: Separate verified facts, inferences, and open questions.\nkeep-coding-instructions: true\n---\n\nLead with the outcome. Label evidence, inference, uncertainty, and recommended next action explicitly.`,
  },
  themes: {
    unit: 'color and style configuration',
    contents: ['Named color tokens', 'Light or dark appearance metadata', 'Optional typography and spacing tokens'],
    flow: ['The theme is discovered from configuration', 'The user selects it', 'Tokens map to interface surfaces', 'The interface updates without executing code'],
    audit: ['Configuration parses against the schema', 'Text and controls meet contrast requirements', 'No executable content is embedded'],
    example: `{\n  "name": "Warm Paper",\n  "appearance": "light",\n  "colors": {\n    "background": "#F5F0E8",\n    "foreground": "#29261F",\n    "accent": "#B75A3A"\n  }\n}`,
  },
  monitors: {
    unit: 'session-lifetime background process',
    contents: ['A persistent command', 'An activation condition', 'A structured notification stream'],
    flow: ['The monitor starts for the session or selected skill', 'It watches files, services, logs, or events', 'State changes become structured notifications', 'The process stops when the session ends'],
    audit: ['CPU, memory, and polling costs are bounded', 'The process has an explicit shutdown path', 'Filesystem and network scope match the stated purpose'],
    example: `{\n  "name": "test-watch",\n  "command": "node scripts/watch-tests.js",\n  "when": "always",\n  "sandbox": true\n}`,
  },
  workflows: {
    unit: 'multi-step component recipe',
    contents: ['An ordered set of phases', 'Agents, skills, commands, or scripts used by each phase', 'Inputs, outputs, gates, and stop conditions'],
    flow: ['The workflow validates its input', 'Each phase produces an explicit artifact', 'Gates decide whether the next phase may begin', 'The final phase verifies the requested outcome'],
    audit: ['Every phase has bounded authority', 'Artifacts and state transitions are inspectable', 'Failure, retry, and rollback behavior are defined'],
    example: `export default {\n  name: "release-readiness",\n  phases: [\n    { name: "quality", run: ["lint", "test"] },\n    { name: "review", agents: ["code-reviewer", "security-auditor"] },\n    { name: "release", requires: ["quality:pass", "review:pass"] }\n  ]\n}`,
  },
}

// ── Static params: real audit entries + illustrative samples ──────────────────

export async function generateStaticParams() {
  const illustrative = CLAUDE_TYPES.flatMap((type) =>
    type.samples.map((sample) => ({ type: type.slug, slug: sampleSlug(sample) })),
  )

  const auditEntries = await getAllAuditEntries().catch(() => [])
  const real = auditEntries.map(e => ({ type: e.typeSlug, slug: e.urlSlug }))

  return [...illustrative, ...real]
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, slug } = await params

  const auditEntry = await getAuditEntry(type, slug)
  if (auditEntry) {
    return {
      title: `${auditEntry.name} — ${getType(type)?.label ?? type} — Bear Brown`,
      description: auditEntry.description.slice(0, 155),
    }
  }

  const entry = getTypeSample(type, slug)
  if (!entry) return {}
  return { title: `${entry.name} — ${getType(type)?.label} Example — Bear Brown`, description: entry.description }
}

// ── Shared layout helpers ─────────────────────────────────────────────────────

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '32px 0', borderTop: '1px solid var(--p-border)' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--p-terra)', marginBottom: '8px' }}>{eyebrow}</p>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '24px', color: 'var(--p-ink)', marginBottom: '18px' }}>{title}</h2>
      {children}
    </section>
  )
}

const listStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.75,
  color: 'var(--p-ink-soft)', paddingLeft: '20px', margin: 0,
}

// ── Real audit entry detail page ──────────────────────────────────────────────

function testStateColor(state: AuditTest['state']): string {
  if (state === 'ran')      return 'var(--p-blue)'
  if (state === 'deferred') return 'var(--p-ink-muted)'
  return 'var(--p-ink-muted)'
}

function testStateLabel(state: AuditTest['state']): string {
  if (state === 'ran')      return 'ran'
  if (state === 'deferred') return 'deferred'
  return 'n/a'
}

function coverageColor(label: string): string {
  if (label.startsWith('CLEARED')) return 'var(--p-blue)'
  if (label.startsWith('QUARANTINE')) return 'var(--p-vermilion)'
  return 'var(--p-ink-muted)'
}

function portabilityLabel(p: string): string {
  if (p === 'agent-agnostic') return 'Agent-agnostic (works beyond Claude)'
  if (p === 'mcp-portable')   return 'MCP-portable'
  return 'Claude-only'
}

function AuditDetailPage({ entry, typeInfo }: { entry: AuditEntry; typeInfo: NonNullable<ReturnType<typeof getType>> }) {
  const passedTests  = entry.tests.filter(t => t.state === 'ran').length
  const totalTests   = entry.tests.length

  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>
      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: 'clamp(44px, 7vw, 84px) clamp(24px, 5vw, 48px)' }}>

        {/* Breadcrumb */}
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--p-ink-muted)', marginBottom: '32px' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Claude Tools</Link>
          {' / '}
          <Link href={`/claude/${entry.typeSlug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{typeInfo.label}</Link>
          {' / '}{entry.name}
        </p>

        {/* Header */}
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--p-terra)', marginBottom: '16px' }}>
          {typeInfo.label} · {entry.owner}/{entry.repo}
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, color: 'var(--p-ink)', marginBottom: '20px' }}>
          {entry.name}
        </h1>
        {entry.description && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '17px', lineHeight: 1.7, color: 'var(--p-ink-soft)', maxWidth: '760px', marginBottom: '28px' }}>
            {entry.description}
          </p>
        )}

        {/* Coverage badge + meta chips */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '40px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.06em', color: coverageColor(entry.coverage.label), border: `1px solid ${coverageColor(entry.coverage.label)}`, padding: '4px 10px', borderRadius: '3px' }}>
            {entry.coverage.label}
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-ink-muted)', border: '1px solid var(--p-border-strong)', padding: '4px 10px', borderRadius: '3px' }}>
            {entry.portability}
          </span>
          {entry.version && (
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-ink-muted)', border: '1px solid var(--p-border-strong)', padding: '4px 10px', borderRadius: '3px' }}>
              v{entry.version}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-10 items-start">
          <div>

            {/* Stats row */}
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '12px' }}>Pipeline results</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                {[
                  ['Coverage', entry.coverage.label],
                  ['Tests run', `${passedTests} / ${totalTests}`],
                  ['Portability', portabilityLabel(entry.portability)],
                  ['Type', typeInfo.label],
                ].map(([label, value]) => (
                  <div key={label} style={{ border: '1px solid var(--p-border)', background: 'var(--p-bg-card)', borderRadius: '6px', padding: '15px' }}>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '8px' }}>{label}</p>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--p-ink)', margin: 0, lineHeight: 1.2 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tests table */}
            <Section eyebrow="Tests &amp; results" title="What the pipeline checked">
              <div style={{ border: '1px solid var(--p-border)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 80px 1fr', background: 'var(--p-bg-card)', borderBottom: '1px solid var(--p-border)', padding: '10px 16px', gap: '12px' }}>
                  {['Test', 'State', 'Result or reason'].map(h => (
                    <span key={h} style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--p-ink-muted)' }}>{h}</span>
                  ))}
                </div>
                {entry.tests.map((test, i) => (
                  <div key={test.name} style={{ display: 'grid', gridTemplateColumns: '140px 80px 1fr', gap: '12px', padding: '12px 16px', borderBottom: i < entry.tests.length - 1 ? '1px solid var(--p-border)' : 'none', alignItems: 'start' }}>
                    <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '12px', color: 'var(--p-ink)' }}>{test.name}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: testStateColor(test.state) }}>{testStateLabel(test.state)}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--p-ink-soft)', lineHeight: 1.55 }}>{test.result_or_reason}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Components */}
            {entry.components.length > 0 && (
              <Section eyebrow="What&apos;s inside" title="Components found">
                <div style={{ display: 'grid', gap: '8px' }}>
                  {entry.components.map((c, i) => (
                    <div key={i} style={{ border: '1px solid var(--p-border)', borderRadius: '5px', padding: '12px 16px', background: 'var(--p-bg-card)', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '12px', color: 'var(--p-ink)' }}>{c.path}</span>
                        {c.description && (
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--p-ink-soft)', margin: '4px 0 0', lineHeight: 1.5 }}>{c.description}</p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--p-ink-muted)', border: '1px solid var(--p-border-strong)', padding: '2px 6px', borderRadius: '3px' }}>{c.type}</span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--p-ink-muted)', border: '1px solid var(--p-border-strong)', padding: '2px 6px', borderRadius: '3px' }}>{c.confidence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Coverage gaps (not_assessed) */}
            {entry.coverage.not_assessed.length > 0 && (
              <Section eyebrow="Coverage" title="Not assessed">
                <ul style={listStyle}>
                  {entry.coverage.not_assessed.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </Section>
            )}

            {/* README excerpt */}
            {entry.readmeHead && (
              <Section eyebrow="README" title="From the repository">
                <div style={{ background: 'var(--p-bg-card)', border: '1px solid var(--p-border)', borderRadius: '6px', padding: '20px' }}>
                  <pre style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.7, color: 'var(--p-ink-soft)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: 0 }}>
                    {entry.readmeHead.replace(/<[^>]+>/g, '').slice(0, 1200)}
                    {entry.readmeHead.length > 1200 && '…'}
                  </pre>
                </div>
              </Section>
            )}

          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24" style={{ display: 'grid', gap: '14px' }}>

            {/* Source */}
            <div style={{ border: '1px solid var(--p-border)', borderRadius: '6px', background: 'var(--p-bg-card)', padding: '18px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '16px' }}>Source</p>
              <a href={entry.repoUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--p-blue)', textDecoration: 'none', wordBreak: 'break-all' }}>
                {entry.owner}/{entry.repo} →
              </a>
            </div>

            {/* Receipts */}
            <div style={{ border: '1px solid var(--p-border)', borderRadius: '6px', background: 'var(--p-bg-card)', padding: '18px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '16px' }}>Audit receipts</p>
              {[
                ['Date',    entry.receipts.audited_date],
                ['Commit',  entry.receipts.commit_sha ?? 'pending'],
                ['Sandbox', entry.receipts.sandbox ? 'gVisor' : 'static-only'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--p-border)' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-ink-muted)' }}>{label}</span>
                  <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '11px', color: 'var(--p-ink)', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Adoption */}
            <div style={{ border: '1px solid var(--p-border)', borderRadius: '6px', background: 'var(--p-bg-card)', padding: '18px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '16px' }}>Adoption</p>
              {[
                ['Forks',       entry.adoption.forks !== null ? String(entry.adoption.forks) : '—'],
                ['Last commit', entry.adoption.last_commit
                  ? entry.adoption.last_commit.slice(0, 10)
                  : '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--p-border)' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-ink-muted)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-ink)', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
              {entry.author && (
                <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-ink-muted)' }}>Author</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-ink)', textAlign: 'right' }}>{entry.author}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div style={{ border: '1px solid var(--p-border)', borderRadius: '6px', background: 'var(--p-bg-card)', padding: '18px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '14px' }}>Tags</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {entry.tags.map(tag => (
                    <span key={tag} style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--p-ink-muted)', border: '1px solid var(--p-border-strong)', borderRadius: '3px', padding: '4px 7px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </aside>
        </div>

        <p style={{ marginTop: '28px' }}>
          <Link href={`/claude/${entry.typeSlug}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--p-terra)', textDecoration: 'none' }}>
            ← Back to {typeInfo.label}
          </Link>
        </p>
      </main>
    </div>
  )
}

// ── Page router ───────────────────────────────────────────────────────────────

export default async function ClaudeEntryPage({ params }: Props) {
  const { type, slug } = await params

  // Real audit entry takes priority
  const auditEntry = await getAuditEntry(type, slug)
  if (auditEntry) {
    const typeInfo = getType(type)
    if (!typeInfo) notFound()
    return <AuditDetailPage entry={auditEntry} typeInfo={typeInfo} />
  }

  // Fall back to illustrative sample (existing behavior)
  const typeInfo = getType(type)
  const entry    = getTypeSample(type, slug)
  const guide    = GUIDES[type]
  if (!typeInfo || !entry || !guide) notFound()

  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>
      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: 'clamp(44px, 7vw, 84px) clamp(24px, 5vw, 48px)' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--p-ink-muted)', marginBottom: '32px' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Claude Tools</Link>
          {' / '}
          <Link href={`/claude/${type}`} style={{ color: 'inherit', textDecoration: 'none' }}>{typeInfo.label}</Link>
          {' / '}{entry.name}
        </p>

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--p-terra)', marginBottom: '16px' }}>Illustrative {guide.unit}</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, color: 'var(--p-ink)', marginBottom: '20px' }}>{entry.name}</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '17px', lineHeight: 1.7, color: 'var(--p-ink-soft)', maxWidth: '760px', marginBottom: '28px' }}>{entry.description}</p>
        <span style={{ display: 'inline-block', fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.06em', color: 'var(--p-ink-muted)', border: '1px solid var(--p-border-strong)', padding: '4px 10px', borderRadius: '3px', marginBottom: '40px' }}>{entry.tag}</span>

        <div style={{ background: 'var(--p-bg-card)', border: '1px solid var(--p-border-strong)', borderRadius: '6px', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '6px', padding: '10px 14px', borderBottom: '1px solid var(--p-border)', background: 'var(--p-bg)' }}>
            {['Preview', 'Source shape', 'Audit notes'].map((tab, index) => <span key={tab} style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.05em', color: index === 0 ? 'var(--p-ink)' : 'var(--p-ink-muted)', border: index === 0 ? '1px solid var(--p-border-strong)' : '1px solid transparent', borderRadius: '3px', padding: '4px 8px' }}>{tab}</span>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 18px' }}>
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: 'var(--p-ink-muted)', fontSize: '13px' }}>$</span>
            <code style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: 'var(--p-ink-soft)', fontSize: '12px', overflowWrap: 'anywhere' }}>starter/{type}/{slug}</code>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-10 items-start">
          <div>
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '12px' }}>Template signals</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                {[['Status', 'Draft'], ['Audit', 'Not run'], ['Collection', typeInfo.label]].map(([label, value]) => (
                  <div key={label} style={{ border: '1px solid var(--p-border)', background: 'var(--p-bg-card)', borderRadius: '6px', padding: '15px' }}>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '8px' }}>{label}</p>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--p-ink)', margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Section eyebrow="Anatomy" title="What it contains">
              <ul style={listStyle}>{guide.contents.map((item) => <li key={item}>{item}</li>)}</ul>
            </Section>

            <Section eyebrow="Lifecycle" title="How it works">
              <ol style={listStyle}>{guide.flow.map((item) => <li key={item}>{item}</li>)}</ol>
            </Section>

            <Section eyebrow="Audit lens" title="What Bear Brown would check">
              <ul style={listStyle}>{guide.audit.map((item) => <li key={item}>{item}</li>)}</ul>
            </Section>

            <Section eyebrow="Content preview" title={type === 'skills' ? 'SKILL.md' : type === 'agents' ? 'Agent content' : type === 'commands' ? 'Command content' : type === 'hooks' ? 'Configuration' : type === 'workflows' ? 'Workflow script' : 'Example configuration'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-ink-muted)' }}>Editable starter content</span>
                <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '10px', color: 'var(--p-ink-muted)' }}>{guide.example.split('\n').length} lines</span>
              </div>
              <pre style={{ background: 'var(--p-bg-card)', border: '1px solid var(--p-border)', borderRadius: '6px', padding: '20px', overflowX: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '12px', lineHeight: 1.65, color: 'var(--p-ink-soft)', whiteSpace: 'pre-wrap' }}><code>{guide.example}</code></pre>
            </Section>

            <Section eyebrow="Related" title={`More ${typeInfo.label}`}>
              <div style={{ display: 'grid', gap: '10px' }}>
                {typeInfo.samples.filter((sample) => sampleSlug(sample) !== slug).slice(0, 3).map((sample) => (
                  <Link key={sample.name} href={`/claude/${type}/${sampleSlug(sample)}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '14px 16px', border: '1px solid var(--p-border)', borderRadius: '5px', textDecoration: 'none', background: 'var(--p-bg-card)' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', color: 'var(--p-ink)' }}>{sample.name}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--p-ink-muted)' }}>{sample.tag}</span>
                  </Link>
                ))}
              </div>
            </Section>
          </div>

          <aside className="lg:sticky lg:top-24" style={{ display: 'grid', gap: '14px' }}>
            <div style={{ border: '1px solid var(--p-border)', borderRadius: '6px', background: 'var(--p-bg-card)', padding: '18px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '16px' }}>Details</p>
              {[['Type', typeInfo.label], ['Shape', guide.unit], ['Status', 'Starter example'], ['Audit', 'Pending']].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '9px 0', borderBottom: '1px solid var(--p-border)' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-ink-muted)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-ink)', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ border: '1px solid var(--p-border)', borderRadius: '6px', background: 'var(--p-bg-card)', padding: '18px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '14px' }}>Tags</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[entry.tag, 'example', typeInfo.value.toLowerCase()].map((tag) => <span key={tag} style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--p-ink-muted)', border: '1px solid var(--p-border-strong)', borderRadius: '3px', padding: '4px 7px' }}>{tag}</span>)}
              </div>
            </div>
            <div style={{ border: '1px solid var(--p-border)', borderRadius: '6px', padding: '18px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '10px' }}>Next editorial step</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.6, color: 'var(--p-ink-soft)', margin: 0 }}>Replace this neutral example with a real listing, then attach installation, source, adoption, and audit evidence.</p>
            </div>
          </aside>
        </div>

        <p style={{ marginTop: '28px' }}><Link href={`/claude/${type}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--p-terra)', textDecoration: 'none' }}>← Back to {typeInfo.label}</Link></p>
      </main>
    </div>
  )
}
