import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MermaidDiagram from '@/components/agents/MermaidDiagram'
import { getAgent, getAgentDetail, repositoryUrl, implementationStatus } from '@/lib/agent-catalog'
import { getWorkflow } from '@/lib/n8n-catalog'
export const dynamicParams = true
export const revalidate = 86400
export function generateStaticParams() { return [] }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = getAgent((await params).slug)
  return entry ? { title: `${entry.title} | Agents · Bear Brown`, description: entry.description, alternates: { canonical: `https://www.bearbrown.co/agents/${entry.slug}` } } : { title: 'Agent not found | Bear Brown' }
}
export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const entry = getAgent(slug); const detail = getAgentDetail(slug)
  if (!entry || !detail) notFound()
  const repo = `${repositoryUrl}/tree/main/agents/${slug}`
  return <article className="px-5 py-12 md:px-8" style={{ background: 'var(--p-bg)', color: 'var(--p-ink)' }}>
    <div className="mx-auto max-w-6xl">
      <Link href="/agents#library" className="text-sm underline">← All agents</Link>
      <header className="my-8 max-w-4xl"><p className="mb-3 text-xs uppercase tracking-widest">{entry.category} · One purpose, multiple implementations</p><h1 className="text-4xl leading-tight md:text-5xl" style={{ fontFamily: 'var(--font-serif)' }}>{entry.title}</h1><p className="mt-5 text-lg leading-relaxed">{detail.purpose}</p><p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--p-ink-soft)' }}>{detail.overview}</p><a className="mt-5 inline-block underline" href={repo} target="_blank" rel="noopener noreferrer">Open agent files on GitHub ↗</a></header>
      <nav aria-label="Agent sections" className="mb-8 flex flex-wrap gap-5 border-y py-4 text-sm" style={{ borderColor: 'var(--p-border)' }}>{['Workflow', 'Implementations', 'Prompts', 'Evidence'].map(s => <a key={s} href={`#${s.toLowerCase()}`} className="underline">{s}</a>)}</nav>
      <section id="workflow"><h2 className="mb-4 text-3xl" style={{ fontFamily: 'var(--font-serif)' }}>Shared workflow</h2><p className="mb-5 max-w-4xl text-sm leading-relaxed">{slug === 'lectern-job-search' ? 'This Mermaid diagram summarizes the five-workflow Lectern design. Consult the implementation files for its detailed node connections.' : 'This initial Mermaid diagram shows observed connections from the n8n source, including model and tool dependencies. Unresolved connections are listed under Evidence.'} It is a starting point for the shared design; it does not execute the agent or establish correctness.</p><MermaidDiagram source={detail.mermaid} /><a className="mt-4 inline-block text-sm underline" href={`${repositoryUrl}/blob/main/agents/${slug}/specification.md`}>Read the specification and unresolved requirements ↗</a></section>
      <section id="implementations" className="mt-12"><h2 className="mb-4 text-3xl" style={{ fontFamily: 'var(--font-serif)' }}>Implementations</h2><p className="mb-5 text-sm">Each implementation shares the agent’s purpose. Available source, planned ports, and verified results are labeled separately.</p><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{detail.implementations.map(i => <div key={i.id} className="rounded border p-5" style={{ borderColor: 'var(--p-border)', background: 'var(--p-bg-card)' }}><h3 className="text-xl font-medium">{i.label}</h3><p className="mt-2 text-sm">{implementationStatus(i.status)}</p><a className="mt-4 block text-sm underline" href={`${repositoryUrl}/tree/main/${i.path}`}>{i.status === 'planned' ? 'Read the implementation plan' : 'Read setup and source'} ↗</a>{i.id === 'n8n' && getWorkflow(slug) && <Link className="mt-3 block text-sm underline" href={`/agents/n8n/${slug}`}>Inspect the n8n canvas and download JSON →</Link>}</div>)}</div></section>
      <section id="prompts" className="mt-12"><h2 className="mb-4 text-3xl" style={{ fontFamily: 'var(--font-serif)' }}>Build or operate with an assistant</h2><p className="mb-5 max-w-4xl text-sm leading-relaxed">Each prompt includes separate build and operating instructions tailored to this agent. They are untested instructions, not working implementations. Check the chosen product’s actual capabilities before using it.</p><div className="flex flex-wrap gap-3">{detail.prompts.map(p => <a key={p.id} href={`${repositoryUrl}/blob/main/${p.path}`} className="rounded border px-4 py-3 text-sm underline" style={{ borderColor: 'var(--p-border)' }}>{p.label} instructions ↗</a>)}</div></section>
      <section id="evidence" className="mt-12 border-t pt-8" style={{ borderColor: 'var(--p-border)' }}><h2 className="mb-4 text-3xl" style={{ fontFamily: 'var(--font-serif)' }}>Evidence and remaining work</h2><p className="max-w-4xl text-sm leading-relaxed">The bulk collection has publication checks, not live-service testing. Diagrams and prompts are documentation. A port needs reviewed schemas, fixtures, actual execution results, and explicit limits before claiming equivalent behavior.</p><ul className="my-5 list-disc space-y-2 pl-5 text-sm">{detail.unresolved.map((x,i) => <li key={i}>{x}</li>)}</ul><div className="flex flex-wrap gap-5 text-sm">{['schemas','fixtures','evaluations'].map(x => <a key={x} href={`${repo}/${x}`} className="underline">{x[0].toUpperCase()+x.slice(1)} ↗</a>)}</div><p className="mt-6 text-sm">Curated by Nik Bear Brown. Preserve each implementation’s original attribution and license. These source templates are separate from the audited Claude directory.</p></section>
    </div>
  </article>
}
