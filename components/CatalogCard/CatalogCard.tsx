import Link from 'next/link'
import type { CatalogEntry } from '@/data/catalog/types'

const KIND_LABEL: Record<string, string> = {
  'code-backed': 'Code',
  'prompt-only': 'Prompt',
}

interface CatalogCardProps {
  entry: CatalogEntry
}

export default function CatalogCard({ entry }: CatalogCardProps) {
  const { slug, name, description, audit, video, verdict, tags } = entry

  return (
    <Link
      href={`/plugins/${slug}`}
      style={{
        display: 'block',
        background: 'var(--p-bg-card)',
        border: '1px solid var(--p-border)',
        borderRadius: '6px',
        padding: '24px',
        textDecoration: 'none',
        transition: 'border-color 0.15s',
      }}
      className="catalog-card"
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '20px',
          fontWeight: 400,
          color: 'var(--p-ink)',
          lineHeight: 1.2,
        }}>
          {name}
        </span>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        lineHeight: 1.65,
        color: 'var(--p-ink-soft)',
        marginBottom: '16px',
      }}>
        {description}
      </p>

      {/* Verdict snippet */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        lineHeight: 1.6,
        color: 'var(--p-ink)',
        marginBottom: '16px',
        borderLeft: '2px solid var(--p-terra)',
        paddingLeft: '12px',
      }}>
        {verdict.length > 160 ? verdict.slice(0, 160) + '…' : verdict}
      </p>

      {/* Footer row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10px',
            letterSpacing: '0.05em',
            color: 'var(--p-ink-muted)',
            border: '1px solid var(--p-border-strong)',
            padding: '2px 7px',
            borderRadius: '3px',
          }}>
            {KIND_LABEL[audit.kind]}
          </span>
          {tags.slice(0, 2).map(tag => (
            <span key={tag} style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '10px',
              letterSpacing: '0.05em',
              color: 'var(--p-ink-muted)',
              border: '1px solid var(--p-border)',
              padding: '2px 7px',
              borderRadius: '3px',
            }}>
              {tag}
            </span>
          ))}
        </div>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          color: 'var(--p-terra)',
        }}>
          {video ? '▶ Teardown' : 'Tested ' + entry.audit.date}
        </span>
      </div>
    </Link>
  )
}
