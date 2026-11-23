'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { arc, geoDistance, geoGraticule, geoMercator, geoPath, pie, scaleSqrt, select, zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3'
import type { FeatureCollection } from 'geojson'
import land from '@/data/startups/bay-land.json'
import { cities, referenceCities, startups, filterStartups, startupCsv, type Startup } from '@/lib/startup-map'

const W = 880, H = 680
const projection = geoMercator().center([-122.22, 37.66]).scale(37000).translate([W / 2, H / 2])
const path = geoPath(projection)
const landPath = path(land as FeatureCollection) || ''
const gridPath = path(geoGraticule().extent([[-123.05, 37.05], [-121.55, 38.35]]).step([.2, .2])()) || ''
const radius = scaleSqrt().domain([0, 12]).range([0, 45])
const categories = [...new Set(startups.map(s => s.category))].sort()
const color = { agent: 'var(--atlas-agent)', infrastructure: 'var(--atlas-infra)' }

const verificationLabel = (c: Startup) => c.independent_verification_status === 'city-category-corroborated' ? 'City & category corroborated' : 'Independent confirmation pending'

function Evidence({ company: c }: { company: Startup }) {
  return <div className="atlas-evidence">
    <div className="atlas-evidence-head"><span>Sources checked · {c.reviewed_at}</span><a href={c.website} target="_blank" rel="noreferrer">Company website ↗</a></div>
    <p className="atlas-verification">{verificationLabel(c)}</p><p className="atlas-small">{c.verification_note}</p>
    <>{c.independent_source && <div><h4>Independent cross-check</h4><p>{c.independent_evidence}</p><p className="atlas-small">Published {c.independent_source_date} · checked {c.independent_verified_at}</p><a href={c.independent_source} target="_blank" rel="noreferrer">{c.independent_source_publisher} ↗</a></div>}</>
    <h4>Why it is included</h4><p>{c.description}</p><blockquote>“{c.classification_evidence}”</blockquote>
    <a href={c.classification_source} target="_blank" rel="noreferrer">Product evidence ↗</a>
    <p className="atlas-small">Classification confidence: {c.classification_confidence} · AI-assisted assessment, not a tested performance claim.</p>
    <h4>Location · city precision</h4><p>{c.location_note}</p><a href={c.location_source} target="_blank" rel="noreferrer">Location source ↗</a>
    <h4>Activity signal</h4><p>{c.activity_evidence}</p><p className="atlas-small">{c.activity_date ? `Published ${c.activity_date}` : 'Posting date not supplied'} · observed {c.activity_observed_at}</p><a href={c.activity_source} target="_blank" rel="noreferrer">Activity source ↗</a>
  </div>
}

