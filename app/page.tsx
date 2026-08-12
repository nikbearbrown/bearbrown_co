import type { Metadata } from 'next'
import { getEntries, CATALOG_META } from '@/data/catalog/entries'
import { getScanStats, getLedgerStats } from '@/lib/ingest'
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
  const ledger = getLedgerStats()

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
          A corpus of {fmt(scan.componentsFound)} Claude components.{' '}
          A directory of {fmt(entriesListed)}, hand-audited.
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
          Every one cleared an automated static check. That is all it means.
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          lineHeight: 1.7,
          color: 'var(--p-ink-soft)',
          maxWidth: '580px',
          marginTop: '16px',
        }}>
          The directory is a separate activity. Each of the {entriesListed} entries was
          sourced and audited by hand: install check, risk scan, prose-to-code ratio,
          and a plain-prose verdict signed with the commit sha it ran against. One entry
          (impeccable) also appears in the scan corpus; the other fifteen were sourced
          independently. Not indexed from GitHub stars. Not ranked by copy-click counts.
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

      {/* Pipeline funnel — full intake breakdown */}
      {ledger.total > 0 && (() => {
        const rr = Object.fromEntries(ledger.rejectReasons.map((r: { reason: string; count: number }) => [r.reason, r.count]))
        const gone     = rr['repo not found (404)'] ?? 0
        const noMfst   = rr['no manifest'] ?? 0
        const noLic    = rr['no license'] ?? 0
        const dup      = rr['duplicate'] ?? 0
        const secrets  = rr['leaking secrets'] ?? 0
        const missFld  = rr['missing required fields'] ?? 0
        const forkEmp  = (rr['is a fork'] ?? 0) + (rr['empty repo'] ?? 0)
        const cleared  = ledger.grades['CLEARED_STATIC'] ?? 0
        const basicProblems = noLic + missFld + forkEmp

        const steps = [
          { label: 'Examined', value: fmt(ledger.total), note: 'public repos found referencing Claude tools' },
          { label: 'Gone (404)', value: `−${fmt(gone)}`, note: 'deleted or made private before audit ran' },
          { label: 'No manifest', value: `−${fmt(noMfst)}`, note: 'no plugin.json or .claude-plugin — not a Claude plugin' },
          { label: 'Basic problems', value: `−${fmt(basicProblems)}`, note: 'no license, or fork, or missing required manifest fields' },
          { label: 'Duplicate', value: `−${fmt(dup)}`, note: 'near-identical to another entry already in the corpus' },
          { label: 'Leaking secrets', value: `−${fmt(secrets)}`, note: 'credentials or tokens committed; flagged, not listed' },
          { label: 'Cleared basics', value: fmt(cleared), note: 'passed all automated static checks; eligible for the corpus' },
        ]

        return (
          <section style={{
            ...sectionPad,
            borderBottom: '1px solid var(--p-border)',
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--p-terra)',
              margin: '0 0 24px',
            }}>
              Pipeline — how {fmt(ledger.total)} became {fmt(cleared)}
            </p>
            <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
              {steps.map((step, i) => (
                <div key={step.label} style={{
                  flex: '1 1 160px',
                  paddingRight: '32px',
                  paddingBottom: '20px',
                  borderRight: i < steps.length - 1 ? '1px solid var(--p-border)' : 'none',
                  marginRight: i < steps.length - 1 ? '32px' : '0',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--p-ink-muted)',
                    marginBottom: '4px',
                  }}>
                    {step.label}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '26px',
                    fontWeight: 400,
                    color: i === steps.length - 1 ? 'var(--p-blue)' : 'var(--p-ink)',
                    lineHeight: 1,
                    marginBottom: '6px',
                  }}>
                    {step.value}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    lineHeight: 1.5,
                    color: 'var(--p-ink-muted)',
                  }}>
                    {step.note}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )
      })()}

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
