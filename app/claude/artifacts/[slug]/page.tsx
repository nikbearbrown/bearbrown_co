import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CopyPrompt from '@/components/CopyPrompt'
import catalog from '@/data/catalog/artifact-pages.json'
import './artifact-doc.css'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return catalog.pages.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = catalog.pages.find((p) => p.slug === slug)
  if (!page) return {}
  return { title: `${page.title} — Artifacts — Bear Brown`, description: page.description.slice(0, 155) }
}

export default async function ArtifactPage({ params }: Props) {
  const { slug } = await params
  const page = catalog.pages.find((p) => p.slug === slug)
  if (!page) notFound()
  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '64px 24px' }}>
      <Link href="/claude/artifacts" style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--p-ink-muted)', textDecoration: 'none' }}>
        ← Artifacts
      </Link>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', color: 'var(--p-ink)', lineHeight: 1.15, margin: '24px 0 10px' }}>
        {page.title}
      </h1>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--p-ink-muted)', maxWidth: '600px', marginBottom: '18px' }}>
        {page.description}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
        <CopyPrompt text={page.raw} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--p-ink-muted)' }}>
          ~{(page.tokensApprox / 1000).toFixed(1)}k tokens of context · paste into any Claude chat, or save as Project instructions
        </span>
      </div>
      <article className="artifact-doc" dangerouslySetInnerHTML={{ __html: page.html }} />
    </main>
  )
}
