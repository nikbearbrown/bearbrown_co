'use client'
import { useEffect, useId, useRef, useState } from 'react'

const MIN_ZOOM = 0.5, MAX_ZOOM = 10

export default function MermaidDiagram({ source, compact = false }: { source: string; compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const id = 'agent-diagram-' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const [error, setError] = useState(false)
  const [ready, setReady] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [naturalWidth, setNaturalWidth] = useState(540)
  useEffect(() => {
    let stopped = false
    setReady(false); setError(false); setZoom(1)
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
  const scroller = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  function zoomTo(next: number, cx?: number, cy?: number) {
    const el = scroller.current
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next))
    if (!el || z === zoomRef.current) return
    const rect = el.getBoundingClientRect()
    const px = cx === undefined ? el.clientWidth / 2 : cx - rect.left
    const py = cy === undefined ? el.clientHeight / 2 : cy - rect.top
    const ratio = z / zoomRef.current
    const left = (el.scrollLeft + px) * ratio - px, top = (el.scrollTop + py) * ratio - py
    zoomRef.current = z
    setZoom(z)
    requestAnimationFrame(() => { el.scrollLeft = left; el.scrollTop = top })
  }
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      zoomTo(zoomRef.current * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [ready])
  const naturalZoom = Math.max(1, naturalWidth / 800)
  if (compact) return <div><div ref={host} className="[&>svg]:mx-auto [&>svg]:h-auto [&>svg]:max-h-48 [&>svg]:w-full" role="img" aria-label="Agent loop diagram" />{error && <p className="text-xs" role="status">Diagram unavailable.</p>}</div>
  return <div>
    {!ready && !error && <p className="p-4 text-sm" role="status">Rendering the workflow diagram…</p>}
    {error && <p className="p-4 text-sm" role="status">The diagram could not be rendered. Its Mermaid source is available below.</p>}
    {ready && <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
      <button type="button" aria-label="Zoom out" className="rounded border px-3 py-2" onClick={() => zoomTo(zoom / 1.4)}>−</button>
      <span aria-live="polite" className="min-w-[3.5rem] text-center">{Math.round(zoom * 100)}%</span>
      <button type="button" aria-label="Zoom in" className="rounded border px-3 py-2" onClick={() => zoomTo(zoom * 1.4)}>+</button>
      <button type="button" className="rounded border px-3 py-2" onClick={() => { zoomTo(1); scroller.current?.scrollTo(0, 0) }}>Fit diagram</button>
      <button type="button" className="rounded border px-3 py-2" onClick={() => zoomTo(naturalZoom)}>Readable size</button>
      <span>Ctrl/⌘ + scroll or pinch to zoom; drag to pan.</span>
    </div>}
    <div ref={scroller} className="max-h-[70vh] cursor-grab touch-pan-x touch-pan-y overflow-auto rounded border bg-[#faf9f5] p-5 text-[#3d3929] select-none active:cursor-grabbing" tabIndex={0} aria-label="Scrollable, zoomable workflow diagram"
      onPointerDown={e => { if (e.pointerType === 'touch') return; const el = e.currentTarget; drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop }; el.setPointerCapture(e.pointerId) }}
      onPointerMove={e => { const d = drag.current; if (!d) return; e.currentTarget.scrollLeft = d.left - (e.clientX - d.x); e.currentTarget.scrollTop = d.top - (e.clientY - d.y) }}
      onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}
      onKeyDown={e => { if (e.key === '+' || e.key === '=') zoomTo(zoom * 1.4); else if (e.key === '-') zoomTo(zoom / 1.4); else if (e.key === '0') zoomTo(1) }}>
      <div ref={host} style={{ width: `${zoom * 100}%` }} className="[&>svg]:!max-w-none [&>svg]:h-auto [&>svg]:w-full" role="img" aria-label="Workflow diagram; the specification and Mermaid source provide text alternatives." />
    </div>
    <details className="mt-3"><summary className="cursor-pointer text-sm underline">Read the Mermaid source</summary><pre className="mt-3 max-h-96 overflow-auto rounded border p-4 text-xs">{source}</pre></details>
  </div>
}
