#!/usr/bin/env python3
"""Build truthful address pins and city reference groups, never synthetic offices.
Optional --ecosystem and --cities arguments refresh the checked-in source extracts.
"""
import argparse, collections, hashlib, io, json, math, re, zipfile
from pathlib import Path
from urllib.parse import urlparse
ROOT = Path(__file__).resolve().parents[2]
SOURCES = ROOT/'data/startups/location-sources'
def domain(s):
    return (urlparse(s or '').hostname or '').lower().removeprefix('www.')
def distance(a,b):
    x,y=map(math.radians,a); u,v=map(math.radians,b)
    h=math.sin((u-x)/2)**2+math.cos(x)*math.cos(u)*math.sin((v-y)/2)**2
    return 6371.0088*2*math.asin(min(1,math.sqrt(h)))
def city_keys(c):
    keys=[]
    for loc in c['location'].split(';'):
        m=re.fullmatch(r'\s*(.+), ([A-Z]{2}), USA\s*',loc)
        if m:keys.append((m[1].strip(),m[2]))
        elif len(c['states'])==1 and ',' not in loc and loc.strip():keys.append((loc.strip(),c['states'][0]))
    return keys
ALIASES={'New York':'New York City','Washington DC':'Washington','Washington, DC':'Washington'}
def build():
    p=argparse.ArgumentParser();p.add_argument('--ecosystem',type=Path);p.add_argument('--cities',type=Path);a=p.parse_args()
    companies=json.loads((ROOT/'public/data/startups/national.json').read_text())['companies']
    by_domain=collections.defaultdict(list)
    for c in companies:
        if c['domain']:by_domain[c['domain']].append(c['id'])
    if a.ecosystem:
        records=json.loads(a.ecosystem.read_text())['records'];addresses={}
        for r in records:
            m=r.get('map_location') or {};ids=by_domain[domain(r.get('website'))]
            if r['kind']=='startup' and len(ids)==1 and m.get('status')=='reviewed' and m.get('precision') in ('address-geocoded','address-point','building') and m.get('address_sources') and m.get('coordinate_source'):
                addresses[ids[0]]={**m,'upstream_id':r['id'],'source':'https://jobs.humanitarians.ai/ecosystem/directory.json'}
        (SOURCES/'addresses.json').write_text(json.dumps({'retrieved_on':'2026-11-02','upstream_sha256':hashlib.sha256(a.ecosystem.read_bytes()).hexdigest(),'addresses':addresses},indent=2)+'\n')
    if a.cities:
        lookup=collections.defaultdict(list)
        z=zipfile.ZipFile(a.cities)
        for line in io.TextIOWrapper(z.open('cities15000.txt'),encoding='utf-8'):
            r=line.rstrip('\n').split('\t')
            if r[8]=='US' and r[6]=='P':
                item={'id':r[0],'name':r[1],'state':r[10],'latitude':float(r[4]),'longitude':float(r[5]),'source':f'https://www.geonames.org/{r[0]}/','modified_on':r[18]}
                for name in {r[1],r[2]}:lookup[(name,r[10])].append(item)
        matches={};unresolved=[]
        for key in sorted({key for c in companies for key in city_keys(c)}):
            options=lookup.get((ALIASES.get(key[0],key[0]),key[1]),[])
            if len(options)==1:matches['|'.join(key)]=options[0]
            else:unresolved.append(list(key))
        (SOURCES/'cities.json').write_text(json.dumps({'source':'https://download.geonames.org/export/dump/cities15000.zip','license':'https://creativecommons.org/licenses/by/4.0/','retrieved_on':'2026-11-02','upstream_sha256':hashlib.sha256(a.cities.read_bytes()).hexdigest(),'matches':matches,'unresolved':unresolved},indent=2)+'\n')
    address_source=json.loads((SOURCES/'addresses.json').read_text());city_source=json.loads((SOURCES/'cities.json').read_text())
    cities={};locations={};points=[]
    for c in companies:
        address=address_source['addresses'].get(c['id']);city_ids=[]
        for key in city_keys(c):
            city=city_source['matches'].get('|'.join(key))
            if city:
                cities[city['id']]=city;city_ids.append(city['id'])
        locations[c['id']]={'city_ids':sorted(set(city_ids)),**({'address':address} if address else {})}
        if address:points.append((c['id'],[address['latitude'],address['longitude']]))
        else:
            for cid in set(city_ids):points.append((c['id'],[cities[cid]['latitude'],cities[cid]['longitude']]))
    def nearby(center,radius):return sorted({cid for cid,coord in points if distance(center,coord)<=radius})
    scores=[]
    for cid,city in cities.items():
        center=[city['latitude'],city['longitude']];ids=nearby(center,25)
        scores.append({'city_id':cid,'name':city['name']+', '+city['state'],'center':center,'count':len(ids)})
    scores.sort(key=lambda s:(-s['count'],s['city_id']))
    hub_specs=[('Bay Area','San Francisco','CA',9,80),('Seattle','Seattle','WA',10,50),('Los Angeles','Los Angeles','CA',10,60),('Austin','Austin','TX',11,45),('Boston / Cambridge','Cambridge','MA',12,40),('New York','New York City','NY',11,40),('Miami','Miami','FL',11,40),('Chicago','Chicago','IL',11,40)]
    hubs=[]
    for name,city,state,zoom,radius in hub_specs:
        found=next(c for c in cities.values() if c['name']==city and c['state']==state)
        center=[found['latitude'],found['longitude']]
        hubs.append({'name':name,'center':center,'zoom':zoom,'radius_km':radius,'count':len(nearby(center,radius))})
    out={'meta':{'as_of':'2026-11-02','addresses':len(address_source['addresses']),'city_reference_points':len(cities),'located_companies':len({p[0] for p in points}),'unplaced_companies':len(companies)-len({p[0] for p in points}),'opening':{**scores[0],'radius_km':25,'zoom':11,'method':'Maximum unique companies within 25 km of each matched city reference point. Address coordinates take precedence; otherwise city reference points. Ties use ascending GeoNames ID. A directory sampling concentration, not measured real-world startup density.'},'density_ranking':scores[:10],'sources':{'addresses_sha256':address_source['upstream_sha256'],'cities_sha256':city_source['upstream_sha256']}},'cities':cities,'locations':locations,'hubs':hubs}
    (ROOT/'public/data/startups/locations.json').write_text(json.dumps(out,separators=(',',':'))+'\n')
    print(json.dumps(out['meta'],indent=2));print('Hubs:',[(h['name'],h['count']) for h in hubs])
if __name__=='__main__':build()
