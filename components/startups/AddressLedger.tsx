'use client'

import { useMemo, useState } from 'react'
import ledgerData from '@/public/data/startups/address-ledger.json'

export type AddressRow = {
  id:string; company_id:string; address:string; role:string; precision:string;
  observed_at:string; notes:string; sources:string[]; evidence_ids:string[];
  historical:boolean; conflict:boolean; privacy_protected:boolean; source_dates:string[];
  map?:{latitude:number; longitude:number; kind:'address'|'zip'}; coordinate_source?:string;
}
type Company = {id:string; name:string; website:string; industry?:string; source_url:string}
const rows=ledgerData.rows as AddressRow[]
export const addressCoverage=ledgerData.meta
const precision=(r:AddressRow)=>r.privacy_protected?'Street withheld · area only':r.precision==='address-point'?'Address point · not surveyed':r.precision==='address-geocoded'?'Street geocode · approximate':r.precision==='zip-area'?'ZIP area · approximate':'No usable coordinate'

export default function AddressLedger({companies,onLocate,onCompany}:{companies:Company[];onLocate:(row:AddressRow)=>void;onCompany:(id:string)=>void}) {
  const [query,setQuery]=useState('')
  const [kind,setKind]=useState('all')
  const [limit,setLimit]=useState(30)
  const byId=useMemo(()=>new Map(companies.map(c=>[c.id,c])),[companies])
  const available=useMemo(()=>rows.filter(r=>byId.has(r.company_id)),[byId])
  const filtered=useMemo(()=>available.filter(r=>{
    const c=byId.get(r.company_id)!
    const matches=kind==='all'||kind==='protected'&&r.privacy_protected||kind==='historical'&&r.historical||kind==='conflict'&&r.conflict||kind==='unmapped'&&!r.map||kind==='street'&&['address-point','address-geocoded'].includes(r.precision)&&!r.privacy_protected||kind==='zip'&&r.precision==='zip-area'
    return matches&&`${c.name} ${c.industry||''} ${r.address} ${r.role}`.toLowerCase().includes(query.trim().toLowerCase())
  }),[available,byId,query,kind])
  return <section id="address-evidence" className="address-ledger" aria-label="Individual address evidence">
    <div className="address-ledger-heading"><div><span className="atlas-kicker">ADDRESS BY ADDRESS</span><h2>What we know at each location.</h2></div><strong aria-live="polite">{filtered.length} address {filtered.length===1?'record':'records'} / {new Set(filtered.map(r=>r.company_id)).size} {new Set(filtered.map(r=>r.company_id)).size===1?'company':'companies'}</strong></div>
    <p>Every available accepted address claim is represented here, including evidence without a usable map coordinate. The company filters above apply. Street details are withheld for mailing/private-use indicators; this does not establish that a property is residential. No location establishes current occupancy. SAM matching has not been performed.</p>
    <div className="address-ledger-controls"><label>Search address evidence<input type="search" placeholder="Company, address, ZIP, industry or location role…" value={query} onChange={e=>{setQuery(e.target.value);setLimit(30)}} /></label><label>Evidence type<select value={kind} onChange={e=>{setKind(e.target.value);setLimit(30)}}><option value="all">All address evidence</option><option value="street">Street / address points</option><option value="zip">Approximate ZIP areas</option><option value="protected">Privacy-protected street details</option><option value="historical">Historical evidence</option><option value="conflict">Conflicting evidence</option><option value="unmapped">No map target</option></select></label><button onClick={()=>{setQuery('');setKind('all');setLimit(30)}}>Reset address filters</button></div>
    <p className="address-ledger-summary">Full collection: {addressCoverage.rows} company/address records across {addressCoverage.companies_with_address_evidence} companies · {addressCoverage.privacy_protected_rows} privacy-protected · {addressCoverage.historical_rows} historical · {addressCoverage.conflict_rows} with conflicts. Categories can overlap. Companies with only city evidence remain in the directory below.</p>
    <div className="address-table-scroll"><table><caption>Individual addresses and their source-backed company details</caption><thead><tr><th scope="col">Company</th><th scope="col">Address / area</th><th scope="col">Evidence & status</th><th scope="col">Inspect</th></tr></thead><tbody>{filtered.slice(0,limit).map(r=>{const c=byId.get(r.company_id)!;return <tr key={r.id}><td><strong>{c.name}</strong><p>{c.industry||'Industry not supplied'}</p><a href={c.website} target="_blank" rel="noreferrer">Website ↗</a><small>AI review pending</small></td><td><strong>{r.address}</strong><p>{r.role}</p></td><td><span className={`address-badge ${r.privacy_protected?'address-badge-protected':''}`}>{precision(r)}</span>{r.historical&&<span className="address-badge">Historical · not mapped</span>}{r.conflict&&<span className="address-badge">Conflict unresolved</span>}<p>Observed {r.observed_at}{r.source_dates.length>0?` · source dated ${r.source_dates.join(', ')}`:''}</p><details><summary>Sources & location notes ({r.sources.length})</summary><p>{r.notes}</p>{r.privacy_protected&&<p>Potential private/residential use is an uncertain review indicator, not a classification. Street/unit details and precise coordinates are withheld from this public view and its downloads.</p>}{r.sources.map((url,i)=><a href={url} target="_blank" rel="noreferrer" key={url}>Source {i+1} ↗</a>)}{r.coordinate_source&&<a href={r.coordinate_source} target="_blank" rel="noreferrer">Coordinate method/source ↗</a>}</details></td><td>{r.map?<button onClick={()=>onLocate(r)}>{r.map.kind==='zip'?'Locate approximate area':'Locate address point'}</button>:<p>Not mapped</p>}<button onClick={()=>onCompany(c.id)}>Inspect {c.name}</button></td></tr>})}</tbody></table></div>
    {!filtered.length&&<p role="status">No address evidence matches these filters. City-only companies are still available in the directory.</p>}
    {filtered.length>limit&&<button className="address-load-more" onClick={()=>setLimit(n=>n+30)}>Show 30 more addresses ({filtered.length-limit} remaining)</button>}
    <p><a href="/data/startups/address-ledger.json" download>Download privacy-safe address evidence · JSON ↗</a></p>
  </section>
}
