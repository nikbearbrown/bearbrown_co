#!/usr/bin/env python3
"""
Sync the "How to AI" playlist of the Nik Bear Brown YouTube channel into static site data (video + article per video).

    python3 scripts/youtube/sync.py             # fetch new videos + rebuild data
    python3 scripts/youtube/sync.py --no-fetch  # rebuild from the local cache only
    python3 scripts/youtube/sync.py --force-articles  # regenerate fallback articles too

Outputs (all committed to the repo):
    data/youtube/videos.json           one record per public upload
    data/youtube/playlists.json        channel playlists -> video ids
    data/youtube/slugs.json            stable youtube_id -> url slug map (never edit by hand)
    data/youtube/transcripts/<id>.json caption text grouped into timed paragraphs
    content/videos/<slug>.md           article (frontmatter + markdown). A fallback
                                       article is generated only when the file is
                                       missing, so hand-written or LLM-written
                                       articles are never clobbered.

Only PUBLIC uploads in that playlist are published (the channel's Videos tab). Unlisted and
private videos never get a page, so a film waiting for review stays off the site. If the
playlist does not exist yet the script says so and writes empty data.

Requires yt-dlp on PATH. Raw scrape output is cached in .cache/youtube (gitignored).
Ported from humanitarians_html/scripts/youtube/sync.py.
"""
import argparse, concurrent.futures as cf, json, re, subprocess, time, unicodedata, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / '.cache' / 'youtube'
DATA = ROOT / 'data' / 'youtube'
CONTENT = ROOT / 'content' / 'videos'
CHANNEL = 'https://www.youtube.com/@NikBearBrown'
CHANNEL_NAME = 'Bear Brown'
# None = every public upload. A playlist title = publish only the videos in that playlist.
# bearbrown.co's AI section is one playlist on the channel; it must be titled exactly this.
ONLY_PLAYLIST = 'How to AI'
RESERVED_SLUGS = {'playlist', 'library', 'all'}

META_KEYS = ['id', 'title', 'description', 'upload_date', 'timestamp', 'duration', 'tags', 'categories',
             'view_count', 'like_count', 'chapters', 'channel', 'channel_id', 'uploader', 'thumbnail',
             'webpage_url', 'availability', 'live_status', 'age_limit', 'width', 'height']


def ytdlp_json(url, extra=()):
    r = subprocess.run(['yt-dlp', '-J', '--skip-download', '--no-warnings', *extra, url],
                       capture_output=True, text=True, timeout=300)
    if r.returncode != 0 or not r.stdout.strip():
        raise RuntimeError(r.stderr.strip()[-200:])
    return json.loads(r.stdout)


def pick_caption(j):
    def pick(d):
        for lang in ['en', 'en-US', 'en-orig', 'en-GB']:
            for f in (d or {}).get(lang, []):
                if f.get('ext') == 'json3':
                    return f.get('url')
        return None
    return pick(j.get('subtitles')) or pick(j.get('automatic_captions'))


def fetch_meta(vid):
    out = CACHE / 'meta' / f'{vid}.json'
    if out.exists():
        return 'cached'
    j = ytdlp_json(f'https://www.youtube.com/watch?v={vid}')
    keep = {k: j.get(k) for k in META_KEYS}
    keep['caption_url'] = pick_caption(j)
    out.write_text(json.dumps(keep))
    return 'ok'


def fetch_captions(vid):
    out = CACHE / 'captions' / f'{vid}.json'
    if out.exists():
        return 'cached'
    meta = json.loads((CACHE / 'meta' / f'{vid}.json').read_text())
    url = meta.get('caption_url')
    if not url:
        return 'none'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    j = json.loads(urllib.request.urlopen(req, timeout=60).read().decode('utf-8'))
    segs = []
    for ev in j.get('events', []):
        if 'segs' not in ev:
            continue
        t = ''.join(s.get('utf8', '') for s in ev['segs']).replace('\n', ' ').strip()
        if t:
            segs.append({'t': ev.get('tStartMs', 0) / 1000.0, 'text': t})
    out.write_text(json.dumps(segs))
    return 'ok'


