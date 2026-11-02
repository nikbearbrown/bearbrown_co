'use client'

import { useEffect, useMemo, useState } from 'react'
import { geoAlbersUsa, geoPath, scaleThreshold } from 'd3'
import type { FeatureCollection } from 'geojson'
import geography from '@/data/startups/us-states.json'
import StreetStartupMap, { affiliations, programs, ProgramEvidence, LocationEvidence, locationCoverage } from './StreetStartupMap'

type Company = {
  id: string; name: string; website: string; domain: string; states: string[];
  location: string; location_precision: string; sources: string[]; source_url: string;
  observed_at: string; status: string; industry: string; ai_status: string;
  location_note: string; duplicate_domain: boolean;
  boston_evidence: {url: string; publisher: string; checked_on: string; note: string}[];
}
type Sec = {counts: Record<string, number>; states: Record<string, number>; archives: number; bytes: number; source: string}
type Dataset = { companies: Company[]; meta: {as_of: string; sec: {D: Sec; C: Sec; cross_source_cik_overlap: number}} }
const projection = geoAlbersUsa().translate([500, 310]).scale(1230)
const path = geoPath(projection).digits(2)
const shapes = (geography as unknown as FeatureCollection).features.map(f => ({
  name: String(f.properties!.name), code: String(f.properties!.postal), d: path(f) || '',
  point: projection([Number(f.properties!.longitude), Number(f.properties!.latitude)]),
})).sort((a,b)=>a.name.localeCompare(b.name))
const colors = ['#e9e9e1', '#bed9cc', '#8cbaa6', '#57927b', '#2c6c56', '#164936']
const shade = scaleThreshold<number, string>().domain([1, 10, 50, 250, 1000]).range(colors)
const number = (n: number) => n.toLocaleString('en-US')
const labels: Record<string,string> = {YC:'YC startup directory',Boston:'Boston research leads',all:'Combined directory',D:'Form D · issuer research',C:'Form C · issuer research'}

