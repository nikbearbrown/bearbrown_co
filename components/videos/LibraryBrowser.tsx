'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'

export interface LibraryItem { slug: string; title: string; date: string | null; duration: string; playlists: string[]; thumbnail: string }
export interface LibraryPlaylist { slug: string; title: string; count: number }

const PAGE = 24

export default function LibraryBrowser({ items, playlists, base }: { items: LibraryItem[]; playlists: LibraryPlaylist[]; base: string }) {
  const [q, setQ] = useState('')
  const [pl, setPl] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let list = items
    if (pl) list = list.filter(i => i.playlists.includes(pl))
    if (q.trim()) {
      const s = q.toLowerCase()
      list = list.filter(i => i.title.toLowerCase().includes(s))
    }
    return list
  }, [items, q, pl])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const cur = Math.min(page, pages)
  const shown = filtered.slice((cur - 1) * PAGE, cur * PAGE)

  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1) }}
          placeholder={`Search ${items.length} videos…`}
          aria-label="Search videos"
          className="w-full rounded-md border bg-background py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {q && (
          <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {playlists.length > 1 && (
        <div className="mb-8 flex flex-wrap items-center gap-1.5">
          <button onClick={() => { setPl(null); setPage(1) }} className={`rounded-full border px-3 py-1 text-xs ${pl === null ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>All</button>
          {playlists.map(p => (
            <button key={p.slug} onClick={() => { setPl(pl === p.slug ? null : p.slug); setPage(1) }} className={`rounded-full border px-3 py-1 text-xs ${pl === p.slug ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>
              {p.title} <span className="opacity-70">({p.count})</span>
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-muted-foreground">No videos match.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(v => (
            <Link key={v.slug} href={`${base}/${v.slug}`} className="group block">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">{v.duration}</span>
              </div>
              <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug group-hover:underline">{v.title}</h3>
              {v.date && <p className="mt-1 text-xs text-muted-foreground">{v.date}</p>}
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={cur === 1} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30">Previous</button>
          <span className="text-sm text-muted-foreground">Page {cur} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={cur === pages} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30">Next</button>
        </div>
      )}
    </>
  )
}
