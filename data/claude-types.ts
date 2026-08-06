// Component-type directory data for the "Claude" section.
// Neutral starter content for reviewing the component-type page templates.
// These examples are illustrative, not listings, audit verdicts, or rankings.

export interface TypeSample {
  slug?: string
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
      { name: 'Document Builder', description: 'Creates and edits structured documents, with optional rendering scripts for visual checks.', tag: 'files + scripts' },
      { name: 'Data Workbook', description: 'Builds, analyzes, and validates spreadsheets while preserving formulas and formatting.', tag: 'data' },
      { name: 'Research Brief', description: 'Turns source material into a concise, cited research brief with a repeatable workflow.', tag: 'research' },
      { name: 'Skill Evaluator', description: 'Tests whether another skill triggers reliably and produces the intended result.', tag: 'evaluation' },
      { name: 'Accessibility Review', description: 'Checks interfaces and documents against an accessibility rubric and reports findings.', tag: 'review' },
    ],
  },
  {
    slug: 'agents',
    label: 'Agents',
    blurb: 'Delegable roles with scoped tool grants. The card shows the role and the tools it can use — over-broad grants get flagged.',
    value: 'Discovery + safety',
    samples: [
      { name: 'Code Reviewer', description: 'Reviews a diff for correctness, security, maintainability, and project conventions.', tag: 'read-only' },
      { name: 'Test Engineer', description: 'Designs focused tests for changed behavior and reports gaps without editing production code.', tag: 'testing' },
      { name: 'Security Auditor', description: 'Inspects code and configuration for injection, secrets, unsafe permissions, and risky defaults.', tag: 'security' },
      { name: 'Documentation Editor', description: 'Improves technical documentation with scoped read and edit access.', tag: 'docs' },
      { name: 'Architecture Explorer', description: 'Maps entry points, dependencies, and data flow using read-only repository tools.', tag: 'exploration' },
    ],
  },
  {
    slug: 'commands',
    label: 'Commands',
    blurb: 'Canned actions you invoke by name. Browse by the task they do; the standard versions cluster, the novel ones stand out.',
    value: 'Discovery',
    samples: [
      { name: '/review', description: 'Review the current diff and return prioritized, actionable findings.', tag: 'review' },
      { name: '/test', description: 'Run the relevant test suite, triage failures, and summarize the evidence.', tag: 'testing' },
      { name: '/document', description: 'Update project documentation from the current source of truth.', tag: 'docs' },
      { name: '/release-check', description: 'Check versioning, changelog, tests, and build readiness before a release.', tag: 'release' },
      { name: '/explain', description: 'Explain a selected file or feature from entry point to output.', tag: 'learning' },
    ],
  },
  {
    slug: 'hooks',
    label: 'Hooks',
    blurb: 'Scripts that auto-fire on events. This is a safety-forward type: the card leads with what runs, when, and the sandbox verdict.',
    value: 'Safety first',
    samples: [
      { name: 'Session Context', description: 'Loads a short project briefing automatically when a session begins.', tag: 'SessionStart' },
      { name: 'Secret Guard', description: 'Checks proposed shell commands and file writes for exposed credentials before execution.', tag: 'PreToolUse' },
      { name: 'Format After Edit', description: 'Runs the project formatter after supported source files change.', tag: 'PostToolUse' },
      { name: 'Prompt Policy Check', description: 'Checks submitted prompts against project policy before the agent continues.', tag: 'UserPromptSubmit' },
      { name: 'Session Summary', description: 'Writes a compact work summary when the session ends.', tag: 'SessionEnd' },
    ],
  },
  {
    slug: 'mcp-servers',
    label: 'MCP Servers',
    blurb: 'Connectors to a tool or service. The card shows what it connects to, the tools it exposes, and its credential/egress surface.',
    value: 'Discovery + safety',
    samples: [
      { name: 'Git Provider', description: 'Reads repositories, issues, pull requests, and review metadata through a hosted API.', tag: 'credentials' },
      { name: 'Local Files', description: 'Provides scoped read and write access to explicitly approved directories.', tag: 'local stdio' },
      { name: 'SQL Database', description: 'Inspects schemas and runs constrained queries against a configured database.', tag: 'data' },
      { name: 'Team Knowledge', description: 'Searches and retrieves pages from a shared documentation workspace.', tag: 'network' },
      { name: 'Browser Automation', description: 'Exposes page navigation, inspection, screenshots, and interaction tools.', tag: 'browser' },
    ],
  },
  {
    slug: 'lsp-servers',
    label: 'LSP Servers',
    blurb: 'Language support during a session — completions, diagnostics, go-to-definition. Browse by language and capability.',
    value: 'Discovery',
    samples: [
      { name: 'TypeScript', description: 'Provides diagnostics, definitions, references, and type information for JS and TS.', tag: 'JS / TS' },
      { name: 'Python', description: 'Provides Python type checking, diagnostics, completion, and navigation.', tag: 'Python' },
      { name: 'Rust', description: 'Provides Rust diagnostics, macro expansion, references, and type information.', tag: 'Rust' },
      { name: 'Go', description: 'Provides Go diagnostics, completion, formatting, and symbol navigation.', tag: 'Go' },
      { name: 'Swift', description: 'Provides Swift completion, diagnostics, definitions, and refactoring support.', tag: 'Swift' },
    ],
  },
  {
    slug: 'output-styles',
    label: 'Output Styles',
    blurb: 'A formatting flavor for responses. A visual, discovery-first type — pick by a sample of the look, nothing to audit.',
    value: 'Discovery',
    samples: [
      { name: 'Concise', description: 'Uses short answers, direct recommendations, and minimal preamble.', tag: 'brevity' },
      { name: 'Teaching', description: 'Explains decisions step by step and introduces unfamiliar concepts as needed.', tag: 'learning' },
      { name: 'Executive Brief', description: 'Leads with the decision, impact, risks, and recommended next action.', tag: 'business' },
      { name: 'Evidence First', description: 'Separates verified facts, inferences, uncertainties, and open questions.', tag: 'analysis' },
      { name: 'Review Findings', description: 'Formats findings by severity with file references and concrete fixes.', tag: 'review' },
    ],
  },
  {
    slug: 'themes',
    label: 'Themes',
    blurb: 'Color and style only. Pure discovery — pick by the look; there is nothing to audit, and we say so.',
    value: 'Discovery',
    samples: [
      { name: 'Warm Paper', description: 'Cream surfaces, charcoal text, and terracotta accents for a quiet editorial feel.', tag: 'light' },
      { name: 'Midnight', description: 'Deep navy surfaces with cool blue accents and high-contrast text.', tag: 'dark' },
      { name: 'Terminal Green', description: 'Near-black background with restrained green status and focus colors.', tag: 'dark' },
      { name: 'High Contrast', description: 'Maximum text and control contrast with minimal decorative color.', tag: 'accessible' },
      { name: 'Soft Slate', description: 'Neutral slate surfaces with muted blue highlights for long sessions.', tag: 'neutral' },
    ],
  },
  {
    slug: 'monitors',
    label: 'Monitors',
    blurb: 'Background insight during a session. The card shows what it watches and its resource cost, plus a safety verdict.',
    value: 'Safety + utility',
    samples: [
      { name: 'Test Watch', description: 'Watches changed files and surfaces relevant test failures during the session.', tag: 'persistent' },
      { name: 'Build Health', description: 'Tracks local build status and reports transitions from passing to failing.', tag: 'build' },
      { name: 'Token Budget', description: 'Reports context growth and warns when the session approaches a configured limit.', tag: 'cost' },
      { name: 'Service Status', description: 'Watches configured development services and reports outages and recoveries.', tag: 'network' },
      { name: 'Work Queue', description: 'Streams changes from a local task queue into the active session.', tag: 'events' },
    ],
  },
  {
    slug: 'workflows',
    label: 'Workflows',
    blurb: 'Multi-step recipes that chain components. Browse by the job they do and the steps they orchestrate.',
    value: 'Discovery',
    samples: [
      { name: 'Spec to Pull Request', description: 'Turns an approved specification into a plan, implementation, tests, review, and pull request.', tag: 'delivery' },
      { name: 'Research and Verify', description: 'Collects sources, drafts a synthesis, then runs an independent evidence check.', tag: 'research' },
      { name: 'Dependency Upgrade', description: 'Plans an upgrade, edits configuration, runs tests, and documents compatibility changes.', tag: 'maintenance' },
      { name: 'Incident Triage', description: 'Collects logs, forms hypotheses, tests likely causes, and produces a recovery brief.', tag: 'operations' },
      { name: 'Release Readiness', description: 'Chains linting, tests, security review, documentation checks, and release notes.', tag: 'release' },
    ],
  },
]

export const TYPE_SLUGS = CLAUDE_TYPES.map((t) => t.slug)
export function getType(slug: string): ClaudeType | undefined {
  return CLAUDE_TYPES.find((t) => t.slug === slug)
}

export function sampleSlug(sample: TypeSample): string {
  return sample.slug ?? sample.name
    .toLowerCase()
    .replace(/^\//, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getTypeSample(typeSlug: string, entrySlug: string): TypeSample | undefined {
  return getType(typeSlug)?.samples.find((sample) => sampleSlug(sample) === entrySlug)
}