export default function NationalStartupMap() {
  const [data, setData] = useState<Dataset | null>(null)
  const [error, setError] = useState(false)
  const [layer, setLayer] = useState('all')
  const [programIds, setProgramIds] = useState<string[]>([])
  const [state, setState] = useState('')
  const [query, setQuery] = useState('')
  const [industry, setIndustry] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/data/startups/national.json', {signal:controller.signal}).then(r => {
      if (!r.ok) throw new Error('Dataset unavailable')
      return r.json()
    }).then(setData).catch(e => {if (e.name !== 'AbortError') setError(true)})
    return () => controller.abort()
  }, [])
  const secLayer = layer === 'D' || layer === 'C'
  const sec = data && secLayer ? data.meta.sec[layer as 'D' | 'C'] : null
  const base = useMemo(() => (data?.companies || []).filter(c => layer === 'all' || c.sources.includes(layer)), [data, layer])
  const industries = useMemo(() => [...new Set(base.map(c=>c.industry).filter(Boolean))].sort(), [base])
  const filtered = useMemo(() => base.filter(c => (!industry || c.industry === industry) && (!programIds.length || (affiliations[c.id] || []).some(a=>programIds.includes(a.program_id))) &&
    `${c.name} ${c.location} ${c.industry}`.toLowerCase().includes(query.trim().toLowerCase())), [base,industry,query,programIds])
  const counts = useMemo(() => {
    if (sec) return sec.states
    const result: Record<string,number> = {}
    for (const c of filtered) for (const s of c.states) result[s] = (result[s] || 0) + 1
    return result
  }, [filtered,sec])
  const rows = useMemo(()=>filtered.filter(c=>!state || c.states.includes(state)), [filtered,state])
  const total = sec ? (state ? counts[state] || 0 : sec.counts.recent_us_review_candidates) : rows.length
  const name = shapes.find(s=>s.code===state)?.name || 'United States'
  const unlocated = filtered.filter(c=>!c.states.length).length
  function chooseState(value: string) {setState(value);setPage(0);setSelected(null)}
  function chooseLayer(value: string) {setLayer(value);setQuery('');setIndustry('');setProgramIds([]);setPage(0);setSelected(null)}
  function reset() {chooseState('');setQuery('');setIndustry('');setProgramIds([])}
  function exportCsv() {
    const keys: (keyof Company)[] = ['id','name','domain','states','location','location_precision','sources','source_url','observed_at','status','industry','ai_status']
    const quote = (v: unknown) => {let s = Array.isArray(v) ? v.join('; ') : String(v ?? '');if (/^[=+@\-\t\r]/.test(s)) s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
    const csv = [keys.join(','), ...rows.map(r=>keys.map(k=>quote(r[k])).join(','))].join('\r\n')
    const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}))
    const a=document.createElement('a');a.href=url;a.download='us-startup-discovery-2026-11-01.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
  }
  if (error) return <section className="atlas-explorer national-loading" role="alert">The directory could not load. <button onClick={()=>window.location.reload()}>Reload the map</button></section>
  if (!data) return <section className="atlas-explorer national-loading" role="status">Loading the source-backed directory…</section>
  return <section className="atlas-explorer" aria-label="U.S. startup discovery map">
    <div className="atlas-stat-row" aria-live="polite">
      <div><strong>{number(total)}</strong><span>{secLayer ? 'issuer review candidates' : 'directory records after filters'}</span></div>
      <div><strong>{Object.keys(counts).length}</strong><span>states + DC with records</span></div>
      <div><strong>Pending</strong><span>AI & job-evidence review</span></div>
      <div><strong>{secLayer?'State':locationCoverage.addresses}</strong><span>{secLayer?'issuer-address precision':'companies with address evidence · full collection'}</span></div>
    </div>
    <div className="national-controls">
      <label>Collection<select value={layer} onChange={e=>chooseLayer(e.target.value)}>{Object.entries(labels).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label>
      <label>Directory-reported state<select value={state} onChange={e=>chooseState(e.target.value)}><option value="">All states + DC</option>{shapes.map(s=><option key={s.code} value={s.code}>{s.name} ({number(counts[s.code] || 0)})</option>)}</select></label>
      <button className="atlas-text-button" onClick={reset}>Reset filters ↺</button>
    </div>
    <p className="national-layer-note">{secLayer ? 'Research queue only — these issuers are not confirmed startups. Counts exclude pooled funds and flagged vehicles; latest filing must be in 2024–September 2026. No funding totals or AI claims are inferred.' : layer==='YC' ? 'Companies marked active in the YC discovery snapshot. Directory status, U.S. presence and startup status need independent confirmation; no job listings have been classified.' : 'Research records, including accelerator affiliations. A source review is not confirmation of an active startup or a current office.'}</p>
    {!secLayer && <div className="national-controls national-search">
      <label>Search companies<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setPage(0)}} placeholder="Name, industry, or reported location…" /></label>
      <label>Industry<select value={industry} onChange={e=>{setIndustry(e.target.value);setPage(0)}}><option value="">All industries</option>{industries.map(i=><option key={i}>{i}</option>)}</select></label>
      <button className="atlas-download" disabled={!rows.length} onClick={exportCsv}>↓ Export view · CSV</button>
    </div>}
    {!secLayer && <fieldset className="street-program-filter"><legend>Accelerator / incubator affiliation <span>Match any selected program</span></legend>{programs.filter(p=>p.filterable).map(p=><label key={p.id}><input type="checkbox" checked={programIds.includes(p.id)} onChange={e=>{setProgramIds(ids=>e.target.checked?[...ids,p.id]:ids.filter(id=>id!==p.id));setPage(0)}} />{p.name} <small>{p.type} · {number(p.count)}</small></label>)}<p>Options come only from the existing evidence. StartX and Alchemist data are not yet available. A company in several programs is counted once.</p></fieldset>}
    {!secLayer ? <StreetStartupMap companies={rows} /> : <div className="national-map-frame">
      <div className="national-map-heading"><strong>{name}</strong><span>{labels[layer]} · select a state to explore</span></div>
      <svg className="national-map" viewBox="0 0 1000 620" role="group" aria-label="United States map. Use the state selector for an equivalent accessible list.">
        <title>U.S. state counts for {labels[layer]}</title>
        {shapes.map(s=><path key={s.code} d={s.d} fill={shade(counts[s.code] || 0)} stroke={state===s.code ? '#bd552e' : '#ffffff'} strokeWidth={state===s.code ? 3 : 1.2}
          role="button" tabIndex={0} aria-pressed={state===s.code} aria-label={`${s.name}: ${number(counts[s.code] || 0)} ${secLayer?'issuer candidates':'directory records'}`}
          onClick={()=>chooseState(state===s.code?'':s.code)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseState(state===s.code?'':s.code)}}}>
          <title>{s.name}: {number(counts[s.code] || 0)}</title></path>)}
        {shapes.filter(s=>s.point && !['DC','RI','DE','MD','NJ','MA','CT','NH','VT'].includes(s.code)).map(s=><text key={s.code} x={Number(s.point![0].toFixed(2))} y={Number(s.point![1].toFixed(2))} textAnchor="middle" className="national-state-label" fill={(counts[s.code] || 0)>=250?'white':'#243b31'} aria-hidden="true">{s.code}</text>)}
        <text x="85" y="590" className="national-inset-label">Alaska & Hawaii shown as insets · not to a common scale</text>
      </svg>
      <div className="national-legend" aria-label="Count color legend">{['0','1–9','10–49','50–249','250–999','1,000+'].map((l,i)=><span key={l}><i style={{background:colors[i]}} />{l}</span>)}<span>{secLayer?'unique issuers per state':'directory records per state'}</span></div>
    </div>}
    <div className="national-results-heading"><h2>{secLayer?'Issuer research coverage':'Company directory'} <span>/ {name}</span></h2><span>{number(total)} {secLayer?'candidates':'records'}</span></div>
    {sec ? <div className="national-sec-panel"><div><strong>{number(sec.counts.unique_primary_issuers)}</strong><p>unique primary issuers in the full Form {layer} history</p></div><div><strong>{sec.archives}</strong><p>quarterly archives downloaded and checked</p></div><div><strong>{number(sec.counts.recent_us_review_candidates)}</strong><p>recent U.S. issuers after conservative exclusions</p></div><p>Issuer-level filings and review exclusions are preserved in the local research dataset. This map publishes aggregate discovery counts only. Form D and Form C overlap by CIK; their totals must not be added. No SEC issuer has been promoted into the startup directory by this import.</p><a href={sec.source} target="_blank" rel="noreferrer">Inspect the official SEC source ↗</a></div> : <>
      <p className="national-small">{unlocated>0 && `${number(unlocated)} matching records have no usable state and remain in the all-states list. `}Companies reporting multiple states appear in each; state counts do not sum to the unique directory total. Location evidence is shown in each record.</p>
      {!rows.length && <div className="national-empty">No records match these filters. <button onClick={reset}>Clear search and state</button></div>}
      <div className="national-company-grid">{rows.slice(page*18,(page+1)*18).map(c=><article className="national-company" key={c.id}>
        <div className="national-card-top"><span>{c.sources.join(' + ')}</span><span>AI review pending</span></div><h3>{c.name}</h3><p>{c.industry || 'Industry not supplied'}</p><p className="national-location">Directory reports: {c.location || 'Location unresolved'}</p><p className="national-small">{c.status}</p>
        <button className="national-evidence-button" aria-expanded={selected===c.id} onClick={()=>setSelected(selected===c.id?null:c.id)}>{selected===c.id?'Close evidence −':'Source & location evidence +'}</button>
        {selected===c.id && <div className="national-evidence"><LocationEvidence id={c.id}/><ProgramEvidence id={c.id}/><p>{c.location_note}</p><p>Observed {c.observed_at} · directory-reported {c.location_precision} precision; street-map evidence is shown separately</p>{c.duplicate_domain && <p>Shared domain: entity resolution still needed.</p>}{c.source_url && <a href={c.source_url} target="_blank" rel="noreferrer">Directory / discovery source ↗</a>}{c.website && <a href={c.website} target="_blank" rel="noreferrer">Company website ↗</a>}{c.boston_evidence.map((e,i)=><p key={i}><a href={e.url} target="_blank" rel="noreferrer">{e.publisher} ↗</a> · {e.checked_on}<br />{e.note}</p>)}</div>}
      </article>)}</div>
      {rows.length>18 && <nav className="national-pagination" aria-label="Directory pages"><button disabled={page===0} onClick={()=>{setPage(p=>p-1);setSelected(null)}}>← Previous</button><span aria-live="polite">Page {page+1} of {Math.ceil(rows.length/18)}</span><button disabled={(page+1)*18>=rows.length} onClick={()=>{setPage(p=>p+1);setSelected(null)}}>Next →</button></nav>}
    </>}
  </section>
}
