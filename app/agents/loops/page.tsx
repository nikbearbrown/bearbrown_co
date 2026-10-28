import type { Metadata } from 'next'
import Link from 'next/link'
import MermaidDiagram from '@/components/agents/MermaidDiagram'
import { LOOP_PATTERNS, LOOP_DIMENSIONS } from '@/lib/agent-loop-patterns'
import { PARADIGMS, NOT_YET_COVERED } from '@/lib/agent-paradigms'
import libraryPatterns from '@/data/agents/loop-library/patterns.json'
import libraryCatalog from '@/data/agents/loop-library/catalog.json'
const libByNumber = new Map((libraryCatalog.loops as { number: string; title: string; url: string; author: string }[]).map(l => [l.number, l]))
export const metadata: Metadata = { title: 'Agent loop patterns | Agents · Bear Brown', description: 'Common loop shapes in agentic engineering, described by what iterates, what is fed back, what stops it and who judges.', alternates: { canonical: 'https://www.bearbrown.co/agents/loops' } }
export default function LoopsPage() {
  return <article className="px-5 py-12 md:px-8" style={{ background: 'var(--p-bg)', color: 'var(--p-ink)' }}>
    <div className="mx-auto max-w-6xl">
      <Link href="/agents" className="text-sm underline">← Agents</Link>
      <header className="my-8 max-w-4xl">
        <p className="mb-3 text-xs uppercase tracking-widest">Agent loop patterns · Draft</p>
        <h1 className="text-4xl leading-tight md:text-5xl" style={{ fontFamily: 'var(--font-serif)' }}>Nobody draws an agent loop the same way</h1>
        <p className="mt-5 text-lg leading-relaxed">Different diagrams often hide the same loop. Compare them by five questions instead of by shape.</p>
        <p className="mt-4 text-sm leading-relaxed">These eleven patterns are a working taxonomy drawn from the literature and from reading the agent diagrams in this library by hand. We have not yet measured how often each appears, so no prevalence is claimed, and the list is open to revision.</p>
      </header>
      <section aria-labelledby="paradigms" className="mb-14"><p className="mb-2 text-xs uppercase tracking-widest" style={{ color: 'var(--p-ink-soft)' }}>Why you&apos;re confused (it&apos;s not you)</p>
        <h2 id="paradigms" className="mb-3 text-3xl" style={{ fontFamily: 'var(--font-serif)' }}>Nobody draws it the same way</h2>
        <p className="mb-4 max-w-3xl leading-relaxed">Watch five videos and you&apos;ll see five different pictures, often of the same idea from different angles. These are the paradigms we found in the literature and in practitioner write-ups. The list is a search result, not a proof of completeness.</p>
        <p className="mb-6 max-w-3xl rounded border p-4 text-sm" style={{ borderColor: 'var(--p-border)', background: 'var(--p-bg-card)' }}>New here? An <strong>LLM</strong> is an AI model, the kind of thing behind ChatGPT. <strong>Tools</strong> are things it can do for itself: search the web, run code, edit a file.</p>
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{PARADIGMS.map(p => <li key={p.id} className="flex flex-col rounded-xl border p-5" style={{ borderColor: 'var(--p-border-strong)', background: 'var(--p-bg-card)' }}>
          <div className="mb-4 min-h-[8rem]"><MermaidDiagram source={p.mermaid} compact /></div>
          <h3 className="text-lg font-semibold">{p.quote}</h3>
          <p className="mt-1 text-xs uppercase tracking-wide" style={{ color: 'var(--p-ink-soft)' }}>{p.name}</p>
          <p className="mt-2 flex-1 text-sm leading-relaxed">{p.line}</p>
          <p className="mt-3 text-xs"><a href={p.href} className="underline" target="_blank" rel="noopener noreferrer">{p.source} ↗</a> · {p.checked === 'primary' ? 'source read' : 'described from search summaries, not the original'}</p>
        </li>)}</ul>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed">Not yet covered: {NOT_YET_COVERED.join('; ')}. Cards marked Cards marked &ldquo;from secondary write-ups&rdquo; are described from blogs and surveys; checkldquo;described from search summariesCards marked &ldquo;from secondary write-ups&rdquo; are described from blogs and surveys; checkrdquo; come from blogs, surveys and abstracts, not the original papers; check the original before relying on detail.</p>
      </section>
      <section aria-labelledby="engineering" className="mb-14 max-w-4xl"><h2 id="engineering" className="mb-4 text-3xl" style={{ fontFamily: 'var(--font-serif)' }}>Loop engineering is finding the loop that fits</h2>
        <p className="mb-4 leading-relaxed">What gets called loop engineering is, at its core, <strong>finding the loop pattern that best fits the problem</strong>. There are quite a few loops, and no closed list: the same parts (a step, a check, a feedback signal, a stop rule, a judge) can be put together in endless ways, so there is potentially an infinite number of loops.</p>
        <p className="mb-4 leading-relaxed">That makes it an inherently human problem. No one can enumerate the loops and test them all. Your intelligence and intuition decide which few are likely to fit this particular problem: does a program or a person judge the result, does it need a clean start each time, can one change be isolated, who must approve. The catalog of paradigms above and the library below are menus to choose from, not an answer.</p>
        <p className="leading-relaxed">The sections that follow give you the questions to ask and the examples to start from. The choice, and the responsibility for it, stays with the person.</p>
      </section>
      <section aria-labelledby="library" className="mb-14"><h2 id="library" className="mb-3 text-3xl" style={{ fontFamily: 'var(--font-serif)' }}>What 85 published loops show</h2>
        <p className="mb-3 max-w-4xl leading-relaxed">The <a className="underline" href="https://signals.forwardfuture.com/loop-library/" target="_blank" rel="noopener noreferrer">Forward Future Loop Library</a> (MIT licence; many loops by Matthew Berman, the rest by named contributors) publishes {libraryPatterns.loopCount} reusable loops, each with a prompt, a verification line and steps. We downloaded the catalog and sorted it by hand into the patterns below. The reading was partial (titles, verification lines and prompt openings), so treat the grouping as a first pass.</p>
        <h3 className="mb-2 mt-6 text-lg font-semibold">Meta-patterns across the library</h3>
        <ul className="grid gap-4 md:grid-cols-2">{libraryPatterns.patterns.map(pt => <li key={pt.id} className="rounded-xl border p-5" style={{ borderColor: 'var(--p-border-strong)', background: 'var(--p-bg-card)' }}>
          <h4 className="font-semibold">{pt.name} <span className="font-normal text-sm" style={{ color: 'var(--p-ink-soft)' }}>· {pt.loops.length} loop{pt.loops.length === 1 ? '' : 's'}</span></h4>
          <p className="mt-1 text-sm leading-relaxed">{pt.summary}</p>
          <p className="mt-2 text-xs leading-relaxed">{pt.loops.map((n, i) => { const l = libByNumber.get(n); return l ? <span key={n}>{i > 0 && ' · '}<a className="underline" href={l.url} target="_blank" rel="noopener noreferrer">{l.title.replace(/^The /, '')}</a></span> : null })}</p>
        </li>)}</ul>
        <h3 className="mb-2 mt-8 text-lg font-semibold">How often each ingredient appears</h3>
        <p className="mb-3 max-w-4xl text-sm leading-relaxed">Approximate keyword counts across the {libraryPatterns.loopCount} loops. They over- and under-count, so read them as rough proportions.</p>
        <table className="w-full max-w-3xl border-collapse text-sm"><thead><tr className="border-b text-left" style={{ borderColor: 'var(--p-border-strong)' }}><th className="py-2 pr-4">Ingredient</th><th className="py-2">Loops</th></tr></thead><tbody>{[...libraryPatterns.keywordCounts].sort((a, b) => b.count - a.count).map(k => <tr key={k.key} className="border-b" style={{ borderColor: 'var(--p-border)' }}><td className="py-2 pr-4">{k.label}</td><td className="py-2">{k.count} of {libraryPatterns.loopCount}</td></tr>)}</tbody></table>
        <p className="mt-4 max-w-4xl text-sm leading-relaxed">Nearly every loop names a stop condition and most name a program-run check. Only a minority use an independent reviewer or a clean-state test. A stop condition and a judge are the two things this page keeps coming back to. Loop snapshot and licence: <code>data/agents/loop-library/</code>.</p>
      </section>
      <section aria-labelledby="why" className="mb-12 max-w-4xl"><h2 id="why" className="mb-4 text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>Reasoning is a plan, and plans loop</h2>
        <p className="mb-4 leading-relaxed">When an agent reasons, what it usually produces is a plan: do step A, then step B, then step C, and so on to the goal. The plan is the agent's answer to what it is doing and how it will do it.</p>
        <h3 className="mb-2 text-lg font-semibold">Show the plan before the long work starts</h3>
        <p className="mb-4 leading-relaxed">An agent can spend a lot of time and money on the wrong thing. Showing the plan first lets a person catch a wrong approach, a missing step or a bad assumption while correcting it is still cheap. The longer the work, the more this matters.</p>
        <h3 className="mb-2 text-lg font-semibold">Two ways to show a plan</h3>
        <ul className="mb-4 list-disc space-y-2 pl-5 leading-relaxed"><li><strong>A diagram.</strong> The agent loop drawn out: what it does, in what order, and where it branches or repeats. Best for seeing the shape and the decision points.</li><li><strong>A to-do list.</strong> The same plan as plain steps: A, B, C, D, E. Best for tracking progress and for approving or editing item by item.</li></ul>
        <h3 className="mb-2 text-lg font-semibold">Why loops are part of agents</h3>
        <p className="mb-4 leading-relaxed">A plan would be a straight line if every step finished the first time. Steps often don't. At the end of step A the agent checks whether A is done; if not, it redoes A. So the agent may stay on step C until step C is done, and only then move to D. That repeat-until-done is the loop. Every pattern below is a different answer to the same questions: how is "done" decided, and what happens when it isn't.</p>
        <h3 className="mb-2 text-lg font-semibold">What effort means in the reasoning loop</h3>
        <p className="mb-4 leading-relaxed"><strong>Effort is how much work an agent puts into a job.</strong> Many models and tools expose it as a setting (low, medium, high). Higher effort costs more time and money, so what does it buy? One answer is more thinking per step. The more important answer, for agents, is what happens to the plan.</p>
        <p className="mb-4 leading-relaxed">Any agent can come up with one plan. What high effort can do is <strong>change that plan midstream</strong>. It keeps checking whether the plan is working. If the evidence says it isn&apos;t (the steps keep failing, the results look wrong, the approach has hit a wall), it stops, comes up with a different plan, and carries on with that one. Low effort rarely does this. It tends to follow the first plan to the end, or repeat the failing step, even when the plan was the problem.</p>
        <p className="mb-4 leading-relaxed">So there are two loops: the inner one redoes a step until it is done, and the outer one decides whether the plan itself should be thrown out. Effort mostly sets how often the outer loop gets a turn.</p>
        <MermaidDiagram source={'flowchart LR\n  P[Come up with a plan] --> S[Do the next step]\n  S --> Q{Is the plan working?}\n  Q -- yes --> N{More steps?}\n  N -- yes --> S\n  N -- no --> Z[Done]\n  Q -- no, high effort --> R[Make a new plan]\n  R --> S\n  Q -- no, low effort --> S'} />
        <p className="mb-4 mt-4 leading-relaxed">Replanning is not free. Each new plan costs thinking, and an agent that replans too readily can thrash between plans. That is why a replan limit, a budget, or a person checking in still matters, and why a plan should be shown first, while changing it, or the effort given to the job, is still cheap. Effort also has two other parts: how many steps the plan has and how many times each step repeats. A plan lets you estimate all three before the work starts.</p>
        <h3 className="mb-2 mt-6 text-lg font-semibold">The simple loop, step by step</h3>
        <MermaidDiagram source={'flowchart LR\n  A[Step A] --> B[Step B]\n  B --> C[Step C]\n  C --> Q{Step C done?}\n  Q -- no, redo --> C\n  Q -- yes --> D[Step D]\n  D --> E[Step E]'} />
      </section>
      <section aria-labelledby="auto" className="mb-12 max-w-4xl"><h2 id="auto" className="mb-4 text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>Not every loop can run by itself</h2>
        <p className="mb-4 leading-relaxed">Iterating on quality usually looks like this: big gains in the first few passes, then a long stretch of small, uneven improvements. That later stretch is where deciding what counts as better gets hard.</p>
        <figure className="mb-4"><svg viewBox="0 0 520 280" role="img" aria-labelledby="curve-t curve-d" className="w-full max-w-xl"><title id="curve-t">Quality against iterations</title><desc id="curve-d">Quality rises steeply over the first few iterations, then climbs slowly and unevenly. The slow, uneven stretch is circled and marked as the part where a person's judgment is usually needed.</desc>
          <line x1="50" y1="20" x2="50" y2="240" stroke="currentColor" strokeWidth="1.5" /><line x1="50" y1="240" x2="500" y2="240" stroke="currentColor" strokeWidth="1.5" />
          <text x="12" y="135" fontSize="13" fill="currentColor" transform="rotate(-90 12 135)" textAnchor="middle">Quality</text><text x="275" y="266" fontSize="13" fill="currentColor" textAnchor="middle">Iterations</text>
          <path d="M50 240 C 70 150, 90 110, 110 100 L 135 92 L 165 88 L 185 82 L 200 66 L 225 74 L 250 70 L 275 52 L 300 60 L 330 50 L 345 36 L 400 42 L 420 30 L 450 30" fill="none" stroke="var(--p-blue)" strokeWidth="3.5" strokeLinejoin="round" />
          <ellipse cx="305" cy="62" rx="185" ry="52" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4" transform="rotate(-6 305 62)" />
          <text x="300" y="150" fontSize="12.5" fill="currentColor" textAnchor="middle">Small, uneven gains: someone has to say</text><text x="300" y="167" fontSize="12.5" fill="currentColor" textAnchor="middle">what is better. Often a person.</text></svg>
          <figcaption className="mt-1 text-xs" style={{ color: 'var(--p-ink-soft)' }}>Illustrative shape, not measured data.</figcaption></figure>
        <p className="mb-4 leading-relaxed">That is why this kind of iteration often cannot be fully automated. A person is frequently in the loop, so the agent has to stop and wait for feedback on what is and is not good before it goes on.</p>
        <p className="mb-4 leading-relaxed"><strong>Rule of thumb:</strong> an agent can run end to end on its own only when every step has a clear, checkable definition of good and bad. Where a program can decide (tests pass, schema validates, value in range), the loop can run unattended. Where "good" is taste, context or a judgment call, build in a pause and ask. This is the "who judges" question below, and it is where goals have to be written precisely enough to check.</p>
      </section>
      <section aria-labelledby="dims" className="mb-12"><h2 id="dims" className="mb-4 text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>Five questions that describe any loop</h2>
        <dl className="grid gap-4 md:grid-cols-2">{LOOP_DIMENSIONS.map(([t, d]) => <div key={t} className="rounded border p-4" style={{ borderColor: 'var(--p-border)' }}><dt className="font-semibold">{t}</dt><dd className="mt-1 text-sm">{d}</dd></div>)}</dl>
        <p className="mt-4 max-w-4xl text-sm">The stopping rule and the judge are where goals enter the loop: a loop with no judge only stops on its cap, and a weak judge lets bad work through.</p>
      </section>
      <nav aria-label="Patterns" className="mb-8 flex flex-wrap gap-4 border-y py-4 text-sm" style={{ borderColor: 'var(--p-border)' }}>{LOOP_PATTERNS.map(p => <a key={p.id} href={`#${p.id}`} className="underline">{p.name}</a>)}</nav>
      {LOOP_PATTERNS.map(p => <section key={p.id} id={p.id} className="mb-14 border-b pb-10" style={{ borderColor: 'var(--p-border)' }}>
        <h2 className="mb-2 text-3xl" style={{ fontFamily: 'var(--font-serif)' }}>{p.name}</h2>
        <p className="mb-5 max-w-4xl leading-relaxed">{p.summary}</p>
        <MermaidDiagram source={p.mermaid} />
        <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
          {([['What iterates', p.iterates], ['What is fed back', p.feedback], ['What stops it', p.stops], ['Who judges', p.judge], ['Typical failure', p.failure]] as const).map(([k, v]) => <div key={k}><dt className="font-semibold">{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </section>)}
    </div>
  </article>
}
