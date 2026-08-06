// Component-type directory data for the "Claude" section.
// SAMPLES ONLY — a layout preview. Nothing here is audited or ranked;
// real listings replace these once the pipeline covers each type.

export interface TypeSample {
  name: string
  source?: string
  description: string
  tag: string
}

export interface ClaudeType {
  slug: string
  label: string
  blurb: string
  value: string
  samples: TypeSample[]
}

export const CLAUDE_TYPES: ClaudeType[] = [
  {
    slug: 'skills',
    label: 'Skills',
    blurb: 'Capabilities the agent invokes for a task — a SKILL.md plus optional scripts. Find what it does, and whether it is the standard one or a novel one.',
    value: 'Discovery + safety',
    samples: [
      { name: 'document-skills', source: 'anthropics/skills', description: 'Read, edit, and create Word, Excel, PDF, and PowerPoint files.', tag: 'documents' },
      { name: 'skill-creator', source: 'anthropics/skills', description: 'Build and iteratively improve skills with an eval loop.', tag: 'meta' },
      { name: 'pdf-tools', source: 'community', description: 'Extract, split, and fill PDF forms from natural language.', tag: 'documents' },
    ],
  },
  {
    slug: 'agents',
    label: 'Agents',
    blurb: 'Delegable roles with scoped tool grants. The card shows the role and the tools it can use — over-broad grants get flagged.',
    value: 'Discovery + safety',
    samples: [
      { name: 'code-reviewer', source: 'wshobson/agents', description: 'Reviews a diff for correctness, security, and style.', tag: 'review' },
      { name: 'test-writer', source: 'community', description: 'Generates unit tests for a target file.', tag: 'testing' },
      { name: 'security-auditor', source: 'community', description: 'Flags injection, secrets, and unsafe calls in a change.', tag: 'security' },
    ],
  },
  {
    slug: 'commands',
    label: 'Commands',
    blurb: 'Canned actions you invoke by name. Browse by the task they do; the standard versions cluster, the novel ones stand out.',
    value: 'Discovery',
    samples: [
      { name: '/commit', source: 'community', description: 'Draft a conventional-commit message from staged changes.', tag: 'git' },
      { name: '/review', source: 'community', description: 'Summarize and critique the current diff.', tag: 'review' },
      { name: '/test', source: 'community', description: 'Run the tests and triage the failures.', tag: 'testing' },
    ],
  },
  {
    slug: 'hooks',
    label: 'Hooks',
    blurb: 'Scripts that auto-fire on events. This is a safety-forward type: the card leads with what runs, when, and the sandbox verdict.',
    value: 'Safety first',
    samples: [
      { name: 'hookify', source: 'community', description: 'Create hooks from natural language.', tag: 'meta' },
      { name: 'session-guard', source: 'community', description: 'Injects reminders on SessionStart.', tag: 'safety' },
      { name: 'secret-blocker', source: 'community', description: 'Blocks tool calls that would commit credentials.', tag: 'safety' },
    ],
  },
  {
    slug: 'mcp-servers',
    label: 'MCP Servers',
    blurb: 'Connectors to a tool or service. The card shows what it connects to, the tools it exposes, and its credential/egress surface.',
    value: 'Discovery + safety',
    samples: [
      { name: 'github-mcp', source: 'modelcontextprotocol/servers', description: 'List repos, read files, and open issues over the GitHub API.', tag: 'git' },
      { name: 'filesystem-mcp', source: 'modelcontextprotocol/servers', description: 'Scoped read/write access to a local directory.', tag: 'files' },
      { name: 'postgres-mcp', source: 'community', description: 'Query and inspect a Postgres database.', tag: 'data' },
    ],
  },
  {
    slug: 'lsp-servers',
    label: 'LSP Servers',
    blurb: 'Language support during a session — completions, diagnostics, go-to-definition. Browse by language and capability.',
    value: 'Discovery',
    samples: [
      { name: 'pyright-bridge', source: 'community', description: 'Python type-checking and hovers in-session.', tag: 'python' },
      { name: 'typescript-lsp', source: 'community', description: 'TS/JS completions, diagnostics, and go-to-definition.', tag: 'javascript' },
      { name: 'rust-analyzer-bridge', source: 'community', description: 'Rust diagnostics and inlay hints.', tag: 'rust' },
    ],
  },
  {
    slug: 'output-styles',
    label: 'Output Styles',
    blurb: 'A formatting flavor for responses. A visual, discovery-first type — pick by a sample of the look, nothing to audit.',
    value: 'Discovery',
    samples: [
      { name: 'Concise', source: 'community', description: 'Terse, no-preamble answers.', tag: 'brevity' },
      { name: 'Tutor', source: 'community', description: 'Explains step by step and checks understanding.', tag: 'teaching' },
      { name: 'Executive', source: 'community', description: 'Bottom-line-up-front summaries.', tag: 'business' },
    ],
  },
  {
    slug: 'themes',
    label: 'Themes',
    blurb: 'Color and style only. Pure discovery — pick by the look; there is nothing to audit, and we say so.',
    value: 'Discovery',
    samples: [
      { name: 'Nebula', source: 'community', description: 'Deep indigo with violet accents.', tag: 'dark' },
      { name: 'Evergreen', source: 'community', description: 'Forest greens on near-black.', tag: 'dark' },
      { name: 'Warm Paper', source: 'community', description: 'Cream and terracotta, light.', tag: 'light' },
    ],
  },
  {
    slug: 'monitors',
    label: 'Monitors',
    blurb: 'Background insight during a session. The card shows what it watches and its resource cost, plus a safety verdict.',
    value: 'Safety + utility',
    samples: [
      { name: 'token-usage', source: 'community', description: 'Live token spend during a session.', tag: 'cost' },
      { name: 'test-watch', source: 'community', description: 'Re-runs affected tests on file change.', tag: 'testing' },
      { name: 'build-status', source: 'community', description: 'Surfaces CI status inline.', tag: 'ci' },
    ],
  },
  {
    slug: 'workflows',
    label: 'Workflows',
    blurb: 'Multi-step recipes that chain components. Browse by the job they do and the steps they orchestrate.',
    value: 'Discovery',
    samples: [
      { name: 'spec-to-pr', source: 'community', description: 'Turn a spec into a branch, code, tests, and a PR.', tag: 'automation' },
      { name: 'research-summarize', source: 'community', description: 'Gather sources and produce a cited brief.', tag: 'research' },
      { name: 'migrate-framework', source: 'community', description: 'Port a codebase across framework versions.', tag: 'migration' },
    ],
  },
]

export const TYPE_SLUGS = CLAUDE_TYPES.map((t) => t.slug)
export function getType(slug: string): ClaudeType | undefined {
  return CLAUDE_TYPES.find((t) => t.slug === slug)
}
