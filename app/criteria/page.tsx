import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Listing Criteria — Bear Brown Plugin Directory',
  description: 'What we test, what fails, and why breadth is not the goal. Published selection criteria and rejection reasons for the Bear Brown Claude plugin directory.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '48px' }}>
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
    }}>
      {children}
    </p>
  )
}

function Check({ result, children }: { result: 'pass' | 'fail' | 'note'; children: React.ReactNode }) {
  const color = result === 'pass' ? '#0072B2' : result === 'fail' ? '#D55E00' : '#9E8C6C'
  const icon  = result === 'pass' ? '✓' : result === 'fail' ? '✗' : '→'
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '10px 0',
      borderBottom: '1px solid var(--p-border)',
    }}>
      <span style={{ color, fontWeight: 700, flexShrink: 0, width: '16px' }} aria-hidden="true">{icon}</span>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        lineHeight: 1.6,
        color: 'var(--p-ink)',
      }}>
        {children}
      </span>
    </div>
  )
}

export default function CriteriaPage() {
  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>
      <div style={{
        maxWidth: '760px',
        margin: '0 auto',
        padding: 'clamp(48px, 7vw, 96px) clamp(24px, 5vw, 48px)',
      }}>

        {/* Header */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--p-terra)',
          marginBottom: '20px',
        }}>
          Listing Criteria
        </p>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 400,
          color: 'var(--p-ink)',
          lineHeight: 1.1,
          marginBottom: '24px',
        }}>
          What we test, what fails,<br />and why breadth is not the goal.
        </h1>
        <Body>
          Every listing in this directory has been tested against the same checklist, at a recorded commit sha, before it goes up. The criteria are public so you can reproduce any audit yourself — and so we have nowhere to hide when we're wrong.
        </Body>

        <hr style={{ border: 'none', borderTop: '1px solid var(--p-border)', margin: '40px 0' }} />

        <Section title="The install check">
          <Body>
            We clone the repo, add it as a plugin marketplace source, and run the install. An entry that cannot be installed does not ship — regardless of how interesting the idea is. We record the HEAD sha at install time. If the plugin later ships a breaking change, the audit date tells you exactly which version we tested.
          </Body>
          <Body>
            For plugins that require Node or Python, we verify the declared runtime is available in a standard environment. Plugins that silently degrade without stating so are flagged.
          </Body>
          <div style={{ background: 'var(--p-bg-card)', borderRadius: '6px', padding: '0 16px', border: '1px solid var(--p-border)', marginTop: '16px' }}>
            <Check result="pass">Installs from a published marketplace source or a documented manual path</Check>
            <Check result="pass">All declared runtime dependencies are stated in the README</Check>
            <Check result="fail">Install fails silently or produces an error the README does not mention</Check>
            <Check result="fail">Requires credentials at install time without a secure documented path</Check>
          </div>
        </Section>

        <Section title="The risk scan">
          <Body>
            We read every hook script that fires at runtime (SessionStart, SubagentStart, UserPromptSubmit, PostToolUse, Stop). We look for outbound network calls, filesystem writes outside the plugin's own directory, and any exec or eval patterns that could run attacker-controlled code.
          </Body>
          <Body>
            "Clean" means none of the above. "Flagged" means something is present but disclosed — documented in the README, gated on an env var the user sets, or limited to a specific opt-in command. Flagged is not excluded; it is disclosed. Silent telemetry or undisclosed network calls that we cannot attribute to disclosed behavior result in exclusion.
          </Body>
          <div style={{ background: 'var(--p-bg-card)', borderRadius: '6px', padding: '0 16px', border: '1px solid var(--p-border)', marginTop: '16px' }}>
            <Check result="pass">Hooks are entirely local — no outbound calls at runtime</Check>
            <Check result="note">Outbound calls exist but are documented, scoped, and opt-outable</Check>
            <Check result="fail">Network calls fire silently without disclosure in the README</Check>
            <Check result="fail">Hooks write to arbitrary filesystem paths or exec dynamic strings</Check>
          </div>
        </Section>

        <Section title="Prose-to-code ratio">
          <Body>
            We count lines in <code style={{ fontFamily: 'monospace', fontSize: '13px', background: 'var(--p-bg-card)', padding: '1px 5px', borderRadius: '2px' }}>.md/.txt</code> files (prose) and lines in <code style={{ fontFamily: 'monospace', fontSize: '13px', background: 'var(--p-bg-card)', padding: '1px 5px', borderRadius: '2px' }}>.ts/.js/.py/.sh</code> files (code). This number is not a quality gate — it is a signal. High ratios often indicate prompt-heavy plugins with little backing behavior; low ratios often indicate code-backed plugins that do real work in the runtime. We publish the number and let the verdict explain it.
          </Body>
        </Section>

        <Section title="Benchmark claims">
          <Body>
            We read the README for quantitative claims. If a plugin claims a specific improvement — tokens saved, lines reduced, tasks completed — we check whether the baseline and methodology are stated. We note retractions prominently. A retraction that is honest and well-documented is a positive signal, not a negative one.
          </Body>
          <Body>
            Our research background influences what we look for: ensemble signals, technical audit pipelines, cluster verification. We apply those methods to the plugins themselves.
          </Body>
        </Section>

        <Section title="Tiers">
          <Body>
            Tiers are derived from the audit fields, not hand-waved. We do not award Excellent to a plugin with a failed install check or an undisclosed network call.
          </Body>
          <div style={{ background: 'var(--p-bg-card)', borderRadius: '6px', padding: '16px 20px', border: '1px solid var(--p-border)', marginTop: '16px' }}>
            {[
              { tier: 'Excellent ◆', color: '#0072B2', desc: 'Clean install, clean or flagged-and-disclosed risk scan, code-backed behavior, honest benchmark claims, actively maintained.' },
              { tier: 'Strong ●',    color: '#3D3929', desc: 'Clean install, disclosed risk signals if any, useful backing behavior, reliable maintenance signal.' },
              { tier: 'Promising ▲', color: '#D55E00', desc: 'Installs, passes the risk scan, shows a clear use case — but early, limited scope, or lighter documentation.' },
            ].map(({ tier, color, desc }) => (
              <div key={tier} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--p-border)' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 700, color, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '4px' }}>{tier}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6, color: 'var(--p-ink-soft)', margin: 0 }}>{desc}</p>
              </div>
            ))}
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--p-ink-muted)', margin: 0 }}>
              Tiers coexist with shape + label in every display. The greyscale gate: desaturate any page and tiers must still be distinguishable by shape.
            </p>
          </div>
        </Section>

        <Section title="What fails outright">
          <Body>
            These are automatic exclusions — no tier, no listing:
          </Body>
          <div style={{ background: 'var(--p-bg-card)', borderRadius: '6px', padding: '0 16px', border: '1px solid var(--p-border)' }}>
            <Check result="fail">Install fails or produces an error not addressed by the README</Check>
            <Check result="fail">Silent outbound network calls without README disclosure</Check>
            <Check result="fail">Hooks that exec dynamic strings or write to arbitrary paths</Check>
            <Check result="fail">Benchmark headline numbers whose baseline is not stated</Check>
            <Check result="fail">Repos that have been archived, deleted, or untouched for 18+ months</Check>
          </div>
        </Section>

        <Section title="Why breadth is not the goal">
          <Body>
            The large Claude plugin directories index tens of thousands of repos. The claim is discovery by volume. Our claim is different: we will list fewer things, and we will be correct about the ones we list.
          </Body>
          <Body>
            A curated directory with three entries and three completed audits is more useful than an index of fifty thousand repos with no verification. We grow the list when we have time to audit properly — not to fill a grid.
          </Body>
          <Body>
            If you have a plugin that you believe should be listed, we will audit it on the same criteria and publish the results either way.
          </Body>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: 'var(--p-ink-soft)',
          }}>
            <a href="mailto:bear@bearbrown.co" style={{ color: 'var(--p-blue)', textDecoration: 'none' }}>bear@bearbrown.co</a> — submit for audit
          </p>
        </Section>

        <div style={{ paddingTop: '24px', borderTop: '1px solid var(--p-border)' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--p-blue)', textDecoration: 'none' }}>
            ← Back to directory
          </Link>
        </div>
      </div>
    </div>
  )
}