def _safe(fn, *a):
    try:
        return fn(*a)
    except Exception as ex:  # noqa
        return 'ERR ' + str(ex)[:160]


def wanted_ids(only_playlist):
    """Video ids this site publishes: every upload, or only those in one playlist."""
    ups = json.loads((CACHE / 'channel_videos.json').read_text())['entries']
    ids = [e['id'] for e in ups]
    if not only_playlist:
        return ids
    want = slugify(only_playlist, 60)
    members = set()
    for f in CACHE.glob('pl_*.json'):
        j = json.loads(f.read_text())
        if slugify((j.get('title') or ''), 60) == want:
            members |= {x['id'] for x in j.get('entries', []) if x.get('id')}
    return [v for v in ids if v in members]


def fetch_all(only_playlist):
    (CACHE / 'meta').mkdir(parents=True, exist_ok=True)
    (CACHE / 'captions').mkdir(parents=True, exist_ok=True)
    print('fetching playlist index...')
    pls = ytdlp_json(f'{CHANNEL}/playlists', ['--flat-playlist'])
    (CACHE / 'playlists.json').write_text(json.dumps(pls))
    print('fetching uploads index...')
    ups = ytdlp_json(f'{CHANNEL}/videos', ['--flat-playlist'])
    (CACHE / 'channel_videos.json').write_text(json.dumps(ups))
    upload_ids = {e['id'] for e in ups.get('entries', [])}
    for e in pls.get('entries', []):
        pid = e['id']
        j = ytdlp_json(f'https://www.youtube.com/playlist?list={pid}', ['--flat-playlist'])
        (CACHE / f'pl_{pid}.json').write_text(json.dumps(j))
        got = [x['id'] for x in j.get('entries', []) if x.get('id')]
        public = sum(1 for v in got if v in upload_ids)
        print(f"  playlist {e.get('title')!r}: {len(got)} listed ({j.get('playlist_count')} on YouTube), {public} public uploads")
    ids = wanted_ids(only_playlist)
    todo = [v for v in ids if not (CACHE / 'meta' / f'{v}.json').exists()]
    print(f'{len(ids)} videos to publish, {len(todo)} need metadata')
    failed = []
    with cf.ThreadPoolExecutor(4) as ex:
        for vid, res in zip(todo, ex.map(lambda v: _safe(fetch_meta, v), todo)):
            if res.startswith('ERR'):
                failed.append(vid)
            print(' ', vid, res)
    if failed:
        print(f'{len(failed)} metadata fetches failed (YouTube bot-check). Re-run later; cached ones are kept.')
    have = [v for v in ids if (CACHE / 'meta' / f'{v}.json').exists()]
    with cf.ThreadPoolExecutor(4) as ex:
        for vid, res in zip(have, ex.map(lambda v: _safe(fetch_captions, v), have)):
            if res not in ('cached',):
                print('  captions', vid, res)
            time.sleep(0.05)


# ---------------------------------------------------------------- build

def slugify(s, maxlen=80):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r"[’'\"“”]", '', s)
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    s = re.sub(r'-+', '-', s)
    if len(s) > maxlen:
        s = s[:maxlen].rsplit('-', 1)[0]
    return s or 'video'


def load_slugs():
    p = DATA / 'slugs.json'
    return json.loads(p.read_text()) if p.exists() else {}


def assign_slug(vid, title, slugs):
    if vid in slugs:
        return slugs[vid]
    base = slugify(title)
    taken = set(slugs.values()) | RESERVED_SLUGS
    slug = base
    if slug in taken:
        slug = f'{base}-{vid[:6].lower()}'
    slugs[vid] = slug
    return slug


