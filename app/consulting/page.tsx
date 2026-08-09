import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consulting — Bear Brown',
  description: 'Bear Brown builds bespoke AI for startups that need to move — as consultant, equity advisor, and talent connector. No bloated retainers. No generalists.',
}

export default function ConsultingPage() {
  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: 'clamp(48px, 7vw, 96px) clamp(24px, 5vw, 48px)',
      }}>

        {/* Hero */}
        <div style={{ paddingBottom: '40px', borderBottom: '1px solid var(--p-border)' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--p-ink-soft)',
            fontWeight: 600,
            marginBottom: '14px',
          }}>
            Consulting
          </p>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(22px, 2.5vw, 30px)',
            fontWeight: 500,
            lineHeight: 1.28,
            margin: 0,
            color: 'var(--p-ink)',
          }}>
            Bear Brown builds bespoke AI for startups that need to move — as consultant, equity advisor, and talent connector.{' '}
            <strong style={{ color: 'var(--p-terra)', fontWeight: 600 }}>
              No bloated retainers. No generalists. Skin in the game, top-tier engineers, and AI that actually ships.
            </strong>
          </p>
        </div>

        {/* Body */}
        <section style={{ padding: '40px 0', borderBottom: '1px solid var(--p-border)' }}>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(18px, 2vw, 20px)',
            lineHeight: 1.6,
            color: 'var(--p-ink)',
            margin: 0,
          }}>
            <span style={{ color: 'var(--p-terra)', fontWeight: 600 }}>
              Most AI consultants give you a roadmap and send an invoice. Bear Brown takes equity.
            </span>{' '}
            As founder of Bear Brown &amp; Company and Associate Teaching Professor of Engineering at
            Northeastern University — where he leads the AI for Education Project and collaborates with
            the Broad Institute and Harvard Medical School — he brings rare depth to early-stage AI
            advising: bespoke AI strategy, hands-on build support, and a direct line to exceptional
            recent engineering graduates at entry-level rates. His research spans machine learning,
            reinforcement learning, deep learning, and computational biology. His practice spans the
            gap between research-grade AI and organizations that need it working by next quarter. He
            holds a Ph.D. in computer science from UCLA, a postdoc from Harvard Medical School, and an
            MBA — and a career's worth of proof that AI doesn&apos;t have to be a black box to be brilliant.
          </p>
        </section>

        {/* CTA */}
        <section style={{ padding: '40px 0', borderBottom: '1px solid var(--p-border)' }}>
          <div style={{
            background: 'var(--p-ink)',
            borderRadius: '14px',
            padding: '26px',
            textAlign: 'center',
            fontFamily: 'var(--font-sans)',
          }}>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '24px',
              marginBottom: '6px',
              color: 'var(--p-bg)',
            }}>
              Work with him
            </p>
            <p style={{ margin: 0, color: 'var(--p-bg)' }}>
              Email Nik at{' '}
              <a
                href="mailto:bear@bearbrown.co"
                style={{ color: '#F0C9B8', fontWeight: 600, textDecoration: 'none' }}
              >
                bear@bearbrown.co
              </a>
              {' '}— or start at{' '}
              <a
                href="https://bearbrown.co"
                style={{ color: '#F0C9B8', fontWeight: 600, textDecoration: 'none' }}
              >
                bearbrown.co
              </a>
              .
            </p>
          </div>
        </section>

        {/* Footer credential */}
        <div style={{ paddingTop: '26px' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--p-ink-soft)',
            margin: 0,
          }}>
            Nik Bear Brown, PhD · Associate Teaching Professor, College of Engineering,
            Northeastern University ·{' '}
            <a
              href="https://bearbrown.co"
              style={{ color: 'var(--p-terra)', textDecoration: 'none' }}
            >
              bearbrown.co
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
