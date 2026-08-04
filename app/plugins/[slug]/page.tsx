import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEntry, getEntries } from '@/data/catalog/entries'
import InstallCommand from '@/components/InstallCommand/InstallCommand'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getEntries().map(e => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = getEntry(slug)
  if (!entry) return {}
  return {
    title: `${entry.name} — Bear Brown Plugin Directory`,
    description: entry.verdict.slice(0, 155),
  }
}

const TIER_LABEL: Record<string, string> = {
  excellent: 'Excellent',
  strong: 'Strong',
  promising: 'Promising',
}
const TIER_SHAPE: Record<string, string> = {
  excellent: '◆',
  strong: '●',
  promising: '▲',
}
const TIER_COLOR: Record<string, string> = {
  excellent: '#0072B2',
  strong:    '#3D3929',
  promising: '#D55E00',
}

function AuditRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      padding: '12px 0',
      borderBottom: '1px solid var(--p-border)',
    }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'baseline' }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--p-ink-muted)',
          minWidth: '160px',
          flexShrink: 0,
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--p-ink)',
          fontWeight: 500,
        }}>
          {value}
        </span>
      </div>
      {note && (
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          lineHeight: 1.55,
          color: 'var(--p-ink-soft)',
          margin: '4px 0 0 176px',
        }}>
          {note}
        </p>
      )}
    </div>
  )
}

export default async function PluginPage({ params }: Props) {
  const { slug } = await params
  const entry = getEntry(slug)
  if (!entry) notFound()

  const { name, repoUrl, description, audit, tier, verdict, tags, installCommand, video, dupes } = entry

  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: 'clamp(40px, 6vw, 80px) clamp(24px, 5vw, 48px)',
      }}>

        {/* Breadcrumb */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          color: 'var(--p-ink-muted)',
          marginBottom: '32px',
        }}>
          <Link href="/" style={{ color: 'var(--p-ink-muted)', textDecoration: 'none' }}>Directory</Link>
          {' / '}
          {name}
        </p>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(32px, 4vw, 44px)',
            fontWeight: 400,
            color: 'var(--p-ink)',
            lineHeight: 1.1,
            margin: 0,
          }}>
            {name}
          </h1>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            padding: '5px 12px',
            borderRadius: '4px',
            border: `1px solid ${TIER_COLOR[tier]}`,
            color: TIER_COLOR[tier],
            flexShrink: 0,
          }}>
            <span aria-hidden="true">{TIER_SHAPE[tier]}</span>
            {TIER_LABEL[tier]}
          </span>
        </div>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          lineHeight: 1.7,
          color: 'var(--p-ink-soft)',
          marginBottom: '32px',
        }}>
          {description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {tags.map(tag => (
            <span key={tag} style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              letterSpacing: '0.05em',
              color: 'var(--p-ink-muted)',
              border: '1px solid var(--p-border-strong)',
              padding: '3px 9px',
              borderRadius: '3px',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Verdict */}
        <section style={{ marginBottom: '40px' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--p-terra)',
            marginBottom: '12px',
          }}>
            Verdict
          </p>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(17px, 2vw, 20px)',
            lineHeight: 1.65,
            color: 'var(--p-ink)',
          }}>
            {verdict}
          </p>
        </section>

        {/* Teardown video */}
        {video && (
          <section style={{ marginBottom: '40px' }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--p-terra)',
              marginBottom: '12px',
            }}>
              Teardown
            </p>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '6px', overflow: 'hidden' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </section>
        )}

        {/* Install command */}
        <section style={{ marginBottom: '40px' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--p-terra)',
            marginBottom: '12px',
          }}>
            Install
          </p>
          <InstallCommand command={installCommand} />
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: 'var(--p-ink-muted)',
            marginTop: '8px',
          }}>
            Source:{' '}
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--p-blue)', textDecoration: 'none' }}
            >
              {repoUrl.replace('https://', '')}
            </a>
          </p>
        </section>

        {/* Audit receipts */}
        <section style={{ marginBottom: '40px' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--p-terra)',
            marginBottom: '4px',
          }}>
            Audit receipts
          </p>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: 'var(--p-ink-muted)',
            marginBottom: '16px',
          }}>
            Every listing is verified against a specific commit. These are the receipts.
          </p>

          <div style={{
            background: 'var(--p-bg-card)',
            borderRadius: '6px',
            padding: '0 20px',
            border: '1px solid var(--p-border)',
          }}>
            <AuditRow label="Commit sha" value={audit.sha.slice(0, 12) + '…'} />
            <AuditRow label="Audit date" value={audit.date} />
            <AuditRow
              label="Install check"
              value={audit.installs === 'pass' ? '✓ Pass' : '✗ Fail'}
              note={audit.installNote}
            />
            <AuditRow
              label="Risk scan"
              value={audit.riskScan === 'clean' ? '✓ Clean' : '⚠ Flagged'}
              note={audit.riskNote}
            />
            <AuditRow
              label="Kind"
              value={audit.kind === 'code-backed' ? 'Code-backed' : 'Prompt-only'}
            />
            <AuditRow label="Prose lines" value={audit.proseLines.toLocaleString()} />
            <AuditRow label="Code lines" value={audit.codeLines.toLocaleString()} />
            <AuditRow
              label="Prose/code ratio"
              value={audit.proseToCodeRatio.toFixed(2)}
            />
          </div>
        </section>

        {/* Cluster note */}
        {dupes && (
          <section style={{ marginBottom: '40px' }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--p-terra)',
              marginBottom: '12px',
            }}>
              Cluster note
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              lineHeight: 1.65,
              color: 'var(--p-ink-soft)',
              background: 'var(--p-bg-card)',
              padding: '16px 20px',
              borderRadius: '6px',
              border: '1px solid var(--p-border)',
            }}>
              {dupes.clusterNote}
            </p>
          </section>
        )}

        {/* Footer links */}
        <div style={{
          display: 'flex',
          gap: '24px',
          paddingTop: '24px',
          borderTop: '1px solid var(--p-border)',
          flexWrap: 'wrap',
        }}>
          <Link href="/" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--p-blue)', textDecoration: 'none' }}>
            ← All listings
          </Link>
          <Link href="/criteria" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--p-blue)', textDecoration: 'none' }}>
            Listing criteria
          </Link>
          <a href={repoUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--p-blue)', textDecoration: 'none' }}>
            GitHub repo ↗
          </a>
        </div>

      </div>
    </div>
  )
}
