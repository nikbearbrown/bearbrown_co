'use client'

import { useMemo, useState, useDeferredValue } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Fuse from 'fuse.js'
import { Search, ArrowUpRight, X } from 'lucide-react'
import SkillShape from './SkillShape'
import { KIND_LABEL, type SkillCard, type SkillKind } from '@/lib/skill-catalog'

const KINDS: SkillKind[] = ['commands', 'protocol', 'voice']

export default function SkillBrowser({ entries }: { entries: SkillCard[] }) {
  const params = useSearchParams(); const router = useRouter(); const pathname = usePathname()
  const query = params.get('q') || ''; const kind = params.get('kind') || ''; const job = params.get('job') || ''; const lib = params.get('lib') || ''
  const [draft, setDraft] = useState(query)
  const deferred = useDeferredValue(draft)
  const [lastQuery, setLastQuery] = useState(query)
  if (query !== lastQuery) { setLastQuery(query); setDraft(query) }
  const jobs = useMemo(() => [...new Set(entries.map(e => e.job).filter(Boolean) as string[])].sort(), [entries])
  const fuse = useMemo(() => new Fuse(entries, {
    keys: [{ name: 'name', weight: 3 }, { name: 'persona', weight: 3 }, { name: 'does', weight: 2 }, { name: 'useWhen', weight: 1.5 }, { name: 'job', weight: 1 }, { name: 'commandNames', weight: 1 }],
    threshold: 0.3, ignoreLocation: true,
  }), [entries])
  const results = useMemo(() => {
    const pool = deferred.trim() ? fuse.search(deferred.trim()).map(r => r.item) : entries
    return pool.filter(e => (!kind || e.kind === kind) && (!job || e.job === job) && (!lib || (lib === 'rewrite') === e.canonical))
  }, [entries, fuse, deferred, kind, job, lib])
  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString())
    Object.entries(changes).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k))
    router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false })
  }
  function reset() { setDraft(''); router.replace(pathname, { scroll: false }) }
  const sel = 'rounded border bg-transparent px-3 py-2 text-sm'
  return <section aria-label="Search skills" className="space-y-7">
    <form onSubmit={e => { e.preventDefault(); update({ q: draft }) }} className="space-y-4" role="search">
      <label htmlFor="skill-search" className="block text-sm font-medium">Find a skill</label>
      <div className="flex items-center gap-3 rounded-lg border p-2 pl-4" style={{ borderColor: 'var(--p-border-strong)', background: 'var(--p-bg-card)' }}>
        <Search size={21} aria-hidden="true" />
        <input id="skill-search" type="search" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Say what you want done: review my paper, audit a playlist, design a syllabus…" className="min-w-0 flex-1 rounded bg-transparent py-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-blue)]" />
        <button className="rounded px-5 py-3 text-sm font-medium" style={{ background: 'var(--p-ink)', color: 'var(--p-bg)' }}>Search</button>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs">Kind of skill<select aria-label="Kind of skill" value={kind} onChange={e => update({ kind: e.target.value, q: draft })} className={sel} style={{ borderColor: 'var(--p-border-strong)' }}><option value="">All kinds</option>{KINDS.map(k => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select></label>
        <label className="flex flex-col gap-1 text-xs">Job<select aria-label="Job" value={job} onChange={e => update({ job: e.target.value, q: draft })} className={sel} style={{ borderColor: 'var(--p-border-strong)' }}><option value="">Any job</option>{jobs.map(j => <option key={j}>{j}</option>)}</select></label>
        <label className="flex flex-col gap-1 text-xs">Library<select aria-label="Library" value={lib} onChange={e => update({ lib: e.target.value, q: draft })} className={sel} style={{ borderColor: 'var(--p-border-strong)' }}><option value="">Everything</option><option value="rewrite">Rewrites (cited, refactored)</option><option value="original">Original skills</option></select></label>
        {(draft || kind || job || lib) && <button type="button" onClick={reset} className="flex items-center gap-2 self-end px-3 py-2 text-sm underline"><X size={15} />Clear filters</button>}
      </div>
    </form>
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm" style={{ color: 'var(--p-ink-soft)' }}>
      <p role="status" aria-live="polite">{results.length} {results.length === 1 ? 'skill' : 'skills'}{deferred.trim() ? ` matching “${deferred.trim()}”` : ''}</p>
      <p>The strip on each card shows where the skill’s text goes, section by section.</p>
    </div>
    {results.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{results.map(e => <Link key={e.slug} href={`/skills/${e.slug}`} prefetch={false} className="group flex flex-col rounded-lg border p-6 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" style={{ borderColor: 'var(--p-border)', background: 'var(--p-bg-card)' }}>
      <div className="mb-4 flex items-center justify-between gap-3 text-xs" style={{ color: 'var(--p-ink-soft)' }}><span>{e.canonical ? 'Rewrite · ' : ''}{KIND_LABEL[e.kind]}{e.job ? ` · ${e.job}` : ''}</span><span>{e.commandCount ? `${e.commandCount} commands · ` : ''}{e.words.toLocaleString('en-US')} words</span></div>
      <h3 className="mb-1 break-words text-xl font-semibold" style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>{e.name}</h3>
      {e.persona && <p className="mb-2 text-xs" style={{ color: 'var(--p-ink-soft)' }}>Persona: {e.persona}</p>}
      <p className="mb-5 line-clamp-3 text-sm leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>{e.does}</p>
      {e.starts && <p className="mb-4 rounded border px-2.5 py-1.5 text-xs" style={{ borderColor: 'var(--p-border)', background: 'var(--p-bg)', fontFamily: 'ui-monospace, monospace' }}>▸ {e.starts}</p>}
      <div className="mt-auto"><SkillShape bars={e.bars} />
        <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs" style={{ borderColor: 'var(--p-border)', color: 'var(--p-ink-soft)' }}><span>{e.canonical ? 'Sources cited' : e.useWhen ? 'Has a trigger' : 'No trigger sentence'}</span><span className="flex items-center gap-1">Read the skill <ArrowUpRight size={14} /></span></div></div>
    </Link>)}</div> : <div className="rounded-lg border py-16 text-center" style={{ borderColor: 'var(--p-border)' }}><h3 className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>No matching skills</h3><p className="mt-2">Try a job (“review”, “syllabus”) or clear a filter.</p><button onClick={reset} className="mt-5 underline">Reset search</button></div>}
  </section>
}