def fmt_ts(sec):
    sec = int(sec)
    h, m, s = sec // 3600, (sec % 3600) // 60, sec % 60
    return f'{h}:{m:02d}:{s:02d}' if h else f'{m}:{s:02d}'


def iso_duration(sec):
    sec = int(sec or 0)
    h, m, s = sec // 3600, (sec % 3600) // 60, sec % 60
    return 'PT' + (f'{h}H' if h else '') + (f'{m}M' if m else '') + f'{s}S'


def paragraphs_from_captions(segs, chapters, duration):
    """Group caption segments into timed paragraphs: by chapter when chapters exist,
    otherwise every ~70 seconds / ~110 words."""
    if not segs:
        return []
    bounds = []
    if chapters:
        bounds = [(c.get('start_time') or 0, c.get('title') or '') for c in chapters]
    paras = []
    cur, cur_t, cur_title, words = [], segs[0]['t'], None, 0
    bi = 0
    if bounds:
        cur_title = bounds[0][1]
        bi = 1
    for s in segs:
        text = s['text']
        if bounds and bi < len(bounds) and s['t'] >= bounds[bi][0]:
            if cur:
                paras.append({'t': cur_t, 'title': cur_title, 'text': ' '.join(cur)})
            cur, cur_t, words = [], s['t'], 0
            cur_title = bounds[bi][1]
            bi += 1
        elif not bounds and (words >= 110 or s['t'] - cur_t >= 70) and cur:
            paras.append({'t': cur_t, 'title': None, 'text': ' '.join(cur)})
            cur, cur_t, words = [], s['t'], 0
        cur.append(text)
        words += len(text.split())
    if cur:
        paras.append({'t': cur_t, 'title': cur_title, 'text': ' '.join(cur)})
    # Split over-long chapter paragraphs
    out = []
    for p in paras:
        w = p['text'].split()
        if len(w) <= 220:
            out.append(p)
            continue
        n = (len(w) + 179) // 180
        step = len(w) / n
        for i in range(n):
            chunk = ' '.join(w[int(i * step):int((i + 1) * step)])
            out.append({'t': p['t'] if i == 0 else None, 'title': p['title'] if i == 0 else None, 'text': chunk})
    for p in out:
        p['text'] = tidy_caption_text(p['text'])
    return out


def tidy_caption_text(t):
    t = re.sub(r'\s+', ' ', t).strip()
    t = re.sub(r'\[(Music|Applause|Laughter)\]', '', t, flags=re.I)
    t = t.replace('&#39;', "'").replace('&amp;', '&').replace('&quot;', '"')
    if t and t[0].islower():
        t = t[0].upper() + t[1:]
    return t.strip()


def description_to_markdown(desc):
    """YouTube descriptions use *bold* and '*   ' bullets. Convert to markdown,
    promote short bold-only lines to headings, and drop bare hashtag lines."""
    lines = []
    for raw in (desc or '').split('\n'):
        line = raw.rstrip()
        if not line.strip():
            lines.append('')
            continue
        if re.fullmatch(r'\s*(#\w+\s*)+', line):
            continue
        m = re.match(r'^\s*[\*\-•]\s{1,4}(.*)$', line)
        if m and not re.match(r'^\*[^*]+\*\s*$', line.strip()):
            body = m.group(1)
            body = re.sub(r'(?<!\*)\*([^*\n]+?)\*(?!\*)', r'**\1**', body)
            lines.append('- ' + body)
            continue
        if re.fullmatch(r'\*[^*]{2,70}\*:?\s*', line.strip()):
            lines.append('')
            lines.append('## ' + line.strip().strip('*:').strip('*').strip())
            lines.append('')
            continue
        line = re.sub(r'(?<!\*)\*([^*\n]+?)\*(?!\*)', r'**\1**', line)
        lines.append(line)
    md = '\n'.join(lines)
    md = re.sub(r'\n{3,}', '\n\n', md).strip()
    return md


