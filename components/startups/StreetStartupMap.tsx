'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type * as Leaflet from 'leaflet'
import locationData from '@/public/data/startups/locations.json'
import affiliationData from '@/public/data/startups/affiliations.json'

export type MapCompany = {id:string; name:string; location:string; website:string; source_url:string; location_note:string; sources:string[]}
type Address = {latitude:number; longitude:number; address:string; precision:string; checked_on:string; location_role?:string; notes:string; coordinate_source:string; address_sources:string[]}
type City = {id:string; name:string; state:string; latitude:number; longitude:number; source:string}
type Location = {city_ids:string[]; address?:Address}
type Affiliation = {program_id:string; cohort:string|null; source_url:string; observed_at:string; evidence:string}
const locations = locationData.locations as Record<string,Location>
const cities = locationData.cities as Record<string,City>
export const affiliations = affiliationData.by_company as Record<string,Affiliation[]>
export const programs = affiliationData.programs
const opening = locationData.meta.opening
const number = (n:number) => n.toLocaleString('en-US')

export function ProgramEvidence({id}:{id:string}) {
  const list=affiliations[id] || []
  return <div className="street-affiliations"><strong>Known program affiliations</strong>{list.length ? list.map(a=><p key={a.program_id}><a href={a.source_url} target="_blank" rel="noreferrer">{programs.find(p=>p.id===a.program_id)?.name} ↗</a><br />{programs.find(p=>p.id===a.program_id)?.type} · {a.cohort || 'Cohort / dates not supplied'}<br /><small>Observed {a.observed_at}</small></p>) : <p>No supported affiliation in this collection.</p>}</div>
}

