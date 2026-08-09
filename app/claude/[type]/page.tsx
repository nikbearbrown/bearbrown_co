import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getType, sampleSlug, TYPE_SLUGS } from '@/data/claude-types'
import { getAuditEntriesByType } from '@/lib/ingest'
import type { AuditEntry } from '@/data/catalog/audit-entry'

interface Props {
  params: Promise<{ type: string }>
}

export function generateStaticParams() {
  return TYPE_SLUGS.map((type) => ({ type }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params
  const t = getType(type)
  if (!t) return {}
  return { title: `${t.label} — Bear Brown`, description: t.blurb.slice(0, 155) }
}

function coverageColor(label: string): string {
  if (label.startsWith('CLEARED')) return 'var(--p-blue)'
  if (label.startsWith('QUARANTINE')) return 'var(--p-vermilion)'
  return 'var(--p-ink-muted)'
}

function AuditCard({ entry, typeSlug }: { entry: AuditEntry; typeSlug: string }) {
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

export default async function ClaudeTypePage({ params }: Props) {
  const { type } = await params
  const t = getType(type)
  if (!t) notFound()

  const auditEntries = await getAuditEntriesByType(type)

  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(24px, 5vw, 80px) clamp(28px, 4vw, 44px)', maxWidth: '780px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--p-terra)', marginBottom: '20px' }}>
          Claude Tools · {t.value}
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 400, lineHeight: 1.1, color: 'var(--p-ink)', letterSpacing: '-0.01em', marginBottom: '20px' }}>
          {t.label}
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', lineHeight: 1.7, color: 'var(--p-ink-soft)', maxWidth: '580px' }}>
          {t.blurb}
        </p>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)', margin: 0 }} />

      {/* Audited listings (real entries from the 24/7 pipeline) */}
      {auditEntries.length > 0 && (
        <>
          <section style={{ padding: '16px clamp(24px, 5vw, 80px)', borderBottom: '1px solid var(--p-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--p-ink)', letterSpacing: '0.02em' }}>
              Audited listings
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-ink-muted)', margin: 0 }}>
              {auditEntries.length} entr{auditEntries.length === 1 ? 'y' : 'ies'} · pipeline-verified
            </p>
          </section>

          <section style={{ padding: 'clamp(24px, 3vw, 40px) clamp(24px, 5vw, 80px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {auditEntries.map(entry => (
                <AuditCard key={entry.id} entry={entry} typeSlug={type} />
              ))}
            </div>
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)', margin: 0 }} />
        </>
      )}

      {/* Starter-page note (illustrative examples) */}
      <section style={{ padding: '16px clamp(24px, 5vw, 80px)', borderBottom: '1px solid var(--p-border)' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--p-ink-muted)', letterSpacing: '0.02em' }}>
          {auditEntries.length > 0
            ? 'Five illustrative examples — content shape only, not audited listings.'
            : 'Five starter examples for reviewing this page template. They illustrate the content shape only and are not audited listings or rankings.'}
        </p>
      </section>

      {/* Directory controls — visual starter state */}
      <section style={{ padding: '20px clamp(24px, 5vw, 80px)', borderBottom: '1px solid var(--p-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All examples', ...Array.from(new Set(t.samples.map((sample) => sample.tag))).slice(0, 3)].map((filter, index) => (
            <span key={filter} style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: index === 0 ? 'var(--p-bg)' : 'var(--p-ink-soft)', background: index === 0 ? 'var(--p-ink)' : 'transparent', border: '1px solid var(--p-border-strong)', borderRadius: '3px', padding: '6px 10px' }}>{filter}</span>
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-ink-muted)', margin: 0 }}>5 examples · starter content</p>
      </section>

      {/* Illustrative grid */}
      <section style={{ padding: 'clamp(32px, 4vw, 56px) clamp(24px, 5vw, 80px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {t.samples.map((s, index) => (
            <Link
              key={s.name}
              href={`/claude/${t.slug}/${sampleSlug(s)}`}
              style={{ display: 'flex', flexDirection: 'column', minHeight: '238px', background: 'var(--p-bg-card)', border: '1px solid var(--p-border)', borderRadius: '6px', padding: '24px', textDecoration: 'none', transition: 'border-color 0.15s, transform 0.15s' }}
            >
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--p-terra)', marginBottom: '14px' }}>
                Example {String(index + 1).padStart(2, '0')}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--p-ink)', lineHeight: 1.2 }}>{s.name}</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.05em', color: 'var(--p-ink-muted)', border: '1px solid var(--p-border-strong)', padding: '2px 7px', borderRadius: '3px', flexShrink: 0 }}>{s.tag}</span>
              </div>
              {s.source && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--p-ink-muted)', marginBottom: '10px' }}>{s.source}</p>
              )}
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6, color: 'var(--p-ink-soft)' }}>{s.description}</p>
              <div style={{ marginTop: 'auto', paddingTop: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--p-border)' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--p-ink-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Editable sample</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--p-terra)', letterSpacing: '0.04em' }}>View full page →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
