import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import InstallCommand from '@/components/InstallCommand/InstallCommand'
import { getEntry, getEntries } from '@/data/catalog/entries'

interface Props { params: Promise<{ slug: string }> }

const TIER_LABEL: Record<string, string> = { excellent: 'Excellent', strong: 'Strong', promising: 'Promising' }
const TIER_SHAPE: Record<string, string> = { excellent: '◆', strong: '●', promising: '▲' }
const TIER_COLOR: Record<string, string> = { excellent: '#0072B2', strong: '#3D3929', promising: '#D55E00' }

export function generateStaticParams() {
  return getEntries().map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = getEntry(slug)
  if (!entry) return {}
  return { title: `${entry.name} — Bear Brown Plugin Directory`, description: entry.description }
}

const sans: React.CSSProperties = { fontFamily: 'var(--font-sans)' }
const mono: React.CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '32px 0', borderTop: '1px solid var(--p-border)' }}>
      <p style={{ ...sans, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--p-terra)', marginBottom: '8px' }}>{eyebrow}</p>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '26px', color: 'var(--p-ink)', marginBottom: '18px' }}>{title}</h2>
      {children}
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', padding: '10px 0', borderBottom: '1px solid var(--p-border)' }}>
      <span style={{ ...sans, fontSize: '11px', color: 'var(--p-ink-muted)' }}>{label}</span>
      <span style={{ ...sans, fontSize: '11px', color: 'var(--p-ink)', textAlign: 'right', overflowWrap: 'anywhere' }}>{value}</span>
    </div>
  )
}

function AuditCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={{ border: '1px solid var(--p-border)', background: 'var(--p-bg-card)', borderRadius: '6px', padding: '17px' }}>
      <p style={{ ...sans, fontSize: '9px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '8px' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '21px', color: 'var(--p-ink)', margin: 0 }}>{value}</p>
      {note && <p style={{ ...sans, fontSize: '11px', lineHeight: 1.55, color: 'var(--p-ink-soft)', margin: '10px 0 0' }}>{note}</p>}
    </div>
  )
}

