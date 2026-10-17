import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Listing Criteria — Bear Brown',
  description: 'How the checker works: what it reads, how it routes on discovered capability rather than declared type, and what it does not assess. Process only — no counts.',
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

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      ...sans,
      fontSize: '14px',
      lineHeight: 1.6,
      color: 'var(--p-ink)',
      background: 'var(--p-bg-alt, rgba(0,0,0,0.03))',
      border: '1px solid var(--p-border)',
      borderLeft: '3px solid var(--p-ink)',
      padding: '14px 16px',
      margin: '14px 0',
    }}>
      {children}
    </div>
  )
}

const gates = [
  {
    title: 'Gate 1 — Inventory and eligibility.',
    body: 'Locate and parse the manifest, confirm a license exists, check required fields, pin the commit sha, and record the shape of the repo. Repos that fail an outright exclusion — archived, no discoverable install path, no license — stop here.',
  },
  {
    title: 'Gate 2 — Deduplication.',
    body: 'Check the repo against what has already been audited. Near-duplicates and re-uploads are identified so the directory does not list the same work five times under five owners.',
  },
  {
    title: 'Gate 3 — Static analysis.',
    body: 'The repo is read, not run. Line counts by language; lexical scans for committed secrets, for egress-call patterns in code, and for prompt-injection patterns in prose. External scanners run alongside our own checks and are recorded by name and version, with their findings, in the record.',
  },
  {
    title: 'Gate 4 — Behavioural.',
    body: 'Determines whether the repo contains anything that could execute, and names exactly what it found. This gate has never returned a completed behavioural assessment — see below.',
  },
]

const verdictRows = [
  {
    key: 'CLEARED_STATIC',
    desc: 'Passed the static and applicable checks at this sha. Behavioural assessment has not been performed. The coverage line on the record names what was not assessed.',
  },
  {
    key: 'DEFERRED',
    desc: 'Could not be fully assessed — an unsupported shape, or behaviour that needs install, network, or credentials to observe. Not a pass and not a reject.',
  },
  {
    key: 'CONTAINER',
    desc: 'A repository holding multiple distinct plugins in subdirectories. The container record names each sub-plugin; each is then audited and graded independently rather than inheriting a verdict from its parent.',
  },
  {
    key: 'REJECT',
    desc: 'Failed an outright exclusion (below).',
  },
  {
    key: 'NOT-ASSESSED',
    desc: 'The pipeline could not produce a usable assessment at all. Recorded as such rather than dropped.',
  },
]

const tools = [
  {
    name: 'Inventory & eligibility',
    desc: 'is it a real, installable Claude plugin — well-formed, licensed, and honest about what it declares. Also pins the sha every later check reads.',
    by: 'ours',
  },
  {
    name: 'Capability detection',
    desc: 'what in this repo can actually run: declared hooks, JS/TS entry points, Python with non-stdlib imports, shell scripts. This — not the manifest type label — is what determines how the repo is treated.',
    by: 'ours',
  },
  {
    name: 'Prompt-injection scan',
    desc: 'prose components are instructions to a model, and instructions can carry injection. This is the primary risk surface for a repo that ships no code.',
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
    name: 'Prose-to-code ratio',
    desc: 'line counts of prose versus code, published as a signal, not a gate.',
    by: 'cloc',
    byHref: 'https://github.com/AlDanial/cloc',
  },
  {
    name: 'Third-party static stack',
    desc: 'independent scanners run as recorded checks alongside ours. Each record names every tool that ran, its version, its exit code, and whether its ruleset was pinned to a published hash. Tools whose rulesets are not pinned produce findings that cannot be reproduced exactly on a later run — the record says which are which, per tool.',
    by: 'named per record',
  },
  {
    name: 'Behavioural execution',
    desc: 'installing a plugin and observing what it does at runtime. NOT IMPLEMENTED. No listing has ever been behaviourally assessed. Where behaviour matters, the record says the behaviour was not assessed — it never says clean.',
    by: 'not implemented',
  },
]