export default function StartupMap() {
  const [query, setQuery] = useState('')
  const [layer, setLayer] = useState('all')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [transform, setTransform] = useState(zoomIdentity)
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const mapRows = useMemo(() => filterStartups(startups, query, layer, category), [query, layer, category])
  const rows = useMemo(() => filterStartups(mapRows, '', 'all', '', city), [mapRows, city])
  const agents = rows.filter(c => c.classification === 'agent').length

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const behavior = zoom<SVGSVGElement, unknown>().extent([[0, 0], [W, H]]).scaleExtent([1, 5])
      .translateExtent([[-80, -80], [W + 80, H + 80]])
      // Let the page scroll normally. Explicit zoom buttons, drag, pinch, or
      // Ctrl/Command+wheel operate the map.
      .filter(event => event.type !== 'wheel' || event.ctrlKey || event.metaKey)
      .on('zoom', event => setTransform(event.transform))
    select(svg).call(behavior).on('dblclick.zoom', null)
    zoomRef.current = behavior
    return () => { select(svg).on('.zoom', null) }
  }, [])

  function changeZoom(factor: number) {
    if (svgRef.current && zoomRef.current) select(svgRef.current).call(zoomRef.current.scaleBy, factor)
  }
  function resetView() {
    if (svgRef.current && zoomRef.current) select(svgRef.current).call(zoomRef.current.transform, zoomIdentity)
  }
  function resetFilters() { setQuery(''); setLayer('all'); setCategory(''); setCity(''); setSelected(null) }
  function downloadCsv() {
    const url = URL.createObjectURL(new Blob(['\uFEFF' + startupCsv(rows)], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = url; a.download = 'bay-area-ai-startups-2026-10-31.csv'; a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  function point(coordinates: readonly [number, number]) {
    // Browser engines differ in the last few floating-point digits. Keep SVG
    // attributes stable across server and browser hydration.
    return transform.apply(projection([coordinates[0], coordinates[1]])!).map(n => Number(n.toFixed(3)))
  }
  function scaleLength(t: ZoomTransform) {
    const a = projection.invert!(t.invert([45, H - 45]))!
    const b = projection.invert!(t.invert([145, H - 45]))!
    const kmPer100 = geoDistance(a, b) * 6371.0088
    const km = kmPer100 >= 10 ? 10 : kmPer100 >= 5 ? 5 : 2
    return { km, pixels: Number((100 * km / kmPer100).toFixed(3)) }
  }
  const scale = scaleLength(transform)

  return <section className="atlas-explorer" aria-label="Interactive startup map and directory">
    <div className="atlas-stat-row" aria-live="polite">
      <div><strong>{rows.length.toString().padStart(2, '0')}</strong><span>companies in view</span></div>
      <div><strong>{agents.toString().padStart(2, '0')}</strong><span>agent products</span></div>
      <div><strong>{(rows.length - agents).toString().padStart(2, '0')}</strong><span>builders & infrastructure</span></div>
      <div><strong>{rows.length}/{rows.length}</strong><span>mapped at city precision</span></div>
    </div>
    <div className="atlas-toolbar">
      <label className="atlas-search"><span>Search companies</span><input type="search" value={query} onChange={e => {setQuery(e.target.value); setSelected(null)}} placeholder="Search name, city, or work they do…" /></label>
      <label className="atlas-category"><span>Focus</span><select value={category} onChange={e => {setCategory(e.target.value); setSelected(null)}}><option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
      <button className="atlas-download" onClick={downloadCsv} disabled={!rows.length}>↓ Export view · CSV</button>
    </div>
    <div className="atlas-layer-row"><div role="group" aria-label="Company layer">{[['all', 'All companies'], ['agent', 'Agent products'], ['infrastructure', 'Builders & infrastructure']].map(([value, label]) => <button key={value} aria-pressed={layer === value} onClick={() => {setLayer(value); setSelected(null)}}>{label}</button>)}</div><button className="atlas-text-button" onClick={resetFilters}>Reset filters ↺</button></div>
    <div className="atlas-workspace">
      <div className="atlas-map-column">
        <div className="atlas-map-heading"><span>01 / THE GEOGRAPHY</span><span>3 CITIES IN THIS COLLECTION</span></div>
        <div className="atlas-map-frame">
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="atlas-map" role="group" aria-label="Bay Area map. Select a city circle to filter companies. City controls are also available below." style={{touchAction:'pan-y'}}>
            <title>Bay Area AI startup map — city aggregates, not office locations</title>
            <defs><clipPath id="atlas-map-clip"><rect width={W} height={H} /></clipPath><pattern id="atlas-infrastructure-pattern" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill={color.infrastructure} /><path d="M0,0 V7" stroke="white" strokeOpacity=".4" strokeWidth="2" /></pattern></defs>
            <g clipPath="url(#atlas-map-clip)">
              <rect width={W} height={H} fill="var(--atlas-water)" />
              <g transform={transform.toString()}><path d={landPath} fill="var(--atlas-land)" stroke="var(--atlas-coast)" strokeWidth={1 / transform.k} /><path d={gridPath} fill="none" stroke="var(--atlas-grid)" strokeWidth={.6 / transform.k} /></g>
              {referenceCities.map(c => { const [x,y] = point(c.coordinates); return <g key={c.name} transform={`translate(${x},${y})`} className="atlas-reference-city"><circle r="2" /><text x="7" y="4">{c.name}</text></g> })}
              <text x={point([-122.53,37.53])[0]} y={point([-122.53,37.53])[1]} className="atlas-water-label" transform={`rotate(-35 ${point([-122.53,37.53]).join(' ')})`}>PACIFIC OCEAN</text>
              <text x={point([-122.21,37.66])[0]} y={point([-122.21,37.66])[1]} className="atlas-water-label" textAnchor="middle" transform={`rotate(-40 ${point([-122.21,37.66]).join(' ')})`}>SAN FRANCISCO BAY</text>
              {cities.map(c => {
                const counts = ['agent', 'infrastructure'].map(kind => mapRows.filter(r => r.city === c.name && r.classification === kind).length)
                const count = counts[0] + counts[1]
                if (!count) return null
                const [x,y] = point(c.coordinates), r = radius(count)
                const slices = pie<number>().sort(null)(counts)
                // Arc uses only these geometric fields; pie supplies start/end angles.
                const arcPath = arc().innerRadius(0).outerRadius(r)
                return <g key={c.name} transform={`translate(${x},${y})`} className="atlas-city" role="button" tabIndex={0} aria-label={`${c.name}: ${count} companies. Filter directory.`} aria-pressed={city === c.name} opacity={city && city !== c.name ? .45 : 1} onClick={() => {setCity(city === c.name ? '' : c.name); setSelected(null)}} onKeyDown={e => {if(e.key === 'Enter' || e.key === ' ') {e.preventDefault(); setCity(city === c.name ? '' : c.name); setSelected(null)}}}>
                  <title>{`${c.name}: ${counts[0]} agent products; ${counts[1]} builders and infrastructure. City-level only.`}</title>
                  <circle className="atlas-city-outline" r={Math.max(r + 5, 22)} fill="transparent" stroke={city === c.name ? 'var(--p-ink)' : 'transparent'} strokeWidth="2" />
                  {slices.filter(s => s.value).map(s => <path key={s.index} d={arcPath({...s, innerRadius:0, outerRadius:r}) || ''} fill={s.index === 0 ? color.agent : 'url(#atlas-infrastructure-pattern)'} stroke="var(--atlas-land)" strokeWidth="1.5" />)}
                  <text textAnchor="middle" dy=".35em" className="atlas-city-count">{count}</text>
                  <text x={c.label[0]} y={c.label[1]} textAnchor="end" className="atlas-city-name">{c.name}</text>
                </g>
              })}
            </g>
            <g transform={`translate(45 ${H - 45})`} className="atlas-scale"><path d={`M0,-5 V0 H${scale.pixels} V-5`} fill="none" stroke="currentColor" strokeWidth="2" /><text y="20">{scale.km} km at scale-bar latitude</text></g>
            <g transform={`translate(${W - 38} 45)`} className="atlas-north"><text textAnchor="middle" y="-14">N</text><path d="M0,-5 L-5,15 L0,11 L5,15 Z" fill="currentColor" /></g>
          </svg>
          <div className="atlas-zoom" role="group" aria-label="Map controls"><button onClick={() => changeZoom(1.5)} aria-label="Zoom in">+</button><button onClick={() => changeZoom(1/1.5)} aria-label="Zoom out">−</button><button onClick={resetView} aria-label="Reset map view">↺</button></div>
          <div className="atlas-map-note">CITY COUNTS ONLY<br /><strong>No office pins. No jitter.</strong></div>
        </div>
        <div className="atlas-legend"><span><i style={{background:color.agent}} />Agent products · solid</span><span><i className="atlas-hatched" />Builders & infrastructure · striped</span><span>Circle area ∝ count · sectors show composition</span></div>
        <p className="atlas-map-help">Drag to pan · use + / − to zoom · select a circle or city below. Gray dots are geographic references, not company records.</p>
        <div className="atlas-city-filters" role="group" aria-label="Filter by city"><button aria-pressed={!city} onClick={() => {setCity(''); setSelected(null)}}>All cities</button>{cities.map(c => <button key={c.name} aria-pressed={city === c.name} onClick={() => {setCity(c.name); setSelected(null)}}>{c.name} <span>{mapRows.filter(r => r.city === c.name).length}</span></button>)}</div>
      </div>
      <div className="atlas-directory">
        <div className="atlas-directory-heading"><span>02 / THE COMPANIES</span><strong>{rows.length} {rows.length === 1 ? 'record' : 'records'}{city ? ` · ${city}` : ''}</strong></div>
        <p className="atlas-directory-note">Verification is shown per company; pending entries are candidates. Select a company to inspect its evidence. All locations are city-level.</p>
        <div className="atlas-company-list">
          {!rows.length && <div className="atlas-empty"><h3>No companies match.</h3><p>Try another category or clear the city filter. This collection is intentionally small.</p><button onClick={resetFilters}>Clear all filters</button></div>}
          {rows.map(c => <article key={c.id} className={`atlas-company ${selected === c.id ? 'is-open' : ''}`}>
            <h3><button aria-expanded={selected === c.id} aria-controls={`evidence-${c.id}`} onClick={() => setSelected(selected === c.id ? null : c.id)}><span><span className="atlas-company-name">{c.name}</span><span className="atlas-company-sub">{c.city} <span aria-hidden="true">·</span> {c.category}</span></span><span aria-hidden="true">{selected === c.id ? '−' : '↗'}</span></button></h3>
            <div className="atlas-company-summary"><span className={`atlas-badge ${c.classification}`}>{c.classification === 'agent' ? '● Agent product' : '▧ Builder / infrastructure'}</span><span className="atlas-precision">City only</span></div>
            <p className="atlas-verification">{verificationLabel(c)}</p>
            <div id={`evidence-${c.id}`} hidden={selected !== c.id}><Evidence company={c} /></div>
          </article>)}
        </div>
      </div>
    </div>
    <p className="atlas-footnote">{startups.length} source-reviewed records · {startups.filter(c => c.independent_verification_status === 'city-category-corroborated').length} with city & category corroborated · {startups.filter(c => c.independent_verification_status === 'pending').length} pending candidates · 0 independently geocoded offices. Map totals follow search, category, and layer; selecting a city narrows the directory and statistics.</p>
  </section>
}
