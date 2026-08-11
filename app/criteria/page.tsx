import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Listing Criteria — Bear Brown',
  description: 'What we test, what fails, and why breadth is not the goal. Published audit criteria for the Bear Brown Claude plugin directory.',
}

const sans: React.CSSProperties = { fontFamily: 'var(--font-sans)' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '34px 0', borderBottom: '1px solid var(--p-border)' }}>
      <h2 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '26px',
        fontWeight: 600,
        margin: '0 0 6px',
        color: 'var(--p-ink)',
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
      ...sans,
      fontSize: '15px',
      lineHeight: 1.65,
      color: 'var(--p-ink-soft)',
      margin: '0 0 12px',
    }}>
      {children}
    </p>
  )
}

function Rule({ result, children }: { result: 'pass' | 'fail' | 'note'; children: React.ReactNode }) {
  const colors = { pass: '#3F7D5A', note: '#B07A1E', fail: '#B0472F' }
  const icons  = { pass: '✓', note: '→', fail: '✗' }
  return (
    <div style={{
      ...sans,
      fontSize: '14px',
      margin: '6px 0',
      paddingLeft: '22px',
      position: 'relative',
      color: 'var(--p-ink-soft)',
    }}>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          fontWeight: 700,
          color: colors[result],
        }}
      >
        {icons[result]}
      </span>
      {children}
    </div>
  )
}

const flowItems = [
  {
    title: 'Inventory.',
    body: 'Detect repo type and component shape from file conventions — hooks, scripts, and code entry points. Repos the detector cannot classify are currently recorded as type "plugin" by default; that is a known gap being fixed.',
  },
  {
    title: 'Eligibility.',
    body: 'The repo has to install from a published marketplace source or a documented path. Archived, deleted, or long-abandoned repos are excluded.',
  },
  {
    title: 'Route & test.',
    body: 'The repo is scanned as a unit — not by component. Lexical scans look for injection patterns in prose files, committed secrets, and egress-call patterns in code. Hooks and code entry points are inspected statically for declared behavior. External scanners (Semgrep, Bandit, detect-secrets, and others) are wired and intended but have run on zero repos to date; they appear in audit records as not-assessed.',
  },
  {
    title: 'Verdict with disclosed coverage.',
    body: 'We record what ran, what it found, and what was not assessed. Then the record and a human-readable report are pushed to a public trace repository.',
  },
]

const verdictRows = [
  {
    key: 'CLEARED_STATIC',
    desc: 'Passed the static and applicable checks at this sha. Behavioral assessment has not been performed on any listing to date; the coverage line names what was not assessed.',
  },
  {
    key: 'DEFERRED',
    desc: 'Could not be fully assessed — unsupported shape, or behavior that needs install/network/credentials. Not a pass, not a reject: needs review.',
  },
  {
    key: 'FLAG',
    desc: 'Something is present but disclosed, or needs a human look — a documented network call, an undeclared component. Flagged is disclosed, not excluded.',
  },
  {
    key: 'REJECT',
    desc: 'Failed an outright exclusion (below).',
  },
]

const tools = [
  {
    name: 'Component detection',
    desc: 'inventory what\'s in the repo. All repos run the same gate sequence regardless of detected type; per-component routing is not yet implemented. Unknown types default to "plugin" today — that is a known gap.',
    by: 'ours',
  },
  {
    name: 'Eligibility & structure',
    desc: 'is it a real, installable Claude plugin, well-formed and honest about what it declares.',
    by: 'ours',
  },
  {
    name: 'Prompt-injection scan',
    desc: 'prose components are instructions to a model, and instructions can carry injection.',
    by: 'ours',
  },
  {
    name: 'Secrets scan',
    desc: 'committed credentials and tokens, filtered for real hits over lockfile noise.',
    by: 'ours',
  },
  {
    name: 'Static exec / egress',
    desc: 'subprocess, eval, and network patterns in code that could run or leak.',
    by: 'ours',
  },
  {
    name: 'Behavioral check',
    desc: 'inspect committed hooks and code entry points statically — what they declare and what patterns they contain. Sandbox execution of repo code is a known gap; the gate reads intent, not runtime behavior.',
    by: 'ours',
  },
  {
    name: 'Prose-to-code ratio',
    desc: 'line counts of prose vs code, published as a signal (not a gate).',
    by: 'cloc',
    byHref: 'https://github.com/AlDanial/cloc',
  },
]

