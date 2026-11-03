import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { geoArea, geoContains, geoMercator, geoDistance } from 'd3'

const data = JSON.parse(readFileSync(new URL('../../public/data/startups/companies.json', import.meta.url)))
const land = JSON.parse(readFileSync(new URL('../../data/startups/bay-land.json', import.meta.url)))
assert.equal(data.companies.length, 12)
assert.equal(new Set(data.companies.map(c => c.domain)).size, data.companies.length, 'Domain duplicates')
const cutoff = new Date(data.meta.as_of); cutoff.setUTCMonth(cutoff.getUTCMonth() - 18)
for (const c of data.companies) {
  assert.equal(c.location_precision, 'city', `${c.name}: unexpected precision`)
  assert.equal(c.latitude, null, `${c.name}: city records must not contain company coordinates`)
  assert.equal(c.longitude, null)
  assert.equal(c.review_status, 'source-reviewed')
  assert.ok(['pending', 'city-category-corroborated'].includes(c.independent_verification_status))
  if (c.independent_verification_status === 'pending') assert.equal(c.independent_verified_at, null)
  else {
    assert.equal(new URL(c.independent_source).protocol, 'https:')
    assert.ok(c.independent_evidence && c.independent_source_publisher)
    assert.ok(c.independent_source_date <= c.independent_verified_at && c.independent_verified_at <= data.meta.as_of)
  }
  assert.ok(c.verification_note)
  assert.ok(['agent', 'infrastructure'].includes(c.classification))
  assert.ok(['San Francisco', 'Palo Alto', 'Mountain View'].includes(c.city))
  for (const key of ['website', 'classification_source', 'location_source', 'activity_source']) assert.equal(new URL(c[key]).protocol, 'https:')
  for (const key of ['classification_evidence', 'location_note', 'activity_evidence', 'reviewed_at', 'website_checked_at', 'activity_observed_at']) assert.ok(c[key], `${c.name}: missing ${key}`)
  for (const key of ['reviewed_at', 'website_checked_at', 'activity_observed_at']) assert.ok(c[key] <= data.meta.as_of)
  if (c.activity_date) {
    assert.ok(new Date(c.activity_date) >= cutoff, `${c.name}: stale activity`)
    assert.ok(c.activity_date <= data.meta.as_of, `${c.name}: future activity`)
  }
  assert.ok(c.classification_evidence.split(/\s+/).length <= 25, `${c.name}: keep excerpts short`)
}
assert.equal(data.companies.filter(c => c.independent_verification_status === 'city-category-corroborated').length, 2)
assert.equal(data.companies.filter(c => c.independent_verification_status === 'pending').length, 10)
assert.equal(data.companies.filter(c => c.classification === 'agent').length, 8)
assert.equal(data.companies.filter(c => c.classification === 'infrastructure').length, 4)
assert.equal(data.companies.filter(c => c.city === 'San Francisco').length, 10)
// Catch the reversed-ring error that causes D3 to fill the entire globe.
assert.ok(geoArea(land) < .001, 'Land rings must describe this small region')
assert.ok(geoContains(land, [-122.4194, 37.7749]), 'San Francisco must be on land')
assert.ok(!geoContains(land, [-122.25, 37.7]), 'The central Bay must remain water')
const p = geoMercator().center([-122.22, 37.66]).scale(37000).translate([440, 340])
for (const k of [1, 2, 5]) {
  const a = p.invert([45/k, 635/k]), b = p.invert([145/k, 635/k])
  const km = geoDistance(a,b)*6371.0088
  const px = 100*2/km
  const check = geoDistance(a,p.invert([(45+px)/k,635/k]))*6371.0088
  assert.ok(Math.abs(check-2)<.002, 'Scale bar must remain accurate after zoom')
}
console.log('PASS: 12 sourced records; 8 agents + 4 infrastructure; city-only coordinates; evidence dates; coastline orientation; zoom scale accuracy.')
