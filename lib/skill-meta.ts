// Types and constants for the skills pages. No catalog import, so client components can use it without shipping the data.
export type SkillKind = 'commands' | 'protocol' | 'voice'
export type SkillSource = { repo: string; path: string; commit: string | null; sha256: string; url: string; license?: string; copyright?: string; role?: string; took?: string }
export type SkillRefactor = { summary: string; changed: string[]; dropped: string[]; findings: { repo: string; finding: string }[]; examined: { repo: string; note: string }[]; excluded: { repo: string; why: string }[]; date: string }
export type SkillEntry = {
  slug: string; name: string; description: string; does: string; useWhen: string
  kind: SkillKind; job: string | null; persona: string | null; starts: string | null
  pairs: string[]; agents: string[]; words: number; descWords: number
  sections: { title: string; words: number }[]
  commands: { name: string; desc: string }[]
  phases: { n: number; title: string }[]
  rules: { from: string; items: string[] } | null
  extraFiles: string[]; sha256: string; changed: string | null; path: string; repoUrl: string
  derivedFrom: SkillSource[]; verbatim: boolean; canonical: boolean; refactor: SkillRefactor | null; note: string | null; audit: string[]
}

export const KIND_LABEL: Record<SkillKind, string> = { commands: 'Command set', protocol: 'Protocol', voice: 'Voice' }
export const KIND_BLURB: Record<SkillKind, string> = {
  commands: 'A named assistant with a menu of commands. Work in the order the stages suggest, or jump in at any command.',
  protocol: 'A written method: it lays out how the work is done and what to check along the way.',
  voice: 'A writing register. It changes how text sounds rather than what job gets done.',
}
export const REPO_URL = 'https://github.com/nikbearbrown/bear-brown-tools'
export const CANON_REPO_URL = 'https://github.com/nikbearbrown/skills'

/** What the browser needs per card: no sections, commands or rules. */
export type SkillCard = {
  slug: string; name: string; does: string; useWhen: string; kind: SkillKind; job: string | null
  persona: string | null; starts: string | null; words: number; commandCount: number; phaseCount: number
  bars: number[]; commandNames: string[]; canonical: boolean
}
export function formatWords(n: number) { return `${n.toLocaleString('en-US')} words` }
