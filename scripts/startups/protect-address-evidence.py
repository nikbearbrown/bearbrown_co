#!/usr/bin/env python3
"""Minimize public address detail without discarding the local source evidence.
This is a conservative publication rule, never a residential-property classifier.
"""
import hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];SOURCES=ROOT/'data/startups/location-sources';PRIVATE=ROOT.parent/'data/location-enrichment/private-source-backups'
FULL_STATES={'California':'CA','Massachusetts':'MA','New York':'NY','Washington':'WA','Texas':'TX','Illinois':'IL','Florida':'FL'}
def reason(row):
    if row.get('privacy'):return row['privacy']['reason']
    if re.search(r'\b(unit|apt|apartment|residential|home)\b',row['address'],re.I):return 'Unit-style or residential wording; residential use is possible but unverified.'
    if row.get('requested_precision')=='zip-area':return 'Legal or mailing contact; private-address use and workplace occupancy are unverified.'
    return None

def protect(review,refs):
    for row in review['records']:
        why=reason(row) if row['review']=='accepted' else None
        if not why:continue
        if not row.get('privacy'):
            codes=re.findall(r'\b(\d{5})(?:-\d{4})?\b',row['address']);code=codes[-1] if codes else None
            state=re.search(r'\b([A-Z]{2})[,\s]+\d{5}\b',row['address'])
            state=state[1] if state else next((v for k,v in FULL_STATES.items() if k in row['address']),None)
            row['privacy']={'status':'street-withheld','reason':why,'residential_status':'unknown','postal_code':code,'state':state,'policy_date':'2026-11-03'}
            row['address']=f"ZIP area {code} · street withheld" if code else 'Street withheld · area unresolved'
            row['review_note']='Public source retained. Street and unit details withheld pending a business-location/privacy review. This is not a finding that the address is residential.'
            if row.get('conflict_note'):row['conflict_note']='Conflicting address evidence retained for review; no address has been selected as current.'
        geo=refs['geocodes'].get(row['evidence_id'])
        if geo:refs['geocodes'][row['evidence_id']]={k:v for k,v in geo.items() if k in ['observed_at','response_sha256']}|{'status':'withheld-privacy'}
    return review,refs

def main():
    PRIVATE.mkdir(parents=True,exist_ok=True)
    for name in ['enrichment-review.json','enrichment-coordinates.json']:
        raw=(SOURCES/name).read_bytes();key=hashlib.sha256(raw).hexdigest()[:16];target=PRIVATE/(key+'-'+name)
        if not target.exists():target.write_bytes(raw);target.chmod(0o600)
    review,refs=protect(json.loads((SOURCES/'enrichment-review.json').read_text()),json.loads((SOURCES/'enrichment-coordinates.json').read_text()))
    for name,value in [('enrichment-review.json',review),('enrichment-coordinates.json',refs)]:
        (SOURCES/name).write_text(json.dumps(value,indent=2)+'\n')
    print('Protected evidence rows:',sum(bool(r.get('privacy')) for r in review['records']))
if __name__=='__main__':main()