def first_sentence(text, limit=155):
    t = re.sub(r'[\*#_]+', '', text or '').strip().split('\n')[0]
    t = re.sub(r'\s+', ' ', t)
    if len(t) <= limit:
        return t
    cut = t[:limit].rsplit(' ', 1)[0]
    return cut.rstrip(',;:') + '…'


def yaml_str(s):
    return json.dumps(s, ensure_ascii=False)


def lede_text(v):
    """First description paragraph that is not just the title repeated (descriptions often open with it)."""
    norm = lambda t: re.sub(r'[\s*]+', ' ', t).strip().lower()
    for para in re.split(r'\n\s*\n', v['description'] or ''):
        p = para.strip()
        if p and not p.startswith('#') and norm(p) != norm(v['title']):
            return p
    return ''


def fallback_article(v, transcript):
    """A readable article built only from the video's own description, chapters
    and transcript. Overwritten later by a hand/LLM-written article if one lands
    in content/videos/<slug>.md."""
    parts = []
    intro = description_to_markdown(v['description'])
    if intro:
        parts.append(intro)
    if v.get('chapters'):
        parts.append('## What this video covers\n')
        for c in v['chapters']:
            parts.append(f"- **{fmt_ts(c['start'])}** — {c['title']}")
        parts.append('')
    if transcript:
        parts.append('## Transcript\n')
        parts.append('A lightly formatted transcript of the video, with timestamps so you can jump to any section on YouTube.\n')
        for p in transcript:
            if p.get('title'):
                parts.append(f"### {p['title']}\n")
            stamp = f"**[{fmt_ts(p['t'])}]** " if p.get('t') is not None else ''
            parts.append(stamp + p['text'] + '\n')
    fm = {
        'title': v['title'],
        'seoTitle': v['title'][:60],
        'description': first_sentence(lede_text(v)) or f"{v['title']} — a video from {CHANNEL_NAME}.",
        'keywords': v.get('tags') or [],
        'generated': 'fallback',
    }
    front = '---\n' + '\n'.join(f'{k}: {yaml_str(val)}' for k, val in fm.items()) + '\n---\n\n'
    return front + '\n'.join(parts).strip() + '\n'


