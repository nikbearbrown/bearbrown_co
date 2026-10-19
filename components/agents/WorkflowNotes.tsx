import ReactMarkdown from 'react-markdown'
import type { WorkflowNode } from '@/lib/n8n-catalog'

export default function WorkflowNotes({ nodes }: { nodes: WorkflowNode[] }) {
  const seen = new Set<string>()
  const notes = nodes.filter(n => {
    const key = n.note?.trim().replace(/\s+/g, ' ')
    if (!key || seen.has(key)) return false
    seen.add(key); return true
  })
  const isLabel = (note: string) => note.trim().split('\n').filter(s => s.trim()).every(s => /^#{1,6}\s+/.test(s.trim()))
  const title = (n: WorkflowNode) => n.note.match(/^#{1,6}\s+(.+)$/m)?.[1] || n.name
  const labels = notes.filter(n => isLabel(n.note))
  const explanations = notes.filter(n => !isLabel(n.note))
  return <section>
    <h2 className="mb-4 text-3xl" style={{ fontFamily: 'var(--font-serif)' }}>Workflow notes</h2>
    <div className="space-y-3">{explanations.map((n, i) => <details key={`${n.id}-${i}`} open={n.name.startsWith('Publication')} className="rounded border p-4" style={{ borderColor: 'var(--p-border)', background: n.sticky ? 'var(--p-bg-card)' : undefined }}>
      <summary className="cursor-pointer font-medium">{title(n)}</summary>
      <div className="prose prose-sm mt-4 max-w-none break-words dark:prose-invert" style={{ color: 'var(--p-ink-soft)' }}><ReactMarkdown skipHtml components={{ img: () => null }}>{n.note}</ReactMarkdown></div>
    </details>)}</div>
    {!!labels.length && <div className="mt-5 rounded border p-4" style={{ borderColor: 'var(--p-border)' }}>
      <h3 className="text-sm font-medium">Canvas section labels</h3>
      <p className="mt-1 text-sm" style={{ color: 'var(--p-ink-soft)' }}>These name areas of the original canvas; they do not include explanatory instructions.</p>
      <ul className="mt-3 flex flex-wrap gap-2">{labels.map(n => <li key={n.id} className="rounded border px-3 py-1 text-sm" style={{ borderColor: 'var(--p-border)', background: 'var(--p-bg-card)' }}>{title(n)}</li>)}</ul>
    </div>}
    {!notes.length && <p>No notes were included in this source.</p>}
  </section>
}
