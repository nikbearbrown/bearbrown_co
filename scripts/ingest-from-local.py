#!/usr/bin/env python3
"""
Read all schema_version:2 CLEARED_STATIC audit records from the local ledger
and write the full dataset to data/catalog/audit-entries.json.

Source: ../github-claude-plugins/ledger/records/ (all time, not just 3 days)
Output: data/catalog/audit-entries.json

Run from the bearbrown_co directory:
    python3 scripts/ingest-from-local.py
"""

from pathlib import Path
import json
from collections import Counter

# ── Taxonomy ──────────────────────────────────────────────────────────────────

TYPE_SLUG_MAP = {
    'skill':        'skills',
    'agent':        'agents',
    'command':      'commands',
    'hook':         'hooks',
    'mcp-server':   'mcp-servers',
    'lsp-server':   'lsp-servers',
    'output-style': 'output-styles',
    'theme':        'themes',
    'monitor':      'monitors',
    'workflow':     'workflows',
    'plugin':       'plugins',
}

FIELD_TAXONOMY = {
    'devops':      ['deploy','kubernetes','k8s','docker','container','terraform','helm','ci/cd','pipeline','grafana','prometheus','infrastructure','cloud sql'],
    'security':    ['security','auth','authentication','secret','credential','vulnerability','cve','pentest','scan','compliance','rbac','oauth','jwt','encryption'],
    'data':        ['database','sql','postgres','postgresql','mysql','redis','mongodb','analytics','etl','dataframe','pandas','query','bigquery','snowflake','warehouse','spark'],
    'docs':        ['documentation','readme','wiki','changelog','api reference','docstring','jsdoc','openapi','swagger'],
    'testing':     ['test','spec','coverage','jest','pytest','mock','assert','tdd','bdd','cypress','playwright'],
    'design':      ['design','figma','ui','ux','css','sass','tailwind','storybook','accessibility','a11y'],
    'finance':     ['finance','billing','payment','stripe','invoice','accounting','revenue','budget','expense'],
    'legal':       ['legal','compliance','gdpr','privacy','license','contract','terms of service','policy'],
    'education':   ['education','learning','course','lesson','student','teacher','curriculum','quiz','tutor'],
    'research':    ['research','paper','arxiv','pubmed','literature','citation','academic','scientific','experiment'],
    'marketing':   ['marketing','campaign','seo','ads','google ads','meta ads','social media','email','brand','conversion','audience'],
    'productivity':['productivity','calendar','task management','project management','kanban','slack','linear','jira','notion','scheduling','automation'],
}