def build(only_playlist, force_articles=False):
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / 'transcripts').mkdir(exist_ok=True)
    CONTENT.mkdir(parents=True, exist_ok=True)
    ups = json.loads((CACHE / 'channel_videos.json').read_text())['entries']
    upload_index = {e['id']: e for e in ups}
    upload_ids = wanted_ids(only_playlist)
    if only_playlist and not upload_ids:
        print(f'NOTICE: no public videos found in a playlist titled {only_playlist!r}. '
              'Create it on the channel (exact title) and add public videos, then re-run. Writing empty data.')
    slugs = load_slugs()

    # playlists (when one playlist is the whole site, only that playlist is kept)
    pls_index = json.loads((CACHE / 'playlists.json').read_text())['entries']
    playlists = []
    membership = {}
    for e in pls_index:
        pid = e['id']
        f = CACHE / f'pl_{pid}.json'
        if not f.exists():
            continue
        title = (e.get('title') or pid).strip()
        if only_playlist and slugify(title, 60) != slugify(only_playlist, 60):
            continue
        j = json.loads(f.read_text())
        vids = [x['id'] for x in j.get('entries', []) if x.get('id') in upload_index and x.get('id') in upload_ids]
        for vid in vids:
            membership.setdefault(vid, []).append(pid)
        playlists.append({
            'id': pid,
            'slug': slugify(title, 60),
            'title': title,
            'description': (j.get('description') or '').strip(),
            'videoIds': vids,
            'url': f'https://www.youtube.com/playlist?list={pid}',
        })
    seen = {}
    for p in playlists:
        if p['slug'] in seen:
            p['slug'] = f"{p['slug']}-{p['id'][-4:].lower()}"
        seen[p['slug']] = 1
    pl_by_id = {p['id']: p for p in playlists}

    videos = []
    n_fallback = 0
    for vid in upload_ids:
        mf = CACHE / 'meta' / f'{vid}.json'
        flat = upload_index[vid]
        if mf.exists():
            m = json.loads(mf.read_text())
        else:  # metadata fetch blocked; still publish a minimal page from the flat listing
            m = {'id': vid, 'title': flat.get('title'), 'description': '', 'duration': flat.get('duration'),
                 'upload_date': None, 'timestamp': flat.get('timestamp'), 'tags': [], 'chapters': None,
                 'view_count': flat.get('view_count')}
        if m.get('availability') not in (None, 'public'):
            continue
        if (m.get('live_status') or 'not_live') not in ('not_live', 'was_live'):
            continue
        title = (m.get('title') or '').strip() or vid
        slug = assign_slug(vid, title, slugs)
        chapters = [{'start': c.get('start_time') or 0, 'end': c.get('end_time'), 'title': c.get('title') or ''}
                    for c in (m.get('chapters') or [])]
        upload_date = m.get('upload_date')
        if upload_date:
            iso_date = f'{upload_date[:4]}-{upload_date[4:6]}-{upload_date[6:8]}'
        elif m.get('timestamp'):
            iso_date = time.strftime('%Y-%m-%d', time.gmtime(m['timestamp']))
        else:
            iso_date = None
        duration = m.get('duration') or 0
        cf_ = CACHE / 'captions' / f'{vid}.json'
        transcript = []
        if cf_.exists():
            segs = json.loads(cf_.read_text())
            transcript = paragraphs_from_captions(segs, m.get('chapters'), duration)
            (DATA / 'transcripts' / f'{vid}.json').write_text(json.dumps(transcript, ensure_ascii=False))
        rec = {
            'id': vid,
            'slug': slug,
            'title': title,
            'description': (m.get('description') or '').strip(),
            'uploadDate': iso_date,
            'duration': duration,
            'durationISO': iso_duration(duration),
            'durationLabel': fmt_ts(duration),
            'tags': m.get('tags') or [],
            'chapters': chapters,
            'viewCount': m.get('view_count'),
            'playlists': [pl_by_id[p]['slug'] for p in membership.get(vid, []) if p in pl_by_id],
            'thumbnail': f'https://i.ytimg.com/vi/{vid}/hqdefault.jpg',
            'hasTranscript': bool(transcript),
            'isShort': bool(duration and duration <= 60) or bool((m.get('height') or 0) > (m.get('width') or 1)),
        }
        videos.append(rec)
        art = CONTENT / f'{slug}.md'
        if force_articles or not art.exists():
            art.write_text(fallback_article(rec, transcript))
            n_fallback += 1

    videos.sort(key=lambda v: (v['uploadDate'] or ''), reverse=True)
    (DATA / 'videos.json').write_text(json.dumps(videos, ensure_ascii=False, indent=1) + '\n')
    for p in playlists:
        p['videoIds'] = [v for v in p['videoIds'] if v in slugs]
    playlists.sort(key=lambda p: -len(p['videoIds']))
    (DATA / 'playlists.json').write_text(json.dumps(playlists, ensure_ascii=False, indent=1) + '\n')
    (DATA / 'slugs.json').write_text(json.dumps(slugs, ensure_ascii=False, indent=1, sort_keys=True) + '\n')
    print(f'{len(videos)} videos, {len(playlists)} playlists, {n_fallback} fallback articles written, '
          f'{sum(1 for v in videos if v["hasTranscript"])} transcripts')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--no-fetch', action='store_true')
    ap.add_argument('--force-articles', action='store_true')
    ap.add_argument('--playlist', help='publish only this playlist (title); overrides the site default')
    a = ap.parse_args()
    only = a.playlist or ONLY_PLAYLIST
    if not a.no_fetch:
        fetch_all(only)
    build(only, force_articles=a.force_articles)