export default async function PluginPage({ params }: Props) {
  const { slug } = await params
  const entry = getEntry(slug)
  if (!entry) notFound()

  const related = getEntries()
    .filter((candidate) => candidate.slug !== slug && candidate.tags.some((tag) => entry.tags.includes(tag)))
    .slice(0, 3)
  const { audit } = entry

  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>
      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: 'clamp(44px, 7vw, 84px) clamp(24px, 5vw, 48px)' }}>
        <p style={{ ...sans, fontSize: '12px', color: 'var(--p-ink-muted)', marginBottom: '32px' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Claude Tools</Link>{' / '}
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Plugins</Link>{' / '}{entry.name}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: '820px' }}>
            <p style={{ ...sans, fontSize: '11px', letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--p-terra)', marginBottom: '16px' }}>Audited plugin listing</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, color: 'var(--p-ink)', marginBottom: '20px' }}>{entry.name}</h1>
          </div>
          <span style={{ ...sans, display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: '4px', border: `1px solid ${TIER_COLOR[entry.tier]}`, color: TIER_COLOR[entry.tier] }}>
            <span aria-hidden="true">{TIER_SHAPE[entry.tier]}</span>{TIER_LABEL[entry.tier]}
          </span>
        </div>
        <p style={{ ...sans, fontSize: '17px', lineHeight: 1.7, color: 'var(--p-ink-soft)', maxWidth: '800px', marginBottom: '24px' }}>{entry.description}</p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {entry.tags.map((tag) => <span key={tag} style={{ ...sans, fontSize: '10px', letterSpacing: '0.05em', color: 'var(--p-ink-muted)', border: '1px solid var(--p-border-strong)', padding: '4px 9px', borderRadius: '3px' }}>{tag}</span>)}
        </div>

        <div style={{ background: 'var(--p-bg-card)', border: '1px solid var(--p-border-strong)', borderRadius: '6px', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '6px', padding: '10px 14px', borderBottom: '1px solid var(--p-border)', background: 'var(--p-bg)' }}>
            {['Overview', 'Install', 'Audit'].map((tab, index) => <span key={tab} style={{ ...sans, fontSize: '10px', letterSpacing: '0.05em', color: index === 0 ? 'var(--p-ink)' : 'var(--p-ink-muted)', border: index === 0 ? '1px solid var(--p-border-strong)' : '1px solid transparent', borderRadius: '3px', padding: '4px 8px' }}>{tab}</span>)}
          </div>
          <div style={{ padding: '16px 18px' }}><InstallCommand command={entry.installCommand} /></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-10 items-start">
          <div>
            <div style={{ marginBottom: '28px' }}>
              <p style={{ ...sans, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '12px' }}>Listing signals</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '10px' }}>
                <AuditCard label="Install check" value={audit.installs === 'pass' ? '✓ Pass' : '✕ Fail'} />
                <AuditCard label="Risk scan" value={audit.riskScan === 'clean' ? '✓ Clean' : '⚠ Flagged'} />
                <AuditCard label="Implementation" value={audit.kind === 'code-backed' ? 'Code-backed' : 'Prompt-only'} />
              </div>
            </div>

            <Section eyebrow="Assessment" title="Verdict">
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(17px, 2vw, 20px)', lineHeight: 1.7, color: 'var(--p-ink)', margin: 0 }}>{entry.verdict}</p>
            </Section>

            {entry.video && (
              <Section eyebrow="Review" title="Video teardown">
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '6px', overflow: 'hidden' }}>
                  <iframe src={`https://www.youtube-nocookie.com/embed/${entry.video.youtubeId}`} title={entry.video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
                </div>
              </Section>
            )}

            <Section eyebrow="Installation" title="Add to Claude Code">
              <InstallCommand command={entry.installCommand} />
              <p style={{ ...sans, fontSize: '12px', color: 'var(--p-ink-muted)', marginTop: '10px' }}>Source: <a href={entry.repoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--p-blue)', textDecoration: 'none' }}>{entry.repoUrl.replace('https://', '')}</a></p>
            </Section>

            <Section eyebrow="Evidence" title="Audit receipts">
              <p style={{ ...sans, fontSize: '13px', lineHeight: 1.65, color: 'var(--p-ink-muted)', margin: '0 0 18px' }}>This listing is tied to a specific source commit and records both installation and risk checks.</p>
              <div style={{ display: 'grid', gap: '10px' }}>
                <AuditCard label="Install check" value={audit.installs === 'pass' ? '✓ Pass' : '✕ Fail'} note={audit.installNote} />
                <AuditCard label="Risk scan" value={audit.riskScan === 'clean' ? '✓ Clean' : '⚠ Flagged'} note={audit.riskNote} />
              </div>
            </Section>

            <Section eyebrow="Composition" title="What was measured">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '10px' }}>
                <AuditCard label="Prose lines" value={audit.proseLines.toLocaleString()} />
                <AuditCard label="Code lines" value={audit.codeLines.toLocaleString()} />
                <AuditCard label="Prose / code" value={audit.proseToCodeRatio.toFixed(2)} />
              </div>
            </Section>

            {entry.dupes && <Section eyebrow="Similarity" title="Cluster note"><p style={{ ...sans, fontSize: '14px', lineHeight: 1.7, color: 'var(--p-ink-soft)', margin: 0 }}>{entry.dupes.clusterNote}</p></Section>}

            {related.length > 0 && (
              <Section eyebrow="Related" title="Similar audited plugins">
                <div style={{ display: 'grid', gap: '10px' }}>
                  {related.map((item) => <Link key={item.slug} href={`/plugins/${item.slug}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '14px 16px', border: '1px solid var(--p-border)', borderRadius: '5px', textDecoration: 'none', background: 'var(--p-bg-card)' }}><span style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', color: 'var(--p-ink)' }}>{item.name}</span><span style={{ ...sans, fontSize: '10px', color: 'var(--p-ink-muted)' }}>{TIER_LABEL[item.tier]}</span></Link>)}
                </div>
              </Section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24" style={{ display: 'grid', gap: '14px' }}>
            <div style={{ border: '1px solid var(--p-border)', borderRadius: '6px', background: 'var(--p-bg-card)', padding: '18px' }}>
              <p style={{ ...sans, fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '16px' }}>Details</p>
              <DetailRow label="Type" value="Plugin" />
              <DetailRow label="Quality" value={TIER_LABEL[entry.tier]} />
              <DetailRow label="Kind" value={audit.kind === 'code-backed' ? 'Code-backed' : 'Prompt-only'} />
              <DetailRow label="Audited" value={audit.date} />
              <DetailRow label="Commit" value={<code style={mono}>{audit.sha.slice(0, 12)}…</code>} />
            </div>
            <div style={{ border: '1px solid var(--p-border)', borderRadius: '6px', background: 'var(--p-bg-card)', padding: '18px' }}>
              <p style={{ ...sans, fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '14px' }}>Tags</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>{entry.tags.map((tag) => <span key={tag} style={{ ...sans, fontSize: '10px', color: 'var(--p-ink-muted)', border: '1px solid var(--p-border-strong)', borderRadius: '3px', padding: '4px 7px' }}>{tag}</span>)}</div>
            </div>
            <div style={{ border: '1px solid var(--p-border)', borderRadius: '6px', padding: '18px' }}>
              <p style={{ ...sans, fontSize: '10px', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', marginBottom: '10px' }}>Source repository</p>
              <a href={entry.repoUrl} target="_blank" rel="noopener noreferrer" style={{ ...sans, display: 'block', fontSize: '12px', lineHeight: 1.55, color: 'var(--p-blue)', textDecoration: 'none', overflowWrap: 'anywhere' }}>{entry.repoUrl.replace('https://github.com/', '')} ↗</a>
            </div>
          </aside>
        </div>

        <div style={{ display: 'flex', gap: '24px', paddingTop: '28px', borderTop: '1px solid var(--p-border)', flexWrap: 'wrap' }}>
          <Link href="/" style={{ ...sans, fontSize: '13px', color: 'var(--p-terra)', textDecoration: 'none' }}>← All plugins</Link>
          <Link href="/criteria" style={{ ...sans, fontSize: '13px', color: 'var(--p-terra)', textDecoration: 'none' }}>Listing criteria</Link>
        </div>
      </main>
    </div>
  )
}