STACK_MAP = {
    'typescript': ['typescript'],
    'javascript': ['javascript','node','nodejs'],
    'python':     ['python'],
    'go':         ['golang'],
    'rust':       ['rust'],
    'postgresql': ['postgres','postgresql','cloud-sql','cloud sql'],
    'kubernetes': ['kubernetes','k8s'],
    'docker':     ['docker','container'],
    'graphql':    ['graphql'],
    'rest':       ['rest api','openapi','swagger'],
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def detect_fields(text: str) -> list[str]:
    lower = text.lower()
    return [field for field, kws in FIELD_TAXONOMY.items() if any(kw in lower for kw in kws)]


def detect_stack(keywords: list) -> list[str]:
    lower = [str(k).lower() for k in keywords]
    return [stack for stack, kws in STACK_MAP.items() if any(any(kw in k for k in lower) for kw in kws)]


def s(v, fb: str = '') -> str:
    return str(v) if v is not None else fb


# ── Transform ─────────────────────────────────────────────────────────────────

def transform(raw: dict):
    if raw.get('schema_version') != 2:
        return None

    grade_obj = raw.get('grade', {})
    if not isinstance(grade_obj, dict):
        grade_obj = {}
    if grade_obj.get('grade') != 'CLEARED_STATIC':
        return None

    rec_type = raw.get('type', '')
    if not rec_type or rec_type == 'unknown':
        return None

    meta = raw.get('meta', {})
    if not isinstance(meta, dict):
        meta = {}
    owner = meta.get('owner', '')
    repo = meta.get('repo', '')
    if not owner or not repo:
        return None

    id_ = raw.get('id', f'{owner}__{repo}')
    gate1 = raw.get('gate1', {})
    if not isinstance(gate1, dict):
        gate1 = {}
    checks = gate1.get('checks', {})
    if not isinstance(checks, dict):
        checks = {}
    manifest = checks.get('manifest_data', {})
    if not isinstance(manifest, dict):
        manifest = {}

    text_digest = raw.get('text_digest', {})
    if not isinstance(text_digest, dict):
        text_digest = {}

    author_raw = manifest.get('author', '')
    if isinstance(author_raw, dict):
        author = author_raw.get('name', '')
    else:
        author = str(author_raw) if author_raw else ''

    keywords = manifest.get('keywords', [])
    if not isinstance(keywords, list):
        keywords = []

    digest_components = text_digest.get('components', [])
    if not isinstance(digest_components, list):
        digest_components = []

    enrich_text = ' '.join([
        str(manifest.get('description', '')),
        str(text_digest.get('readme_head', ''))[:2000],
        *[str(c.get('description', '')) for c in digest_components if isinstance(c, dict)]
    ])

    tags = list(set(detect_fields(enrich_text) + detect_stack(keywords)))

    coverage = raw.get('coverage', {})
    if not isinstance(coverage, dict):
        coverage = {}

    receipts = raw.get('receipts', {})
    if not isinstance(receipts, dict):
        receipts = {}

    adoption = raw.get('adoption', {})
    if not isinstance(adoption, dict):
        adoption = {}

    components = raw.get('components', [])
    if not isinstance(components, list):
        components = []

    tests = raw.get('tests', [])
    if not isinstance(tests, list):
        tests = []

    commit_sha = receipts.get('commit_sha')
    commit_sha_val = str(commit_sha) if commit_sha is not None else None

    forks = adoption.get('forks')
    try:
        forks_val = int(forks) if forks is not None else None
    except (TypeError, ValueError):
        forks_val = None

    last_commit = adoption.get('last_commit')
    last_commit_val = str(last_commit) if last_commit is not None else None

    built_components = []
    for c in components:
        if not isinstance(c, dict):
            continue
        comp = {
            'type': s(c.get('type')),
            'path': s(c.get('path')),
            'confidence': s(c.get('confidence', 'low')),
        }
        if 'description' in c:
            comp['description'] = s(c['description'])
        built_components.append(comp)

    return {
        'id': id_,
        'urlSlug': id_.replace('__', '--'),
        'typeSlug': TYPE_SLUG_MAP.get(rec_type, 'skills'),
        'owner': owner,
        'repo': repo,
        'repoUrl': f'https://github.com/{owner}/{repo}',
        'name': s(manifest.get('name', repo)),
        'description': s(manifest.get('description', '')),
        'version': s(manifest.get('version', '')),
        'author': author,
        'license': s(manifest.get('license', '')),
        'type': rec_type,
        'components': built_components,
        'tests': [
            {
                'name': s(t.get('name')),
                'by': s(t.get('by')),
                'state': s(t.get('state', 'na')),
                'result_or_reason': s(t.get('result_or_reason', '')),
            }
            for t in tests if isinstance(t, dict)
        ],
        'coverage': {
            'label': s(coverage.get('label', '')),
            'assessed': [str(x) for x in coverage.get('assessed', []) if x is not None],
            'not_assessed': [str(x) for x in coverage.get('not_assessed', []) if x is not None],
        },
        'receipts': {
            'commit_sha': commit_sha_val,
            'audited_date': s(receipts.get('audited_date', '')),
            'sandbox': bool(receipts.get('sandbox', False)),
        },
        'portability': s(raw.get('portability', 'claude-only')),
        'adoption': {
            'forks': forks_val,
            'last_commit': last_commit_val,
        },
        'grade': s(grade_obj.get('grade', '')),
        'tags': tags,
        'readmeHead': s(text_digest.get('readme_head', '')),
        'auditedAt': s(meta.get('audited_at', '')),
    }


# ── Main ──────────────────────────────────────────────────────────────────────

LEDGER = Path('../github-claude-plugins/ledger/records')
OUT = Path('data/catalog/audit-entries.json')

records = list(LEDGER.rglob('audit.json'))
print(f'Found {len(records)} audit.json files')

entries = []
skipped_grade = 0
skipped_type = 0
skipped_v1 = 0
errors = 0

for p in records:
    try:
        raw = json.loads(p.read_text())
    except Exception as e:
        errors += 1
        continue

    if raw.get('schema_version') != 2:
        skipped_v1 += 1
        continue

    grade_obj = raw.get('grade', {})
    if not isinstance(grade_obj, dict):
        grade_obj = {}
    if grade_obj.get('grade') != 'CLEARED_STATIC':
        skipped_grade += 1
        continue

    rec_type = raw.get('type', '')
    if not rec_type or rec_type == 'unknown':
        skipped_type += 1
        continue

    entry = transform(raw)
    if entry:
        entries.append(entry)

# Deduplicate by id (keep the most recent auditedAt)
seen: dict = {}
for e in entries:
    id_ = e['id']
    if id_ not in seen or e['auditedAt'] > seen[id_]['auditedAt']:
        seen[id_] = e
entries = list(seen.values())

print(f'CLEARED_STATIC entries: {len(entries)}')
print(f'Skipped: {skipped_grade} grade, {skipped_type} unknown type, {skipped_v1} v1, {errors} errors')
types = Counter(e['typeSlug'] for e in entries)
print('By type:', dict(types.most_common()))

OUT.write_text(json.dumps(entries, indent=2))
print(f'Wrote {len(entries)} entries to {OUT}')