const behaviouralTodo = [
  {
    title: 'Containment first.',
    body: 'Untrusted plugin code must execute inside a sandbox with no path to the host, and on a machine that holds no key worth stealing. This is the blocker, and it is the reason the gap exists rather than an excuse for it. Nothing below ships before this does.',
  },
  {
    title: 'Separate the two silences.',
    body: 'A repo with nothing executable in it is currently recorded the same way as a repo full of shell scripts we did not run: behaviour not assessed. Those are different facts. Gate 4 needs a distinct not-applicable result so a prose-only component stops carrying a deferral it never earned.',
  },
  {
    title: 'Observe, then record.',
    body: 'Network egress, filesystem writes, and process spawns, captured per run and written into the record as evidence — not as a summary verdict. A behavioural pass should be readable as what happened, not as an adjective.',
  },
  {
    title: 'Re-issue, do not patch.',
    body: 'When behavioural assessment runs against a repo already listed, the audit is re-issued as a new record at a new sha. Existing records are never edited to look as though they had covered more than they did.',
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
            What the checker does, and what it refuses to claim.
          </h1>
          <p style={{
            ...sans,
            fontSize: '17px',
            lineHeight: 1.62,
            color: 'var(--p-ink-soft)',
            margin: 0,
          }}>
            Every listing is tested against the same sequence, at a recorded commit sha, before it goes
            up. The criteria are public so you can reproduce any audit yourself — and so we have nowhere
            to hide when we are wrong. We do not claim a plugin is <em>safe</em>. We say which checks ran
            against which commit and what they returned. Human review and curation stay separate gates.
          </p>

          <Callout>
            <strong>This page describes a process, not a scoreboard.</strong> It carries no counts, no
            coverage percentages, and no corpus size — those change hourly and would make this page wrong
            by tomorrow. It changes when the process changes, and at no other time. If you want to know
            what happened to a specific listing, read its record: every listing links to one. The record
            is the fact; this page is only the method.
          </Callout>
        </div>

        {/* What the checker is */}
        <Section title="What the checker is">
          <Body>
            A pipeline on a dedicated machine that clones a candidate repository at a pinned commit, runs
            a fixed sequence of checks against it, and emits one JSON record per repository into a public
            results repo. It audits. It does not build the directory, host the site, or decide what gets
            published — a human does that, and only from a record that already exists.
          </Body>
          <Body>
            The machine holds no Claude keys and no API credentials: a read-only public GitHub token and a
            scoped deploy key, nothing more. It reads hostile code for a living, so it is built to be
            worth nothing if it is taken.
          </Body>
          <Body>
            <strong>Everything is pinned to a commit sha.</strong> A record describes one exact state of
            one repository. If the repo changes after we audit it, our record does not silently become a
            claim about the new code — it stays a claim about the sha we read. Re-audits produce new
            records rather than editing old ones.
          </Body>
        </Section>

        {/* The gate sequence */}
        <Section title="The gate sequence">
          <Body>
            Four gates, in order. Every repository runs the same sequence.
          </Body>
          <ol style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', counterReset: 'flow' }}>
            {gates.map((item, i) => (
              <li
                key={item.title}
                style={{
                  position: 'relative',
                  padding: '8px 0 8px 40px',
                  counterIncrement: 'flow',
                  borderBottom: i < gates.length - 1 ? '1px solid var(--p-border)' : 'none',
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
                <span style={{ ...sans, fontSize: '15px', lineHeight: 1.6, color: 'var(--p-ink-soft)' }}>
                  <strong style={{ color: 'var(--p-ink)' }}>{item.title}</strong>{' '}
                  {item.body}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        {/* Component routing — the core of the page */}
        <Section title="How skills, plugins, and other components are handled">
          <Body>
            This is the part most people expect us to get wrong, so here is the actual answer.
          </Body>
          <Body>
            <strong>We do not route on the declared component type.</strong> A repository saying it is a
            &ldquo;skill&rdquo; in its manifest does not cause it to be checked as a skill. The type label
            is self-declared, unverified, frequently absent, and trivially wrong — and a checker that
            trusted it would be checking the claim rather than the code.
          </Body>
          <Body>
            <strong>We route on discovered executable surface.</strong> Gate 4 asks one question of every
            repository regardless of what it calls itself: <em>what in here can actually run?</em> It looks
            for declared hooks, JavaScript/TypeScript entry points, Python with non-stdlib imports, and
            shell scripts — and records exactly which of those it found, by file.
          </Body>
          <Body>That produces two outcomes:</Body>
          <Rule result="pass">
            <strong>Nothing executable found.</strong> No hooks, no JS/TS, no Python, no shell. The repo is
            prose — instructions a model reads. Its risk surface is what the text can talk a model into
            doing, which is precisely what the injection scan at Gate 3 covers.
          </Rule>
          <Rule result="note">
            <strong>Executable surface found.</strong> The record names it — the count of shell files, the
            count of JS/TS entry points, the Python imports, the declared hooks. That surface cannot be
            assessed by reading. It is deferred, and the record says which surface caused the deferral.
          </Rule>
          <Body>
            <strong>Why this makes sense.</strong> The interesting difference between a skill and a plugin
            is not the word in the manifest — it is whether the thing ships code. A markdown-only skill and
            a markdown-only plugin carry the same risk and get the same treatment, correctly. A
            &ldquo;skill&rdquo; that ships a hook gets the hook treatment, because it has a hook.
            Capability is observable; the label is a claim. We check the observable one.
          </Body>
          <Body>
            A repository containing several distinct plugins in subdirectories is recorded as a container:
            the container record names each sub-plugin, and each is audited and graded independently.
          </Body>
        </Section>

        {/* The checks */}
        <Section title="The checks">
          <Body>Install and provenance:</Body>
          <Rule result="pass">Installs from a published marketplace source or a documented manual path</Rule>
          <Rule result="fail">Install fails silently, or errors in a way the README does not mention</Rule>
          <Rule result="fail">Requires credentials at install time without a secure documented path</Rule>
          <div style={{ height: '14px' }} />
          <Body>Code and runtime surface, read statically:</Body>
          <Rule result="pass">Entirely local — no outbound calls in the committed code</Rule>
          <Rule result="note">Outbound calls exist but are documented, scoped, and opt-outable — disclosed, not excluded</Rule>
          <Rule result="fail">Network calls fire silently without README disclosure</Rule>
          <Rule result="fail">Hooks write to arbitrary paths or exec dynamic strings</Rule>
        </Section>

        {/* Verdicts */}
        <Section title="The verdict is the coverage — not a grade">
          <Body>
            A verdict is never a quality judgement. Nothing here says a plugin is good, well-built, or
            worth installing. It says which checks ran against which commit and what they returned.
          </Body>
          <div style={{ margin: '14px 0 0' }}>
            {verdictRows.map((row) => (
              <div
                key={row.key}
                style={{
                  padding: '10px 0',
                  borderTop: '1px solid var(--p-border)',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(140px, 170px) 1fr',
                  gap: '16px',
                  alignItems: 'baseline',
                }}
              >
                <code style={{
                  ...sans,
                  fontSize: '12.5px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: 'var(--p-ink)',
                }}>
                  {row.key}
                </code>
                <span style={{ ...sans, fontSize: '14px', lineHeight: 1.6, color: 'var(--p-ink-soft)' }}>
                  {row.desc}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* What is not assessed */}
        <Section title="What is not assessed">
          <Callout>
            <strong>No plugin in this directory has been behaviourally assessed. Not one, ever.</strong>
          </Callout>
          <Body>
            Behavioural assessment means installing a plugin and watching what it does — what it reaches
            for on the network, what it writes, what it spawns. We do not do this yet, and we do not
            approximate it. Where behaviour matters, the record says the behaviour was not assessed. It
            never says clean.
          </Body>
          <Body>
            The blocker is deliberate and worth stating plainly: <strong>behavioural testing requires
            containment we have not finished building.</strong> Running untrusted plugin code without it
            would mean executing hostile code on the machine that holds our deploy key. We would rather
            publish an honest gap than an unsafe pass. Until that containment lands, behavioural findings
            are absent by design rather than by oversight.
          </Body>
          <Body>Two consequences we are not hiding:</Body>
          <Rule result="note">
            A repository with <strong>nothing executable in it</strong> is currently still recorded as
            behaviour-not-assessed, when the truthful statement is that there was nothing to assess. The
            pipeline does not yet distinguish &ldquo;we did not look&rdquo; from &ldquo;there was nothing
            to look at.&rdquo; Until it does, some deferrals read as more alarming than the code warrants.
          </Rule>
          <Rule result="note">
            <strong>Not every external scanner is reproducible.</strong> Some run against a pinned, hashed
            ruleset and the hash is published in the record. Others do not pin their rules, and their
            findings cannot be reproduced exactly on a later run. Each record states which is which, per
            tool. Treat an unpinned tool&apos;s silence as weaker evidence than a pinned tool&apos;s silence.
          </Rule>
        </Section>

        {/* Behavioural roadmap */}
        <Section title="Behavioural testing — what has to happen">
          <Body>
            This is the work, in order. It is published here so the gap has a shape rather than a promise.
          </Body>
          <ol style={{ listStyle: 'none', padding: 0, margin: '10px 0 0' }}>
            {behaviouralTodo.map((item, i) => (
              <li
                key={item.title}
                style={{
                  position: 'relative',
                  padding: '8px 0 8px 40px',
                  borderBottom: i < behaviouralTodo.length - 1 ? '1px solid var(--p-border)' : 'none',
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
                    border: '1px solid var(--p-ink)',
                    color: 'var(--p-ink)',
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
                <span style={{ ...sans, fontSize: '15px', lineHeight: 1.6, color: 'var(--p-ink-soft)' }}>
                  <strong style={{ color: 'var(--p-ink)' }}>{item.title}</strong>{' '}
                  {item.body}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        {/* Exclusions */}
        <Section title="What fails outright">
          <Body>Automatic exclusions — no listing:</Body>
          <Rule result="fail">Install fails or errors in a way the README does not address</Rule>
          <Rule result="fail">Silent outbound network calls without README disclosure</Rule>
          <Rule result="fail">Hooks that exec dynamic strings or write to arbitrary paths</Rule>
          <Rule result="fail">Benchmark headline numbers whose baseline is not stated</Rule>
          <Rule result="fail">Repos archived, deleted, or long abandoned</Rule>
          <Rule result="fail">No license</Rule>
        </Section>

        {/* Tools */}
        <Section title="The tests, and the tools behind them">
          <div style={{ margin: '14px 0 0' }}>
            {tools.map((t) => (
              <div
                key={t.name}
                style={{
                  padding: '10px 0',
                  borderTop: '1px solid var(--p-border)',
                }}
              >
                <div style={{
                  ...sans,
                  fontSize: '14.5px',
                  fontWeight: 600,
                  color: 'var(--p-ink)',
                  marginBottom: '3px',
                }}>
                  {t.name}
                  <span style={{
                    fontWeight: 400,
                    fontSize: '12px',
                    letterSpacing: '0.04em',
                    color: 'var(--p-ink-soft)',
                    marginLeft: '8px',
                  }}>
                    {t.byHref
                      ? <a href={t.byHref} style={{ color: 'inherit' }}>{t.by}</a>
                      : t.by}
                  </span>
                </div>
                <div style={{ ...sans, fontSize: '14px', lineHeight: 1.6, color: 'var(--p-ink-soft)' }}>
                  {t.desc}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Why breadth is not the goal */}
        <Section title="Why breadth is not the goal">
          <Body>
            A curated directory with a few completed audits is more useful than an index of fifty thousand
            repos nobody checked. No audit, no listing. Coverage is the thing we are slowest at on
            purpose — because the alternative is a directory whose entries mean nothing.
          </Body>
        </Section>

        {/* The rule underneath */}
        <section style={{ padding: '34px 0 0' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '26px',
            fontWeight: 600,
            margin: '0 0 6px',
            color: 'var(--p-ink)',
          }}>
            The rule underneath all of it
          </h2>
          <Body>
            We record what ran, what it found, and what was not assessed.
          </Body>
          <Body>
            A claim on this site that a live record cannot back is the exact failure this project exists to
            prevent — so it is the failure we audit ourselves for hardest. If this page and a record
            disagree, <strong>the record is right and this page is a bug.</strong>
          </Body>
        </section>

        {/* Sibling criteria */}
        <section style={{ padding: '34px 0 0', borderTop: '1px solid var(--p-border)', marginTop: '34px' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '26px',
            fontWeight: 600,
            margin: '0 0 6px',
            color: 'var(--p-ink)',
          }}>
            Agentic workflows are checked differently
          </h2>
          <Body>
            Plugins and skills are repositories that install and run. Agentic workflow starters are
            graph artifacts that are read and never run, so they earn a listing on different tests —
            whether the wiring resolves, what the graph actually contains, and whether the same idea is
            already listed under another name.
          </Body>
          <Body>
            <a href="/criteria/workflows" style={{ color: 'var(--p-blue)', fontWeight: 500 }}>
              Workflow listing criteria →
            </a>
          </Body>
        </section>

      </div>
    </div>
  )
}
