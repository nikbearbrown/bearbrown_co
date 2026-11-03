#!/usr/bin/env python3
"""One reviewable company/address row per mapped site or retained source claim.
Historical/conflicting claims have no map target. No SAM data is used.
"""
import collections,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];PUBLIC=ROOT/'public/data/startups'
def build():
    locations=json.loads((PUBLIC/'locations.json').read_text())
    enrichment=json.loads((PUBLIC/'enrichment.json').read_text())
    companies=enrichment['companies'];rows=[];covered=set()
    def make(cid,address,role,precision,date,notes,sources,evidence,site=None):
        protected=any(e.get('privacy') for e in evidence) or bool((site or {}).get('privacy'))
        historical=any(e.get('stale') for e in evidence)
        conflict=any(e.get('conflict_note') for e in evidence)
        item={'id':hashlib.sha256((cid+'|'+address+'|'+precision).encode()).hexdigest()[:16],'company_id':cid,'address':address,'role':role or 'Reported contact; workplace unverified','precision':precision,'observed_at':date,'notes':notes,'sources':sources,'evidence_ids':[e['evidence_id'] for e in evidence],'historical':historical,'conflict':conflict,'privacy_protected':protected,'occupancy':'unverified','source_dates':sorted({e['source_date'] for e in evidence if e.get('source_date')})}
        if site and not historical and not conflict:
            item['map']={'latitude':site['latitude'],'longitude':site['longitude'],'kind':'zip' if site['precision']=='zip-area' else 'address'}
            item['coordinate_source']=site['coordinate_source']
        rows.append(item)
    for cid,loc in locations['locations'].items():
        detail=companies.get(cid,{});ev=detail.get('evidence',[])
        for site in loc['sites']:
            matches=[e for e in ev if e['evidence_id'] in site.get('evidence_ids',[])]
            covered.update(e['evidence_id'] for e in matches)
            make(cid,site['address'],site.get('location_role'),site['precision'],site['checked_on'],site['notes'],site['address_sources'],matches,site)
        remaining={}
        for e in ev:
            if e['evidence_id'] in covered:continue
            key=re.sub(r'\W+','',e['address'].lower())
            remaining.setdefault(key,[]).append(e)
        for group in remaining.values():
            e=group[0];site=next((s for s in detail.get('sites',[]) if any(x['evidence_id'] in s['evidence_ids'] for x in group)),None)
            precision=site['precision'] if site else 'unmapped'
            notes=' '.join(dict.fromkeys(x.get('review_note','') for x in group))
            make(cid,e['address'],e['location_role'],precision,max(x['observed_at'] for x in group),notes,sorted({x['source_url'] for x in group}),group,site)
    ids=[r['id'] for r in rows];assert len(ids)==len(set(ids))
    meta={'as_of':'2026-11-03','rows':len(rows),'companies_with_address_evidence':len({r['company_id'] for r in rows}),'precision_counts':dict(collections.Counter(r['precision'] for r in rows)),'privacy_protected_rows':sum(r['privacy_protected'] for r in rows),'historical_rows':sum(r['historical'] for r in rows),'conflict_rows':sum(r['conflict'] for r in rows),'source_claims':len({eid for r in rows for eid in r['evidence_ids']}),'baseline_site_claims':63,'sam_matching':'not performed','method':'Mapped sites plus accepted source claims, deduplicated within company and normalized address. Privacy-protected claims may share an area row; counts describe evidence, not confirmed offices. Historical or conflicting claims have no map target.'}
    out={'meta':meta,'rows':rows};(PUBLIC/'address-ledger.json').write_text(json.dumps(out,separators=(',',':'))+'\n');print(json.dumps(meta,indent=2))
if __name__=='__main__':build()
