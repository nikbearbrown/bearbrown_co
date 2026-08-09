import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Talent — Bear Brown & Co.',
  description: 'We build AI-era web apps using recent graduates from top AI programs. A structured way to audition top AI talent on a real project — and hire them away, no placement fee.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '52px' }}>
      <h2 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(22px, 2.5vw, 28px)',
        fontWeight: 400,
        color: 'var(--p-ink)',
        lineHeight: 1.2,
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--p-border)',
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-sans)',
      fontSize: '16px',
      lineHeight: 1.75,
      color: 'var(--p-ink-soft)',
      maxWidth: '660px',
      marginBottom: '16px',
      margin: '0 0 16px',
    }}>
      {children}
    </p>
  )
}

function LaneCard({
  label,
  price,
  children,
}: {
  label: string
  price: string
  children: React.ReactNode
}) {
  return (
    <div style={{
      flex: '1 1 300px',
      background: 'var(--p-bg-card)',
      border: '1px solid var(--p-border-strong)',
      borderRadius: '6px',
      padding: '28px 24px',
    }}>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--p-terra)',
        marginBottom: '4px',
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '24px',
        fontWeight: 400,
        color: 'var(--p-ink)',
        marginBottom: '20px',
        lineHeight: 1.2,
      }}>
        {price}
      </p>
      {children}
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      paddingBottom: '10px',
      marginBottom: '10px',
      borderBottom: '1px solid var(--p-border)',
    }}>
      <span style={{ color: 'var(--p-terra)', flexShrink: 0, lineHeight: 1.6, fontSize: '14px' }} aria-hidden="true">—</span>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        lineHeight: 1.65,
        color: 'var(--p-ink-soft)',
      }}>
        {children}
      </span>
    </div>
  )
}

function WhyItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--p-ink)',
        letterSpacing: '0.01em',
      }}>
        {label}{' '}
      </span>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '15px',
        lineHeight: 1.7,
        color: 'var(--p-ink-soft)',
      }}>
        {children}
      </span>
    </div>
  )
}

