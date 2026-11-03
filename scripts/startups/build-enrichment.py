#!/usr/bin/env python3
"""Reduce reviewed public facts and cached Census results to reproducible evidence.
Run --refresh to refresh the small committed source extract from local receipts.
Raw pages and full geocoder responses remain outside the public repository.
"""
import argparse,collections,csv,hashlib,io,json,re,zipfile,importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SOURCES=ROOT/'data/startups/location-sources'
CACHE=ROOT.parent/'data/location-enrichment'
_spec=importlib.util.spec_from_file_location('privacy',Path(__file__).with_name('protect-address-evidence.py'));privacy=importlib.util.module_from_spec(_spec);_spec.loader.exec_module(privacy)
GAZ_URL='https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2025_Gazetteer/2025_Gaz_zcta_national.zip'
def postal(address):
    m=re.search(r'\b([A-Z]{2})[,\s]+(\d{5})(?:-\d{4})?\b',address)
    return m.groups() if m else None

def verified_match(row,receipt):
    matches=receipt.get('response',{}).get('result',{}).get('addressMatches',[])
    if len(matches)!=1:return None
    m=matches[0];p=postal(row['address']);parts=m['addressComponents']
    number=re.match(r'\s*(\d+[A-Za-z]?)\b',row['address'])
    matched_number=re.match(r'(\d+[A-Za-z]?)\b',m['matchedAddress'])
    street=parts['streetName'].upper()
    words=re.sub(r'[^A-Z0-9 ]',' ',row['address'].upper()).split()
    # Do not accept corrected house numbers, postal codes, states or different street names.
    if not p or p!=(parts['state'],parts['zip']) or not number or not matched_number or number[1].upper()!=matched_number[1].upper():return None
    if not all(w in words for w in street.split()):return None
    return m

def refresh():
    review=json.loads((SOURCES/'enrichment-review.json').read_text())
    # Keep full audit excerpts local; the repository retains facts and review decisions only.
    if any('context' in r for r in review['records']):
        (CACHE/'review-with-context.json').write_text(json.dumps(review,indent=2)+'\n')
    for r in review['records']:
        r.pop('context',None);r.pop('prefix',None)
    (SOURCES/'enrichment-review.json').write_text(json.dumps(review,indent=2)+'\n')
    z=zipfile.ZipFile(CACHE/'2025_Gaz_zcta_national.zip')
    gaz={r['GEOID']:r for r in csv.DictReader(io.TextIOWrapper(z.open(z.namelist()[0])),delimiter='|')}
    used={};geo={};careers={}
    for row in review['records']:
        if row['review']!='accepted':continue
        p=postal(row['address'])
        if row.get('privacy') and row['privacy'].get('postal_code'):p=(row['privacy'].get('state') or '',row['privacy']['postal_code'])
        if p and p[1] in gaz:
            r={k.strip():v.strip() for k,v in gaz[p[1]].items()}
            used[p[1]]={'latitude':float(r['INTPTLAT']),'longitude':float(r['INTPTLONG'])}
        path=CACHE/'geocodes'/(hashlib.sha256(row['address'].encode()).hexdigest()+'.json')
        if path.exists() and not row.get('privacy'):
            receipt=json.loads(path.read_text());m=verified_match(row,receipt)
            geo[row['evidence_id']]={'status':'verified' if m else 'unmatched-or-inconsistent','source_url':receipt['url'],'observed_at':receipt['observed_at'],'response_sha256':receipt.get('sha256')}
            if m:geo[row['evidence_id']].update(latitude=m['coordinates']['y'],longitude=m['coordinates']['x'],matched_address=m['matchedAddress'])
    for path in sorted(list(CACHE.glob('yc-*.json'))+list(CACHE.glob('boston-*.json'))):
        receipt=json.loads(path.read_text());links={}
        for c in receipt.get('careers',[]):
            if c['url'].startswith(('https://','http://')):links.setdefault(c['url'],{**c,'observed_at':receipt['observed_at'][:10]})
        if links:careers[receipt['company_id']]=list(links.values())
    out={'as_of':'2026-11-02','zcta_source':GAZ_URL,'zcta_sha256':hashlib.sha256((CACHE/'2025_Gaz_zcta_national.zip').read_bytes()).hexdigest(),'zcta':used,'geocodes':geo,'careers':careers}
    (SOURCES/'enrichment-coordinates.json').write_text(json.dumps(out,indent=2)+'\n')

def build():
    review=json.loads((SOURCES/'enrichment-review.json').read_text())
    refs=json.loads((SOURCES/'enrichment-coordinates.json').read_text())
    review,refs=privacy.protect(review,refs)
    companies={};reasons=collections.Counter()
    for r in review['records']:
        if r['review']!='accepted':continue
        item=companies.setdefault(r['company_id'],{'sites':[],'evidence':[],'careers':[]})
        item['evidence'].append(r)
        if r.get('stale'):reasons['historical_only']+=1;continue
        p=postal(r['address']);g=refs['geocodes'].get(r['evidence_id'],{})
        if r.get('privacy') and r['privacy'].get('postal_code'):p=(r['privacy'].get('state') or '',r['privacy']['postal_code'])
        site={'address':r['address'],'checked_on':r['observed_at'],'location_role':r['location_role'],'address_sources':[r['source_url']],'evidence_ids':[r['evidence_id']],'source_type':'company-website','status':'reviewed','notes':r['review_note'],'state':p[0] if p else ''}
        if r.get('privacy'):site['privacy']=r['privacy']
        if not r.get('privacy') and r['requested_precision']=='street' and g.get('status')=='verified':
            site.update(latitude=g['latitude'],longitude=g['longitude'],precision='address-geocoded',coordinate_source=g['source_url'],matched_address=g['matched_address'])
            site['notes']+=' Census street-range interpolation, not a rooftop or proof of occupancy.'
        elif p and p[1] in refs['zcta'] and not r.get('conflict_note'):
            site.update(**refs['zcta'][p[1]],precision='zip-area',coordinate_source=GAZ_URL,postal_code=p[1])
            site['notes']+=' Approximate Census ZCTA reference point, not an office location or exact USPS delivery boundary.'
            if r['requested_precision']=='street' and not r.get('privacy'):site['notes']+=' Street match was absent or failed consistency checks; only ZIP-area precision is supported.'
        else:reasons['no_usable_match_or_conflict']+=1;continue
        if r.get('conflict_note'):site['notes']+=' '+r['conflict_note']
        item['sites'].append(site)
    for cid,links in refs['careers'].items():companies.setdefault(cid,{'sites':[],'evidence':[],'careers':[]})['careers']=links
    out={'meta':{'as_of':refs['as_of'],'reviewed_candidates':len(review['records']),'accepted_candidates':sum(r['review']=='accepted' for r in review['records']),'privacy_protected_candidates':sum(bool(r.get('privacy')) for r in review['records']),'rejected_candidates':sum(r['review']=='rejected' for r in review['records']),'hold_reasons':dict(reasons),'careers_companies':len(refs['careers']),'sources':{'zcta':GAZ_URL,'geocoder':'https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html'}},'companies':companies}
    (ROOT/'public/data/startups/enrichment.json').write_text(json.dumps(out,separators=(',',':'))+'\n')
    print(json.dumps(out['meta'],indent=2))
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--refresh',action='store_true');args=parser.parse_args()
    if args.refresh:refresh()
    build()
