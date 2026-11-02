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
        actual={cid:r['address'] for cid,r in self.d['locations'].items() if 'address' in r}
        self.assertEqual(actual,source);self.assertEqual(len(actual),63)
        for r in actual.values():
            self.assertEqual(r['status'],'reviewed');self.assertTrue(r['address_sources']);self.assertTrue(r['coordinate_source']);self.assertTrue(-180<=r['longitude']<=180 and -90<=r['latitude']<=90)
    def test_density_uses_unique_companies(self):
        cities=self.d['cities'];points=[]
        for cid,r in self.d['locations'].items():
            if 'address' in r:points.append((cid,[r['address']['latitude'],r['address']['longitude']]))
            else:
                for cityid in r['city_ids']:points.append((cid,[cities[cityid]['latitude'],cities[cityid]['longitude']]))
        scores=[]
        for cid,c in cities.items():
            score=len({id for id,p in points if b.distance([c['latitude'],c['longitude']],p)<=25});scores.append((-score,cid))
        score,cid=min(scores);self.assertEqual(cid,self.d['meta']['opening']['city_id']);self.assertEqual(-score,2117)
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
            if 'address' in r:
                a=r['address'];groups.setdefault((a['latitude'],a['longitude']),[]).append(cid)
        self.assertEqual(max(map(len,groups.values())),10);self.assertEqual(sum(map(len,groups.values())),63)
if __name__=='__main__':unittest.main()
