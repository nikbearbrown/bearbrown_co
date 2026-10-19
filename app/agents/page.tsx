import type { Metadata } from 'next'
import { Suspense } from 'react'
import WorkflowBrowser from '@/components/agents/WorkflowBrowser'
import { workflows, repositoryUrl } from '@/lib/n8n-catalog'

export const metadata: Metadata = {
  title: 'Agents — N8N workflow library | Bear Brown',
  description: 'Search 1,900 documented n8n workflows. Explore workflow previews, integrations, setup instructions, source attribution, and downloadable JSON.',
  alternates: { canonical: 'https://www.bearbrown.co/agents' },
}
export default function AgentsPage() {
  return <div style={{ background: 'var(--p-bg)', color: 'var(--p-ink)' }}>
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
      <header className="mb-12 max-w-3xl"><p className="mb-3 text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--p-ink-soft)' }}>Build · Inspect · Adapt</p><h1 className="mb-5 text-6xl md:text-7xl" style={{ fontFamily: 'var(--font-serif)' }}>Agents</h1><p className="text-lg leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>Explore the workflows behind useful automation. Find a starting point, understand how it is connected, and make it your own.</p></header>
      <section aria-labelledby="n8n-heading" id="n8n">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b pb-6" style={{ borderColor: 'var(--p-border-strong)' }}><div><p className="mb-2 text-xs uppercase tracking-widest" style={{ color: 'var(--p-ink-soft)' }}>Workflow library</p><h2 id="n8n-heading" className="text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>N8N <span className="ml-2 text-xl" style={{ color: 'var(--p-ink-soft)' }}>{workflows.length.toLocaleString()} workflows</span></h2></div><a href={repositoryUrl} target="_blank" rel="noopener noreferrer" className="rounded border px-4 py-2 text-sm" style={{ borderColor: 'var(--p-border-strong)' }}>Browse the GitHub repository ↗</a></div>
        <p className="mb-8 max-w-4xl text-sm leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>These are deduplicated, documented source templates with credentials and private configuration removed. They still need your configuration and testing. This library is separate from the audited Claude directory; inclusion is not a production-readiness verdict.</p>
        <Suspense fallback={<p>Loading workflow search…</p>}><WorkflowBrowser entries={workflows} /></Suspense>
      </section>
    </div>
  </div>
}
