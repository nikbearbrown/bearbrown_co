import type { CatalogEntry } from './types'

// Catalog entries — every entry has a completed audit.
// "No audit, no listing" is a hard rule: do not add an entry without
// filling in the audit block with a real sha, date, and check results.
const entries: CatalogEntry[] = [
  {
    slug: 'caveman',
    name: 'caveman',
    repoUrl: 'https://github.com/JuliusBrussee/caveman',
    description: 'Compresses Claude Code output using caveman-style speech — saves tokens in chat replies without touching code.',
    installCommand: '/plugin marketplace add JuliusBrussee/caveman\n/plugin install caveman@caveman',
    audit: {
      sha: '7066cc815414421f1ed29b42293cfb177a11db8c',
      date: '2026-08-03',
      installs: 'pass',
      installNote: 'Has .claude-plugin/ with marketplace.json and plugin.json. SessionStart and UserPromptSubmit hooks via Node 18+.',
      riskScan: 'clean',
      kind: 'code-backed',
      proseLines: 4234,
      codeLines: 11312,
      proseToCodeRatio: 0.37,
    },
    tier: 'excellent',
    dupes: {
      clusterNote: 'Several language-specific ports exist (cavemanov for Russian/Kazakh, others). This is the English original and the best-maintained.',
    },
    video: null,
    verdict: `Caveman is a tightly scoped, well-documented token-compression skill with clean hooks, zero runtime network calls, and benchmark numbers that are more carefully qualified than the headline suggests. The 65% token reduction is real for prose replies; the JetBrains-measured 8.5% applies to agentic coding runs, and the README explains both in the same paragraph — an unusual level of honesty for a plugin README. Hooks are purely local, install is standard, and the caveman-stats command gives users an actual receipt of session savings rather than a marketing promise.`,
    tags: ['productivity', 'token-efficiency', 'output-style'],
  },
  {
    slug: 'ponytail',
    name: 'ponytail',
    repoUrl: 'https://github.com/DietrichGebert/ponytail',
    description: 'Enforces YAGNI and minimal code by scanning for over-engineering, dead code, and unnecessary dependencies.',
    installCommand: '/plugin marketplace add DietrichGebert/ponytail\n/plugin install ponytail@ponytail',
    audit: {
      sha: '16f29800fd2681bdf24f3eb4ccffe38be3baec6b',
      date: '2026-08-03',
      installs: 'pass',
      installNote: 'Has .claude-plugin/ with marketplace.json and plugin.json (v4.8.4). Hooks for SessionStart, SubagentStart, UserPromptSubmit. Node required for lifecycle hooks; skills work without it.',
      riskScan: 'clean',
      kind: 'code-backed',
      proseLines: 5056,
      codeLines: 6245,
      proseToCodeRatio: 0.81,
    },
    tier: 'strong',
    video: null,
    verdict: `Ponytail earns its place: a well-structured minimal-code plugin with a ladder-of-minimalism prompt backed by real agentic benchmarks, not handwaved claims. The original 80-94% LOC reduction headline has been publicly retracted — the README now states a corrected 54% mean from a properly isolated Claude Code run, names the contamination bug found in their own prior numbers, and discloses the critic by name. Hooks are entirely local with no network calls. The correction is a trust signal, not a red flag: teams that find and publish their own methodology errors are exactly the kind of maintainers who belong in a curated directory.`,
    tags: ['code-quality', 'minimal-code', 'refactoring'],
  },
  {
    slug: 'impeccable',
    name: 'impeccable',
    repoUrl: 'https://github.com/pbakaus/impeccable',
    description: 'Audits and polishes frontend interfaces with 23 design-focused commands and 59 deterministic local detector rules.',
    installCommand: 'npx impeccable install',
    audit: {
      sha: '14d2641685a3fae643eceb74d9c843c54fb33bf8',
      date: '2026-08-03',
      installs: 'pass',
      installNote: 'Installs via npx impeccable install (recommended), git submodule, or /plugin marketplace add. PostToolUse and Stop hooks via hook.mjs on UI file edits.',
      riskScan: 'flagged',
      riskNote: 'Three disclosed outbound calls: (1) a once-per-session version check to impeccable.style (cached 24h, DO_NOT_TRACK honored); (2) an opt-in design-direction dice roll to impeccable.style/api/roll; (3) OpenAI image generation only when OPENAI_API_KEY is set, cost disclosed in the script header. None are silent; all are documented.',
      kind: 'code-backed',
      proseLines: 82038,
      codeLines: 329776,
      proseToCodeRatio: 0.25,
    },
    tier: 'strong',
    video: null,
    verdict: `Impeccable is the most substantial of the three: 23 commands, a 59-rule deterministic design detector that runs entirely offline without an LLM or API key, proper PostToolUse/Stop hooks, and a DESIGN.md/PRODUCT.md context system that makes later commands coherent without re-explaining the project. Three outbound network patterns exist — a weekly version-check ping, an opt-in design-direction randomizer (DO_NOT_TRACK honored), and OpenAI image generation only when the user's key is set. None are silent or telemetric; all are documented. The network footprint should be surfaced to end-users; it is not grounds for exclusion, but it is grounds for disclosure.`,
    tags: ['frontend', 'design-audit', 'ui-quality', 'accessibility'],
  },
]

export default entries

export function getEntry(slug: string): CatalogEntry | undefined {
  return entries.find(e => e.slug === slug)
}

export function getEntries(): CatalogEntry[] {
  return entries
}

export const CATALOG_META = {
  entriesListed: entries.length,
  entriesTested: entries.filter(e => e.audit.installs === 'pass').length,
  lastAuditDate: entries.reduce<string>((latest, e) => {
    return e.audit.date > latest ? e.audit.date : latest
  }, ''),
}
