# U.S. startup discovery foundation — 2026-11-01

`/startups` is the national discovery atlas. `/startups/bay-area` preserves the earlier 12-company evidence study. The national dataset is `public/data/startups/national.json`; filters, cards, state counts and CSV export use that file. No new company has been classified for AI or inferred to have a current job vacancy.

## What was already on this Mac

| Source | Observed contents | Treatment |
| --- | --- | --- |
| `2026-10-31/task/research/yc-all.json` | 6,358 global directory records; snapshot timestamp 2026-10-31T03:22:16.444Z | 3,213 marked active, U.S., for profit; community mirror, independent review pending |
| `2026-10-31/task-2/startup-jobs/data/companies.json` | 161 Boston-area/affiliated companies; 160 source-reviewed; one needs review; 107 reviewed hiring routes; zero verified live vacancies | Separate research layer; nine exact unambiguous domain matches to YC; affiliations never become offices |
| Existing Bear Brown map | 12 Bay Area agent/infrastructure companies; two independently corroborated city/category records | Retained as its own earlier study, with its existing evidence and limitations |
| `startup-jobs/data/discovery/nsf-ma-2023-awards.json` | 135 unique NSF award observations, 133 title-qualified, 113 company UEI groups | Massachusetts award discovery, not national active-startup or hiring evidence |
| `startup-jobs` source/discovery files | MassRobotics, MIT TLO, Engine Ventures, MassVentures, YC Boston and reviewed company pages | Already represented in Boston records or pending review queues; no duplicate bulk import |
| `research-jobs/data/labs.json` | 5,843 research-lab records | Excluded: labs are not startups |
| Kaggle jobs snapshot | At 2026-11-01T18:41:47Z: 3,350 discovered datasets; 2,210 completed, 1,129 pending, 11 failed; 100 local archives awaiting transfer | Inventory only; downloader, ledgers, archives and cluster coordination untouched; figures are a dated snapshot |
| `the-reallocation-engine-fresh/data/sec/form-d/processed/` | May 2026 audit and small samples for 2025 Q2–2026 Q1 | Audit documents previous downloads, but raw/extracted/full processed files are absent in this checkout |
| `Documents/BEAR/PY/sec_*.py` and reallocation-engine SEC scripts | Prior downloader, flattening and matching code | Useful history; no raw Form D ZIPs or ISSUERS.tsv files found in the Documents/Downloads search |
| Downloads CSV directory | Multiple startup/research exports and the earlier Bay Area CSV | Exports of earlier work, not separate unique company universes |

Inventory covers the identified Documents/CoWork/Codex/BEAR projects and Downloads; it is not a claim that every mounted volume or inaccessible directory was searched. Existing SBIR bulk receipt records HTTP/robots 403; the NSF seed-fund history receipt records robots disallow. Those sources were not bypassed or counted as downloaded.

## New official government data

All archive links were enumerated from the official index pages on 2026-11-01, including legacy `_0.zip` filenames. The raw ZIPs are outside this Git repository in the sibling `data/` folder. Each ZIP passed CRC validation and has byte size, SHA-256, source URL and verification timestamp in the committed provenance manifests. The importer rehashes every ZIP before use.

