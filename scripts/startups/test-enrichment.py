#!/usr/bin/env python3
import copy,importlib.util,json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('enrich',Path(__file__).with_name('build-enrichment.py'));b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
class EnrichmentTests(unittest.TestCase):
 def test_geocoder_rejects_corrected_or_ambiguous_results(self):
  row={'address':'123 Main St, Boston, MA 02110'}
  match={'addressComponents':{'state':'MA','zip':'02110','streetName':'MAIN'},'matchedAddress':'123 MAIN ST, BOSTON, MA, 02110'}
  receipt={'response':{'result':{'addressMatches':[match]}}}
  self.assertEqual(b.verified_match(row,receipt),match)
  for field,value in [('zip','02111'),('state','CA'),('streetName','ELM')]:
   altered=copy.deepcopy(receipt);altered['response']['result']['addressMatches'][0]['addressComponents'][field]=value
   self.assertIsNone(b.verified_match(row,altered))
  altered=copy.deepcopy(receipt);altered['response']['result']['addressMatches'][0]['matchedAddress']='125 MAIN ST, BOSTON, MA, 02110'
  self.assertIsNone(b.verified_match(row,altered))
  receipt['response']['result']['addressMatches'].append(match);self.assertIsNone(b.verified_match(row,receipt))
 def test_reviews_gate_public_points(self):
  review=json.loads((ROOT/'data/startups/location-sources/enrichment-review.json').read_text())['records'];rows={r['evidence_id']:r for r in review}
  refs=json.loads((ROOT/'data/startups/location-sources/enrichment-coordinates.json').read_text())
  public=json.loads((ROOT/'public/data/startups/enrichment.json').read_text())
  self.assertEqual(len(rows),len(review));self.assertEqual(sum(r['review']=='rejected' for r in review),33)
  for c in public['companies'].values():
   for e in c['evidence']:
    self.assertEqual(e['review'],'accepted');self.assertNotIn('context',e)
   for site in c['sites']:
    for eid in site['evidence_ids']:
     r=rows[eid];self.assertEqual(r['review'],'accepted');self.assertFalse(r.get('stale'));self.assertIn(r['source_url'],site['address_sources'])
     if site['precision']=='address-geocoded':
      self.assertEqual(r['requested_precision'],'street');self.assertEqual(refs['geocodes'][eid]['status'],'verified')
     else:
      self.assertEqual(site['precision'],'zip-area');self.assertFalse(r.get('conflict_note'));self.assertIn('not an office',site['notes']);self.assertEqual(site['latitude'],refs['zcta'][site['postal_code']]['latitude'])
   for link in c['careers']:
    self.assertTrue(link['source_url'].startswith(('http://','https://')));self.assertIn('not verified',link['evidence'])
 def test_known_false_positive_addresses_stay_rejected(self):
  rows=json.loads((ROOT/'data/startups/location-sources/enrichment-review.json').read_text())['records']
  rejected=[r for r in rows if r['review']=='rejected']
  self.assertTrue(any('government' in r['review_note'].lower() or 'regulator' in r['review_note'].lower() for r in rejected))
  self.assertTrue(any('sample' in r['review_note'].lower() for r in rejected))
if __name__=='__main__':unittest.main()
