'use client'
import { useState, useMemo, useRef } from 'react'
import type { WorkflowDetail } from '@/lib/n8n-catalog'
import { NODE_CATEGORIES, getNodeCategory } from '@/lib/n8n-node-categories'
import { NodeCategoryIcon } from './NodeCategoryIcon'

export default function WorkflowPreview({ nodes, edges }: Pick<WorkflowDetail, 'nodes' | 'edges'>) {
  const [zoom, setZoom] = useState(1); const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const visual = useMemo(() => nodes.filter(n => !n.sticky).map((n, i) => ({ ...n, x: Number.isFinite(n.position?.[0]) ? n.position[0] : (i % 5) * 250, y: Number.isFinite(n.position?.[1]) ? n.position[1] : Math.floor(i / 5) * 150 })), [nodes])
  const categories = [...new Set(visual.map(n => getNodeCategory(n.type)))]
  const lookup = new Map(visual.map(n => [n.name, n]))
  const minX = Math.min(...visual.map(n => n.x), ...(visual.length ? [] : [0])) - 60, minY = Math.min(...visual.map(n => n.y), ...(visual.length ? [] : [0])) - 60
  const width = Math.max(500, Math.max(0, ...visual.map(n => n.x)) - minX + 260), height = Math.max(250, Math.max(0, ...visual.map(n => n.y)) - minY + 170)
  const vw = width / zoom, vh = height / zoom
  const x = minX + (width - vw) / 2 + offset.x, y = minY + (height - vh) / 2 + offset.y
  function point(clientX: number, clientY: number) {
    const matrix = svg.current?.getScreenCTM()?.inverse()
    return matrix ? new DOMPoint(clientX, clientY).matrixTransform(matrix) : { x: clientX, y: clientY }
  }
  return <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--p-border-strong)' }}>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{ background: 'var(--p-bg-card)', borderColor: 'var(--p-border)' }}><span className="text-sm">Workflow preview</span><div className="flex items-center gap-2"><button aria-label="Zoom out" onClick={() => setZoom(z => Math.max(0.5, z / 1.5))} className="rounded border px-3 py-1">−</button><button aria-label="Zoom in" onClick={() => setZoom(z => Math.min(12, z * 1.5))} className="rounded border px-3 py-1">+</button><button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }) }} className="rounded border px-3 py-1 text-sm">Fit</button></div></div>
    <svg ref={svg} role="img" aria-label={`Static workflow graph with ${visual.length} executable nodes. The node table below provides a text alternative.`} viewBox={`${x} ${y} ${vw} ${vh}`} className="h-[340px] w-full touch-none cursor-grab md:h-[460px]" style={{ background: 'var(--p-bg-card)' }} onPointerDown={e => { const p = point(e.clientX, e.clientY); drag.current = { x: p.x, y: p.y, ox: offset.x, oy: offset.y }; e.currentTarget.setPointerCapture(e.pointerId) }} onPointerMove={e => { if (!drag.current) return; const p = point(e.clientX, e.clientY); setOffset(o => ({ x: o.x + drag.current!.x - p.x, y: o.y + drag.current!.y - p.y })) }} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}>
      <defs><marker id="workflow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--p-ink-soft)" /></marker></defs>
      {edges.map((edge, i) => { const a = lookup.get(edge.from), b = lookup.get(edge.to); if (!a || !b) return null; const ax = a.x + 180, ay = a.y + 52, bx = b.x, by = b.y + 52; return <path key={i} d={`M${ax},${ay} C${ax + 70},${ay} ${bx - 70},${by} ${bx},${by}`} fill="none" stroke="var(--p-ink-soft)" strokeWidth="2" strokeDasharray={edge.kind === 'main' ? undefined : '7 5'} markerEnd="url(#workflow-arrow)"><title>{edge.from} → {edge.to} ({edge.kind}, output {edge.output})</title></path> })}
      {visual.map((n, i) => {
        const category = getNodeCategory(n.type), style = NODE_CATEGORIES[category]
        const words = n.name.split(/\s+/), lines: string[] = ['']
        for (const word of words) {
          const last = lines.length - 1
          if (lines[last] && (lines[last] + ' ' + word).length > 23) lines.push(word)
          else lines[last] += (lines[last] ? ' ' : '') + word
        }
        const titleLine = (line: string) => line.length > 24 ? line.slice(0, 22) + '…' : line
        return <g key={`${n.id}-${i}`} transform={`translate(${n.x},${n.y})`}>
          <title>{n.name} — {n.type} · {style.label}. {style.description}</title>
          <rect width="180" height="104" rx="10" fill="var(--p-bg)" stroke="var(--p-ink-soft)" strokeWidth="1.5" />
          <rect x="1" y="1" width="178" height="43" rx="9" fill={style.background} />
          <NodeCategoryIcon category={category} x={12} y={10} size={25} color={style.color} strokeWidth={1.8} />
          <text x="46" y="28" fill={style.color} fontSize="12" fontWeight="600">{style.label}</text>
          <text x="12" y="63" fill="var(--p-ink)" fontSize="12" fontWeight="600">{titleLine(lines[0])}</text>
          {lines[1] && <text x="12" y="79" fill="var(--p-ink)" fontSize="12" fontWeight="600">{titleLine(lines[1] + (lines.length > 2 ? '…' : ''))}</text>}
          <text x="12" y="95" fill="var(--p-ink-soft)" fontSize="10">{n.type.length > 26 ? n.type.slice(0, 24) + '…' : n.type}</text>
        </g>
      })}
    </svg>
    <div className="border-t px-4 py-4" style={{ borderColor: 'var(--p-border)' }}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--p-ink-soft)' }}>Node categories in this workflow</h3>
      <ul className="flex flex-wrap gap-2" aria-label="Node category legend">{categories.map(category => {
        const style = NODE_CATEGORIES[category]
        return <li key={category} title={style.description} className="flex items-center gap-2 rounded px-3 py-2 text-xs" style={{ color: style.color, background: style.background }}><NodeCategoryIcon category={category} size={18} /><span>{style.label}</span></li>
      })}</ul>
      <p className="mt-3 text-xs" style={{ color: 'var(--p-ink-soft)' }}>Icons describe general node roles, inferred from node types. Inspect the parameters for the configured action.</p>
    </div>
    <p className="border-t px-4 py-3 text-xs leading-relaxed" style={{ borderColor: 'var(--p-border)', color: 'var(--p-ink-soft)' }}>Drag to pan; use + and − to zoom. Reconstructed from the exported node positions; nothing runs here. Dashed lines represent non-main connections. Full node names and notes appear below.</p>
  </div>
}
