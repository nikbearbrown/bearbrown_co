import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Essays — Bear Brown',
  description: 'Writing from Nik Bear Brown — skepticism.ai, Theorist, Hypothetical, Musinique, and Bear Brown Co.',
}

const PUBS = [
  {
    name: 'skepticism.ai',
    url: 'https://skepticism.ai',
    description: 'The epistemics of machine-generated claims, computational skepticism, and what it means to verify.',
    tag: 'AI · Epistemics',
  },
  {
    name: 'Theorist',
    url: 'https://theorist.substack.com',
    description: 'Frameworks for thinking about technology, education, and what comes after.',
    tag: 'Ideas',
  },
  {
    name: 'Hypothetical',
    url: 'https://hypothetical.substack.com',
    description: 'Thought experiments and counterfactuals — what would happen if.',
    tag: 'Speculative',
  },
  {
    name: 'Musinique',
    url: 'https://musinique.com',
    description: 'Music, artists, and the human creative process — writing from the Musinique stable.',
    tag: 'Music · Art',
  },
  {
    name: 'Bear Brown Co.',
    url: 'https://bearbrownco.substack.com',
    description: 'The main newsletter — notes on AI, education, and building things that matter.',
    tag: 'Newsletter',
  },
]

export default function EssaysPage() {
  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: 'clamp(60px, 8vw, 100px) clamp(24px, 5vw, 48px)',
      }}>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--p-terra)',
          marginBottom: '20px',
        }}>
          Essays & Writing
        </p>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 400,
          color: 'var(--p-ink)',
          lineHeight: 1.1,
          marginBottom: '24px',
        }}>
          Writing from Nik Bear Brown
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          lineHeight: 1.75,
          color: 'var(--p-ink-soft)',
          marginBottom: '56px',
        }}>
          Published across five outlets — each with its own scope and register. The blog on this site is a separate feed. The publications below are the longer-form work.
        </p>

        {/* Publication list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {PUBS.map((pub, i) => (
            <a
              key={pub.name}
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '28px 0',
                borderTop: i === 0 ? '1px solid var(--p-border)' : 'none',
                borderBottom: '1px solid var(--p-border)',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                marginBottom: '8px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '22px',
                  fontWeight: 400,
                  color: 'var(--p-ink)',
                  lineHeight: 1.2,
                }}>
                  {pub.name}
                </span>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '10px',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: 'var(--p-ink-muted)',
                  border: '1px solid var(--p-border-strong)',
                  padding: '3px 8px',
                  borderRadius: '3px',
                  flexShrink: 0,
                  marginTop: '4px',
                }}>
                  {pub.tag}
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                lineHeight: 1.65,
                color: 'var(--p-ink-soft)',
                margin: 0,
              }}>
                {pub.description}
              </p>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--p-terra)',
                marginTop: '8px',
              }}>
                ↗ {pub.url.replace('https://', '')}
              </p>
            </a>
          ))}
        </div>

        {/* Blog link */}
        <div style={{ marginTop: '48px' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: 'var(--p-ink-soft)',
            marginBottom: '8px',
          }}>
            Shorter posts live on the site blog:
          </p>
          <Link
            href="/blog"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: 'var(--p-blue)',
              textDecoration: 'none',
            }}
          >
            Browse the blog →
          </Link>
        </div>

      </div>
    </div>
  )
}