| Source | Coverage | Archives | Compressed bytes | Unique primary issuers | Recent U.S. review candidates |
| --- | --- | ---: | ---: | ---: | ---: |
| [SEC Form D](https://www.sec.gov/data-research/sec-markets-data/form-d-data-sets) | 2008 Q1–2026 Q3 | 75 | 199,270,742 | 365,344 | 25,786 |
| [SEC Form C](https://www.sec.gov/data-research/sec-markets-data/crowdfunding-offerings-data-sets) | 2016 Q2–2026 Q3 | 42 | 13,444,315 | 9,166 | 3,020 |

Combined compressed download: 212,715,057 bytes. The sources overlap on 1,919 primary-issuer CIKs across their complete histories; do not add issuer totals. Form D has 778,966 distinct primary-issuer filing accessions and 483,090 distinct nonempty offering file numbers; Form C has 36,478 distinct filing accessions. No amounts sold are summed. The Form D ledger retains explicit previous-accession links; 9,463 links refer to accessions absent from this bulk history and remain unresolved. These are not all necessarily errors (earlier or unavailable submissions can be referenced). Missing/invalid issuer CIKs are quarantined by accession instead of merged into a fabricated CIK zero; the raw filings and filing ledger remain intact.

These datasets are as-filed, flattened public filings, not a complete census of startups. Many startups never file these forms. They include older businesses, funds, property vehicles and ordinary small businesses. Filing dates do not establish present operations, hiring, office occupancy or a completed financing. The early Form D quarters have sparse coverage. Raw records are not SEC-verified claims, and this work does not imply SEC endorsement. [SEC table definitions](https://www.sec.gov/files/Form_D.pdf) describe the source keys and limitations.

Downloads used the existing project identity `Bear Brown bear@bearbrown.co`, one sequential request per downloader with at least one second between requests, below the [SEC fair-access ceiling](https://www.sec.gov/about/developer-resources). Form D and Form C ran briefly concurrently, at a combined rate below two requests per second. A failed HTTP/ZIP check stops the downloader; it does not evade a denial.

## Filtering and entity resolution

The public company directory has 3,365 records after nine unambiguous exact-domain matches. Domains are normalized only by host case and removal of `www.`; ambiguous shared domains are flagged. No fuzzy name merge links companies to issuers or jobs. Three YC records and two Boston records lack a usable state and stay in the all-states list. YC companies with multiple reported U.S. states count once in each state, but once in the directory total. Boston evidence is retained on matched records without overwriting YC locations with accelerator affiliations.

SEC primary issuers use `(source, CIK)` identity. Latest filing is selected by parsed date and accession as deterministic tie-break. Coissuers, related persons, signatures, home addresses and telephone numbers are not published. Address geography comes only from the issuer table. CIK is a legal-entity identifier, not necessarily a unique commercial brand or operating business. No CIK has been automatically joined to a directory company.

Recent review candidates require a latest filing on or after 2024-01-01 and a state code in the 50 states or DC. Exclusions retain explicit reasons:

- Any historical pooled-fund industry, investment-fund type or pooled-fund flag excludes a Form D issuer conservatively.
- Names containing whole-word `fund`, `spv`, `trust`, `holdings` or `series`, real-estate industry descriptions, and limited partnerships are flagged as ambiguous and held out. This deliberately has false positives and false negatives; excluded operating companies can be restored after review.
- Latest Form C `C-W` or `C-TR` is held out; reporting termination is not proof a company closed.
- Stale, foreign, territory and unknown-state records remain in local review files with reasons, not in state totals.

The resulting 25,786 / 3,020 counts are **review candidates, not approved startups**. Only aggregate SEC counts reach the website. Counts of exclusion reasons overlap. Form C includes restaurants and other small businesses; even non-fund Form D issuers need startup review. The original archives and all latest primary issuers remain available for better filters.

## Geography and future AI work

`us-states.json` derives from [Natural Earth 1:110m admin-1 states/provinces](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_1_states_provinces.geojson), downloaded 2026-11-01. It contains the 50 states plus DC. Properties were reduced to state name/code and reference labels; polygon winding was normalized for D3. [Public domain](https://www.naturalearthdata.com/about/terms-of-use/). Albers USA uses Alaska/Hawaii insets, not a common scale. The coarse boundaries are unsuitable for addresses, parcels, or point-in-polygon adjudication near coasts.

All national `ai_status` values are `unreviewed` with empty `ai_evidence`. A later evidence model should record category (`primarily_ai`, `uses_ai_skills`, `no_ai_evidence`, `unknown`), dated source/quote, employer/domain match, evidence scope, observation versus posting date, expiry, confidence and reviewer. “No AI evidence” is a scoped review outcome, not absence of AI. Do not classify companies from names or fundraising sectors, or assume all job archives are current, licensed alike, or deduplicated.

## Reproduction

Copy committed `provenance/form-d-urls.json` and `form-c-urls.json` to `sec-form-d/urls.json` and `sec-form-c/urls.json` under a local data root, then run:

```sh
python3 scripts/startups/download-sec.py /absolute/data/sec-form-d
python3 scripts/startups/download-sec.py /absolute/data/sec-form-c
python3 scripts/startups/build-national.py --data-root /absolute/data --yc /path/to/yc-all.json --boston /path/to/companies.json
node scripts/startups/validate.mjs
node scripts/startups/validate-national.mjs
python3 scripts/startups/test-national.py
npm run build
```

Input hashes are in `national.json` metadata. The local task also preserves those exact input snapshots. Derived local outputs are `processed/sec-discovery.sqlite`, `form-d-issuer-review.jsonl`, `form-c-issuer-review.jsonl`, and `sec-summary.json`. Rebuilding replaces only the generated SQLite tables and generated review files. No downloader or transfer process is started for Kaggle.

The website build passes; its existing configuration skips global TypeScript checking. A separate `tsc --noEmit` finds six pre-existing errors in blog, sitemap, substack and tools data typing, none in startup-map files. Browser QA verified the source JSON renders, MA filtering yields 64 YC records, search for 1910 yields one, evidence opens, and CSV contains that one MA record with `unreviewed` AI status. SEC D/C layers show 25,786/3,020. Mobile width 390 has no horizontal overflow. Screenshots and logs are in the task's sibling `evidence/` folder. Draft/preview only; no production release.
