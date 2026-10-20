'use client'

import { useMemo, useState, useDeferredValue } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Fuse from 'fuse.js'
import { formatN8nLabel } from '@/lib/n8n-labels'
import { Search, ArrowUpRight, ArrowLeft, ArrowRight, X } from 'lucide-react'
import type { WorkflowEntry } from '@/lib/n8n-catalog'

const PAGE_SIZE = 24
export default function WorkflowBrowser({ entries }: { entries: WorkflowEntry[] }) {
  const params = useSearchParams(); const router = useRouter(); const pathname = usePathname()
  const query = params.get('q') || ''; const category = params.get('category') || ''; const integration = formatN8nLabel(params.get('integration') || '')
  const implementation = params.get('implementation') || ''
  const [draft, setDraft] = useState(query)
  const deferred = useDeferredValue(draft)
  const [lastQuery, setLastQuery] = useState(query)
  if (query !== lastQuery) { setLastQuery(query); setDraft(query) }
  const categories = useMemo(() => [...new Set(entries.map(e => e.category))].sort(), [entries])
  const integrations = useMemo(() => [...new Set(entries.flatMap(e => e.integrations))].sort(), [entries])
  const implementations = useMemo(() => [...new Map(entries.flatMap(e => (e.implementations || []).filter(i => i.status !== 'planned')).map(i => [i.id, i.label])).entries()], [entries])
  const fuse = useMemo(() => new Fuse(entries, { keys: [{ name: 'title', weight: 3 }, { name: 'integrations', weight: 2 }, 'description', 'slug'], threshold: 0.32, ignoreLocation: true }), [entries])
  const results = useMemo(() => {
    const candidates = deferred.trim() ? fuse.search(deferred.trim()).map(r => r.item) : entries
    return candidates.filter(e => (!category || e.category === category) && (!integration || e.integrations.includes(integration)) && (!implementation || e.implementations?.some(i => i.id === implementation && i.status !== 'planned')))
  }, [entries, fuse, deferred, category, integration, implementation])
  const requestedPage = Number(params.get('page') || 1)
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const page = Math.max(1, Math.min(Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1, pageCount))
  const shown = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString())
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key))
    router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false })
  }
  function reset() { setDraft(''); router.replace(pathname, { scroll: false }) }
  return <section aria-label="Search agents" className="space-y-7">
    <form onSubmit={e => { e.preventDefault(); update({ q: draft, page: '' }) }} className="space-y-4">
      <label htmlFor="workflow-search" className="block text-sm font-medium">Find an agent</label>
      <div className="flex items-center gap-3 rounded-lg border p-2 pl-4" style={{ borderColor: 'var(--p-border-strong)', background: 'var(--p-bg-card)' }}>
        <Search size={21} aria-hidden="true" />
        <input id="workflow-search" type="search" value={draft} onChange={e => { setDraft(e.target.value); if (params.has('page')) update({ page: '' }) }} placeholder="Try RAG, job search, Google Sheets, or Telegram…" className="min-w-0 flex-1 bg-transparent py-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-blue)] rounded" />
        <button className="rounded px-5 py-3 text-sm font-medium" style={{ background: 'var(--p-ink)', color: 'var(--p-bg)' }}>Search</button>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs">Category<select aria-label="Category" value={category} onChange={e => update({ category: e.target.value, q: draft, page: '' })} className="rounded border bg-transparent px-3 py-2 text-sm" style={{ borderColor: 'var(--p-border-strong)' }}><option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
        <label className="flex flex-col gap-1 text-xs">Node or integration<select aria-label="Node or integration" value={integration} onChange={e => update({ integration: e.target.value, q: draft, page: '' })} className="max-w-full rounded border bg-transparent px-3 py-2 text-sm" style={{ borderColor: 'var(--p-border-strong)' }}><option value="">All nodes and integrations</option>{integrations.map(i => <option key={i}>{i}</option>)}</select></label>
        <label className="flex flex-col gap-1 text-xs">Available implementation<select aria-label="Available implementation" value={implementation} onChange={e => update({ implementation: e.target.value, q: draft, page: '' })} className="rounded border bg-transparent px-3 py-2 text-sm" style={{ borderColor: 'var(--p-border-strong)' }}><option value="">All available sources</option>{implementations.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        {(draft || category || integration || implementation) && <button type="button" onClick={reset} className="self-end flex items-center gap-2 px-3 py-2 text-sm underline"><X size={15} />Clear filters</button>}
      </div>
    </form>
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm" style={{ color: 'var(--p-ink-soft)' }}>
      <p role="status" aria-live="polite">{results.length.toLocaleString()} {results.length === 1 ? 'agent' : 'agents'}{deferred.trim() ? ` matching “${deferred.trim()}”` : ''}</p>
      <p>Source and planned ports labeled · inspect evidence</p>
    </div>
    {shown.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{shown.map(entry => <Link key={entry.slug} href={`/agents/${entry.slug}`} prefetch={false} className="group flex flex-col rounded-lg border p-6 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" style={{ borderColor: 'var(--p-border)', background: 'var(--p-bg-card)' }}>
      <div className="mb-4 flex items-center justify-between gap-3 text-xs" style={{ color: 'var(--p-ink-soft)' }}><span>{entry.category}</span><span>{entry.nodeCount} nodes</span></div>
      <h3 className="mb-3 text-2xl leading-tight break-words" style={{ fontFamily: 'var(--font-serif)' }}>{entry.title}</h3>
      <p className="mb-5 text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--p-ink-soft)' }}>{entry.description}</p>
      <div className="mt-auto flex flex-wrap gap-2">{entry.integrations.slice(0, 3).map(i => <span key={i} className="rounded border px-2 py-1 text-xs" style={{ borderColor: 'var(--p-border-strong)' }}>{i}</span>)}{entry.integrations.length > 3 && <span className="px-1 py-1 text-xs">+{entry.integrations.length - 3}</span>}</div>
      <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs" style={{ borderColor: 'var(--p-border)', color: 'var(--p-ink-soft)' }}><span>n8n source · {(entry.implementations || []).filter(i => i.status === 'planned').length} ports planned</span><span className="flex items-center gap-1">View agent <ArrowUpRight size={14} /></span></div>
    </Link>)}</div> : <div className="rounded-lg border py-16 text-center" style={{ borderColor: 'var(--p-border)' }}><h3 className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>No matching agents</h3><p className="mt-2">Try a service name or clear one of the filters.</p><button onClick={reset} className="mt-5 underline">Reset search</button></div>}
    {pageCount > 1 && <nav aria-label="Agent result pages" className="flex items-center justify-center gap-5 py-4"><button disabled={page === 1} onClick={() => update({ page: String(page - 1), q: draft })} className="flex items-center gap-2 rounded border px-4 py-2 disabled:opacity-40" style={{ borderColor: 'var(--p-border-strong)' }}><ArrowLeft size={15} />Previous</button><span className="text-sm">{page} / {pageCount}</span><button disabled={page === pageCount} onClick={() => update({ page: String(page + 1), q: draft })} className="flex items-center gap-2 rounded border px-4 py-2 disabled:opacity-40" style={{ borderColor: 'var(--p-border-strong)' }}>Next<ArrowRight size={15} /></button></nav>}
  </section>
}
