#!/usr/bin/env python3
"""Build conservative discovery data; never infer AI ability or current hiring.

python3 scripts/startups/build-national.py --data-root ../data --yc PATH --boston PATH
SEC archives remain local; website receives only issuer counts by state.
"""
import argparse
import collections
import csv
from datetime import datetime
import hashlib
import io
import json
from pathlib import Path
import re
import sqlite3
from urllib.parse import urlparse
import zipfile

ROOT = Path(__file__).resolve().parents[2]
STATES = {f['properties']['postal'] for f in json.loads((ROOT / 'data/startups/us-states.json').read_text())['features']}

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def domain(url):
    try:
        host = urlparse(url).hostname or ''
        return host.lower().removeprefix('www.')
    except ValueError:
        return ''

def safe_url(url):
    return url if urlparse(url or '').scheme in ('https', 'http') else ''

def table(z, suffix):
    names = [n for n in z.namelist() if n.upper().endswith(suffix)]
    if len(names) != 1:
        raise ValueError(f'Missing/ambiguous table {suffix}')
    return csv.DictReader(io.TextIOWrapper(z.open(names[0]), encoding='utf-8-sig'), delimiter='\t')

def date_d(value):
    value=value.strip()
    for fmt in ['%d-%b-%Y','%d-%b-%y','%Y-%m-%d %H:%M:%S','%Y-%m-%d']:
        try:return datetime.strptime(value,fmt).date().isoformat()
        except ValueError:pass
    raise ValueError(f'Unknown SEC date: {value}')

def vehicle(name, industry='', entity=''):
    return bool(re.search(r'\b(fund|spv|trust|holdings|series)\b', name, re.I) or
                'real estate' in industry.lower() or entity.lower() in ('limited partnership',))

def build_directory(yc_path, boston_path):
    yc = json.loads(yc_path.read_text())
    boston = json.loads(boston_path.read_text())
    records = {}
    domain_index = {}
    for row in yc:
        if row['status'] != 'Active' or row.get('nonprofit') or 'United States of America' not in row.get('regions', []):
            continue
        states = sorted(set(re.findall(r', ([A-Z]{2}), USA(?:;|$)', row['all_locations'])) & STATES)
        rid = 'yc-' + str(row['id'])
        host = domain(row.get('website', ''))
        # Directory IDs are authoritative within this source. Shared domains are
        # flagged rather than silently merging different directory companies.
        records[rid] = dict(id=rid, name=row['name'], website=safe_url(row.get('website', '')),
            domain=host, states=states, location=row['all_locations'],
            location_precision='state' if states else 'country', sources=['YC'],
            source_url=safe_url(row['url']), observed_at='2026-10-31',
            status='Directory-reported active; independent review pending',
            industry=row.get('industry', ''), ai_status='unreviewed', ai_evidence=[],
            location_note='Directory-reported U.S. locations; current office occupancy unverified.',
            boston_evidence=[], duplicate_domain=False)
        if host:
            domain_index.setdefault(host, []).append(rid)
    for row in boston:
        host = row.get('canonical_domain') or domain(row.get('website', ''))
        evidence = [{k: e.get(k) for k in ['url', 'publisher', 'checked_on', 'note']} for e in row.get('evidence', [])]
        match = domain_index.get(host, []) if host else []
        if len(match) == 1:
            records[match[0]]['sources'].append('Boston')
            records[match[0]]['boston_evidence'] = evidence
            # Keep YC location/state fields; do not convert an affiliation into HQ.
            continue
        states = sorted({l.get('region') for l in row.get('locations', []) if l.get('country') == 'US' and l.get('region') in STATES})
        rid = 'boston-' + row['id']
        records[rid] = dict(id=rid, name=row['name'], website=safe_url(row.get('website', '')), domain=host,
            states=states, location='; '.join(l.get('city', '') for l in row.get('locations', [])),
            location_precision='state' if states else 'unknown', sources=['Boston'],
            source_url=next((safe_url(e['url']) for e in evidence if e.get('url')), ''), observed_at=row['checked_on'],
            status='Research lead; active-startup status unverified', industry=', '.join(row.get('industries', [])),
            ai_status='unreviewed', ai_evidence=[], location_note=row.get('notes', ''),
            boston_evidence=evidence, duplicate_domain=len(match)>1)
    for ids in domain_index.values():
        if len(ids)>1:
            for rid in ids: records[rid]['duplicate_domain']=True
    return sorted(records.values(), key=lambda r:r['name'].casefold()), {
        'yc_raw_records':len(yc), 'yc_active_us_for_profit':sum('YC' in r['sources'] for r in records.values()),
        'boston_records':len(boston), 'domain_matches':sum(len(r['sources'])>1 for r in records.values()),
        'yc_sha256':digest(yc_path), 'boston_sha256':digest(boston_path)}

