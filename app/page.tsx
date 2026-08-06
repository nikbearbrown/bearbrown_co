import type { Metadata } from 'next'
import { getEntries, CATALOG_META } from '@/data/catalog/entries'
import CatalogSearch from '@/components/CatalogSearch/CatalogSearch'

export const metadata: Metadata = {
  title: 'Bear Brown — Claude Tools Directory',
  description: 'A curated Claude tools directory. A few dozen entries that earned their place — every listing tested, every verdict shown.',
}

const sectionPad: React.CSSProperties = {
  padding: 'clamp(20px, 3vw, 40px) clamp(24px, 5vw, 80px)',
}

const hr = (
  <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)', margin: 0 }} />
)

export default function Home() {
  const entries = getEntries()
  const { entriesListed, entriesTested, lastAuditDate } = CATALOG_META

  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        padding: 'clamp(60px, 8vw, 100px) clamp(24px, 5vw, 80px) clamp(40px, 5vw, 60px)',
        maxWidth: '780px',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--p-terra)',
          marginBottom: '20px',
        }}>
          Claude Tools Directory · Bear Brown
        </p>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 400,
          lineHeight: 1.1,
          color: 'var(--p-ink)',
          letterSpacing: '-0.01em',
          marginBottom: '24px',
        }}>
          A few dozen Claude tools that earned their place.
          Every listing tested. Every verdict shown.
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          lineHeight: 1.7,
          color: 'var(--p-ink-soft)',
          maxWidth: '580px',
        }}>
          Not indexed from GitHub stars. Not ranked by copy-click counts.
          Each entry has a completed audit: install check, risk scan, prose-to-code ratio,
          and a plain-prose verdict — signed with the commit sha it ran against.
        </p>
      </section>

      {hr}

      {/* Stats bar */}
      <section style={{
        ...sectionPad,
        display: 'flex',
        gap: '40px',
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--p-border)',
      }}>
        {[
          { label: 'Entries listed', value: entriesListed.toString() },
          { label: 'Entries tested', value: entriesTested.toString() },
          { label: 'Last audit', value: lastAuditDate || '—' },
        ].map(stat => (
          <div key={stat.label}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--p-ink-muted)',
              marginBottom: '4px',
            }}>
              {stat.label}
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '28px',
              fontWeight: 400,
              color: 'var(--p-ink)',
              lineHeight: 1,
            }}>
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Directory grid + search */}
      <section style={{
        padding: 'clamp(32px, 4vw, 56px) clamp(24px, 5vw, 80px)',
      }}>
        <CatalogSearch entries={entries} />
      </section>

    </div>
  )
}
