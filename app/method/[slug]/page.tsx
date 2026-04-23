import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type MethodPage = {
  num: string
  title: string
  group: string
  body: string
  next?: { num: string; title: string; slug: string }
}

const METHOD_PAGES: Record<string, MethodPage> = {
  'irreducibly-human': {
    num: '1.1',
    group: 'The Belief',
    title: 'Irreducibly human',
    body: `
      <p>There is a class of intelligence the AI era most urgently requires and
      least reliably teaches. Not pattern retrieval. Not syntactic correctness.
      Not code generation. Machines are superhuman at these, and the gap will not close.</p>
      <p>What goes untaught is harder to name and harder to automate: the capacity
      to hear the wrong note before verification, to decide what the mission is
      before the tools are deployed, to supply meaning and accountability to an
      output that cannot supply them for itself.</p>
      <p>These are not soft skills. They are the cognitive capacities that allow
      a person to use a powerful tool rather than be used by it. Bear Brown calls
      them irreducibly human — not because machines will never approximate them,
      but because <em>accountability for them cannot be delegated</em>. Someone
      must sign their name to the consequence. That someone is you.</p>
    `,
    next: { num: '1.2', title: 'The solve–verify asymmetry', slug: 'solve-verify-asymmetry' },
  },
  'solve-verify-asymmetry': {
    num: '1.2',
    group: 'The Belief',
    title: 'The solve–verify asymmetry',
    body: `
      <p>Claude solves faster than any human, and that gap will not close.
      What will not change is this: Claude cannot verify whether its output is
      grounded in the specific domain reality at hand. It cannot reframe a poorly
      formulated problem. It cannot interpret what an accurate output means in a
      specific human context.</p>
      <p>This is the solve–verify asymmetry. The cost of generating a solution
      approaches zero. The cost of determining whether the solution is correct —
      for this problem, in this context, with these stakes — remains irreducibly human.</p>
      <p>The practical consequence: the most valuable thing a person can do in
      an AI-assisted workflow is not prompt more cleverly. It is to audit more
      precisely. To be the person in the room who hears the wrong note before
      the system ships.</p>
    `,
    next: { num: '1.3', title: 'What AI can and cannot do', slug: 'what-ai-cannot-do' },
  },
  'what-ai-cannot-do': {
    num: '1.3',
    group: 'The Belief',
    title: 'What AI can and cannot do',
    body: `
      <p>AI can generate the ideas. It cannot care which one matters.</p>
      <p>AI can write the code. It cannot decide what is worth building.</p>
      <p>AI can produce the output. It cannot be accountable for it.</p>
      <p>AI can optimize the decision. It cannot live with the consequences.</p>
      <p>This is not a limitation to be engineered around. It is the permanent
      structural condition of the technology. The question is not when AI will
      close this gap. The question is whether the humans working with AI have
      developed the capacity to hold it.</p>
    `,
    next: { num: '2.1', title: 'Build', slug: 'build' },
  },
  'build': {
    num: '2.1',
    group: 'Three Ways to Work',
    title: 'Build',
    body: `
      <p>Bespoke AI development for organizations that know what they believe
      and need a system that reflects it.</p>
      <p>Recent grad developers supervised by Bear Brown. Entry-level prices.
      No lock-in. No placement fee if you hire the developer. $35/hr development.
      $200/hr Bear Brown time, when needed.</p>
      <p>Before code is written: a detailed Software Design Document and a
      client-facing brief. Every time. The build does not begin until the problem
      is formulated precisely enough to hand off cleanly.</p>
      <p>→ <a href="mailto:bear@bearbrown.co">bear@bearbrown.co</a></p>
    `,
    next: { num: '2.2', title: 'Advise', slug: 'advise' },
  },
  'advise': {
    num: '2.2',
    group: 'Three Ways to Work',
    title: 'Advise',
    body: `
      <p>Early-stage AI strategy for founders entering new categories.
      Bear Brown takes equity for expertise — long-term skin in the game,
      not a consulting invoice.</p>
      <p>The engagement is not advisory in the traditional sense. Bear Brown
      is a co-thinker on the problem formulation layer: what are you building,
      for whom, and why will it hold together when the technology shifts under it?</p>
      <p>→ <a href="mailto:bear@bearbrown.co">bear@bearbrown.co</a></p>
    `,
    next: { num: '2.3', title: 'Connect', slug: 'connect' },
  },
  'connect': {
    num: '2.3',
    group: 'Three Ways to Work',
    title: 'Connect',
    body: `
      <p>Top recent engineering graduates, Bear Brown-vetted, matched to
      organizations that need exceptional talent at honest prices.</p>
      <p>No placement fee if you hire the developer. The relationship is with
      the engineer, not with a staffing layer.</p>
      <p>→ <a href="mailto:bear@bearbrown.co">bear@bearbrown.co</a></p>
    `,
    next: { num: '3.1', title: 'Medhavy — Adaptive Learning', slug: 'medhavy' },
  },
  'medhavy': {
    num: '3.1',
    group: "What We've Built",
    title: 'Medhavy — Adaptive Learning',
    body: `
      <p>Adaptive learning infrastructure deployed inside a federally funded
      cancer nanomedicine training program at Northeastern University, through
      the CaNCURE program directed by Srinivas Sridhar.</p>
      <p>The system is a conversational textbook: researchers query a RAG-backed
      knowledge base built from a 38-chapter oncology curriculum, integrated
      with Canvas LMS. The technology stays in the background. The researcher
      stays in the foreground.</p>
      <p>Medhavy is co-founded with the domain expertise anchored in the lab,
      not in the software team.</p>
      <p>→ <a href="https://www.medhavy.com/" target="_blank" rel="noopener">medhavy.com</a></p>
    `,
    next: { num: '3.2', title: 'Humanitarians AI', slug: 'humanitarians-ai' },
  },
  'humanitarians-ai': {
    num: '3.2',
    group: "What We've Built",
    title: 'Humanitarians AI',
    body: `
      <p>A 501(c)(3) built on the belief that AI fluency should be universally
      accessible. Tools used by 150+ fellows across a global volunteer network.</p>
      <p>The infrastructure manages fellows, projects, STEM OPT compliance, and
      contract workflows — built on the same stack and the same methodology as
      every other Bear Brown system.</p>
      <p>→ <a href="https://humanitarians.ai" target="_blank" rel="noopener">humanitarians.ai</a></p>
    `,
    next: { num: '3.3', title: 'Irreducibly Human curriculum', slug: 'irreducibly-human-curriculum' },
  },
  'irreducibly-human-curriculum': {
    num: '3.3',
    group: "What We've Built",
    title: 'Irreducibly Human curriculum',
    body: `
      <p>A curriculum series mapping the intelligences the AI era most urgently
      requires against the ones the curriculum stopped teaching.</p>
      <p>The five capacities the series develops: plausibility auditing,
      problem formulation, tool orchestration, interpretive judgment, and
      executive integration. These are not soft skills. They are the cognitive
      infrastructure for working with powerful tools without being replaced by them.</p>
      <p>Gru is the first product in the series: a software design document
      consultant that holds the line on problem formulation before a single
      line of code is written.</p>
      <p>→ <a href="https://www.irreducibly.xyz/" target="_blank" rel="noopener">irreducibly.xyz</a></p>
    `,
    next: { num: '3.4', title: 'Boondoggling', slug: 'boondoggling' },
  },
  'boondoggling': {
    num: '3.4',
    group: "What We've Built",
    title: 'Boondoggling',
    body: `
      <p>The practice of conducting Claude through a build — assigning each task
      to the right labor, sequencing tasks by dependency, and producing explicit
      handoff conditions between every step — is called boondoggling.</p>
      <p>A boondoggle is not a workaround. It is programming as conducting.
      Anyone can use Claude Code. Boondogglers conduct it.</p>
      <p>The recognition that drives the practice: the human's job in an
      AI-assisted build is not to type less. It is to decide more precisely.
      Every prompt that goes to Claude is a decision about what Claude can be
      trusted to do at this step. Every handoff condition is a decision about
      what "done" means before the next step begins.</p>
      <p>→ <a href="https://www.boondoggling.ai/" target="_blank" rel="noopener">boondoggling.ai</a></p>
    `,
    next: { num: '3.5', title: 'Computational Skepticism', slug: 'computational-skepticism' },
  },
  'computational-skepticism': {
    num: '3.5',
    group: "What We've Built",
    title: 'Computational Skepticism',
    body: `
      <p>Daily insights on the asymmetry of AI-generated bullshit, practical AI
      tutorials, research updates for the Humanitarians AI Lab, and guidance for
      research groups. AI literacy through practice. Understanding the tech.</p>
      <p>→ <a href="https://www.skepticism.ai/" target="_blank" rel="noopener">skepticism.ai</a></p>
    `,
    next: { num: '3.6', title: 'Brutalist', slug: 'brutalist' },
  },
  'brutalist': {
    num: '3.6',
    group: "What We've Built",
    title: 'Brutalist',
    body: `
      <p>The slide deck is a program, not a canvas.</p>
      <p>Brutalist builds HTML presentations through conversation. No templates.
      No canvas. A living, deployable deck — in the time it takes to describe
      what you need.</p>
      <p>→ <a href="https://www.brutalist.art/" target="_blank" rel="noopener">brutalist.art</a></p>
    `,
    next: undefined,
  },
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = METHOD_PAGES[slug]
  if (!page) return {}
  const plain = stripHtml(page.body)
  const firstSentence = plain.split(/(?<=[.!?])\s/)[0] ?? plain.slice(0, 160)
  return {
    title: `${page.title} — Bear Brown`,
    description: firstSentence,
  }
}

