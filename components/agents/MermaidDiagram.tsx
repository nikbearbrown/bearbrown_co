'use client'
import { useEffect, useId, useRef, useState } from 'react'

export default function MermaidDiagram({ source }: { source: string }) {
  const host = useRef<HTMLDivElement>(null)
  const id = 'agent-diagram-' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const [error, setError] = useState(false)
  const [ready, setReady] = useState(false)
  const [readable, setReadable] = useState(false)
  const [naturalWidth, setNaturalWidth] = useState(540)
  useEffect(() => {
    let stopped = false
    setReady(false); setError(false); setReadable(false)
    async function render() {
      try {
        const { default: mermaid } = await import('mermaid')
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true, theme: 'neutral', maxEdges: 1000, maxTextSize: 100000, flowchart: { htmlLabels: false, useMaxWidth: true } })
        const { svg } = await mermaid.render(id, source)
        if (!stopped && host.current) {
          host.current.innerHTML = svg
          setNaturalWidth(host.current.querySelector('svg')?.viewBox.baseVal.width || 540)
          setReady(true)
        }
      } catch { if (!stopped) setError(true) }
    }
    render()
    return () => { stopped = true }
  }, [id, source])
  return <div>
    {!ready && !error && <p className="p-4 text-sm" role="status">Rendering the workflow diagram…</p>}
    {error && <p className="p-4 text-sm" role="status">The diagram could not be rendered. Its Mermaid source is available below.</p>}
    {ready && <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
      <button type="button" className="rounded border px-3 py-2" aria-pressed={!readable} onClick={() => setReadable(false)}>Fit diagram</button>
      <button type="button" className="rounded border px-3 py-2" aria-pressed={readable} onClick={() => setReadable(true)}>Readable size</button>
      {readable && <span>Scroll inside the diagram to follow its branches.</span>}
    </div>}
    <div className="max-h-[70vh] overflow-auto rounded border bg-[#faf9f5] p-5 text-[#3d3929]" tabIndex={0} aria-label="Scrollable workflow diagram">
      <div ref={host} style={{ width: readable ? naturalWidth : '100%' }} className="[&>svg]:w-full" role="img" aria-label="Workflow diagram; the specification and Mermaid source provide text alternatives." />
    </div>
    <details className="mt-3"><summary className="cursor-pointer text-sm underline">Read the Mermaid source</summary><pre className="mt-3 max-h-96 overflow-auto rounded border p-4 text-xs">{source}</pre></details>
  </div>
}
