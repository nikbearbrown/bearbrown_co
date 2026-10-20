import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import SkillBrowser from '@/components/skills/SkillBrowser'
import { skills, toCard, REPO_URL } from '@/lib/skill-catalog'

export const metadata: Metadata = {
  title: 'Skills — read, understand, use | Bear Brown',
  description: `Search ${skills.length} Claude skills: what each one does, when it fires, how it is organised, and the full text to read before you install it.`,
  alternates: { canonical: 'https://www.bearbrown.co/skills' },
}
export default function SkillsPage() {
  const cards = skills.map(toCard)
  return <div style={{ background: 'var(--p-bg)', color: 'var(--p-ink)' }}>
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
      <header className="mb-12 max-w-3xl"><p className="mb-3 text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--p-ink-soft)' }}>Read · Understand · Use</p><h1 className="mb-5 text-6xl md:text-7xl" style={{ fontFamily: 'var(--font-serif)' }}>Skills</h1><p className="text-lg leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>A skill is a written procedure Claude loads when your request matches it. Find one by the job you need done, see how it is built, and read the whole text before you install it.</p></header>
      <section aria-labelledby="library-heading" id="library">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b pb-6" style={{ borderColor: 'var(--p-border-strong)' }}><div><p className="mb-2 text-xs uppercase tracking-widest" style={{ color: 'var(--p-ink-soft)' }}>Skill library</p><h2 id="library-heading" className="text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>Skills <span className="ml-2 text-xl" style={{ color: 'var(--p-ink-soft)' }}>{skills.length} skills</span></h2></div><a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="rounded border px-4 py-2 text-sm" style={{ borderColor: 'var(--p-border-strong)' }}>Browse the GitHub repository ↗</a></div>
        <p className="mb-8 max-w-4xl text-sm leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>Two kinds live here. <b>Rewrites</b> are one canonical version of a skill that many people copied, refactored from the best of the copies, with every source cited and the problems found in them listed. <b>Original skills</b> are Nik Bear Brown’s own, for teaching, writing, branding, music and software design. Every page says where its text came from. None has been run through the auditor pipeline, so read the text before you trust one with something that matters. Skills other people wrote are in the <Link href="/claude/skills" className="underline">audited directory</Link>, which is a different library with a different promise. The rewrites are also in the <a href="https://github.com/nikbearbrown/skills" className="underline" target="_blank" rel="noopener noreferrer">skills repository</a>.</p>
        <Suspense fallback={<p>Loading skill search…</p>}><SkillBrowser entries={cards} /></Suspense>
      </section>
    </div>
  </div>
}
