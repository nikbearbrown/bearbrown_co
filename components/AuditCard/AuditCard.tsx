import Link from 'next/link'
import type { AuditEntry } from '@/data/catalog/audit-entry'

interface Props {
  entry: AuditEntry
  typeSlug: string
}

function coverageColor(label: string): string {
  if (label.startsWith('CLEARED')) return 'var(--p-blue)'
  if (label.startsWith('QUARANTINE')) return 'var(--p-vermilion)'
  return 'var(--p-ink-muted)'
}

export default function AuditCard({ entry, typeSlug }: Props) {
  const href = `/claude/${typeSlug}/${entry.urlSlug}`
  const topTag = entry.tags[0] ?? entry.portability
  return (
    <Link
      href={href}
      style={{
        display: 'flex', flexDirection: 'column', minHeight: '238px',
        background: 'var(--p-bg-card)', border: '1px solid var(--p-border)',
        borderRadius: '6px', padding: '24px', textDecoration: 'none',
      }}
    >
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: coverageColor(entry.coverage.label), marginBottom: '14px' }}>
        {entry.coverage.label}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--p-ink)', lineHeight: 1.2 }}>{entry.name}</span>
        {topTag && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.05em', color: 'var(--p-ink-muted)', border: '1px solid var(--p-border-strong)', padding: '2px 7px', borderRadius: '3px', flexShrink: 0 }}>{topTag}</span>
        )}
      </div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--p-ink-muted)', marginBottom: '6px' }}>
        {entry.owner}/{entry.repo}
      </p>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6, color: 'var(--p-ink-soft)' }}>
        {entry.description.slice(0, 160)}
      </p>
      <div style={{ marginTop: 'auto', paddingTop: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--p-border)' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--p-ink-muted)', letterSpacing: '0.05em' }}>
          Audited {entry.receipts.audited_date}
        </span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-terra)', letterSpacing: '0.04em' }}>View audit →</span>
      </div>
    </Link>
  )
}
