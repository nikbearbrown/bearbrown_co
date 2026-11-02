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

Inventory covers the identified Documents/CoWork/Codex/BEAR projects and Downloads; it is not a claim that every mounted volume or inaccessible directory was searched. The Kaggle manifest also has 11 startup-related dataset-name matches (including `joebeachcapital/startups` and `chickooo/top-tech-startups-hiring-2023`). These are metadata leads with mixed licenses, not validated company counts; their archive presence and transfer state must be checked before use. No archive was unpacked or classified. Existing SBIR bulk receipt records HTTP/robots 403; the NSF seed-fund history receipt records robots disallow. Those sources were not bypassed or counted as downloaded.

## New official government data

All archive links were enumerated from the official index pages on 2026-11-01, including legacy `_0.zip` filenames. The raw ZIPs are outside this Git repository in the sibling `data/` folder. Each ZIP passed CRC validation and has byte size, SHA-256, source URL and verification timestamp in the committed provenance manifests. The importer rehashes every ZIP before use.

| Source | Coverage | Archives | Compressed bytes | Unique primary issuers | Recent U.S. review candidates |
| --- | --- | ---: | ---: | ---: | ---: |
| [SEC Form D](https://www.sec.gov/data-research/sec-markets-data/form-d-data-sets) | 2008 Q1–2026 Q3 | 75 | 199,270,742 | 365,344 | 25,786 |
| [SEC Form C](https://www.sec.gov/data-research/sec-markets-data/crowdfunding-offerings-data-sets) | 2016 Q2–2026 Q3 | 42 | 13,444,315 | 9,166 | 3,020 |

Combined compressed download: 212,715,057 bytes. The sources overlap on 1,919 primary-issuer CIKs across their complete histories; do not add issuer totals. Form D has 778,966 distinct primary-issuer filing accessions and 483,090 distinct nonempty offering file numbers; Form C has 36,478 distinct filing accessions. No amounts sold are summed. The Form D ledger retains explicit previous-accession links; 9,463 links refer to accessions absent from this bulk history and remain unresolved. These are not all necessarily errors (earlier or unavailable submissions can be referenced). Two Form C rows with missing/invalid issuer CIKs are quarantined by accession instead of merged into a fabricated CIK zero; the raw filings and filing ledger remain intact.

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

## Street-map and affiliation update — 2026-11-02

The primary company view now uses Leaflet 1.9.4 and normal interactive OpenStreetMap raster tiles, following the existing `jobs.humanitarians.ai/ecosystem` implementation (`jobs-marker-scale/components/EntityMapCanvas.tsx`). The site retains its cream, warm ink, green and rust palette. SEC research stays in separate D3 state layers. No production release is authorized.

`locations.json` is a separate evidence layer; original directory location claims are unchanged. It contains:

- **63 reviewed address records**, matched by exact, unambiguous normalized website host against the current ecosystem snapshot. Company `kind=startup` is an upstream category, not confirmation of startup status. Coordinates, precision, source URLs, review dates, roles, notes and source hashes are retained verbatim. There are 42 unique positions; shared addresses are never jittered. The largest shared position has ten companies, all selectable in the sidebar. Some coordinates are Census street-range interpolations, not rooftops or independently audited occupancy.
- **160 city reference points** from the official [GeoNames cities15000 download](https://download.geonames.org/export/dump/), retrieved 2026-11-02; [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Exact primary/ASCII city name plus state matches only; explicit `New York → New York City` and `Washington DC → Washington` spelling aliases. Ambiguous or missing matches remain unresolved. These are approximate city positions, not company coordinates. Boston city claims can represent affiliations. City circles open accessible individual-company lists; zooming never manufactures office locations.
- **3,348 distinct companies** with address or city geography; **17 unplaced** companies remain searchable in the directory. Address evidence takes precedence over city groups for the same entity. Multiple reported cities may share an entity, but sidebar, density and hub totals use unique entity IDs.

The 2025 Census Gazetteer was also downloaded locally for evaluation. Its San Francisco internal point lies offshore because the administrative geography includes islands/water. It is not used in the website; GeoNames supplies the city reference layer instead. Raw upstream snapshots remain outside Git; committed reduced source extracts plus SHA-256 receipts support reproducible derivation.

### Calculated opening view

Evaluate every one of the 160 matched city reference points. For each, count unique directory company IDs within **25 km great-circle distance**, using the reviewed address when present and city reference coordinates otherwise. Choose the greatest count; ties use ascending GeoNames ID. This yields **South San Francisco, CA (37.65466, -122.40775), 2,117 unique companies**, maximum zoom 11, fitting the 25 km area to the viewport. This is a concentration of records in a YC-heavy sample, not real-world startup density or a comprehensive census. The map viewport count differs from the circular calculation because a viewport is rectangular and responsive. The top ten results and exact calculation description are published in location metadata.

Hub shortcuts use source-backed central city points and documented regional radii for unique-count badges (baseline before filters): Bay Area 80 km / 2,123; Seattle 50 km / 56; Los Angeles 60 km / 133; Austin 45 km / 59; Boston/Cambridge 40 km / 211; New York 40 km / 542; Miami 40 km / 25; Chicago 40 km / 18. Miami and Chicago are additional represented hubs. Counts are not metropolitan statistical area definitions and can overlap. Hub buttons pan/zoom while preserving program/search filters.

### Many-to-many affiliations

`affiliations.json` stores evidence edges by company ID and program ID, with source link, observed date, original cohort label, nullable exact start/end dates, and affiliation type. Filter options are generated only from supported accelerator/incubator records: **YC 3,213** and **MassRobotics residency 78**. Three entities have both, so the union is **3,288**, never 3,291. Selection is OR across programs and AND with other filters. Existing YC season/year batch labels are retained; no exact cohort dates are invented. **Engine Ventures 31** portfolio relationships appear in profiles explicitly as investor relationships, not accelerator options. Missing affiliations mean unknown. No supported StartX or Alchemist records were identified in the existing snapshots, so neither is offered as a filter. No additional accelerator dataset was ingested. To expand, add evidence edges and a typed program record; never create another company solely for another program.

Rebuild the two new public layers from the committed extracts:

```sh
python3 scripts/startups/build-locations.py
python3 scripts/startups/build-affiliations.py
python3 scripts/startups/test-locations.py
```

To refresh extracts from already acquired snapshots, use `build-locations.py --ecosystem PATH --cities PATH` and `build-affiliations.py --yc PATH`. `location-sources/addresses.json`, `cities.json` and `yc-cohorts.json` preserve input provenance. No AI labels or job evidence were changed. OpenStreetMap attribution remains visible; tiles use standard browser caching without bulk/prefetch requests.

### Verification of the street-map update

Production build and seven focused Python tests pass, along with the existing national data/geography validator. Separate TypeScript checking still reports the six unrelated baseline errors and no startup-map errors. The protected Vercel preview was opened using the existing signed-in Chrome session, without changing deployment protection. At 1280×1000 and 390×844, street tiles load and there is no horizontal page overflow. All eight hub controls change the view; city circles expose individual records; shared addresses expose ten Boston and eight Cambridge companies; profiles show address-source links, geocoding precision and residency/YC cohort evidence. Selecting both programs yields 3,288 distinct records. Searching Cerulion yields one entity with both YC Summer 2024 and MassRobotics evidence. No browser runtime errors were recorded during those checks. A keyboard Enter inconsistency found in QA was corrected with an explicit Enter/Space handler and live sidebar announcements.

A temporary-share-link tool request was rejected by automatic approval review because a bearer link would broaden preview access. It was not retried or bypassed. Testing continued through existing account authentication; no new share link or protection change was needed. Screenshots and build/typecheck logs are retained in the sibling task `evidence/` folder.

Responsive QA also caught a fixed-zoom opening view that could exclude San Francisco’s city point at phone width. The opening view now fits the calculated 25 km area with padding and a maximum zoom of 11, so the dense city group remains visible on narrow screens.

## Company location enrichment — 2026-11-02

This pass inspected 516 existing companies, prioritizing SEC match candidates, the Bay Area, and major hubs. No additional companies or accelerator datasets were imported. Official company-site navigation was collected with robots checks, conservative per-host pacing, and no access-control bypass. Full HTML receipts, hashes and geocoder responses remain in the local `../data/location-enrichment/` research folder; the repository contains reduced factual evidence and review decisions. The interrupted review append was checked before resuming: it had not executed. The append used evidence-ID deduplication; the final manifest has 346 distinct candidates, 313 accepted and 33 rejected. Rejected examples include government complaint addresses, an example invoice, third-party reseller addresses and rental properties.

Rebuild, without network or private local data:

```sh
python3 scripts/startups/build-enrichment.py
python3 scripts/startups/build-locations.py
python3 scripts/startups/test-enrichment.py
python3 scripts/startups/test-locations.py
python3 scripts/startups/test-national.py
node scripts/startups/validate-national.mjs
```

Refreshing from research receipts is an explicit separate operation (`build-enrichment.py --refresh`). `enrichment-review.json` preserves the company/evidence ID, source URL/hash, observation/review date, address role, requested precision, decision and conflict/history notes. Raw source excerpts are deliberately omitted. `enrichment-coordinates.json` preserves only needed official Census matches, ZCTA reference coordinates and observed careers navigation links. All accepted evidence stays in profiles even when it cannot produce a trustworthy map point.

141 unique reviewed street candidates were submitted to the official Census geocoder. 114 returned one match whose street number, street-name tokens, state and ZIP agreed with the evidence; 27 were absent or failed these checks. The coordinate is street-range interpolation, not a rooftop, occupancy check or proof of headquarters. Legal, privacy and mailing addresses are deliberately coarsened to a Census 2025 ZCTA internal/reference point where available. These are **ZIP-area reference points**, not exact USPS boundaries or office pins. Conflicting ZIP evidence and historical sources do not become unsupported coordinates. The ZCTA archive SHA-256 and official URL are retained. Government sources: [Census geocoding API](https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html), [2025 ZCTA Gazetteer](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2025_Gazetteer/2025_Gaz_zcta_national.zip).

Coverage now reconciles to all 3,365 unique companies:

| Best mapped precision | Companies | Change |
| --- | ---: | ---: |
| Reported street-address evidence | 132 | +69 from 63 |
| Approximate ZIP-area reference | 130 | +130 |
| City reference only | 3,086 | -199 |
| Unplaced | 17 | unchanged |

There are 294 reported site/reference entries: 163 street addresses and 131 ZIP areas. Distinct publicly reported offices, branches, stores and facilities remain separately positioned; company totals are deduplicated. Existing ecosystem evidence accounts for 63 site entries; company-website evidence accounts for 231. Near-identical geocodes for the same company/building are merged within 40 m only when the street number agrees. ZIP entries for a company are suppressed on the map when street evidence exists; all publication evidence remains in its profile. This avoids a mailing ZIP masquerading as an additional office. Older ecosystem address evidence is preserved as reported evidence, not asserted to establish current occupancy.

Official-site navigation supplied careers links for 336 companies. The link's discovery source, hash and observation date are retained; neither vacancies nor AI requirements have been verified. All 3,365 AI statuses remain unreviewed. No SEC name-only match was promoted: the 209 local SEC address candidates include shared platform domains and legal-name ambiguity and still require entity resolution. Form D/C state-level research layers remain separate.

The default map shows address and ZIP circles. City groups are optional, initially off; all records remain searchable in the directory. Shared positions enumerate all companies without invented offsets. Profiles show website, all address evidence and roles, dated sources, careers navigation, known many-to-many affiliations and unknown AI status. The state filter is explicitly labeled **Directory-reported state**; it does not silently reinterpret older directory claims using branches.

The opening area is recomputed from all located records, counting each company once within each 25 km region, using reported sites first, ZIP-area evidence next and city points otherwise. The current winner is Alameda, CA, with 2,083 unique companies within 25 km. This is a sampling concentration dominated by the YC collection, not a claim about real-world comprehensive startup density. The maximum changes when coarse city assignments gain more precise evidence.

Validation for this update: 11 Python tests pass across national data, location and enrichment suites; national source/state/SEC reconciliation passes. Production build passes (1,993 pages). Standalone TypeScript checking reports the same six pre-existing errors in blog/sitemap/substack/tools and no startup-component errors; the existing Next.js configuration skips type/lint validation, so the build alone is not claimed as a type check. Local Chrome testing at 1280×1000 and 390×844 confirmed individual selection, Enter/Space activation, all 10 entities at 12 Channel Street, city-layer toggling, source/careers visibility, searchable evidence, OR affiliation union of 3,288 without duplicates, loaded OSM tiles and no horizontal overflow or browser errors. Mobile tooltip wrapping was corrected during this review. Raw collected pages and ongoing unrelated download/transfer work were left untouched. Available disk space was about 120 GiB before preview publication.
