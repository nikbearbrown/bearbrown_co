'use client'

import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import AuditCard from '@/components/AuditCard/AuditCard'
import type { AuditEntry } from '@/data/catalog/audit-entry'

const PAGE_SIZE = 24

interface Props {
  entries: AuditEntry[]
  typeSlug: string
}

export default function SkillSearch({ entries, typeSlug }: Props) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const fuse = useMemo(() => new Fuse(entries, {
    keys: ['name', 'description', 'tags', 'owner', 'repo'],
    threshold: 0.35,
    includeScore: true,
  }), [entries])

  const results: AuditEntry[] = useMemo(() => {
    if (query.trim()) {
      return fuse.search(query.trim()).map(r => r.item)
    }
    return entries
  }, [query, entries, fuse])

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageSlice = results.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const isSearching = query.trim().length > 0

  return (
    <div>
      {/* Search input */}
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          placeholder={`Search ${entries.length} skills…`}
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(1) }}
          style={{
            width: '100%',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid var(--p-border-strong)',
            background: 'var(--p-bg)',
            color: 'var(--p-ink)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--p-ink)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--p-border-strong)' }}
        />
      </div>

      {/* Count line */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        color: 'var(--p-ink-muted)',
        marginBottom: '24px',
      }}>
        {isSearching
          ? `${results.length} result${results.length === 1 ? '' : 's'} for ‘${query.trim()}’`
          : `${entries.length} skills · pipeline-verified`}
      </p>

      {/* Results grid or empty state */}
      {results.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 0',
          fontFamily: 'var(--font-serif)',
          fontSize: '18px',
          color: 'var(--p-ink-muted)',
        }}>
          No matches. Try broader terms.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {pageSlice.map(entry => (
            <AuditCard key={entry.id} entry={entry} typeSlug={typeSlug} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '40px',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--p-ink-soft)',
        }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: safePage <= 1 ? 'var(--p-ink-muted)' : 'var(--p-ink)',
              background: 'none',
              border: '1px solid var(--p-border-strong)',
              borderRadius: '3px',
              padding: '6px 12px',
              cursor: safePage <= 1 ? 'default' : 'pointer',
              opacity: safePage <= 1 ? 0.4 : 1,
            }}
          >
            ← Prev
          </button>
          <span>Page {safePage} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: safePage >= totalPages ? 'var(--p-ink-muted)' : 'var(--p-ink)',
              background: 'none',
              border: '1px solid var(--p-border-strong)',
              borderRadius: '3px',
              padding: '6px 12px',
              cursor: safePage >= totalPages ? 'default' : 'pointer',
              opacity: safePage >= totalPages ? 0.4 : 1,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
