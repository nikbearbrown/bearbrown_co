import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roll your own — Bear Brown',
  description: 'A plugin is just components packaged together. Pick the audited ones that fit your work — and we audit the bundle you build.',
}

const steps = [
  {
    title: 'Pick from the audited catalog.',
    body: 'Browse by type, stack, or field; add the components you want to your bundle.',
  },
  {
    title: 'We re-audit the bundle you built.',
    body: 'Two clean components can be unsafe together, so the whole gets its own audit — not just its parts\'.',
  },
  {
    title: 'If it flags something, you get the fix — not just a verdict.',
    body: 'A plain suggestion, usually a one-click swap to a better component in the same cluster, or a ready-to-run prompt. Apply it, and it re-audits until clean.',
  },
  {
    title: 'Install your own plugin.',
    body: 'A pinned, lineage-credited bundle, listed on the same terms as everything else: no audit, no listing.',
  },
]

export default function RollYourOwnPage() {
  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>
      <div style={{
        maxWidth: '820px',
        margin: '0 auto',
        padding: 'clamp(48px, 7vw, 96px) clamp(24px, 5vw, 48px)',
      }}>

        {/* Hero */}
        <div style={{ paddingBottom: '36px', borderBottom: '1px solid var(--p-border)' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--p-ink-soft)',
            fontWeight: 600,
            marginBottom: '12px',
          }}>
            Claude Tools
          </p>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(34px, 5vw, 46px)',
            fontWeight: 600,
            margin: '0 0 14px',
            lineHeight: 1.04,
            color: 'var(--p-ink)',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            Roll your own
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--p-terra)',
              background: 'rgba(217,119,87,0.10)',
              border: '1px solid rgba(217,119,87,0.30)',
              borderRadius: '999px',
              padding: '3px 10px',
              fontWeight: 600,
            }}>
              In development
            </span>
          </h1>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(18px, 2vw, 22px)',
            fontStyle: 'italic',
            color: 'var(--p-terra)',
            lineHeight: 1.35,
            margin: 0,
          }}>
            A plugin is just components packaged together. So pick the ones that fit your work — and we audit the bundle you build.
          </p>
        </div>

        {/* The idea */}
        <section style={{ padding: '36px 0', borderBottom: '1px solid var(--p-border)' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '26px',
            fontWeight: 600,
            margin: '0 0 14px',
            color: 'var(--p-ink)',
          }}>
            The idea
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '17px',
            lineHeight: 1.65,
            color: 'var(--p-ink-soft)',
            margin: '0 0 14px',
          }}>
            A Claude plugin isn&apos;t one thing — it&apos;s a bundle. A manifest that packages skills, agents,
            commands, hooks, and MCP servers together. Most bundles are take-it-or-leave-it: you install
            all of it to use part of it.
          </p>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            lineHeight: 1.65,
            color: 'var(--p-ink-soft)',
            margin: 0,
          }}>
            Roll your own flips that. Choose the audited components you actually want — these three skills,
            those four tools — and get a plugin built from vetted parts. The catalog is already audited;
            this lets you assemble from it.
          </p>
        </section>

        {/* How it will work */}
        <section style={{ padding: '36px 0', borderBottom: '1px solid var(--p-border)' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '26px',
            fontWeight: 600,
            margin: '0 0 14px',
            color: 'var(--p-ink)',
          }}>
            How it will work
          </h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', counterReset: 'step' }}>
            {steps.map((step) => (
              <li
                key={step.title}
                style={{
                  position: 'relative',
                  padding: '14px 0 14px 44px',
                  borderBottom: '1px solid var(--p-border)',
                  counterIncrement: 'step',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '12px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--p-terra)',
                    color: '#fff',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    flexShrink: 0,
                  }}
                >
                  {steps.indexOf(step) + 1}
                </span>
                <strong style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '17px',
                  fontWeight: 600,
                  color: 'var(--p-ink)',
                  display: 'block',
                  marginBottom: '4px',
                }}>
                  {step.title}
                </strong>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  lineHeight: 1.6,
                  color: 'var(--p-ink-soft)',
                }}>
                  {step.body}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Why honest */}
        <section style={{ padding: '36px 0', borderBottom: '1px solid var(--p-border)' }}>
          <div style={{
            background: 'var(--p-bg-card)',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '14.5px',
            color: 'var(--p-ink-soft)',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--p-ink)' }}>Why this is honest:</strong>{' '}
            you compose from parts that already cleared the checks, the plugin you build is audited
            as a new artifact — never just stapled together and trusted — and every suggested fix is
            re-audited, never assumed. Same rule, applied to the thing you assembled.
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '36px 0', borderBottom: '1px solid var(--p-border)' }}>
          <div style={{
            background: 'var(--p-ink)',
            borderRadius: '14px',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'var(--font-sans)',
            color: 'var(--p-bg)',
          }}>
            <p style={{ margin: '0 0 8px' }}>
              Want to help shape it, or get early access?
            </p>
            <p style={{ margin: 0 }}>
              Email{' '}
              <a
                href="mailto:bear@bearbrown.co"
                style={{ color: '#F0C9B8', fontWeight: 600, textDecoration: 'none' }}
              >
                bear@bearbrown.co
              </a>
              .
            </p>
          </div>
        </section>

        {/* Footer */}
        <div style={{ paddingTop: '26px' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--p-ink-soft)',
            margin: 0,
          }}>
            Bear Brown — Claude Tools · every listing tested, every verdict shown ·{' '}
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
