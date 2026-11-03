import importlib.util
from pathlib import Path
import tempfile
import json
import unittest

spec=importlib.util.spec_from_file_location('build',Path(__file__).with_name('build-national.py'))
build=importlib.util.module_from_spec(spec);spec.loader.exec_module(build)

class NationalDataTests(unittest.TestCase):
    def test_sec_schema_dates(self):
        for value in ['30-JUN-2020','30-JUN-20','2020-06-30 17:28:21','2020-06-30']:
            self.assertEqual(build.date_d(value),'2020-06-30')
        with self.assertRaises(ValueError):build.date_d('unknown')

    def test_ambiguous_entities_are_reviewed(self):
        for name in ['Acme Fund II','Acme SPV','Acme Holdings']:
            self.assertTrue(build.vehicle(name))
        self.assertTrue(build.vehicle('Acme','Other Real Estate'))
        self.assertFalse(build.vehicle('Capital Robotics'))

    def test_directory_exclusions_and_affiliation_merge(self):
        row={'id':1,'name':'Example','website':'https://www.example.com','status':'Active',
            'nonprofit':False,'regions':['United States of America'],'all_locations':'Austin, TX, USA; Remote',
            'url':'https://www.ycombinator.com/companies/example','industry':'B2B'}
        rows=[row,dict(row,id=2,status='Acquired'),dict(row,id=3,nonprofit=True),dict(row,id=4,regions=['Canada'])]
        boston=[{'id':'example','name':'Example','website':'https://example.com','checked_on':'2026-11-01',
            'locations':[{'city':'Boston','region':'MA','country':'US'}],'evidence':[]}]
        with tempfile.TemporaryDirectory() as folder:
            a=Path(folder)/'yc.json';b=Path(folder)/'boston.json'
            a.write_text(json.dumps(rows));b.write_text(json.dumps(boston))
            result,meta=build.build_directory(a,b)
        self.assertEqual(len(result),1)
        self.assertEqual(result[0]['states'],['TX']) # Boston affiliation cannot overwrite HQ/location.
        self.assertEqual(result[0]['sources'],['YC','Boston'])
        self.assertEqual(meta['domain_matches'],1)
        self.assertEqual(result[0]['ai_status'],'unreviewed')

if __name__=='__main__':unittest.main()
