# CLAUDE.md — bearbrown.co

## What the site is

A curated Claude plugin/skill directory — a few dozen entries that earned their place, every listing tested, every verdict shown — with the consulting business as an interior page. The verdicts are the product; the listings are where the verdicts live.

## Tech stack
- Next.js 15 (App Router)
- Deployed on Vercel via GitHub repo: nikbearbrown/bearbrown_co
- Tailwind CSS + @tailwindcss/typography
- TypeScript
- next-themes (defaultTheme="light", enableSystem=false)
- Fuse.js (client-side catalog search)
- Vercel Blob (@vercel/blob) for image uploads
- Neon (serverless PostgreSQL via @neondatabase/serverless) — blog, tools, videos, substack
- Tiptap (ProseMirror rich text editor for blog)
- D3.js (data visualizations embedded in blog posts)
- adm-zip (server-side Substack ZIP parsing)

## Information architecture

| Route | What it is |
|---|---|
| `/` | **THE DIRECTORY** — thesis hero, real stats bar, card grid with Fuse.js search and tier/kind filters |
| `/plugins/[slug]` | **Verdict page** — what it is, tier WITH RECEIPTS (sha, date, each check), install command with copy button, repo link |
| `/criteria` | **Listing criteria** — what we test, what fails, why breadth is not the goal. The trust signal no big directory can copy. |
| `/consulting` | **Consulting** — the manifesto (Bear Brown Method, The Belief, Three Ways to Work, method TOC). Was the old home. |
| `/essays` | **Essays** — surface for the five Substack publications |
| `/videos` | Videos from @NikBearBrown (Neon-driven) |
| `/blog` | Blog feed (Neon-driven, Tiptap editor) |
| `/about` | CV / bio |
| `/method/[slug]` | Method content pages (linked from /consulting) |
| `/tools` | Tools directory (Neon + filesystem artifacts) |
| `/notes` | Notes browser (filesystem-driven) |
| `/dev` | Dev docs browser (filesystem-driven) |
| `/talks` | Talks browser (filesystem-driven) |
| `/books` | Books browser (filesystem-driven) |
| `/substack/[section]/[slug]` | Substack articles (Neon-driven) |
| `/admin/*` | Admin dashboard (password-protected) |

## Persistent layout

### Header (`/components/Header/Header.tsx`)
Primary nav: **Plugins** (`/`) | **Criteria** (`/criteria`) | **Videos** (`/videos`) | **Essays** (`/essays`) | **Consulting** (`/consulting`)
Secondary: divider + **Blog** (`/blog`)
Right: GitHub, YouTube, Substack pills · ThemeToggle · mobile hamburger
Uses `--p-bg` background, `--p-border` border-bottom.

### Footer (`/components/Footer/Footer.tsx`)
Four-column grid: Bear Brown LLC address/contact · Publications (5 Substack links) · Connect (GitHub, YouTube, Spotify, Substack) · Legal (Privacy, Cookies, ToS)
Uses shadcn/ui variables (bg-background, text-muted-foreground) which pick up the new light-mode cream values.

## Design system

The site uses two CSS variable families, both defined in `app/globals.css`.

### `--p-*` — Print design system (directory, catalog pages)
Light is the brand default. Cream page, warm ink, terracotta as decoration.

| Variable | Light value | Dark value | Role | WCAG on cream |
|---|---|---|---|---|
| `--p-bg` | #FAF9F5 | #1a0a00 | Page background | — |
| `--p-bg-card` | #F3EBDD | #2a1200 | Card surface | — |
| `--p-ink` | #3D3929 | #F0E6D0 | Primary text | 12.8:1 ✓ AAA |
| `--p-ink-soft` | #6B6047 | #DFC99A | Secondary text | 6.1:1 ✓ AA |
| `--p-ink-muted` | #9E8C6C | #B8860B | Labels, tertiary | 3.4:1 ✓ AA large only |
| `--p-terra` | #D97757 | #D97757 | **DECORATION ONLY** | 2.96:1 ✗ below 3:1 |
| `--p-blue` | #0072B2 | #4DAAF0 | Meaning color | 4.92:1 ✓ AA |
| `--p-vermilion` | #D55E00 | #E07040 | Meaning color | 3.67:1 ✓ AA large |
| `--p-border` | rgba(61,57,41,0.12) | rgba(200,169,110,0.14) | Subtle dividers | — |
| `--p-border-strong` | rgba(61,57,41,0.24) | rgba(200,169,110,0.28) | Stronger borders | — |

