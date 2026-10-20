import type { Metadata } from 'next'
import { Suspense } from 'react'
import WorkflowBrowser from '@/components/agents/WorkflowBrowser'
import { agents, repositoryUrl } from '@/lib/agent-catalog'

export const metadata: Metadata = {
  title: 'Agents — workflows and implementations | Bear Brown',
  description: 'Explore 1,877 agent packages: shared workflows, n8n sources, alternative implementation plans, assistant prompts, and explicit test evidence.',
  alternates: { canonical: 'https://www.bearbrown.co/agents' },
}
export default function AgentsPage() {
  return <div style={{ background: 'var(--p-bg)', color: 'var(--p-ink)' }}>
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
      <header className="mb-12 max-w-3xl"><p className="mb-3 text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--p-ink-soft)' }}>Build · Inspect · Adapt</p><h1 className="mb-5 text-6xl md:text-7xl" style={{ fontFamily: 'var(--font-serif)' }}>Agents</h1><p className="text-lg leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>One purpose, multiple implementations. Explore agent workflows, inspect the n8n sources, and find plans and prompts for building the same behavior in other forms.</p></header>
      <section aria-labelledby="walkthrough-heading" className="mb-14 max-w-5xl">
        <p className="mb-2 text-xs uppercase tracking-widest" style={{ color: 'var(--p-ink-soft)' }}>Agentic AI · Video walkthrough</p>
        <h2 id="walkthrough-heading" className="mb-4 text-3xl" style={{ fontFamily: 'var(--font-serif)' }}>Find, inspect, adapt</h2>
        <p className="mb-5 max-w-3xl leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>Liam walks through this library, inspects a Telegram template, and shows how to distinguish documentation from execution evidence.</p>
        <div className="relative aspect-video overflow-hidden rounded-xl border" style={{ borderColor: 'var(--p-border-strong)' }}>
          <iframe className="absolute inset-0 h-full w-full" src="https://www.youtube-nocookie.com/embed/1mtH871u8bM" title="Find, inspect, adapt: the n8n workflow library" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        </div>
        <p className="mt-3 text-sm" style={{ color: 'var(--p-ink-soft)' }}>6-minute walkthrough · Native 4K master · AI narration. Filmed before the catalog was consolidated from 1,900 to 1,876 workflows.</p>
        <a className="mt-3 inline-block text-sm underline underline-offset-4" href="https://www.youtube.com/playlist?list=PLH5UELa_jheA" target="_blank" rel="noopener noreferrer">Watch the Agentic AI playlist ↗</a>
      </section>
      <span id="n8n" /><section aria-labelledby="library-heading" id="library">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b pb-6" style={{ borderColor: 'var(--p-border-strong)' }}><div><p className="mb-2 text-xs uppercase tracking-widest" style={{ color: 'var(--p-ink-soft)' }}>Agent library</p><h2 id="library-heading" className="text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>Agents <span className="ml-2 text-xl" style={{ color: 'var(--p-ink-soft)' }}>{agents.length.toLocaleString()} agents</span></h2></div><a href={repositoryUrl} target="_blank" rel="noopener noreferrer" className="rounded border px-4 py-2 text-sm" style={{ borderColor: 'var(--p-border-strong)' }}>Browse the GitHub repository ↗</a></div>
        <p className="mb-8 max-w-4xl text-sm leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>The library contains 1,876 collected workflow families plus Lectern job search. Each agent has a shared design, an existing n8n implementation, and plans for Python and other implementations. Build and operating prompts are labeled separately from executable code. Source availability is not runtime verification; this collection is separate from the audited Claude directory.</p>
        <Suspense fallback={<p>Loading agent search…</p>}><WorkflowBrowser entries={agents} /></Suspense>
      </section>
    </div>
  </div>
}
