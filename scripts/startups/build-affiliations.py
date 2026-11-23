#!/usr/bin/env python3
"""Extract only explicit program evidence from existing snapshots; no new ingestion."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--yc',type=Path);a=p.parse_args()
cache=ROOT/'data/startups/location-sources/yc-cohorts.json'
companies=json.loads((ROOT/'public/data/startups/national.json').read_text())['companies']
if a.yc:
    ids={c['id'] for c in companies}
    cache.write_text(json.dumps({'source':'https://github.com/yc-oss/api','sha256':hashlib.sha256(a.yc.read_bytes()).hexdigest(),'observed_at':'2026-10-31','cohorts':{'yc-'+str(r['id']):r.get('batch') or None for r in json.loads(a.yc.read_text()) if 'yc-'+str(r['id']) in ids}},indent=2)+'\n')
cohorts=json.loads(cache.read_text())
programs=[{'id':'yc','name':'Y Combinator','type':'accelerator','filterable':True},{'id':'massrobotics','name':'MassRobotics','type':'resident incubator','filterable':True},{'id':'engine-ventures','name':'Engine Ventures','type':'investor portfolio','filterable':False}]
by_company={}
for c in companies:
    affiliations=[]
    if 'YC' in c['sources']:
        affiliations.append({'program_id':'yc','cohort':cohorts['cohorts'].get(c['id']),'start_date':None,'end_date':None,'source_url':c['source_url'],'observed_at':c['observed_at'],'evidence':'YC directory record; cohort label preserved verbatim. Exact participation dates not supplied.'})
    for e in c['boston_evidence']:
        pid='massrobotics' if e['url']=='https://www.massrobotics.org/startups/massrobotics-resident-startups/' else 'engine-ventures' if e['url'].startswith('https://engineventures.com/companies/') else None
        if pid and not any(x['program_id']==pid for x in affiliations):
            affiliations.append({'program_id':pid,'cohort':None,'start_date':None,'end_date':None,'source_url':e['url'],'observed_at':e['checked_on'],'evidence':e['note']})
    by_company[c['id']]=affiliations
for program in programs:program['count']=sum(any(a['program_id']==program['id'] for a in arr) for arr in by_company.values())
(ROOT/'public/data/startups/affiliations.json').write_text(json.dumps({'meta':{'as_of':'2026-11-02','policy':'Only existing explicit directory/residency/portfolio evidence. Absence is unknown, not proof of non-participation. Investor portfolios are not accelerator filters.','yc_sha256':cohorts['sha256']},'programs':programs,'by_company':by_company},separators=(',',':'))+'\n')
print(programs)