type Group = {id:string; kind:'address'|'city'; lat:number; lng:number; label:string; companies:MapCompany[]}
export default function StreetStartupMap({companies}:{companies:MapCompany[]}) {
  const container=useRef<HTMLDivElement>(null)
  const mapRef=useRef<Leaflet.Map|null>(null)
  const leaflet=useRef<typeof Leaflet|null>(null)
  const markers=useRef<Leaflet.LayerGroup|null>(null)
  const [ready,setReady]=useState(false)
  const [failed,setFailed]=useState(false)
  const [tileError,setTileError]=useState(false)
  const [view,setView]=useState(0)
  const [group,setGroup]=useState<string|null>(null)
  const [selected,setSelected]=useState<string|null>(null)
  const [limit,setLimit]=useState(30)
  const [focus,setFocus]=useState('Densest area')
  const groups=useMemo(()=>{
    const result=new Map<string,Group>()
    function add(key:string,kind:Group['kind'],lat:number,lng:number,label:string,c:MapCompany) {
      if(!result.has(key)) result.set(key,{id:key,kind,lat,lng,label,companies:[]})
      result.get(key)!.companies.push(c)
    }
    for(const c of companies) {
      const loc=locations[c.id];if(!loc)continue
      if(loc.address) {const a=loc.address;add(`a:${a.latitude},${a.longitude}`,'address',a.latitude,a.longitude,a.address,c)}
      else for(const id of loc.city_ids) {const city=cities[id];add(`c:${id}`,'city',city.latitude,city.longitude,`${city.name}, ${city.state}`,c)}
    }
    return [...result.values()]
  },[companies])
  useEffect(()=>{
    let cancelled=false;let observer:ResizeObserver|undefined
    import('leaflet').then(L=>{
      if(cancelled || !container.current)return
      leaflet.current=L
      const map=L.map(container.current,{scrollWheelZoom:true}).setView(opening.center as [number,number],opening.zoom)
      mapRef.current=map
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).on('tileerror',()=>setTileError(true)).addTo(map)
      L.control.scale({imperial:true,metric:true}).addTo(map)
      markers.current=L.layerGroup().addTo(map)
      map.on('moveend',()=>{setView(v=>v+1);setLimit(30)})
      map.on('dragstart',()=>{setGroup(null);setFocus('Exploring')})
      observer=new ResizeObserver(()=>map.invalidateSize());observer.observe(container.current)
      setReady(true)
    }).catch(()=>setFailed(true))
    return ()=>{cancelled=true;observer?.disconnect();mapRef.current?.remove();mapRef.current=null}
  },[])
  useEffect(()=>{setGroup(null);setSelected(null);setLimit(30)},[companies])
  useEffect(()=>{
    const L=leaflet.current;const map=mapRef.current;const layer=markers.current
    if(!ready||!L||!map||!layer)return
    layer.clearLayers()
    for(const g of groups) {
      const badge=document.createElement('span');badge.className=`street-marker street-marker-${g.kind}`
      badge.textContent=g.kind==='city'?number(g.companies.length):g.companies.length>1?String(g.companies.length):'•'
      const marker=L.marker([g.lat,g.lng],{icon:L.divIcon({html:badge,className:'street-icon',iconSize:g.kind==='city'?[46,46]:[26,26],iconAnchor:g.kind==='city'?[23,23]:[13,13]}),title:`${g.label}: ${g.companies.length} ${g.kind==='city'?'city-level records':'address records'}`,keyboard:true,zIndexOffset:g.kind==='address'?500:0}).addTo(layer)
      const tooltip=document.createElement('span');tooltip.textContent=`${g.label} · ${g.kind==='city'?'City reference only':'Reviewed address'} · ${g.companies.length} record${g.companies.length===1?'':'s'}`
      marker.bindTooltip(tooltip,{direction:'top'})
      marker.on('click',()=>{setGroup(g.id);setSelected(g.companies.length===1?g.companies[0].id:null);setLimit(30);map.setView([g.lat,g.lng],Math.max(map.getZoom(),g.kind==='address'?16:12))})
      const element=marker.getElement();element?.setAttribute('aria-label',marker.options.title!);element?.setAttribute('data-kind',g.kind)
      element?.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();marker.fire('click')}})
    }
  },[groups,ready])
  const activeGroup=groups.find(g=>g.id===group)
  const visible=useMemo(()=>{
    const bounds=mapRef.current?.getBounds();const ids=new Set<string>()
    for(const g of activeGroup?[activeGroup]:groups)if(activeGroup || bounds?.contains([g.lat,g.lng]))for(const c of g.companies)ids.add(c.id)
    return companies.filter(c=>ids.has(c.id))
  },[companies,groups,activeGroup,view,ready])
  const company=companies.find(c=>c.id===selected)
  const address=company?locations[company.id]?.address:null
  const unplaced=companies.filter(c=>!locations[c.id]?.address&&!locations[c.id]?.city_ids.length).length
  function go(center:number[],zoom:number,name:string){setGroup(null);setSelected(null);setFocus(name);mapRef.current?.setView(center as [number,number],zoom)}
  return <section className="street-atlas" aria-label="Geographic company explorer">
    <div className="street-toolbar"><div><span className="atlas-kicker">JUMP TO A HUB</span><p>Explore places. Follow the evidence.</p></div><div className="street-hubs">{locationData.hubs.map(h=><button key={h.name} aria-pressed={focus===h.name} onClick={()=>go(h.center,h.zoom,h.name)}>{h.name}<small>{number(h.count)}</small></button>)}</div></div>
    <div className="street-map-top"><span><strong>{focus}</strong> / Street map</span><div><button onClick={()=>go(opening.center,opening.zoom,'Densest area')}>Densest area ↗</button><button onClick={()=>go([39,-98],4,'United States')}>U.S. overview</button></div></div>
    <div className="street-layout"><div className="street-canvas-wrap"><div ref={container} className="street-canvas" role="region" aria-label="Street map of company address evidence and city groups" />{!ready&&<p className="street-loading" role={failed?'alert':'status'}>{failed?'The street map could not load. The full directory remains below.':'Loading the street map…'}</p>}<div className="street-legend"><span><i className="street-dot" /> Reviewed address</span><span><i className="street-city-key">#</i> City group · not office pins</span></div></div>
      <aside className="street-sidebar" aria-label="Companies on the map"><div className="street-sidebar-heading" aria-live="polite"><span className="atlas-kicker">{activeGroup?.kind==='address'?'AT THIS ADDRESS':activeGroup?'IN THIS CITY':'IN THE MAP VIEW'}</span><h3>{activeGroup?.label || 'Explore the companies'} <small>{number(visible.length)}</small></h3>{activeGroup&&<button onClick={()=>{setGroup(null);setSelected(null)}}>← All records in map view</button>}<p>{activeGroup?.kind==='address'?'Shared addresses retain one position. Select any company below.':'Click a numbered city circle to browse every company. City positions are approximate areas or affiliations, not individual offices.'}</p></div>
      {company?<article className="street-profile"><button onClick={()=>setSelected(null)}>← Back to companies</button><span className="street-status">AI REVIEW PENDING</span><h3>{company.name}</h3><p>{company.location}</p>{address?<><strong>{address.address}</strong><p>{address.location_role}</p><p>{address.notes}</p><p>{address.precision} · checked {address.checked_on}</p>{address.address_sources.map((s,i)=><a key={s} href={s} target="_blank" rel="noreferrer">Address evidence {i+1} ↗</a>)}<a href={address.coordinate_source} target="_blank" rel="noreferrer">Coordinate source ↗</a></>:<p>{company.location_note} City-level only; no office coordinate is available.</p>}<ProgramEvidence id={company.id}/><a href={company.source_url} target="_blank" rel="noreferrer">Directory source ↗</a><a href={company.website} target="_blank" rel="noreferrer">Company website ↗</a></article>:<div className="street-list">{visible.slice(0,limit).map(c=><button key={c.id} onClick={()=>{setSelected(c.id);const a=locations[c.id]?.address;if(a)mapRef.current?.setView([a.latitude,a.longitude],16)}}><strong>{c.name}</strong><span>{locations[c.id]?.address?'Reviewed address':'City-level location'} · {c.sources.join(' + ')}</span></button>)}{visible.length>limit&&<button className="street-more" onClick={()=>setLimit(n=>n+30)}>Show 30 more ({number(visible.length-limit)} remaining)</button>}{ready&&!visible.length&&<p>No matching records in this map view. Try another hub or clear the filters. Records without coordinates remain in the directory below.</p>}</div>}</aside>
    </div>
    {tileError&&<p role="status" className="national-layer-note">Some street tiles did not load. Company markers and the directory remain available; refresh to retry.</p>}
    <p className="street-method">Opening view: {opening.name}, the highest sampled concentration—{number(opening.count)} unique companies within 25 km of a matched city reference point. Computed across all {locationData.meta.located_companies.toLocaleString('en-US')} located records; directory coverage strongly favors YC. Hub counts use documented regional radii, before filters. {unplaced} matching records lack usable coordinates and remain below. <a href="#location-method">Location method ↗</a></p>
  </section>
}
