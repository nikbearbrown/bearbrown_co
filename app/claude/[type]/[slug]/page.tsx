import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CLAUDE_TYPES, getType, getTypeSample, sampleSlug } from '@/data/claude-types'

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

export function generateStaticParams() {
  return CLAUDE_TYPES.flatMap((type) =>
    type.samples.map((sample) => ({ type: type.slug, slug: sampleSlug(sample) })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, slug } = await params
  const entry = getTypeSample(type, slug)
  if (!entry) return {}
  return { title: `${entry.name} — ${getType(type)?.label} Example — Bear Brown`, description: entry.description }
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '32px 0', borderTop: '1px solid var(--p-border)' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--p-terra)', marginBottom: '8px' }}>{eyebrow}</p>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '24px', color: 'var(--p-ink)', marginBottom: '18px' }}>{title}</h2>
      {children}
    </section>
  )
}

const listStyle: React.CSSProperties = { fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.75, color: 'var(--p-ink-soft)', paddingLeft: '20px', margin: 0 }

export default async function ClaudeExamplePage({ params }: Props) {
  const { type, slug } = await params
  const typeInfo = getType(type)
  const entry = getTypeSample(type, slug)
  const guide = GUIDES[type]
  if (!typeInfo || !entry || !guide) notFound()

  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>
      <main style={{ maxWidth: '820px', margin: '0 auto', padding: 'clamp(44px, 7vw, 84px) clamp(24px, 5vw, 48px)' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--p-ink-muted)', marginBottom: '32px' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Claude Tools</Link>
          {' / '}
          <Link href={`/claude/${type}`} style={{ color: 'inherit', textDecoration: 'none' }}>{typeInfo.label}</Link>
          {' / '}{entry.name}
        </p>

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--p-terra)', marginBottom: '16px' }}>Illustrative {guide.unit}</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, color: 'var(--p-ink)', marginBottom: '20px' }}>{entry.name}</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '17px', lineHeight: 1.7, color: 'var(--p-ink-soft)', maxWidth: '680px', marginBottom: '28px' }}>{entry.description}</p>
        <span style={{ display: 'inline-block', fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.06em', color: 'var(--p-ink-muted)', border: '1px solid var(--p-border-strong)', padding: '4px 10px', borderRadius: '3px', marginBottom: '40px' }}>{entry.tag}</span>

        <div style={{ background: 'var(--p-bg-card)', border: '1px solid var(--p-border)', borderRadius: '6px', padding: '18px 20px', marginBottom: '12px' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.6, color: 'var(--p-ink-muted)', margin: 0 }}>Template example — this page demonstrates the content and audit structure for a future listing. It is not an installable component or an audit verdict.</p>
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

        <Section eyebrow="Illustrative configuration" title="What a source file might look like">
          <pre style={{ background: 'var(--p-bg-card)', border: '1px solid var(--p-border)', borderRadius: '6px', padding: '20px', overflowX: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '12px', lineHeight: 1.65, color: 'var(--p-ink-soft)', whiteSpace: 'pre-wrap' }}><code>{guide.example}</code></pre>
        </Section>

        <p style={{ marginTop: '28px' }}><Link href={`/claude/${type}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--p-terra)', textDecoration: 'none' }}>← Back to {typeInfo.label}</Link></p>
      </main>
    </div>
  )
}
