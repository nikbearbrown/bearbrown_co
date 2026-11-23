#!/usr/bin/env python3
"""Collect public official-site evidence for review, never auto-publish a location.
Robots-aware, bounded same-host crawl; blocked hosts are not bypassed.
"""
import argparse,concurrent.futures,hashlib,json,re,time
from datetime import datetime,timezone
from pathlib import Path
from urllib.parse import urlparse,urljoin,urldefrag
from urllib.robotparser import RobotFileParser
import requests
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT.parent/'data/location-enrichment';PAGES=OUT/'pages'
UA='BearBrownStartupResearch/1.0 (+https://www.bearbrown.co; bear@bearbrown.co)'
STATES='AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'
POSTAL=re.compile(r'\b(?:'+STATES.replace(' ','|')+r'|California|Massachusetts|New York|Washington|Texas|Illinois|Florida)\s*,?\s*\d{5}(?:-\d{4})?\b',re.I)
def host(url):return (urlparse(url).hostname or '').lower().removeprefix('www.')
def collect(c):
    file=OUT/(c['id']+'.json')
    if file.exists():return json.loads(file.read_text())
    result={'company_id':c['id'],'name':c['name'],'website':c['website'],'observed_at':datetime.now(timezone.utc).isoformat(),'pages':[],'careers':[],'status':'pending'}
    s=requests.Session();s.headers['User-Agent']=UA
    robots={};last={};denied=set()
    def fetch(url,is_robots=False,redirect_depth=0):
        if redirect_depth>5:return None
        parsed=urlparse(url)
        if parsed.scheme not in ('http','https') or not parsed.hostname:return None
        origin=f'{parsed.scheme}://{parsed.netloc}'
        if origin in denied:return None
        if not is_robots and origin not in robots:
            try:
                rr=s.get(origin+'/robots.txt',timeout=(6,10))
                if rr.status_code in (401,403,429) or rr.status_code>=500:denied.add(origin);result['pages'].append({'url':origin+'/robots.txt','status':rr.status_code,'note':'Access/robots unavailable; host skipped'});return None
                rp=RobotFileParser();rp.parse(rr.text.splitlines() if rr.ok else []);robots[origin]=rp
            except requests.RequestException as e:result['pages'].append({'url':origin+'/robots.txt','status':'network-error','note':type(e).__name__});denied.add(origin);return None
        if not is_robots and not robots[origin].can_fetch(UA,url):result['pages'].append({'url':url,'status':'robots-disallowed'});return None
        delay=max(1,robots[origin].crawl_delay(UA) or robots[origin].crawl_delay('*') or 0)
        if delay>10:result['pages'].append({'url':url,'status':'crawl-delay-over-budget'});return None
        time.sleep(max(0,delay-(time.monotonic()-last.get(origin,0))))
        try:
            # Inspect redirects rather than fetching an unreviewed destination.
            r=s.get(url,timeout=(6,12),allow_redirects=False);last[origin]=time.monotonic()
            if r.is_redirect:
                target=urljoin(url,r.headers.get('Location',''))
                if host(target)!=host(c['website']):result['pages'].append({'url':url,'status':r.status_code,'redirect':target,'note':'Different host; identity review required'});return None
                if target==url:return None
                return fetch(target,redirect_depth=redirect_depth+1)
            receipt={'url':url,'status':r.status_code}
            if r.status_code in (401,403,429):denied.add(origin)
            if not r.ok or 'html' not in r.headers.get('Content-Type',''):result['pages'].append(receipt);return None
            raw=r.content
            if len(raw)>6_000_000:receipt['note']='Page exceeds collection limit';result['pages'].append(receipt);return None
            digest=hashlib.sha256(raw).hexdigest();(PAGES/(digest+'.html')).write_bytes(raw)
            soup=BeautifulSoup(raw,'html.parser');structured=[]
            for tag in soup.find_all('script',type='application/ld+json'):
                try:structured.append(json.loads(tag.string or tag.get_text()))
                except (ValueError,TypeError):pass
            for tag in soup(['script','style','svg','noscript']):tag.decompose()
            text=' '.join(soup.stripped_strings)
            contexts=[]
            for m in POSTAL.finditer(text):contexts.append(text[max(0,m.start()-250):min(len(text),m.end()+120)])
            links=[]
            for a in soup.find_all('a',href=True):
                href=urldefrag(urljoin(url,a['href']))[0];label=a.get_text(' ',strip=True)
                if urlparse(href).scheme not in ('http','https'):continue
                if re.search(r'\b(careers?|join (?:our|the) team|open (?:roles|positions)|jobs)\b',label,re.I):result['careers'].append({'url':href,'label':label,'source_url':url,'source_sha256':digest,'evidence':'Official-site navigation link; vacancies not verified'})
                if host(href)==host(c['website']) and re.search(r'(contact|about|privacy|terms|locations|offices|company)',urlparse(href).path+' '+label,re.I) and not re.search(r'(blog|post|news|customer|event|case-study|press-release)',urlparse(href).path,re.I):links.append(href)
            receipt.update(sha256=digest,bytes=len(raw),title=soup.title.get_text() if soup.title else '',contexts=list(dict.fromkeys(contexts)),structured=structured)
            result['pages'].append(receipt)
            return list(dict.fromkeys(links))
        except (requests.RequestException,RecursionError) as e:result['pages'].append({'url':url,'status':'network-error','note':type(e).__name__});return None
    links=fetch(c['website']) or []
    def rank(url):
        path=urlparse(url).path.lower()
        return (0 if re.search(r'contact|locations|offices',path) else 1 if 'about' in path else 2 if 'privacy' in path else 3,len(path))
    for url in sorted(set(links),key=rank)[:3]:fetch(url)
    result['status']='collected';file.write_text(json.dumps(result,indent=2)+'\n')
    return result

