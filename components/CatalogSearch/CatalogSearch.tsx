'use client'

import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import CatalogCard from '@/components/CatalogCard/CatalogCard'
import type { CatalogEntry, Tier, PluginKind } from '@/data/catalog/types'

const TIER_OPTIONS: { value: Tier | ''; label: string }[] = [
  { value: '',          label: 'All tiers' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'strong',    label: 'Strong' },
  { value: 'promising', label: 'Promising' },
]

const KIND_OPTIONS: { value: PluginKind | ''; label: string }[] = [
  { value: '',            label: 'Any kind' },
  { value: 'code-backed', label: 'Code-backed' },
  { value: 'prompt-only', label: 'Prompt-only' },
]

interface Props {
  entries: CatalogEntry[]
}

export default function CatalogSearch({ entries }: Props) {
  const [query, setQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<Tier | ''>('')
  const [kindFilter, setKindFilter] = useState<PluginKind | ''>('')

  const fuse = useMemo(() => new Fuse(entries, {
    keys: ['name', 'description', 'verdict', 'tags'],
    threshold: 0.35,
    includeScore: true,
  }), [entries])

  const results: CatalogEntry[] = useMemo(() => {
    let base = query.trim()
      ? fuse.search(query).map(r => r.item)
      : entries
    if (tierFilter) base = base.filter(e => e.tier === tierFilter)
    if (kindFilter) base = base.filter(e => e.audit.kind === kindFilter)
    return base
  }, [query, tierFilter, kindFilter, entries, fuse])

  const pill = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        letterSpacing: '0.05em',
        padding: '4px 12px',
        borderRadius: '3px',
        border: active ? '1px solid var(--p-ink)' : '1px solid var(--p-border-strong)',
        background: active ? 'var(--p-ink)' : 'transparent',
        color: active ? 'var(--p-bg)' : 'var(--p-ink-soft)',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )

  return (
    <div>
      {/* Search input */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="What do you need? e.g. token reduction, frontend audit, minimal code…"
          value={query}
          onChange={e => setQuery(e.target.value)}
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

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {TIER_OPTIONS.map(opt => pill(opt.label, tierFilter === opt.value, () => setTierFilter(opt.value)))}
        <span style={{ width: '1px', background: 'var(--p-border-strong)', margin: '0 4px' }} />
        {KIND_OPTIONS.map(opt => pill(opt.label, kindFilter === opt.value, () => setKindFilter(opt.value)))}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 0',
          fontFamily: 'var(--font-serif)',
          fontSize: '18px',
          color: 'var(--p-ink-muted)',
        }}>
          {entries.length === 0
            ? 'No listings yet. Every entry requires a completed audit — check back soon.'
            : 'No matches. Try broader terms, or remove a filter.'}
        </div>
      ) : (
        <>
          {query || tierFilter || kindFilter ? (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--p-ink-muted)',
              marginBottom: '16px',
            }}>
              {results.length} {results.length === 1 ? 'result' : 'results'}{query ? ` for "${query}"` : ''}
            </p>
          ) : null}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}>
            {results.map(entry => (
              <CatalogCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