export default function TalentPage() {
  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: 'clamp(48px, 7vw, 96px) clamp(24px, 5vw, 48px)',
      }}>

        {/* Hero */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--p-terra)',
          marginBottom: '20px',
        }}>
          Talent
        </p>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(36px, 5.5vw, 56px)',
          fontWeight: 400,
          color: 'var(--p-ink)',
          lineHeight: 1.05,
          marginBottom: '16px',
          letterSpacing: '-0.01em',
        }}>
          Bear Brown &amp; Co.
        </h1>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(18px, 2vw, 22px)',
          fontStyle: 'italic',
          color: 'var(--p-ink-soft)',
          lineHeight: 1.4,
          marginBottom: '0',
        }}>
          A professor sees the best. Hire them away, please.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)', margin: '48px 0' }} />

        {/* What we do */}
        <Section title="What we do">
          <Body>
            We build AI-era web apps — interactive tools, dashboards, assessments, wrappers around your models and data — using open-source tools and recent graduates from top AI programs.
          </Body>
          <Body>
            The code is real work, delivered fast and cheap. But the bigger thing we offer is a structured way to audition top AI talent on a real project. If you want to hire the person who built your app, we&apos;ll introduce you. <strong>No placement fee. No non-solicit. That&apos;s the point.</strong>
          </Body>
        </Section>

        {/* Two lanes */}
        <Section title="Two lanes. No middle.">
          <div style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            marginTop: '4px',
          }}>
            <LaneCard label="Open Lane" price="$35/hr">
              <Body>For the 95% of what most clients need: wrapping your vision in open-source tools so people can actually use it.</Body>
              <div style={{ marginTop: '16px' }}>
                <Bullet>Recent grad developers, supervised by Prof. Nik Bear Brown (Northeastern University, College of Engineering)</Bullet>
                <Bullet>$35/hr, billed weekly</Bullet>
                <Bullet>Open source only — MIT, Apache, BSD dependencies</Bullet>
                <Bullet>No NDAs. If your project needs one, it belongs in the Bespoke Lane.</Bullet>
                <Bullet>Client never shares proprietary IP with us. We build the wrapper; your secret sauce stays yours.</Bullet>
                <Bullet>Client owns the code and can do whatever they want with it.</Bullet>
                <Bullet>No warranty period. Bugs get fixed at the hourly rate. Retainers available.</Bullet>
                <Bullet>Either side can stop at a week boundary. No long-term commitment.</Bullet>
                <Bullet><strong>Hire the grads.</strong> If you want to bring the developer in-house, we&apos;ll introduce you at no cost. If it happens mid-project, we cover the shadowing cost for a clean handoff.</Bullet>
              </div>
            </LaneCard>

            <LaneCard label="Bespoke Lane" price="$200+/hr or equity">
              <Body>For the 5% that genuinely needs it.</Body>
              <div style={{ marginTop: '16px' }}>
                <Bullet>Nik directly, possibly with vetted senior collaborators</Bullet>
                <Bullet>$200+/hr, equity, or both — priced per engagement</Bullet>
                <Bullet>NDAs, exclusivity, direct IP handling — all on the table</Bullet>
                <Bullet>Meaningful engagement size. Not a weekend gig.</Bullet>
              </div>
            </LaneCard>
          </div>
        </Section>

        {/* Why this works */}
        <Section title="Why this works">
          <WhyItem label="For clients:">
            Essential work done — and a possible first employee. You get a working app at a rate no dev shop can match, built on infrastructure you can maintain yourself, by someone you can hire if they're a fit. The structure of the engagement is itself the interview.
          </WhyItem>
          <WhyItem label="For grads:">
            Real paid project experience, real professional references, and a direct path to a job with a client who's already seen their work.
          </WhyItem>
          <WhyItem label="The moat:">
            The economics only work because Nik teaches hundreds of students a year and knows who the strong ones are. No dev shop can replicate the vetting. That&apos;s the moat, stated plainly.
          </WhyItem>
        </Section>

        {/* What we build */}
        <Section title="What we build">
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            maxWidth: '660px',
          }}>
            {[
              'Interactive assessment tools (sliders, spider charts, scoring dashboards)',
              'Data viz and executive dashboards',
              'LLM-wrapper applications over your existing models, data, or workflows',
              'Agentic systems — multi-step automations, tool-using agents, workflow orchestration',
              'Research tools — literature review, data gathering, analysis pipelines',
              'Fine-tuned models on your open data',
              'Internal tools, client-facing portals, prototypes',
              'Anything where the goal is to make your vision usable by other people',
            ].map((item) => (
              <li key={item} style={{
                display: 'flex',
                gap: '12px',
                padding: '10px 0',
                borderBottom: '1px solid var(--p-border)',
              }}>
                <span style={{ color: 'var(--p-blue)', flexShrink: 0, lineHeight: 1.65, fontSize: '14px' }} aria-hidden="true">→</span>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  lineHeight: 1.65,
                  color: 'var(--p-ink-soft)',
                }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* "What we don't" callout */}
          <div style={{
            background: 'var(--p-bg-card)',
            border: '1px solid var(--p-border-strong)',
            borderLeft: '3px solid var(--p-terra)',
            borderRadius: '4px',
            padding: '20px 24px',
            maxWidth: '660px',
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'var(--p-ink-soft)',
              margin: 0,
            }}>
              We don't build your core model. We don't touch your training data. We don't want to see your customer list. We build the part that turns your work into something people can interact with.
            </p>
          </div>
        </Section>

        {/* How to start */}
        <Section title="How to start">
          <Body>
            Email Nik at{' '}
            <a
              href="mailto:bear@bearbrown.co"
              style={{ color: 'var(--p-blue)', textDecoration: 'none' }}
            >
              bear@bearbrown.co
            </a>
            {' '}with a rough description of what you want to build. We'll scope it in a short call, match you with a grad, and start week one.
          </Body>
        </Section>

        {/* Footer credential */}
        <div style={{
          paddingTop: '32px',
          borderTop: '1px solid var(--p-border)',
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--p-ink-muted)',
            lineHeight: 1.6,
          }}>
            Nik Bear Brown, PhD · Associate Teaching Professor, College of Engineering, Northeastern University{' '}
            <a href="https://bearbrown.co" style={{ color: 'var(--p-blue)', textDecoration: 'none' }}>bearbrown.co</a>
            {' '}·{' '}
            <a href="https://nikbearbrown.com" style={{ color: 'var(--p-blue)', textDecoration: 'none' }}>nikbearbrown.com</a>
          </p>
        </div>

      </div>
    </div>
  )
}
