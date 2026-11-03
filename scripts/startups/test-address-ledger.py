#!/usr/bin/env python3
import copy,importlib.util,json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('privacy',Path(__file__).with_name('protect-address-evidence.py'));privacy=importlib.util.module_from_spec(spec);spec.loader.exec_module(privacy)
class LedgerTests(unittest.TestCase):
 def setUp(self):
  self.ledger=json.loads((ROOT/'public/data/startups/address-ledger.json').read_text())
  self.review=json.loads((ROOT/'data/startups/location-sources/enrichment-review.json').read_text())['records']
 def test_every_accepted_claim_remains_discoverable(self):
  ids={r['evidence_id'] for r in self.review if r['review']=='accepted'}
  actual={eid for r in self.ledger['rows'] for eid in r['evidence_ids']}
  self.assertEqual(ids,actual);self.assertEqual(len(ids),313)
  self.assertEqual(len(self.ledger['rows']),len({r['id'] for r in self.ledger['rows']}))
  self.assertEqual(self.ledger['meta']['sam_matching'],'not performed')
 def test_private_coordinates_are_not_published(self):
  coords=json.loads((ROOT/'data/startups/location-sources/enrichment-coordinates.json').read_text())['geocodes']
  for r in self.review:
   if r.get('privacy'):
    self.assertIn('withheld',r['address'])
    if r['evidence_id'] in coords:
     geo=coords[r['evidence_id']];self.assertNotIn('latitude',geo);self.assertNotIn('longitude',geo);self.assertNotIn('source_url',geo);self.assertNotIn('matched_address',geo)
  for r in self.ledger['rows']:
   if r['historical'] or r['conflict']:self.assertNotIn('map',r)
   if r['privacy_protected']:
    self.assertIn('withheld',r['address'])
    if r.get('map'):self.assertEqual(r['map']['kind'],'zip');self.assertNotIn('address=',r['coordinate_source'])
 def test_unit_indicator_coarsens_without_asserting_residential_use(self):
  row={'review':'accepted','address':'123 Example Street Unit 4, Boston, MA 02111','requested_precision':'street','evidence_id':'test','source_url':'https://example.com/contact','observed_at':'2026-11-03'}
  refs={'geocodes':{'test':{'latitude':42.1,'longitude':-71.1,'source_url':'https://example.com/?address=123','matched_address':row['address']}}}
  out,refs=privacy.protect({'records':[row]},refs);r=out['records'][0]
  self.assertEqual(r['privacy']['residential_status'],'unknown');self.assertEqual(r['privacy']['postal_code'],'02111');self.assertNotIn('123 Example',json.dumps(out));self.assertEqual(refs['geocodes']['test'],{'status':'withheld-privacy'})
  self.assertEqual(privacy.protect(copy.deepcopy(out),copy.deepcopy(refs)),(out,refs))
 def test_company_sources_and_dates_are_present(self):
  companies={c['id'] for c in json.loads((ROOT/'public/data/startups/national.json').read_text())['companies']}
  for row in self.ledger['rows']:
   self.assertIn(row['company_id'],companies);self.assertTrue(row['sources']);self.assertTrue(row['observed_at']);self.assertEqual(row['occupancy'],'unverified')
if __name__=='__main__':unittest.main()