def main():
    p=argparse.ArgumentParser();p.add_argument('--limit',type=int,default=320);p.add_argument('--workers',type=int,default=8);p.add_argument('--hub-limit',type=int,default=0);a=p.parse_args();OUT.mkdir(exist_ok=True);PAGES.mkdir(exist_ok=True)
    cs=json.loads((ROOT/'public/data/startups/national.json').read_text())['companies'];byid={c['id']:c for c in cs}
    yc=json.loads((ROOT.parent/'data/inventory/yc-all-2026-10-31.json').read_text());sizes={'yc-'+str(c['id']):c.get('team_size') or 0 for c in yc}
    candidates=json.loads((ROOT.parent/'data/inventory/form-d-name-candidates.json').read_text());formc=json.loads((ROOT.parent/'data/inventory/form-c-directory-domain-matches.json').read_text());priority={r['company_id'] for r in candidates}|{r['id'] for r in formc}
    cs.sort(key=lambda c:(0 if c['id'] in priority else 1,0 if 'CA' in c['states'] else 1,-sizes.get(c['id'],0),c['id']))
    pool=[c for c in cs if c['website']];cs=pool[:a.limit]
    for state in ['NY','TX','WA','FL','IL']:
        cs.extend(sorted([c for c in pool if state in c['states']],key=lambda c:-sizes.get(c['id'],0))[:a.hub_limit])
    cs=list({c['id']:c for c in cs}.values());(OUT/'queue.json').write_text(json.dumps([{'id':c['id'],'name':c['name'],'website':c['website']} for c in cs],indent=2)+'\n')
    done=0;with_context=0
    with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as pool:
        futures={pool.submit(collect,c):c for c in cs}
        for f in concurrent.futures.as_completed(futures):
            try:
                r=f.result();done+=1;hits=sum(len(p.get('contexts',[])) for p in r['pages']);with_context+=bool(hits)
                if done%20==0 or hits:print(json.dumps({'done':done,'company':r['name'],'address_contexts':hits,'companies_with_context':with_context}),flush=True)
            except Exception as e:print(json.dumps({'company':futures[f]['name'],'error':repr(e)}),flush=True)
    print(json.dumps({'complete':done,'companies_with_address_context':with_context}),flush=True)
if __name__=='__main__':main()
