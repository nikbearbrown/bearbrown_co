import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Consulting — Bear Brown',
  description: 'We handle the AI. You handle the humanity. AI consulting, development, and talent connection from Nik Bear Brown.',
}

const TOC_GROUPS = [
  {
    label: 'THE BELIEF',
    entries: [
      { title: 'Irreducibly human',          num: '1.1', slug: 'irreducibly-human' },
      { title: 'The solve–verify asymmetry', num: '1.2', slug: 'solve-verify-asymmetry' },
      { title: 'What AI can and cannot do',  num: '1.3', slug: 'what-ai-cannot-do' },
    ],
  },
  {
    label: 'THREE WAYS TO WORK',
    entries: [
      { title: 'Build',   num: '2.1', slug: 'build' },
      { title: 'Advise',  num: '2.2', slug: 'advise' },
      { title: 'Connect', num: '2.3', slug: 'connect' },
    ],
  },
  {
    label: "WHAT WE'VE BUILT",
    entries: [
      { title: 'Medhavy — Adaptive Learning',  num: '3.1', slug: 'medhavy' },
      { title: 'Humanitarians AI',             num: '3.2', slug: 'humanitarians-ai' },
      { title: 'Irreducibly Human curriculum', num: '3.3', slug: 'irreducibly-human-curriculum' },
      { title: 'Boondoggling',                 num: '3.4', slug: 'boondoggling' },
      { title: 'Computational Skepticism',     num: '3.5', slug: 'computational-skepticism' },
      { title: 'Brutalist',                    num: '3.6', slug: 'brutalist' },
    ],
  },
]

const WORK_CARDS = [
  {
    num: '2.1',
    title: 'Build',
    body: 'Bespoke AI development for organizations that know what they believe and need a system that reflects it.\n\nRecent grad developers supervised by Bear Brown. Entry-level prices. No lock-in. No placement fee if you hire the developer. $35/hr development. $200/hr Bear Brown time, when needed.',
  },
  {
    num: '2.2',
    title: 'Advise',
    body: 'Early-stage AI strategy for founders entering new categories. Bear Brown takes equity for expertise — long-term skin in the game, not a consulting invoice.',
  },
  {
    num: '2.3',
    title: 'Connect',
    body: 'Top recent engineering graduates, Bear Brown-vetted, matched to organizations that need exceptional talent at honest prices.',
  },
]

const sectionPad: React.CSSProperties = {
  padding: 'clamp(80px, 10vw, 120px) clamp(24px, 5vw, 80px) 80px',
}

const hr = (
  <hr style={{ border: 'none', borderTop: '1px solid var(--m-border)', margin: 0 }} />
)

