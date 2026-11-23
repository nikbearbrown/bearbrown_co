#!/usr/bin/env python3
"""Geocode reviewed public street addresses only. Cache official responses; no guesses."""
import concurrent.futures,hashlib,json,time
from pathlib import Path
from urllib.parse import urlencode
import requests
ROOT=Path(__file__).resolve().parents[2];CACHE=ROOT.parent/'data/location-enrichment/geocodes';CACHE.mkdir(exist_ok=True)
rows=json.loads((ROOT/'data/startups/location-sources/enrichment-review.json').read_text())['records']
def run(address):
 key=hashlib.sha256(address.encode()).hexdigest();path=CACHE/(key+'.json')
 if path.exists():return json.loads(path.read_text())
 url='https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?'+urlencode({'address':address,'benchmark':'Public_AR_Current','format':'json'})
 result={'address':address,'url':url,'observed_at':'2026-11-02'}
 try:
  r=requests.get(url,headers={'User-Agent':'BearBrownStartupResearch/1.0 bear@bearbrown.co'},timeout=(8,35));result['status']=r.status_code;result['sha256']=hashlib.sha256(r.content).hexdigest()
  if r.ok:result['response']=r.json()
 except (requests.RequestException,ValueError) as e:result['error']=type(e).__name__
 path.write_text(json.dumps(result,indent=2)+'\n');time.sleep(1);return result
addresses=sorted({r['address'] for r in rows if r['review']=='accepted' and r['requested_precision']=='street' and not r.get('stale')})
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 for i,r in enumerate(pool.map(run,addresses)):
  print(json.dumps({'done':i+1,'total':len(addresses),'address':r['address'],'status':r.get('status'),'matches':len(r.get('response',{}).get('result',{}).get('addressMatches',[]))}),flush=True)
