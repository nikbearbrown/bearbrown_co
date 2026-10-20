import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import InstallTabs from '@/components/skills/InstallTabs'
import SkillCopy from '@/components/skills/SkillCopy'
import { skills, getSkill, KIND_LABEL, KIND_BLURB, formatWords, CANON_REPO_URL } from '@/lib/skill-catalog'
import { getSkillText } from '@/lib/skill-text'
import { getAgent } from '@/lib/agent-catalog'

export const dynamicParams = false
export function generateStaticParams() { return skills.map(s => ({ slug: s.slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = getSkill((await params).slug)
  if (!s) return { title: 'Skill not found | Bear Brown' }
  return { title: `${s.name} — Skills | Bear Brown`, description: s.does, alternates: { canonical: `https://www.bearbrown.co/skills/${s.slug}` } }
}

const serif = { fontFamily: 'var(--font-serif)' } as const
const mono = { fontFamily: 'var(--font-mono, ui-monospace, monospace)' } as const
const eyebrow = 'mb-2 text-xs uppercase tracking-widest'

export default async function SkillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = getSkill(slug); const text = getSkillText(slug)
  if (!s || !text) notFound()
  const pairs = s.pairs.map(getSkill).filter(Boolean) as typeof skills
  const agents = s.agents.map(getAgent).filter(Boolean) as NonNullable<ReturnType<typeof getAgent>>[]
  const maxWords = Math.max(1, ...s.sections.map(x => x.words))
  const source = s.derivedFrom[0]
  return <article className="px-5 py-10 md:px-8" style={{ background: 'var(--p-bg)', color: 'var(--p-ink)' }}>
    <div className="mx-auto max-w-6xl">
      <Link href="/skills#library" className="text-sm underline" style={{ color: 'var(--p-ink-soft)' }}>← All skills</Link>
      <header className="my-8 border-b pb-8" style={{ borderColor: 'var(--p-border)' }}>
        <div className="mb-4 flex flex-wrap gap-2 text-xs">{s.canonical && <span className="rounded border px-3 py-1 font-medium" style={{ borderColor: 'var(--p-ink)' }}>Rewrite · {s.derivedFrom.length} sources cited</span>}<span className="rounded border px-3 py-1">{KIND_LABEL[s.kind]}</span>{s.job && <span className="rounded border px-3 py-1">{s.job}</span>}{s.persona && <span className="rounded border px-3 py-1">Persona: {s.persona}</span>}</div>
        <h1 className="break-words text-4xl font-semibold md:text-6xl" style={mono}>{s.name}</h1>
        <p className="mt-5 max-w-3xl text-2xl leading-snug" style={serif}>{s.does}</p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          {s.starts && <code className="rounded px-4 py-3 text-base" style={{ background: 'var(--p-ink)', color: 'var(--p-bg)' }}>{s.starts}</code>}
          {s.starts && <SkillCopy text={s.starts} label="Copy" />}
          <a href="#install" className="rounded px-5 py-2.5 text-sm font-medium" style={{ background: 'var(--p-ink)', color: 'var(--p-bg)' }}>Install it</a>
          <a href="#text" className="rounded border px-5 py-2.5 text-sm" style={{ borderColor: 'var(--p-border-strong)' }}>Read the full text</a>
        </div>
        {s.starts && <p className="mt-3 text-sm" style={{ color: 'var(--p-ink-soft)' }}>Type <code>{s.starts}</code> to start and see what it can do. It also starts when your request matches its description.</p>}
      </header>
      <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-14">
          <dl className="grid overflow-hidden rounded-lg border sm:grid-cols-2" style={{ borderColor: 'var(--p-border-strong)', background: 'var(--p-bg-card)' }}>
            {([['Use it when', (u => u ? u[0].toUpperCase() + u.slice(1) : 'The description does not say.')(s.useWhen.replace(/^Use (?:when|this when|it when|for)\s+/i, '').replace(/^Use\s+/, ''))], ['What kind it is', KIND_BLURB[s.kind]], ['Size', `${formatWords(s.words)}. The whole text loads when the skill fires; only the ${s.descWords}-word description is always loaded.`], ['Starts with', s.starts ? `${s.starts}, or just ask for the job.` : 'Ask for the job it describes.']] as const).map(([k, v]) => <div key={k} className="border-b p-5 sm:odd:border-r [&:nth-last-child(-n+2)]:sm:border-b-0" style={{ borderColor: 'var(--p-border)' }}><dt className="mb-1 text-xs uppercase tracking-widest" style={{ color: 'var(--p-ink-soft)' }}>{k}</dt><dd className="text-sm leading-relaxed">{v}</dd></div>)}
          </dl>

          {!!s.sections.length && <section id="inside"><p className={eyebrow} style={{ color: 'var(--p-ink-soft)' }}>How it is organised</p><h2 className="mb-3 text-3xl" style={serif}>What’s inside</h2>
            <p className="mb-5 max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>The skill’s top-level sections, in order. The bar is each section’s share of the {formatWords(s.words)}, so you can see where the weight sits before reading.</p>
            <ol className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--p-border)' }}>{s.sections.map((x, i) => <li key={i} className="grid grid-cols-[1.6rem_1fr_5.5rem] items-center gap-3 border-b px-4 py-2.5 text-sm last:border-b-0 sm:grid-cols-[1.6rem_minmax(0,1fr)_minmax(0,14rem)_5.5rem]" style={{ borderColor: 'var(--p-border)' }}><span style={{ color: 'var(--p-ink-muted)' }}>{i + 1}</span><span className="break-words">{x.title}</span><span aria-hidden="true" className="hidden sm:block"><span className="block h-2 rounded-sm" style={{ width: `${Math.max(2, (x.words / maxWords) * 100)}%`, background: 'var(--p-ink)', opacity: 0.55 }} /></span><span className="text-right text-xs" style={{ color: 'var(--p-ink-soft)' }}>{x.words.toLocaleString('en-US')} words</span></li>)}</ol></section>}

          {!!s.phases.length && <section id="phases"><p className={eyebrow} style={{ color: 'var(--p-ink-soft)' }}>How it runs</p><h2 className="mb-3 text-3xl" style={serif}>{s.phases.length} phases, in order</h2>
            <p className="mb-5 max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>The skill names these phases in its headings. Open the text for what each one asks of you and what it holds back until you have answered.</p>
            <ol className="ml-4 space-y-1 border-l-2 pl-8" style={{ borderColor: 'var(--p-border-strong)' }}>{s.phases.map(p => <li key={p.n} className="relative py-2.5"><span aria-hidden="true" className="absolute -left-[49px] top-2 grid h-8 w-8 place-items-center rounded-full text-xs font-semibold" style={{ background: 'var(--p-ink)', color: 'var(--p-bg)' }}>{p.n}</span><span className="font-medium">{p.title}</span></li>)}</ol></section>}

          {!!s.commands.length && <section id="commands"><p className={eyebrow} style={{ color: 'var(--p-ink-soft)' }}>What you can ask</p><h2 className="mb-3 text-3xl" style={serif}>{s.commands.length} commands</h2>
            <p className="mb-5 max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>Read off the text by a script. The skill itself is the authority on what each command does, and some descriptions are blank because the text does not give a one-line one.</p>
            <ul className="grid gap-2 sm:grid-cols-2">{s.commands.map(c => <li key={c.name} className="rounded border px-4 py-3" style={{ borderColor: 'var(--p-border)', background: 'var(--p-bg-card)' }}><code className="text-sm font-semibold">{c.name}</code>{c.desc && <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>{c.desc}</p>}</li>)}</ul></section>}

          {s.rules && <section id="rules"><p className={eyebrow} style={{ color: 'var(--p-ink-soft)' }}>What it holds the line on</p><h2 className="mb-3 text-3xl" style={serif}>Rules in the text</h2>
            <p className="mb-5 text-sm" style={{ color: 'var(--p-ink-soft)' }}>From the section “{s.rules.from}”.</p>
            <ul className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--p-border-strong)' }}>{s.rules.items.map((r, i) => <li key={i} className="relative border-b py-3 pl-11 pr-5 text-sm leading-relaxed last:border-b-0" style={{ borderColor: 'var(--p-border)' }}><span aria-hidden="true" className="absolute left-4 top-3 font-bold" style={{ color: 'var(--p-vermilion)' }}>✕</span>{r}</li>)}</ul></section>}

          <section id="text"><p className={eyebrow} style={{ color: 'var(--p-ink-soft)' }}>The skill itself</p><h2 className="mb-3 text-3xl" style={serif}>Read it before you install it</h2>
            <div className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--p-border-strong)' }}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 text-sm" style={{ borderColor: 'var(--p-border)', background: 'var(--p-bg-card)' }}><span><code>{s.slug}/SKILL.md</code> · {formatWords(s.words)}</span><span className="flex flex-wrap items-center gap-4"><a className="underline" href={`/skills/${s.slug}/skill.md`} download="SKILL.md">Download</a><a className="underline" href={s.canonical ? s.repoUrl : source.url} target="_blank" rel="noopener noreferrer">{s.canonical ? 'Skill on GitHub ↗' : 'Source on GitHub ↗'}</a></span></div>
              <pre tabIndex={0} className="m-0 max-h-[34rem] overflow-auto whitespace-pre-wrap break-words p-5 text-[13px] leading-relaxed" style={{ fontFamily: 'ui-monospace, monospace' }}>{text}</pre>
            </div>
            <div className="mt-4"><SkillCopy text={text} label="Copy the whole skill" /></div></section>

          {s.refactor && <section id="refactor"><p className={eyebrow} style={{ color: 'var(--p-ink-soft)' }}>The second audit</p><h2 className="mb-3 text-3xl" style={serif}>What we found in the sources</h2>
            <p className="mb-6 max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>{s.refactor.summary} Every source below was read at the commit the auditor recorded. Nothing was taken from a source without a permissive license.</p>
            <h3 className="mb-3 text-xl font-semibold">What each source contributed</h3>
            <ul className="mb-8 space-y-3 text-sm leading-relaxed">{s.derivedFrom.map(d => <li key={d.repo} className="rounded border p-4" style={{ borderColor: 'var(--p-border)', background: 'var(--p-bg-card)' }}><a className="font-medium underline" href={d.url} target="_blank" rel="noopener noreferrer">{d.repo} ↗</a> <span className="text-xs" style={{ color: 'var(--p-ink-soft)' }}>· {d.role} · {d.license}</span><p className="mt-1">{d.took ? d.took[0].toUpperCase() + d.took.slice(1) : ''}</p></li>)}</ul>
            <h3 className="mb-3 text-xl font-semibold">What changed</h3>
            <ul className="mb-8 list-disc space-y-2 pl-5 text-sm leading-relaxed">{s.refactor.changed.map((c, i) => <li key={i}>{c}</li>)}</ul>
            <h3 className="mb-3 text-xl font-semibold">Problems found in the sources</h3>
            <ul className="mb-8 space-y-2 text-sm leading-relaxed">{s.refactor.findings.map((f, i) => <li key={i} className="relative pl-6"><span aria-hidden="true" className="absolute left-0 top-0 font-bold" style={{ color: 'var(--p-vermilion)' }}>!</span><b>{f.repo}</b>: {f.finding}</li>)}</ul>
            <h3 className="mb-3 text-xl font-semibold">What was dropped</h3>
            <ul className="mb-8 list-disc space-y-2 pl-5 text-sm leading-relaxed">{s.refactor.dropped.map((c, i) => <li key={i}>{c}</li>)}</ul>
            <details className="mb-3 rounded border p-4 text-sm" style={{ borderColor: 'var(--p-border)' }}><summary className="cursor-pointer font-medium">Read but not used ({s.refactor.examined.length})</summary><ul className="mt-3 space-y-2 leading-relaxed">{s.refactor.examined.map(x => <li key={x.repo}><b>{x.repo}</b>: {x.note}</li>)}</ul></details>
            {!!s.refactor.excluded.length && <details className="rounded border p-4 text-sm" style={{ borderColor: 'var(--p-border)' }}><summary className="cursor-pointer font-medium">Left out for license ({s.refactor.excluded.length})</summary><p className="mt-3 leading-relaxed">No license is declared on these, so nothing was taken from them: {s.refactor.excluded.map(x => x.repo).join(', ')}.</p></details>}
          </section>}

          <section id="install"><p className={eyebrow} style={{ color: 'var(--p-ink-soft)' }}>Same text, wherever you work</p><h2 className="mb-4 text-3xl" style={serif}>Use it where you work</h2><InstallTabs slug={s.slug} canonical={s.canonical} /></section>

          {(!!pairs.length || !!agents.length) && <section><h2 className="mb-5 text-3xl" style={serif}>Pairs with</h2>
            <div className="grid gap-4 md:grid-cols-3">{pairs.map(p => <Link key={p.slug} href={`/skills/${p.slug}`} className="rounded-lg border p-4 text-sm" style={{ borderColor: 'var(--p-border)' }}><b className="mb-1 block break-words" style={mono}>{p.name}</b><span style={{ color: 'var(--p-ink-soft)' }}>{p.does.length > 110 ? `${p.does.slice(0, 107)}…` : p.does}</span></Link>)}
              {agents.map(a => <Link key={a.slug} href={`/agents/${a.slug}`} className="rounded-lg border p-4 text-sm" style={{ borderColor: 'var(--p-border-strong)', background: 'var(--p-bg-card)' }}><span className="mb-1 block text-xs uppercase tracking-widest" style={{ color: 'var(--p-ink-soft)' }}>Agent</span><b className="mb-1 block break-words">{a.title}</b><span style={{ color: 'var(--p-ink-soft)' }}>A workflow in the Agents library that covers related ground.</span></Link>)}</div></section>}
        </div>
        <aside className="space-y-6">
          <section className="rounded-lg border p-5" style={{ borderColor: 'var(--p-border-strong)', background: 'var(--p-bg-card)' }}><h2 className="mb-3 text-2xl" style={serif}>Where this came from</h2>
            <p className="mb-3 text-sm leading-relaxed">{s.canonical ? `A Bear Brown rewrite, refactored from ${s.derivedFrom.length} public skills. It is not the original of any of them, and the sources are cited below.` : s.verbatim ? 'This page shows the skill exactly as it appears in its source. Nothing here was rewritten.' : (s.note || 'Bear Brown’s rewrite of the sources below. It is not the original.')}</p>
            <ul className="space-y-3 text-sm">{s.derivedFrom.map(d => <li key={d.path + d.repo}><a className="break-all underline" href={d.url} target="_blank" rel="noopener noreferrer">{d.repo}{s.canonical ? '' : `/${d.path}`} ↗</a>{d.commit && <span className="block text-xs" style={{ color: 'var(--p-ink-soft)' }}>commit {d.commit.slice(0, 10)}{d.license ? ` · ${d.license}` : ''}</span>}</li>)}</ul>
            {s.canonical && <p className="mt-3 text-sm"><a className="underline" href="#refactor">What we found in the sources ↓</a></p>}
            <details className="mt-4"><summary className="cursor-pointer text-sm">File fingerprints</summary>{s.derivedFrom.map(d => <div key={d.repo}><p className="mt-3 text-xs">{s.canonical ? d.repo : 'Source'} SHA-256</p><code className="mt-1 block break-all text-[11px]">{d.sha256}</code></div>)}{!s.verbatim && <><p className="mt-3 text-xs">This page’s SHA-256</p><code className="mt-1 block break-all text-[11px]">{s.sha256}</code></>}</details></section>
          <section className="rounded-lg border p-5" style={{ borderColor: 'var(--p-border)' }}><h2 className="mb-3 text-2xl" style={serif}>Status</h2><p className="font-medium">Not audited</p><p className="mt-2 text-sm leading-relaxed">{s.canonical ? 'Written by Nik Bear Brown with Claude from the cited sources. It has not been run against benchmarks or through the auditor pipeline. The audit above is a reading of the sources, so check it against them.' : 'Written by Nik Bear Brown. It has not been run through the auditor pipeline, and its commands were read off the text, not exercised. Read the text before you trust it with something that matters.'}</p><p className="mt-3 text-sm" style={{ color: 'var(--p-ink-soft)' }}>MIT license{s.canonical ? ` · refactored ${s.refactor?.date}` : s.changed ? ` · last changed ${s.changed}` : ''}</p></section>
          <section className="rounded-lg border p-5 text-sm" style={{ borderColor: 'var(--p-border)' }}><h2 className="mb-3 text-2xl" style={serif}>On this page</h2><ul className="space-y-1.5">{[...(s.sections.length ? [['inside', 'What’s inside']] : []), ...(s.phases.length ? [['phases', 'Phases']] : []), ...(s.commands.length ? [['commands', 'Commands']] : []), ...(s.rules ? [['rules', 'Rules']] : []), ['text', 'The skill text'], ...(s.refactor ? [['refactor', 'What we found']] : []), ['install', 'Install']].map(([id, label]) => <li key={id}><a className="underline" href={`#${id}`}>{label}</a></li>)}</ul></section>
        </aside>
      </div>
    </div>
  </article>
}