def build_sec(data_root):
    out = data_root / 'processed'
    out.mkdir(exist_ok=True)
    db = sqlite3.connect(out / 'sec-discovery.sqlite')
    # This database is a reproducible derived artifact; source ZIPs are untouched.
    db.executescript('DROP TABLE IF EXISTS filings; DROP TABLE IF EXISTS issuers;'
        'CREATE TABLE filings (accession TEXT PRIMARY KEY, form TEXT, cik TEXT, date TEXT, previous TEXT, file_number TEXT);'
        'CREATE TABLE issuers (source TEXT, cik TEXT, date TEXT, accession TEXT, state TEXT, fund INTEGER, ambiguous INTEGER, data TEXT, PRIMARY KEY(source,cik));')
    totals = collections.Counter()
    quarantine = (out/'invalid-issuer-identifiers.jsonl').open('w')
    manifests = {}
    for source, folder in [('D','sec-form-d'), ('C','sec-form-c')]:
        manifest = json.loads((data_root/folder/'manifest.json').read_text())
        expected = json.loads((data_root/folder/'urls.json').read_text())
        assert len(manifest['archives']) == len(expected), f'{folder}: incomplete download'
        assert all(r['status']=='verified' for r in manifest['archives'])
        manifests[source] = {'archives':len(expected), 'bytes':sum(r['bytes'] for r in manifest['archives']), 'source':manifest['source']}
        for receipt in manifest['archives']:
            archive = data_root/folder/receipt['file']
            assert digest(archive)==receipt['sha256'], f'Archive changed: {archive}'
            with zipfile.ZipFile(archive) as z:
                if source=='D':
                    offerings={r['ACCESSIONNUMBER']:r for r in table(z,'OFFERING.TSV')}
                    submissions={r['ACCESSIONNUMBER']:r for r in table(z,'FORMDSUBMISSION.TSV')}
                    rows=table(z,'ISSUERS.TSV')
                else:
                    submissions={r['ACCESSION_NUMBER']:r for r in table(z,'FORM_C_SUBMISSION.TSV')}
                    rows=table(z,'FORM_C_ISSUER_INFORMATION.TSV')
                for row in rows:
                    totals[source+'_issuer_rows']+=1
                    if source=='D':
                        if row['IS_PRIMARYISSUER_FLAG'].upper()!='YES':
                            totals['D_coissuer_rows_excluded']+=1
                            continue
                        acc=row['ACCESSIONNUMBER'];sub=submissions[acc];offer=offerings[acc]
                        cik=row['CIK'].lstrip('0') or '0';date=date_d(sub['FILING_DATE'])
                        name=row['ENTITYNAME'];industry=offer.get('INDUSTRYGROUPTYPE','')
                        fund=(industry=='Pooled Investment Fund' or offer.get('ISPOOLEDINVESTMENTFUNDTYPE','').lower()=='true' or bool(offer.get('INVESTMENTFUNDTYPE','').strip()))
                        form=sub['SUBMISSIONTYPE'];previous=offer.get('PREVIOUSACCESSIONNUMBER','')
                        file_num=sub['FILE_NUM'].strip();entity=row.get('ENTITYTYPE','')
                        extra={'industry':industry,'incorporation_year':row.get('YEAROFINC_VALUE_ENTERED',''),
                               'reported_amount_sold':offer.get('TOTALAMOUNTSOLD',''), 'previous_accession':previous}
                    else:
                        acc=row['ACCESSION_NUMBER'];sub=submissions[acc]
                        cik=sub['CIK'].lstrip('0') or '0';date=datetime.strptime(sub['FILING_DATE'],'%Y%m%d').date().isoformat()
                        name=row['NAMEOFISSUER'];industry='';fund=False;form=sub['SUBMISSION_TYPE'];previous=''
                        file_num=sub['FILE_NUMBER'].strip();entity=row.get('LEGALSTATUSFORM','')
                        extra={'website':safe_url(row.get('ISSUERWEBSITE','')), 'incorporated':row.get('DATEINCORPORATION','')}
                    state=row['STATEORCOUNTRY'].strip().upper();ambiguous=vehicle(name,industry,entity)
                    db.execute('INSERT OR IGNORE INTO filings VALUES (?,?,?,?,?,?)',(acc,form,cik,date,previous,file_num))
                    if cik == '0' or not cik.isdigit():
                        totals[source+'_invalid_cik_rows']+=1
                        quarantine.write(json.dumps({'source':source,'accession':acc,'cik':cik,'date':date,
                            'archive_url':receipt['url'],'reason':'missing or invalid CIK; cannot resolve issuer'})+'\n')
                        continue
                    data=dict(source=source,cik=cik,name=name,state=state,city=row['CITY'],date=date,accession=acc,
                        filing_type=form,file_number=file_num,pooled_fund=bool(fund),ambiguous_vehicle=ambiguous,
                        startup_status='unreviewed',ai_status='unreviewed',location_precision='reported city/state; office unverified',
                        source_url=f'https://www.sec.gov/Archives/edgar/data/{cik}/{acc.replace("-", "")}/',**extra)
                    old=db.execute('SELECT date,accession,fund FROM issuers WHERE source=? AND cik=?',(source,cik)).fetchone()
                    if old and old[2]: data['pooled_fund']=True
                    if not old or (date,acc)>(old[0],old[1]):
                        db.execute('INSERT OR REPLACE INTO issuers VALUES (?,?,?,?,?,?,?,?)',
                            (source,cik,date,acc,state,int(data['pooled_fund']),int(ambiguous),json.dumps(data)))
                    elif fund and not old[2]:
                        db.execute('UPDATE issuers SET fund=1 WHERE source=? AND cik=?',(source,cik))
            db.commit()
        print(f'Processed Form {source}',flush=True)
    quarantine.close()
    stats={}
    for source in ['D','C']:
        states=collections.Counter(); counts=collections.Counter()
        with (out/f'form-{source.lower()}-issuer-review.jsonl').open('w') as output:
            for raw,fund,ambiguous in db.execute('SELECT data,fund,ambiguous FROM issuers WHERE source=?',(source,)):
                r=json.loads(raw);r['pooled_fund']=bool(fund)
                counts['unique_primary_issuers']+=1
                reasons=[]
                if r['state'] not in STATES:reasons.append('outside_50_states_dc_or_unknown')
                if r['date']<'2024-01-01':reasons.append('latest_filing_before_2024')
                if fund:reasons.append('pooled_investment_fund')
                if ambiguous:reasons.append('ambiguous_vehicle_or_real_estate')
                if source=='C' and r['filing_type'] in ['C-W','C-TR']:reasons.append('withdrawn_or_reporting_terminated')
                for reason in reasons:counts[reason]+=1
                r['review_exclusions']=reasons
                if not reasons:states[r['state']]+=1;counts['recent_us_review_candidates']+=1
                output.write(json.dumps(r)+'\n')
        counts['filings']=db.execute('SELECT count(*) FROM filings WHERE form LIKE ?', (source+'%',)).fetchone()[0]
        counts['invalid_cik_rows_quarantined']=totals[source+'_invalid_cik_rows']
        stats[source]={'counts':dict(counts),'states':dict(states),**manifests[source]}
    stats['cross_source_cik_overlap']=db.execute("SELECT count(*) FROM issuers d JOIN issuers c ON c.cik=d.cik WHERE d.source='D' AND c.source='C'").fetchone()[0]
    # File number is an offering-family key; previous accession retains explicit
    # D amendment lineage. Never sum amounts sold across amendments or offerings.
    stats['D_offering_file_numbers']=db.execute("SELECT count(DISTINCT file_number) FROM filings WHERE form LIKE 'D%' AND file_number<>''").fetchone()[0]
    stats['D_missing_previous_accessions']=db.execute("SELECT count(*) FROM filings f WHERE f.previous<>'' AND NOT EXISTS(SELECT 1 FROM filings p WHERE p.accession=f.previous)").fetchone()[0]
    db.close()
    (out/'sec-summary.json').write_text(json.dumps(stats,indent=2)+'\n')
    return stats

def main():
    p=argparse.ArgumentParser();p.add_argument('--data-root',type=Path,required=True);p.add_argument('--yc',type=Path,required=True);p.add_argument('--boston',type=Path,required=True)
    args=p.parse_args()
    companies,inventory=build_directory(args.yc,args.boston)
    sec=build_sec(args.data_root)
    data={'meta':{'as_of':'2026-11-01','ai_review':'pending; no jobs classified',
        'yc_snapshot':'2026-10-31T03:22:16.444Z','inventory':inventory,
        'coverage':'Directory discovery, not a census. YC status and locations are directory-reported. Boston affiliations are not offices.',
        'sources':['https://yc-oss.github.io/api/companies/all.json','https://github.com/yc-oss/api','https://github.com/nikbearbrown/startup-jobs'],
        'sec':sec},'companies':companies}
    dest=ROOT/'public/data/startups/national.json';dest.write_text(json.dumps(data,separators=(',',':'))+'\n')
    print(json.dumps({'records':len(companies),'inventory':inventory,'sec':sec},indent=2))

if __name__=='__main__':main()