export default async function MethodPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = METHOD_PAGES[slug]
  if (!page) notFound()

  return (
    <div
      style={{
        background: 'var(--m-bg)',
        minHeight: '100vh',
        padding: 'clamp(48px, 6vw, 80px) clamp(24px, 5vw, 80px)',
      }}
    >
      {/* Breadcrumb */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        color: 'var(--m-text-tertiary)',
        marginBottom: '8px',
      }}>
        <Link
          href="/"
          style={{ color: 'var(--m-text-tertiary)', textDecoration: 'none' }}
        >
          Method
        </Link>
        {' / '}
        <span style={{ color: 'var(--m-text-secondary)' }}>{page.group}</span>
      </p>

      {/* Headline */}
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(40px, 6vw, 72px)',
        fontWeight: 400,
        color: 'var(--m-text-primary)',
        lineHeight: 1.05,
        margin: '32px 0 64px',
      }}>
        {page.title}
      </h1>

      {/* Body prose */}
      <div
        style={{ maxWidth: '680px' }}
        dangerouslySetInnerHTML={{ __html: page.body }}
      />

      {/* Next card */}
      {page.next && (
        <Link
          href={`/method/${page.next.slug}`}
          style={{
            border: '1px solid var(--m-border)',
            borderRadius: '6px',
            padding: '24px 28px',
            maxWidth: '360px',
            marginTop: '80px',
            marginLeft: 'auto',
            textDecoration: 'none',
            display: 'block',
            transition: 'border-color 0.15s',
          }}
          className="method-next-card"
        >
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            color: 'var(--m-text-tertiary)',
            letterSpacing: '0.08em',
            marginBottom: '8px',
          }}>
            {page.next.num} ›
          </p>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '20px',
            color: 'var(--m-text-primary)',
            fontWeight: 400,
          }}>
            {page.next.title}
          </p>
        </Link>
      )}

      <style>{`
        .method-next-card:hover {
          border-color: var(--m-border-strong) !important;
        }
        div[style*="max-width: 680px"] p {
          font-family: var(--font-sans);
          font-size: 17px;
          line-height: 1.75;
          color: var(--m-text-secondary);
          margin-bottom: 24px;
        }
        div[style*="max-width: 680px"] a {
          color: var(--m-accent);
          text-decoration: none;
          border-bottom: 1px solid currentColor;
        }
        div[style*="max-width: 680px"] em {
          font-family: var(--font-serif);
          font-style: italic;
        }
      `}</style>
    </div>
  )
}

export async function generateStaticParams() {
  return Object.keys(METHOD_PAGES).map((slug) => ({ slug }))
}
