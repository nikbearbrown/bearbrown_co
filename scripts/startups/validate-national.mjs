import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { geoArea, geoContains, geoAlbersUsa, geoPath } from 'd3'
const read = p => JSON.parse(readFileSync(new URL(p,import.meta.url)))
const d = read('../../public/data/startups/national.json')
const g = read('../../data/startups/us-states.json')
const states = new Set(g.features.map(f=>f.properties.postal))
assert.equal(states.size,51)
assert.ok(geoArea(g) > .2 && geoArea(g) < .3, 'US basemap area / ring orientation')
assert.ok(geoContains(g,[-100,40]),'Great Plains must be land')
assert.ok(!geoContains(g,[-45,40]),'Atlantic must not be land')
for(const f of g.features) assert.ok(geoPath(geoAlbersUsa())(f),`${f.properties.postal} must render`)
assert.equal(new Set(d.companies.map(c=>c.id)).size,d.companies.length)
for(const c of d.companies){
  assert.equal(c.ai_status,'unreviewed')
  assert.deepEqual(c.ai_evidence,[])
  assert.ok(!('latitude' in c) && !('longitude' in c),'No fabricated company pins')
  assert.equal(new Set(c.states).size,c.states.length)
  for(const s of c.states)assert.ok(states.has(s))
  assert.ok(c.status.includes('pending') || c.status.includes('unverified'))
  for(const url of [c.website,c.source_url,...c.boston_evidence.map(e=>e.url)].filter(Boolean))assert.ok(['https:','http:'].includes(new URL(url).protocol))
}
const i=d.meta.inventory
assert.equal(d.companies.length,i.yc_active_us_for_profit+i.boston_records-i.domain_matches)
assert.equal(d.companies.filter(c=>c.sources.includes('YC')).length,i.yc_active_us_for_profit)
assert.equal(d.companies.filter(c=>c.sources.includes('Boston')).length,i.boston_records)
for(const source of ['D','C']){
  const sec=d.meta.sec[source]
  assert.equal(Object.values(sec.states).reduce((a,b)=>a+b,0),sec.counts.recent_us_review_candidates)
  assert.ok(sec.counts.recent_us_review_candidates < sec.counts.unique_primary_issuers)
  for(const s of Object.keys(sec.states))assert.ok(states.has(s))
}
console.log(`PASS: ${d.companies.length} discovery records, source reconciliation, unknown AI labels, source URLs, 51 state polygons, geography, and SEC aggregate totals.`)
