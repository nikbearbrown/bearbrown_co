#!/usr/bin/env python3
import importlib.util,json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('builder',Path(__file__).with_name('build-locations.py'));b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
class EvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.d=json.loads((ROOT/'public/data/startups/locations.json').read_text());cls.c=json.loads((ROOT/'public/data/startups/national.json').read_text())['companies'];cls.a=json.loads((ROOT/'public/data/startups/affiliations.json').read_text())
    def test_no_synthetic_addresses(self):
        source=json.loads((ROOT/'data/startups/location-sources/addresses.json').read_text())['addresses']
        for cid,a in source.items():
            self.assertTrue(any(s['latitude']==a['latitude'] and s['longitude']==a['longitude'] for s in self.d['locations'][cid]['sites']))
        self.assertEqual(len(source),63)
        for loc in self.d['locations'].values():
            for r in loc['sites']:
                self.assertEqual(r['status'],'reviewed');self.assertTrue(r['address_sources']);self.assertTrue(r['coordinate_source']);self.assertTrue(-180<=r['longitude']<=180 and -90<=r['latitude']<=90)
        self.assertGreater(self.d['meta']['addresses'],63)
    def test_density_uses_unique_companies(self):
        cities=self.d['cities'];points=[]
        for cid,r in self.d['locations'].items():
            if r['sites']:
                for site in r['sites']:points.append((cid,[site['latitude'],site['longitude']]))
            else:
                for cityid in r['city_ids']:points.append((cid,[cities[cityid]['latitude'],cities[cityid]['longitude']]))
        scores=[]
        for cid,c in cities.items():
            score=len({id for id,p in points if b.distance([c['latitude'],c['longitude']],p)<=25});scores.append((-score,cid))
        score,cid=min(scores);self.assertEqual(cid,self.d['meta']['opening']['city_id']);self.assertEqual(-score,self.d['meta']['opening']['count'])
        self.assertEqual(len({id for id,p in points}),3348)
    def test_affiliation_union_and_cohorts(self):
        links=self.a['by_company'];yc={id for id,a in links.items() if any(r['program_id']=='yc' for r in a)};mass={id for id,a in links.items() if any(r['program_id']=='massrobotics' for r in a)}
        self.assertEqual(len(yc),3213);self.assertEqual(len(mass),78);self.assertEqual(len(yc & mass),3);self.assertEqual(len(yc | mass),3288)
        self.assertEqual({p['id'] for p in self.a['programs'] if p['filterable']},{'yc','massrobotics'})
        for id,arr in links.items():
            self.assertEqual(len(arr),len({a['program_id'] for a in arr}))
            for a in arr:self.assertTrue(a['source_url'].startswith('https://'));self.assertIsNone(a['start_date']);self.assertIsNone(a['end_date'])
        self.assertTrue(any(a['cohort'] for arr in links.values() for a in arr))
    def test_shared_address_retains_every_entity(self):
        groups={}
        for cid,r in self.d['locations'].items():
            for a in r['sites']:groups.setdefault((a['latitude'],a['longitude']),set()).add(cid)
        self.assertGreaterEqual(max(map(len,groups.values())),10)
        self.assertEqual(len(set.union(*groups.values())),self.d['meta']['addresses']+self.d['meta']['zip_area_companies'])
    def test_precision_totals_reconcile(self):
        m=self.d['meta']
        self.assertEqual(m['addresses']+m['zip_area_companies']+m['city_only_companies']+m['unplaced_companies'],len(self.c))
        self.assertEqual(m['address_sites']+m['zip_area_sites'],m['site_positions'])
        self.assertEqual(sum(m['site_source_counts'].values()),m['site_positions'])
if __name__=='__main__':unittest.main()