export default function ConsultingPage() {
  return (
    <div style={{ background: 'var(--m-bg)', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        padding: 'clamp(64px, 8vw, 100px) clamp(24px, 5vw, 80px)',
        maxWidth: '780px',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--m-text-tertiary)',
          marginBottom: '28px',
        }}>
          THE BEAR BROWN METHOD
        </p>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(44px, 5.5vw, 72px)',
          fontWeight: 400,
          lineHeight: 1.05,
          color: 'var(--m-text-primary)',
          letterSpacing: '-0.01em',
          marginBottom: '32px',
        }}>
          We handle the AI.<br />
          You handle the<br />
          humanity.
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          lineHeight: 1.65,
          color: 'var(--m-text-secondary)',
          maxWidth: '440px',
          marginBottom: '40px',
        }}>
          Bear Brown builds AI infrastructure for people who have something
          human to say — and need the technology to stay out of the way
          while they say it.
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--m-text-tertiary)',
          letterSpacing: '0.04em',
        }}>
          {'→ '}
          <a
            href="mailto:bear@bearbrown.co"
            style={{
              color: 'var(--m-text-primary)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--m-border-strong)',
              paddingBottom: '1px',
            }}
          >
            bear@bearbrown.co
          </a>
        </p>
      </section>

      {hr}

      {/* What Bear Brown Does */}
      <section style={sectionPad}>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 400,
          lineHeight: 1.2,
          color: 'var(--m-text-primary)',
          maxWidth: '720px',
          marginBottom: '40px',
        }}>
          Your creativity stays yours. Your judgment stays yours. Your vision stays yours.
          We handle everything else.
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '17px',
          lineHeight: 1.75,
          color: 'var(--m-text-secondary)',
          maxWidth: '600px',
          marginBottom: '20px',
        }}>
          Researchers. Educators. Founders. Investors. They come to Bear Brown with a
          belief about how something should work — a framework, a pedagogy, a market
          thesis — and we build the AI infrastructure that makes it real.
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '17px',
          lineHeight: 1.75,
          color: 'var(--m-text-secondary)',
          maxWidth: '600px',
        }}>
          The AI takes the back seat. Almost invisible. Present when a human needs it.
          In service of what that human is trying to do.
        </p>
      </section>

      {hr}

      {/* The Method — TOC */}
      <section style={{ padding: '72px clamp(24px, 5vw, 80px)' }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--m-text-tertiary)',
          marginBottom: '32px',
        }}>
          The Method
        </p>
        {TOC_GROUPS.map((group, gi) => (
          <div key={group.label}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '32px 0 20px',
              borderTop: gi === 0 ? 'none' : '1px solid var(--m-border)',
            }}>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--m-text-tertiary)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}>
                {group.label}
              </p>
              <div style={{ flex: 1, borderTop: '1px dashed var(--m-border)' }} />
            </div>

            {group.entries.map((entry) => (
              <Link
                key={entry.slug}
                href={`/method/${entry.slug}`}
                className="toc-row-link"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '14px 0',
                  borderBottom: '1px solid var(--m-border)',
                  textDecoration: 'none',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(20px, 2.5vw, 26px)',
                  fontWeight: 400,
                  color: 'var(--m-text-secondary)',
                  transition: 'color 0.15s',
                }}>
                  {entry.title}
                </span>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  color: 'var(--m-text-tertiary)',
                  letterSpacing: '0.08em',
                }}>
                  {entry.num}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </section>

      {hr}

      {/* Three Ways to Work */}
      <section style={sectionPad}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--m-text-tertiary)',
          marginBottom: '40px',
        }}>
          THREE WAYS TO WORK
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}>
          {WORK_CARDS.map((card) => (
            <div
              key={card.num}
              style={{
                border: '1px solid var(--m-border)',
                borderRadius: '6px',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.08em', color: 'var(--m-text-tertiary)' }}>{card.num}</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, color: 'var(--m-text-primary)', lineHeight: 1.1 }}>{card.title}</span>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.7, color: 'var(--m-text-secondary)', flex: 1, whiteSpace: 'pre-line' }}>{card.body}</p>
              <a href="mailto:bear@bearbrown.co" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--m-accent)', textDecoration: 'none', letterSpacing: '0.03em' }}>
                → bear@bearbrown.co
              </a>
            </div>
          ))}
        </div>
      </section>

      {hr}

      {/* The Belief */}
      <section style={sectionPad}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--m-text-tertiary)', marginBottom: '48px' }}>
          THE BELIEF
        </p>
        {[
          'AI can generate the ideas. It cannot care which one matters.',
          'AI can write the code. It cannot decide what is worth building.',
          'AI can produce the output. It cannot be accountable for it.',
          'AI can optimize the decision. It cannot live with the consequences.',
        ].map((line) => (
          <p key={line} style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 400, lineHeight: 1.5, color: 'var(--m-text-secondary)', marginBottom: '8px' }}>
            {line}
          </p>
        ))}
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', lineHeight: 1.65, color: 'var(--m-text-secondary)', maxWidth: '560px', marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--m-border)' }}>
          AI can and should do many things. The rest is irreducibly human.
        </p>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 400, color: 'var(--m-text-primary)', marginTop: '16px' }}>
          Bear Brown exists for the rest.
        </p>
      </section>

    </div>
  )
}