export default function CriteriaPage() {
  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: 'clamp(48px, 7vw, 96px) clamp(24px, 5vw, 48px)',
      }}>

        {/* Hero */}
        <div style={{ paddingBottom: '30px', borderBottom: '1px solid var(--p-border)' }}>
          <p style={{
            ...sans,
            fontSize: '12px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--p-ink-soft)',
            fontWeight: 600,
            marginBottom: '12px',
          }}>
            Listing Criteria
          </p>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(32px, 4vw, 40px)',
            fontWeight: 600,
            margin: '0 0 16px',
            lineHeight: 1.08,
            color: 'var(--p-ink)',
          }}>
            What we test, what fails, and why breadth is not the goal.
          </h1>
          <p style={{
            ...sans,
            fontSize: '17px',
            lineHeight: 1.62,
            color: 'var(--p-ink-soft)',
            margin: 0,
          }}>
            Every listing is tested against the same checks, at a recorded commit sha, before it goes
            up. The criteria are public so you can reproduce any audit yourself — and so we have nowhere
            to hide when we&apos;re wrong. We record which checks ran, against which pinned commit, and what
            they found. We do not claim a plugin is <em>safe</em> — only that it cleared these checks as
            of that sha, on that date. Human review and curation stay separate gates.
          </p>
        </div>

        {/* How an audit runs */}
        <Section title="How an audit runs">
          <Body>
            The auditor is a credential-free machine that clones each repo to a host directory and works
            through the same sequence. Which checks fire depends on what the repo turns out to contain.
            Static scans run on the host as the auditor user; gVisor is available and verified at startup
            but the clone and scan work runs outside it — that is a known gap.
          </Body>
          <ol style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', counterReset: 'flow' }}>
            {flowItems.map((item, i) => (
              <li
                key={item.title}
                style={{
                  position: 'relative',
                  padding: '8px 0 8px 40px',
                  counterIncrement: 'flow',
                  borderBottom: i < flowItems.length - 1 ? '1px solid var(--p-border)' : 'none',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '7px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--p-ink)',
                    color: 'var(--p-bg)',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ ...sans, fontSize: '15px', color: 'var(--p-ink-soft)', lineHeight: 1.62 }}>
                  <strong style={{ color: 'var(--p-ink)' }}>{item.title}</strong>{' '}{item.body}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        {/* The checks */}
        <Section title="The checks">

          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '19px',
            fontWeight: 600,
            margin: '20px 0 4px',
            color: 'var(--p-ink)',
          }}>
            Install &amp; eligibility
          </h3>
          <Body>
            We clone the repo, add it as a marketplace source, and run the install. An entry that cannot
            be installed does not ship, regardless of how interesting the idea is. We record the HEAD sha
            at install time, so the audit date tells you exactly which version we tested. Declared
            Node/Python runtimes must be stated in the README.
          </Body>
          <Rule result="pass">Installs from a published marketplace source or a documented manual path</Rule>
          <Rule result="fail">Install fails silently, or errors in a way the README does not mention</Rule>
          <Rule result="fail">Requires credentials at install time without a secure documented path</Rule>

          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '19px',
            fontWeight: 600,
            margin: '20px 0 4px',
            color: 'var(--p-ink)',
          }}>
            Risk scan — static
          </h3>
          <Body>
            We read every hook and script that fires at runtime (SessionStart, UserPromptSubmit,
            PostToolUse, Stop, and the rest) and look for outbound network calls, filesystem writes
            outside the plugin&apos;s own directory, and exec/eval patterns that could run attacker-controlled
            code.
          </Body>
          <Rule result="pass">Entirely local — no outbound calls at runtime</Rule>
          <Rule result="note">Outbound calls exist but are documented, scoped, and opt-outable — disclosed, not excluded</Rule>
          <Rule result="fail">Network calls fire silently without README disclosure</Rule>
          <Rule result="fail">Hooks write to arbitrary paths or exec dynamic strings</Rule>

          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '19px',
            fontWeight: 600,
            margin: '20px 0 4px',
            color: 'var(--p-ink)',
          }}>
            Risk scan — behavioral
          </h3>
          <Body>
            For code that is committed-only, we inspect hooks and code entry points statically — what
            they declare and what patterns they contain. We have gVisor available and verified at startup,
            but we do not currently execute repo code inside it; that is a known gap. When behavior
            cannot be assessed statically, we mark it deferred — never assumed clean.
          </Body>

          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '19px',
            fontWeight: 600,
            margin: '20px 0 4px',
            color: 'var(--p-ink)',
          }}>
            Prose-to-code ratio
          </h3>
          <Body>
            We count prose lines (<code style={{ ...sans, fontSize: '13px', background: 'var(--p-bg-card)', padding: '1px 5px', borderRadius: '2px' }}>.md/.txt</code>) against code lines (<code style={{ ...sans, fontSize: '13px', background: 'var(--p-bg-card)', padding: '1px 5px', borderRadius: '2px' }}>.ts/.js/.py/.sh</code>). This is a <em>signal</em>, not a gate: high ratios often mean prompt-heavy plugins with little backing behavior; low ratios often mean code-backed plugins doing real runtime work. We publish the number and let the verdict explain it.
          </Body>

          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '19px',
            fontWeight: 600,
            margin: '20px 0 4px',
            color: 'var(--p-ink)',
          }}>
            Benchmark claims
          </h3>
          <Body>
            We read the README for quantitative claims — tokens saved, lines reduced, tasks completed —
            and check whether the baseline and methodology are stated. An unbacked headline number is an
            exclusion. A retraction that is honest and well-documented is a positive signal, not a
            negative one.
          </Body>
        </Section>

        {/* The verdict is the coverage */}
        <Section title="The verdict is the coverage — not a grade">
          <Body>
            We do not award a quality tier. A tier is an opinion; coverage is a fact. The record says
            what was tested, at which sha, and what it found — and that <em>is</em> the verdict. Four
            outcomes, all disclosed:
          </Body>
          <div style={{ marginTop: '8px' }}>
            {verdictRows.map((row, i) => (
              <div
                key={row.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '170px 1fr',
                  gap: 0,
                  borderBottom: i < verdictRows.length - 1 ? '1px solid var(--p-border)' : 'none',
                }}
              >
                <div style={{
                  ...sans,
                  fontFamily: 'ui-monospace, Menlo, monospace',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--p-ink)',
                  padding: '10px 0',
                }}>
                  {row.key}
                </div>
                <div style={{
                  ...sans,
                  fontSize: '14.5px',
                  color: 'var(--p-ink-soft)',
                  padding: '10px 0',
                  lineHeight: 1.55,
                }}>
                  {row.desc}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* What fails outright */}
        <Section title="What fails outright">
          <Body>Automatic exclusions — no listing:</Body>
          <Rule result="fail">Install fails or errors in a way the README does not address</Rule>
          <Rule result="fail">Silent outbound network calls without README disclosure</Rule>
          <Rule result="fail">Hooks that exec dynamic strings or write to arbitrary paths</Rule>
          <Rule result="fail">Benchmark headline numbers whose baseline is not stated</Rule>
          <Rule result="fail">Repos archived, deleted, or untouched for 18+ months</Rule>
        </Section>

        {/* Why breadth is not the goal */}
        <Section title="Why breadth is not the goal">
          <Body>
            The large Claude plugin directories index tens of thousands of repos and call it discovery
            by volume. Our claim is different: we will list fewer things, and we will be correct about
            the ones we list. A curated directory with a few completed audits is more useful than an
            index of fifty thousand repos with no verification. We grow the list when we have time to
            audit properly — not to fill a grid. If you have a plugin you believe should be listed, we
            will audit it on the same criteria and publish the results either way.
          </Body>
        </Section>

        {/* The tests, and the tools behind them */}
        <Section title="The tests, and the tools behind them">
          <Body>
            A short account of each check — and the honest part: who actually ran it in the record
            you&apos;re reading. We name a tool here only when the trace shows it ran.
          </Body>
          <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
            {tools.map((tool) => (
              <li
                key={tool.name}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid var(--p-border)',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--p-ink)',
                }}>
                  {tool.name}
                </span>
                {' '}
                <span style={{ ...sans, fontSize: '14.5px', color: 'var(--p-ink-soft)' }}>
                  — {tool.desc}
                </span>
                {' '}
                <span style={{ ...sans, fontSize: '13px', color: 'var(--p-ink-muted)' }}>
                  {tool.byHref ? (
                    <>Uses <a href={tool.byHref} style={{ color: 'var(--p-terra)', textDecoration: 'none' }}>cloc</a>.</>
                  ) : (
                    tool.by
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div style={{
            background: 'var(--p-bg-card)',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '15px',
            color: 'var(--p-ink-soft)',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1.6,
            marginTop: '8px',
          }}>
            <strong style={{ color: 'var(--p-ink)' }}>What we don&apos;t yet claim.</strong>{' '}
            A layered third-party stack —{' '}
            <a href="https://github.com/semgrep/semgrep" style={{ color: 'var(--p-terra)', textDecoration: 'none' }}>Semgrep</a>,{' '}
            <a href="https://github.com/PyCQA/bandit" style={{ color: 'var(--p-terra)', textDecoration: 'none' }}>Bandit</a>,{' '}
            <a href="https://github.com/Yelp/detect-secrets" style={{ color: 'var(--p-terra)', textDecoration: 'none' }}>detect-secrets</a>,{' '}
            <a href="https://github.com/agent-sh/agnix" style={{ color: 'var(--p-terra)', textDecoration: 'none' }}>agnix</a>,{' '}
            <a href="https://github.com/NVIDIA/SkillSpector" style={{ color: 'var(--p-terra)', textDecoration: 'none' }}>SkillSpector</a>{' '}
            — is wired and intended, but none have run against any repo. Semgrep currently fetches
            rules live rather than from a pinned local snapshot; that is a second gap. None are{' '}
            <strong>independently recorded per listing</strong>, so we don&apos;t credit any of them as run.
            When a listing&apos;s trace names one of these, it&apos;ll be linked here with its version and coverage.
            Today every recorded check is either <strong>ours</strong> or <strong>cloc</strong> — and the
            record says which. We&apos;d rather show the gap than claim a tool the trace can&apos;t back.
          </div>
        </Section>

        {/* CTA */}
        <section style={{ padding: '34px 0', borderBottom: '1px solid var(--p-border)' }}>
          <div style={{
            background: 'var(--p-ink)',
            borderRadius: '14px',
            padding: '22px',
            textAlign: 'center',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: 'var(--p-bg)',
          }}>
            Think a plugin should be listed? We&apos;ll audit it on these same criteria and publish the
            result either way.
            <br />
            <a
              href="mailto:bear@bearbrown.co"
              style={{ color: '#F0C9B8', fontWeight: 600, textDecoration: 'none' }}
            >
              bear@bearbrown.co
            </a>
            {' '}— submit for audit
          </div>
        </section>

        {/* Footer */}
        <div style={{ paddingTop: '24px' }}>
          <p style={{
            ...sans,
            fontSize: '12.5px',
            color: 'var(--p-ink-soft)',
            margin: 0,
          }}>
            Bear Brown, LLC · every listing tested, every verdict shown ·{' '}
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
