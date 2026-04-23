import Link from 'next/link'

const TOC_GROUPS = [
  {
    label: 'THE BELIEF',
    entries: [
      { title: 'Irreducibly human',             num: '1.1', slug: 'irreducibly-human' },
      { title: 'The solve–verify asymmetry',    num: '1.2', slug: 'solve-verify-asymmetry' },
      { title: 'What AI can and cannot do',     num: '1.3', slug: 'what-ai-cannot-do' },
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
      { title: 'Medhavy — cancer nanomedicine AI',  num: '3.1', slug: 'medhavy' },
      { title: 'Humanitarians AI',                  num: '3.2', slug: 'humanitarians-ai' },
      { title: 'Irreducibly Human curriculum',      num: '3.3', slug: 'irreducibly-human-curriculum' },
      { title: 'Boondoggling',                      num: '3.4', slug: 'boondoggling' },
    ],
  },
]

const PUBS = [
  { label: 'skepticism.ai',  href: 'https://skepticism.ai' },
  { label: 'Musinique',      href: 'https://musinique.com' },
  { label: 'Theorist',       href: 'https://theorist.substack.com' },
  { label: 'Hypothetical',   href: 'https://hypothetical.substack.com' },
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

export default function Home() {
  return (
    <div style={{ background: 'var(--m-bg)', minHeight: '100vh' }}>

      {/* Section A — Hero */}
      <section style={sectionPad}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--m-text-tertiary)',
          marginBottom: '32px',
        }}>
          THE BEAR BROWN METHOD
        </p>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(52px, 8vw, 96px)',
          fontWeight: 400,
          lineHeight: 1.0,
          color: 'var(--m-text-primary)',
          letterSpacing: '-0.01em',
          marginBottom: '40px',
        }}>
          We handle<br />
          the AI. You<br />
          handle the<br />
          humanity.
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          lineHeight: 1.65,
          color: 'var(--m-text-secondary)',
          maxWidth: '520px',
          marginBottom: '48px',
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

      {/* Section B — TOC + Video/Bio */}
      <section>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}>
          {/* Left — TOC */}
          <div style={{ padding: 'clamp(60px, 7vw, 80px) clamp(24px, 5vw, 80px)' }}>
            {TOC_GROUPS.map((group) => (
              <div key={group.label} style={{ marginBottom: '48px' }}>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--m-text-tertiary)',
                  fontWeight: 500,
                  marginBottom: '16px',
                }}>
                  {group.label}
                </p>
                {group.entries.map((entry, i) => (
                  <Link
                    key={entry.slug}
                    href={`/method/${entry.slug}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      padding: '10px 0',
                      borderBottom: i < group.entries.length - 1 ? '1px dashed var(--m-border)' : 'none',
                      textDecoration: 'none',
                    }}
                    className="toc-row-link"
                  >
                    <span style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '20px',
                      fontWeight: 400,
                      color: 'var(--m-text-secondary)',
                      transition: 'color 0.15s',
                    }}
                    className="toc-title-text"
                    >
                      {entry.title}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      color: 'var(--m-text-tertiary)',
                      letterSpacing: '0.06em',
                    }}>
                      {entry.num}
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Right — Watch + Bio */}
          <div style={{
            padding: 'clamp(60px, 7vw, 80px) clamp(24px, 5vw, 80px)',
            borderLeft: '1px solid var(--m-border)',
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--m-text-tertiary)',
              fontWeight: 500,
              marginBottom: '16px',
            }}>
              WATCH
            </p>
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              marginBottom: '40px',
            }}>
              <iframe
                src="https://www.youtube.com/embed/GN7yQntWJHU"
                title="Bear Brown — Build This or Want to Build an AI App?"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '6px',
                }}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--m-border)', paddingTop: '40px' }}>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--m-text-tertiary)',
                fontWeight: 500,
                marginBottom: '16px',
              }}>
                NIK BEAR BROWN
              </p>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '17px',
                color: 'var(--m-text-secondary)',
                lineHeight: 1.7,
                marginBottom: '24px',
              }}>
                Professor at Northeastern University. Founder of Humanitarians AI.
                Co-founder of Medhavy AI. Writing at skepticism.ai, Theorist,
                Hypothetical, and Musinique.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {PUBS.map((pub) => (
                  <a
                    key={pub.label}
                    href={pub.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pub-pill"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      letterSpacing: '0.05em',
                      color: 'var(--m-text-tertiary)',
                      textDecoration: 'none',
                      border: '1px solid var(--m-border-strong)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                  >
                    {pub.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {hr}

      {/* Section C — The Belief */}
      <section style={sectionPad}>
        {[
          'AI can generate the ideas. It cannot care which one matters.',
          'AI can write the code. It cannot decide what is worth building.',
          'AI can produce the output. It cannot be accountable for it.',
          'AI can optimize the decision. It cannot live with the consequences.',
        ].map((line) => (
          <p key={line} style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(20px, 3vw, 30px)',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'var(--m-text-secondary)',
            marginBottom: '4px',
          }}>
            {line}
          </p>
        ))}
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(20px, 3vw, 30px)',
          fontWeight: 400,
          color: 'var(--m-text-primary)',
          marginTop: '40px',
          paddingTop: '40px',
          borderTop: '1px solid var(--m-border)',
        }}>
          Bear Brown exists for the rest.
        </p>
      </section>

      {hr}

      {/* Section D — Three ways to work */}
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
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: 'var(--m-text-tertiary)',
              }}>
                {card.num}
              </span>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '26px',
                fontWeight: 400,
                color: 'var(--m-text-primary)',
                lineHeight: 1.1,
              }}>
                {card.title}
              </span>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                lineHeight: 1.7,
                color: 'var(--m-text-secondary)',
                flex: 1,
                whiteSpace: 'pre-line',
              }}>
                {card.body}
              </p>
              <a
                href="mailto:bear@bearbrown.co"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'var(--m-accent)',
                  textDecoration: 'none',
                  letterSpacing: '0.03em',
                }}
              >
                → bear@bearbrown.co
              </a>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
