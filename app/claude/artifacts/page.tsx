import type { Metadata } from 'next'
import Link from 'next/link'
import catalog from '@/data/catalog/artifact-pages.json'

export const metadata: Metadata = {
  title: 'Artifacts — Bear Brown',
  description:
    'Paste-form prompts: complete consultant personas you copy into any Claude chat, or save as claude.ai Project instructions. Structure shown as published.',
}

export default function ArtifactsPage() {
  const pages = [...catalog.pages].sort((a, b) => a.title.localeCompare(b.title))
  return (
    <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '64px 24px' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--p-vermilion)', marginBottom: '18px' }}>
        Claude Tools Directory
      </p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', color: 'var(--p-ink)', lineHeight: 1.15, marginBottom: '16px' }}>
        Artifacts
      </h1>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--p-ink-muted)', maxWidth: '640px', marginBottom: '10px' }}>
        Paste-form prompts: complete consultant personas with commands, phase gates, and
        pushback rules. Copy one into any Claude chat, or save it as claude.ai Project
        instructions. The same tools ship in skill form from the bear-brown-tools repo.
      </p>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--p-ink-muted)', maxWidth: '640px', marginBottom: '44px' }}>
        Token counts are approximate context cost — what the prompt occupies in your window.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {pages.map((p) => (
          <Link
            key={p.slug}
            href={`/claude/artifacts/${p.slug}`}
            style={{
              display: 'flex', flexDirection: 'column', minHeight: '190px',
              background: 'var(--p-bg-card)', border: '1px solid var(--p-border)',
              borderRadius: '6px', padding: '24px', textDecoration: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--p-ink)', lineHeight: 1.2 }}>{p.title}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.05em', color: 'var(--p-ink-muted)', border: '1px solid var(--p-border-strong)', padding: '2px 7px', borderRadius: '3px', flexShrink: 0 }}>
                ~{(p.tokensApprox / 1000).toFixed(1)}k tokens
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--p-ink-muted)', lineHeight: 1.55, overflow: 'hidden' }}>
              {p.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}
