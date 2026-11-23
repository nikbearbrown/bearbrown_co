#!/usr/bin/env python3
"""Download the links captured from the official SEC index, with resumable receipts.

Usage: python3 scripts/startups/download-sec.py /absolute/path/to/sec-form-d
The input directory must contain urls.json captured from the official index.
Raw archives stay outside the website. No extraction or personal-data publication.
"""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from datetime import datetime, timezone
from urllib.parse import urlparse
import zipfile

root = Path(sys.argv[1])
ua = os.environ.get('SEC_USER_AGENT', 'Bear Brown bear@bearbrown.co')
urls = json.loads((root / 'urls.json').read_text())
form_c = root.name == 'sec-form-c'
receipts = []
(root / 'raw').mkdir(exist_ok=True)
for url in urls:
    if urlparse(url).hostname != 'www.sec.gov':
        raise ValueError('Only official SEC archive links are accepted')
    dest = root / 'raw' / Path(urlparse(url).path).name
    receipt = {'url': url, 'file': str(dest.relative_to(root))}
    try:
        if not dest.exists():
            temp = dest.with_suffix('.part')
            subprocess.run(['curl', '--silent', '--show-error', '--fail', '--location',
                            '--max-time', '90', '-A', ua, url, '-o', str(temp)], check=True)
            with zipfile.ZipFile(temp) as z:
                assert z.testzip() is None
                assert any(n.lower().endswith('.tsv') for n in z.namelist())
            temp.rename(dest)
        with zipfile.ZipFile(dest) as z:
            assert z.testzip() is None
        receipt.update(status='verified', bytes=dest.stat().st_size,
                       sha256=hashlib.sha256(dest.read_bytes()).hexdigest(),
                       verified_at=datetime.now(timezone.utc).isoformat())
    except Exception as error:
        receipt.update(status='failed', error=str(error))
    receipts.append(receipt)
    (root / 'manifest.json').write_text(json.dumps({'source': 'https://www.sec.gov/data-research/sec-markets-data/' + ('crowdfunding-offerings-data-sets' if form_c else 'form-d-data-sets'),
        'user_agent': ua, 'archives': receipts}, indent=2) + '\n')
    print(f'{len(receipts)}/{len(urls)} {dest.name}: {receipt["status"]}', flush=True)
    # One request at a time and at least one second between requests.
    time.sleep(1)
    if receipt['status'] == 'failed':
        print('Stopped on failure; rerun only after resolving the response.', flush=True)
        sys.exit(1)