**Terracotta rule:** `--p-terra` (#D97757) is measured at 2.96:1 on cream — below the 3:1 WCAG graphic/UI-component threshold. It is used only for decoration: eyebrow labels, hover states, left-border accents, the verdict rule. It **never** carries meaning alone. Every use that needs to mean something uses a real WCAG-passing color OR accompanies a text label.

**Greyscale gate (build requirement):** After any design change, desaturate a rendered page. If tier badges (Excellent/Strong/Promising) or pass/fail check marks become ambiguous, the design fails. Shape + label always accompany color — ◆ EXCELLENT / ● STRONG / ▲ PROMISING are the canonical tier identifiers.

**Meaning colors (tier badges, pass/fail marks):**
- Excellent ◆: `--p-blue` #0072B2 (4.92:1) — with border
- Strong ●: `--p-ink` #3D3929 (12.8:1) — with border
- Promising ▲: `--p-vermilion` #D55E00 (3.67:1) — with border
- Pass ✓: `--p-blue`
- Fail ✗: `--p-vermilion`
- Note →: `--p-ink-muted`

### `--m-*` — Manifesto variables (consulting, method pages)
Legacy family. Picked up by: `/consulting`, `/method/[slug]`, and any other manifesto-style pages.
In light mode: `--m-bg` = #FAF9F5, `--m-text-primary` = #3D3929, `--m-accent` = #8B3A0F.
In dark mode: `--m-bg` = #1a0a00, `--m-text-primary` = #F0E6D0.

### Typography
- Display/serif: EB Garamond (`var(--font-serif)`, `--font-garamond` CSS variable)
- UI/chrome: Inter (`var(--font-sans)`, `--font-inter` CSS variable)
Both loaded via `next/font/google` in `app/layout.tsx`.

## The catalog (`data/catalog/`)

The catalog is versioned in the repo. No database — it's TypeScript files.

### Files
- `data/catalog/types.ts` — TypeScript types for `CatalogEntry`, `Audit`, `Tier`, etc.
- `data/catalog/entries.ts` — All entries. Exports `getEntries()`, `getEntry(slug)`, `CATALOG_META`.

### `CatalogEntry` schema
```typescript
{
  slug: string
  name: string
  repoUrl: string
  description: string           // one sentence
  installCommand: string        // the command users run
  audit: {
    sha: string                 // full HEAD sha at audit time
    date: string                // YYYY-MM-DD
    installs: 'pass' | 'fail'
    installNote?: string
    riskScan: 'clean' | 'flagged'
    riskNote?: string
    kind: 'code-backed' | 'prompt-only'
    proseLines: number
    codeLines: number
    proseToCodeRatio: number
  }
  tier: 'excellent' | 'strong' | 'promising'  // derived from audit, never hand-waved
  dupes?: { clusterNote: string }
  video: { youtubeId: string; title: string } | null  // null until teardown ships
  verdict: string               // 2-4 sentences of plain prose
  tags: string[]
}
```

### Hard rules
- **No audit, no listing.** An entry with no completed audit does not ship. There is no "pending" tier.
- **No failed installs.** If the install check fails, find a different entry.
- **Every quality find gets a teardown video.** The `video` field is ready for the `youtubeId` when each episode ships.
- Tiers are derived from audit fields. Excellent = clean install + clean/disclosed risk + code-backed + honest claims + maintained.

### Adding an entry
1. Clone the repo to a temp location
2. Record HEAD sha: `git rev-parse HEAD`
3. Record last commit date: `git log -1 --format="%ai"`
4. Count prose lines: `find . -name "*.md" -o -name "*.txt" | xargs wc -l | tail -1`
5. Count code lines: `find . -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.sh" | xargs wc -l | tail -1`
6. Run the install in a sandbox; record pass/fail
7. Audit all hook scripts for outbound calls, filesystem writes, exec patterns
8. Write the `CatalogEntry` in `data/catalog/entries.ts`

## Key components

### `CatalogSearch` (`/components/CatalogSearch/CatalogSearch.tsx`)
Client component. Fuse.js search across name/description/verdict/tags, threshold 0.35. Tier and kind filters as pill buttons. Active state = ink background + cream text (distinguishable in greyscale by fill, not just color). Empty state message varies: "no entries yet" vs "no matches."

### `CatalogCard` (`/components/CatalogCard/CatalogCard.tsx`)
Displays: name (serif), tier badge (shape+label+color), description, verdict snippet (truncated to 160 chars, left-bordered terracotta), tags, audit date or teardown link. All rendered server-side; no client JS needed.

### `InstallCommand` (`/components/InstallCommand/InstallCommand.tsx`)
Client component. Dark ink background, monospace command text, "Copy" button that reads "Copied!" for 1.8s. Used on `/plugins/[slug]`.

## Search

At catalog scale (dozens of entries), no infrastructure is needed. `CatalogSearch` is a single client-side component with Fuse.js. It is NOT a full-text search index — it matches against the static catalog entries.

## Tools system (unchanged)
Neon + filesystem artifacts. See the tools database schema below. Admin at `/admin/dashboard/tools`.

### Database (`tools` table in Neon PostgreSQL)
```sql
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  tool_type TEXT DEFAULT 'link',
  claude_url TEXT,
  chatgpt_url TEXT,
  artifact_id TEXT,
  artifact_embed_code TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tool types
- **link** — External URL tool (database-driven). Card clicks open URL in new tab.
- **artifact** — HTML file in `public/artifacts/` (filesystem-driven). No database entry needed.

## Videos system (unchanged)
Neon-driven. See the videos database schema:

```sql
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_id TEXT NOT NULL,
  tags TEXT[],
  pinned BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Blog system (unchanged)
Neon-driven, Tiptap editor. See the blog_posts table:

```sql
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT NOT NULL UNIQUE,
  byline TEXT,
  cover_image TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Filesystem-driven systems (unchanged internals)
- `/dev` — grouped browser of `public/dev/` HTML files
- `/notes` — grouped browser of `public/notes/` HTML files
- `/talks` — grouped browser of `public/talks/` HTML files
- `/books` — browser of `public/books/*/book.json` + chapter HTML files
- All use `lib/html-meta.ts` (`scanHtmlDir`, `scanHtmlSubdirs`) to extract title/description/keywords

## Admin (unchanged)
- Protected by `middleware.ts` — redirects to `/admin/login` without valid `admin_session` cookie
- Tabs: Overview, Blog, Tools, Dev, Notes, Videos, Substack

## Environment variables
```
DATABASE_URL=                    # Neon PostgreSQL connection string
ADMIN_PASSWORD=                  # Password for /admin/login
NEXT_PUBLIC_SITE_URL=https://bearbrown.co
BLOB_READ_WRITE_TOKEN=           # Vercel Blob token
NEXT_PUBLIC_GA_ID=               # Google Analytics (optional)
YOUTUBE_API_KEY=                 # YouTube Data API v3 (video import)
GITHUB_READ_TOKEN=               # Read-only PAT for nikbearbrown/github-claude-plugins (audit ingest)
```

`GITHUB_READ_TOKEN` must be a fine-grained GitHub PAT scoped to `nikbearbrown/github-claude-plugins`
with **Contents: Read** permission only. Add it to Vercel project env vars (Production + Preview).
Without it the `/claude/[type]` pages still render — they show only illustrative examples.

## Deployment
- Push to main → auto-deploys to Vercel
- Domain: bearbrown.co

## Audit ingest system (`lib/ingest/`)

Turns live `schema_version:2` records from the auditor box into page data for `/claude/[type]/[slug]`.

| File | Role |
|---|---|
| `scripts/ingest-to-file.mjs` | **Run locally** to regenerate `data/catalog/audit-entries.json` |
| `data/catalog/audit-entries.json` | **Pre-generated, committed** — primary data source at build time (no API calls) |
| `lib/ingest/github.ts` | Shard-aware GitHub walk + blob fetch (fallback when JSON file absent) |
| `lib/ingest/transform.ts` | Raw JSON → `AuditEntry`; keyword field/stack enrichment |
| `lib/ingest/index.ts` | `getAllAuditEntries()` — reads static file first, falls back to GitHub |
| `data/catalog/audit-entry.ts` | `AuditEntry` TypeScript type (schema_version:2 shape) |

### Regenerating the catalog

When new audit records have been posted to the results repo, run locally:
```bash
node scripts/ingest-to-file.mjs
```
This reads `GITHUB_READ_TOKEN` from `.env.local`, walks the newest 3 days of ledger records, filters to `CLEARED_STATIC` grade only (REJECTs and DEFERREDs are excluded — they failed eligibility/dedup/secret gates), and writes `data/catalog/audit-entries.json`. Commit the updated file, then deploy.

### Nightly auto-refresh

`.github/workflows/refresh-audit-entries.yml` runs `ingest-to-file.mjs` at 04:00 UTC daily, commits the updated JSON if it changed, and pushes — triggering a new Vercel deploy. Requires `AUDIT_READ_TOKEN` in the repo's GitHub Actions secrets (same fine-grained PAT as `GITHUB_READ_TOKEN`, scoped to `nikbearbrown/github-claude-plugins` with Contents: Read).

The Vercel build reads the committed JSON file — no GitHub API calls at build time.

### AuditEntry URL mapping
- Record `id` field: `owner__repo` (double underscore, the auditor's slug separator)
- URL slug: `__` → `--` (e.g. `gomarble-ai--marketing-agent`)
- URL type: pluralized (`skill`→`skills`, `mcp-server`→`mcp-servers`, `plugin`→`skills`)
- Detail URL: `/claude/{typeSlug}/{urlSlug}`

### Pages that consume real entries
- `/claude/[type]/page.tsx` — shows real entries above illustrative examples
- `/claude/[type]/[slug]/page.tsx` — real entry detail OR illustrative sample (real wins)

### What NOT to do with the ingest
- Never hardcode `GITHUB_READ_TOKEN` — read from `process.env.GITHUB_READ_TOKEN` only
- Never contact the auditor box from the site — read-only from the public results repo
- Never fabricate fields the record lacks — missing data renders as absent, not invented
- Never block a build on ingest failure — empty result array is a valid state
- Never delete `data/catalog/audit-entries.json` — it is the primary data source for the build

## What NOT to do
- Do not add entries to the catalog without a completed audit (sha, date, install check, risk scan)
- Do not use color alone to convey tier or pass/fail — always pair with shape + label
- Do not use terracotta (#D97757) for anything meaning-bearing — it is below WCAG 3:1 on cream
- Do not add a "pending" tier — the site's thesis is verification; an unaudited entry cannot ship
- Do not rebuild the blog/tools/Neon internals — update their chrome only
- Do not commit .env.local or credentials to git
- Do not push without Bear's explicit instruction

## Standing instructions
After every session, update CLAUDE.md to reflect any changes (check `git log` and `git diff` — do not ask).
