import type { Metadata } from 'next'
import { getEntries, CATALOG_META } from '@/data/catalog/entries'
import { getScanStats } from '@/lib/ingest'
import CatalogSearch from '@/components/CatalogSearch/CatalogSearch'

export const metadata: Metadata = {
  title: 'Bear Brown — Claude Tools Directory',
  description: 'A curated Claude tools directory built on a corpus-wide scan. Every listing tested, every verdict shown.',
}

const sectionPad: React.CSSProperties = {
  padding: 'clamp(20px, 3vw, 40px) clamp(24px, 5vw, 80px)',
}

const hr = (
  <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)', margin: 0 }} />
)

const fmt = (n: number) => n.toLocaleString('en-US')

export default async function Home() {
  const entries = getEntries()
  const { entriesListed, entriesTested, lastAuditDate } = CATALOG_META
  const scan = await getScanStats()

  const typeLine = scan.reposByType
    .slice(0, 4)
    .map(t => `${fmt(t.count)} ${t.type}${t.count === 1 ? '' : 's'}`)
    .join(' · ')

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
          {fmt(scan.componentsFound)} Claude components found.{' '}
          {fmt(entriesListed)} that earned a listing.
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          lineHeight: 1.7,
          color: 'var(--p-ink-soft)',
          maxWidth: '580px',
        }}>
          The scanner walks public repositories and inventories what is actually in them:{' '}
          {fmt(scan.componentsFound)} components across {fmt(scan.reposScanned)} repositories
          from {fmt(scan.distinctOwners)} distinct owners — {typeLine}.
          Every one of those cleared an automated static check.
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          lineHeight: 1.7,
          color: 'var(--p-ink-soft)',
          maxWidth: '580px',
          marginTop: '16px',
        }}>
          A static clearance is not a recommendation. The {entriesListed} entries in the
          directory below cleared a further bar: install check, risk scan, prose-to-code
          ratio, and a plain-prose verdict — signed with the commit sha it ran against.
          Not indexed from GitHub stars. Not ranked by copy-click counts.
        </p>
      </section>

      {hr}

      {/* Scan stats — corpus-wide, automated */}
      <section style={{
        ...sectionPad,
        display: 'flex',
        gap: '40px',
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--p-border)',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--p-terra)',
          width: '100%',
          margin: 0,
        }}>
          Scanned — automated static clearance
        </p>
        {[
          { label: 'Components found', value: fmt(scan.componentsFound) },
          { label: 'High confidence', value: fmt(scan.componentsHighConfidence) },
          { label: 'Repositories', value: fmt(scan.reposScanned) },
          { label: 'Distinct owners', value: fmt(scan.distinctOwners) },
          { label: 'Stats updated', value: scan.lastAudit || '—' },
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

      {/* Directory stats — human-audited */}
      <section style={{
        ...sectionPad,
        display: 'flex',
        gap: '40px',
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--p-border)',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--p-terra)',
          width: '100%',
          margin: 0,
        }}>
          Listed — full audit with a written verdict
        </p>
        {[
          { label: 'Entries listed', value: fmt(entriesListed) },
          { label: 'Entries tested', value: fmt(entriesTested) },
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
