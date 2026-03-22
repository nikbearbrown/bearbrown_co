# CLAUDE.md — bearbrown.co

## Who this site is for
Nik Bear Brown — professor, educator, artist, musician, and AI innovator at Northeastern University. Owner of Bear Brown LLC (AI consulting) and connector of organizations to recent engineering grads.

Primary audiences:
- Educators and instructional leaders looking for AI tools
- Conference organizers and editors considering him as a speaker or contributor
- Artists and students he collaborates with
- Organizations seeking AI consulting or engineering talent
- General public who found him via Substack, EdSurge, ISTE+ASCD, or YouTube

## Tech stack
- Next.js (App Router)
- Deployed on Vercel via GitHub repo: nikbearbrown/bearbrown_co
- Tailwind CSS + @tailwindcss/typography (for prose article rendering)
- TypeScript
- next-themes for dark/light mode
- Supabase (PostgreSQL — sections & articles tables)
- adm-zip (server-side Substack ZIP parsing)

## Site structure
1. `/` — Home (business card + Spotify player + AI contact assistant)
2. `/tools` — Tools directory (card grid, Supabase-driven)
3. `/tools/[slug]` — Artifact tool embed page (full-viewport iframe)
4. `/about` — CV / bio page (prose format)
5. `/privacy` — Privacy Policy for Bear Brown LLC
6. `/privacy/cookies` — Cookie Policy for Bear Brown LLC (dedicated page)
7. `/terms-of-service` — Terms of Service for Bear Brown LLC
8. `/substack` — Newsletter hub: card grid of all Substack sections
9. `/substack/[section]` — Section page: description, "Follow on Substack" CTA, chronological article list
10. `/substack/[section]/[slug]` — Full article: attribution banner, prose content, "Subscribe on Substack" footer CTA
11. `/admin/dashboard` — Admin dashboard (protected via `admin_session` cookie)
12. `/admin/dashboard/tools` — Manage tools (link and artifact types)
13. `/admin/dashboard/substack` — Manage Substack sections & import ZIP archives

## Persistent layout (every page)

### Header (`/components/Header/Header.tsx`) — DONE
- Logo: theme-aware SVG (white for dark, black for light)
- Nav: Home (`/`) | Tools (`/tools`) | About (`/about`) | Contact (`mailto:bear@bearbrown.co`)
- Social buttons (top right): GitHub, YouTube, Spotify, Substack — black button style
- Dark/light mode toggle (ThemeToggle component)
- Mobile hamburger menu with backdrop (lg breakpoint)
- Sticky, z-50, backdrop-blur

### Footer (`/components/Footer/Footer.tsx`) — DONE
Four-column grid layout:
- **Company Info:** Bear Brown LLC, 30 N Gould St Ste N, Sheridan WY 82801, bear@bearbrown.co, EIN: 41-4226710
- **Publications:** Links to all 5 Substack publications (Bear Brown Co, Skepticism AI, Theorist AI, Hypothetical AI, Musinique)
- **Connect:** GitHub, YouTube, Spotify, Substack (text links)
- **Legal:** Privacy Policy, Cookie Policy, Terms of Service
- Bottom bar: copyright

### Root layout (`/app/layout.tsx`) — DONE
- ThemeProvider: defaultTheme="light", enableSystem
- Inter font
- Header + main + Footer
- Vercel Analytics
- Muzak component removed from layout

## Home page (`/app/page.tsx`) — DONE
- Left: name (h1), tagline, About Me + Contact buttons (black button style)
- Right: SpotifyPlayer component
- Below fold: AI contact assistant widget (NOT YET BUILT)

## Tools system — DONE

### Database (`tools` table in Supabase)
```sql
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  tool_type TEXT DEFAULT 'link',  -- 'link' | 'artifact'
  url TEXT,                        -- external URL (for link tools, or fallback for artifacts)
  artifact_id TEXT,                -- Claude artifact UUID
  artifact_embed_code TEXT,        -- raw iframe embed (overrides artifact_id if set)
  tags TEXT[],                     -- category tags stored as array
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_tools" ON tools FOR SELECT USING (true);
CREATE POLICY "service_role_tools" ON tools FOR ALL USING (true) WITH CHECK (true);
```

### Tool types
- **link** — External URL tool. Card clicks open URL in new tab.
- **artifact** — Claude Artifact embed. Card clicks go to `/tools/[slug]` which renders the artifact in a full-viewport iframe. Iframe source: `https://claude.site/artifacts/[artifact_id]` or raw `artifact_embed_code` if provided.

### API routes (admin-protected)
- `GET/POST /api/admin/tools` — list & create tools
- `PUT/DELETE /api/admin/tools/[id]` — update & delete tools

### Admin UI (`/app/admin/dashboard/tools/page.tsx`)
- Tool list with name, type badge (Link/Artifact), slug, tags, artifact ID or URL
- "New Tool" button → dialog form with:
  - Name, slug (auto-generated), description
  - Tool type selector (Link / Claude Artifact)
  - Conditional fields: URL for link tools; artifact_id + embed_code + fallback URL for artifacts
  - Tags (comma-separated input, stored as array)
- Edit and delete per tool

### Public pages
- `/tools` — Card grid of all tools. Artifact tools show "Artifact" badge and link to `/tools/[slug]`. Link tools open in new tab.
- `/tools/[slug]` — Full-page artifact embed with title bar (name, description, "Back to Tools" link, optional "Open External" button). Iframe takes full viewport height minus header.

### Initial tools to add via admin:
1. **Subby** — Substack writing assistant (artifact_id: `6dc0c6cf-32e0-4f53-94b9-f6d01cc4df9c`)
2. **CRITIQ** — Peer review & paper development protocol (artifact_id: `a53d969f-5aaf-45f6-9992-2c6a00a4122f`)

## About page (`/app/about/page.tsx`) — DONE
Prose-forward CV format with sections:
- Bio intro (professor at NEU, AI/ML/prompt engineering)
- Academic Role
- Writing & Speaking (EdSurge, ISTE+ASCD)
- Humanitarians AI (501c3, Fellows Program)
- Music & Art (Spotify link)
- Connect (email, GitHub/YouTube/Spotify buttons)

Still needs: Substack link, musinique.com links, Bear Brown LLC details, publications list.

## Legal Pages — DONE
All three pages follow the Humanitarians AI structural template, rewritten for Bear Brown LLC. Each references: Bear Brown LLC (Nik Bear Brown, Sole Member), 30 N Gould St Ste N, Sheridan WY 82801, bear@bearbrown.co, EIN 41-4226710, AI consulting services.

### Privacy Policy (`/app/privacy/page.tsx`)
Sections: introduction, information we collect (contact data, inquiry content, consulting engagement data, analytics), how we use info, sharing (consent, legitimate interests, contract, legal, vital interests), third-party services (Vercel, Supabase, Spotify, Substack, Anthropic, GitHub, YouTube), cookies reference (links to Cookie Policy page), data security, data retention, your privacy rights, children's privacy, changes, contact. Nav: Terms of Service ← → Cookie Policy.

### Cookie Policy (`/app/privacy/cookies/page.tsx`)
Separate dedicated page at `/privacy/cookies`. Sections: what are cookies, cookies we use (table: theme + admin_session), cookies we do NOT use (advertising, remarketing, cross-site tracking, social pixels, individual analytics), third-party cookies (Spotify, Substack, Claude.site with links to their policies), how to manage cookies (browser-specific instructions), Do Not Track, changes, contact. Nav: Privacy Policy ← → Terms of Service.

### Terms of Service (`/app/terms-of-service/page.tsx`)
15 sections: introduction, website purpose, AI consulting services, intellectual property, use license, user conduct, newsletter content (lists all 5 Substack publications), third-party services and links, disclaimer, limitations, indemnification, revisions and errata, governing law (Wyoming), modifications, contact. Nav: Privacy Policy ← → Home.

## AI Contact Assistant (Home page) — NOT YET BUILT
- Embedded Claude-powered chat widget
- Purpose: help visitors answer common questions before emailing bear@bearbrown.co
- System prompt context: Bear is a professor at NEU, builds AI tools for education, speaks at conferences, writes for EdSurge and ISTE+ASCD, runs Humanitarians AI (501c3), runs Bear Brown LLC (AI consulting + engineering grad placement), open to consulting and collaboration
- Calls Anthropic API — auth handled by Claude.ai if published as artifact
- Keep UI minimal: small chat box, not full-page

## Spotify player (`/components/SpotifyPlayer/SpotifyPlayer.tsx`) — DONE
Client component. Randomly picks one artist on mount via `pickRandom()` helper.
"Another artist" button shuffles without repeating. Uses `key={artist.id}` on iframe to force reload.

### All 13 artist IDs:
```typescript
const ARTISTS = [
  { name: 'Nik Bear Brown',         id: '0hSpFCJodAYMP2cWK72zI6' },
  { name: 'Mayfield King',          id: '6vpw3aw6hEJRPHgYGrN3kX' },
  { name: 'Liam Bear Brown',        id: '4SSyKsRubysg99cAIs82uI' },
  { name: 'Tuzi Brown',             id: '5DvRo9Gtg5bxsUUbKQBdg6' },
  { name: 'Newton Willams Brown',   id: '7Ec9DTFD4EMsxdpiiGos2p' },
  { name: 'Parvati Patel Brown',    id: '0tYk1RYgGD7k9MN0bd1p8u' },
  { name: 'Dijit Arjun Bear Brown', id: '55YYr6d7P8x8LVZWaOd5SZ' },
  { name: 'Prarthana Maha Brown',   id: '1sPHt959TSCSgctMB5Xdop' },
  { name: 'Marley Bear Brown',      id: '09UwgY1zJ63aJUkM4xgOb1' },
  { name: 'Humanitarians AI',       id: '3cj3R4pDpYQHaWx0MM2vFV' },
  { name: 'Jingle Yankel',          id: '3T20r0SBgeL2xUUNCRJZHG' },
  { name: 'Muzack',                 id: '4V8CzlAfk1VipGmOx5Hv7o' },
  { name: 'Cletus Bear Spuckler',   id: '2hmp7X5Qx3K1PZAIm2ciUB' },
];
```

## Artist profile links (for About page or footer)
- Nik Bear Brown: spotify/0hSpFCJodAYMP2cWK72zI6 · apple/1779725275 · nikbear.musinique.com
- Mayfield King: spotify/6vpw3aw6hEJRPHgYGrN3kX · apple/1846526759 · mayfield.musinique.com
- Liam Bear Brown: spotify/4SSyKsRubysg99cAIs82uI · apple/1780970474 · liam.musinique.com
- Tuzi Brown: spotify/5DvRo9Gtg5bxsUUbKQBdg6 · apple/1838852692 · tuzi.musinique.com
- Newton Willams Brown: spotify/7Ec9DTFD4EMsxdpiiGos2p · apple/1781653273 · newton.musinique.com
- Parvati Patel Brown: spotify/0tYk1RYgGD7k9MN0bd1p8u · apple/1781528271 · parvati.musinique.com
- Dijit Arjun Bear Brown: spotify/55YYr6d7P8x8LVZWaOd5SZ · apple/1842722191 · dijit.musinique.com
- Prarthana Maha Brown: spotify/1sPHt959TSCSgctMB5Xdop · apple/1840725199 · prarthana.musinique.com
- Marley Bear Brown: spotify/09UwgY1zJ63aJUkM4xgOb1 · apple/1835745524 · marley.musinique.com
- Humanitarians AI: spotify/3cj3R4pDpYQHaWx0MM2vFV · apple/1781414009 · humanitarians.ai
- Jingle Yankel: spotify/3T20r0SBgeL2xUUNCRJZHG · mayfield.musinique.com
- Muzack: spotify/4V8CzlAfk1VipGmOx5Hv7o
- Cletus Bear Spuckler: spotify/2hmp7X5Qx3K1PZAIm2ciUB

## Design direction
- Light mode default (dark mode toggle available)
- Clean, editorial — not a portfolio showoff site
- Typography: Inter font (headings bold tracking-tighter, body clean)
- Color: restrained — chocolate brown primary, crimson red accent, ink/paper palette
- Black button style: `bg-black text-white hover:bg-gray-800` (dark mode: border outline with accent hover)
- No purple gradients, no generic AI aesthetics

## Existing components (do not rebuild)

### ThemeToggle.tsx (`/components/ThemeToggle.tsx`)
Sun/Moon toggle using next-themes. Import and use as-is.

### theme-provider.tsx (`/components/theme-provider.tsx`)
Wrapper around NextThemesProvider. Used in root layout.

### Logo paths (in `/public/svg-logos/`)
- Dark mode: NikBearBrown_white_logo.svg
- Light mode: NikBearBrown_black_logo.svg

### UI components (`/components/ui/`)
60+ shadcn/ui components. PrimaryButton and SecondaryButton exist but home page currently uses inline button styles.

## Substack import system — DONE

### Database (Supabase)
Two tables: `substack_sections` and `substack_articles`. Sections have title, slug, description, substack_url, article_count. Articles belong to a section and store title, subtitle, slug, excerpt, content (HTML), original_url, published_at, display_date. RLS enabled with public read + service role write.

### ZIP parser (`lib/substack-parser.ts`)
Server-side parser using adm-zip. Reads `posts.csv` + HTML files from a Substack export ZIP. Returns parsed posts with title, subtitle, slug, content, publishedAt, displayDate, excerpt (~200 chars plain text), canonicalUrl. Skips drafts and podcasts.

### API routes (all admin-protected via `admin_session` cookie)
- `GET/POST /api/admin/substack/sections` — list & create sections
- `PUT/DELETE /api/admin/substack/sections/[id]` — update & delete sections
- `POST /api/admin/substack/upload` — multipart formData (zip + sectionId), parses ZIP, upserts articles, updates article_count

### Admin UI (`/app/admin/dashboard/substack/page.tsx`)
- Section list with title, slug badge, article count, Substack URL
- "New Section" button → dialog form (title, auto-slug, substack URL, description)
- "Import ZIP" button per section → file upload dialog with drag area
- Edit and delete per section

### Public pages
- `/substack` — hero + card grid of sections (force-dynamic, graceful fallback if Supabase not configured)
- `/substack/[section]` — section hero + "Follow on Substack" CTA + article list
- `/substack/[section]/[slug]` — attribution banner, prose content via `dangerouslySetInnerHTML`, subscribe CTA

### Supabase clients
- `lib/supabase/server.ts` — `getSupabaseAdmin()` uses service role key (server-side only)
- `lib/supabase/client.ts` — `getSupabaseClient()` uses anon key (browser-safe)

### Admin auth
- `lib/admin-auth.ts` — checks for `admin_session` cookie via `cookies()` from `next/headers`
- All `/api/admin/*` routes check this before proceeding

## SEO — DONE
- `app/sitemap.ts` — dynamic sitemap: static pages + all `/substack/*` routes from Supabase. Falls back to static-only if Supabase not configured.
- `app/robots.ts` — allows all, disallows `/admin/` and `/api/`, points to `/sitemap.xml`

## Admin dashboard (`/app/admin/dashboard/`) — DONE
- Layout with tabbed nav (Overview, Tools, Substack)
- Protected pages — requires `admin_session` cookie to use API routes
- Tools management: create/edit/delete tools with link/artifact type support
- Substack management: create/edit/delete sections, import ZIP archives
- Overview is placeholder

## Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (server-side only)
NEXT_PUBLIC_SITE_URL=https://bearbrown.co  # Used in sitemap generation
NEXT_PUBLIC_ANTHROPIC_API_KEY=   # only if embedding AI assistant directly
```

## Deployment
- Push to main → auto-deploys to Vercel
- Domain: bearbrown.co

## What NOT to do
- Do not use localStorage — use React state or sessionStorage
- Do not add analytics or tracking beyond what's already present
- Keep public nav to four items: Home, Tools, About, Contact
- Do not commit .env.local or credentials to git

## User Guide

### Overview

bearbrown.co is Nik Bear Brown's personal site — part business card, part newsletter archive, part tool directory. It runs on Next.js with Vercel auto-deploy. The public site has no login; the admin dashboard is cookie-protected.

---

### For visitors

**Home page** (`/`) — Landing page with a brief intro, "About Me" and "Contact" buttons, and an embedded Spotify player that randomly showcases one of 13 artist profiles. Click "Another artist" to shuffle.

**About** (`/about`) — Prose-format CV covering academic work at Northeastern, writing and speaking credits, Humanitarians AI, music projects, and contact info.

**Tools** (`/tools`) — Placeholder page. Will contain interactive tool cards (Subby, CRITIQ, etc.) once populated.

**Newsletter** (`/substack`) — Card grid of all Substack newsletter sections. Click a section to see its articles listed chronologically. Click an article to read the full post with original Substack attribution.

**Privacy** (`/privacy`) — Privacy policy covering data collection, third-party services, and cookies.

**Dark/light mode** — Toggle via the sun/moon icon in the top-right header. Defaults to light mode.

---

### For the site admin

#### Initial setup (one-time)

1. **Supabase project** — Create a project at supabase.com. Run this SQL in the SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS substack_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  substack_url TEXT NOT NULL,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS substack_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES substack_sections(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT,
  content TEXT,
  original_url TEXT,
  published_at TIMESTAMPTZ,
  display_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, slug)
);

ALTER TABLE substack_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE substack_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_sections" ON substack_sections FOR SELECT USING (true);
CREATE POLICY "public_read_articles" ON substack_articles FOR SELECT USING (true);
CREATE POLICY "service_role_sections" ON substack_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_articles" ON substack_articles FOR ALL USING (true) WITH CHECK (true);
```

2. **Environment variables** — Add to `.env.local` (local dev) and Vercel project settings (production):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://bearbrown.co
```

3. **Admin access** — The admin dashboard is protected by an `admin_session` cookie. There is no login page yet. To access the dashboard:
   - In your browser, open DevTools → Application → Cookies
   - Add a cookie named `admin_session` with any non-empty value for the site domain
   - Navigate to `/admin/dashboard`

#### Managing Substack sections

1. Go to `/admin/dashboard/substack`
2. Click **"New Section"** to create a newsletter section (e.g., "AI in Education")
   - **Title**: Display name shown on public pages
   - **Slug**: Auto-generated from title, used in URLs (e.g., `/substack/ai-in-education`)
   - **Substack URL**: Link to the original Substack (e.g., `https://nikbearbrown.substack.com`)
   - **Description**: Shown on the section page hero and section cards
3. Each section card shows its title, slug badge, article count, and Substack URL
4. Use the **pencil icon** to edit or the **trash icon** to delete (deletes all articles too)

#### Importing Substack articles

1. Export your Substack archive:
   - Go to your Substack → Settings → Exports → "Create new export"
   - Download the ZIP file (contains `posts.csv` + individual `.html` files)
2. In the admin dashboard, click **"Import ZIP"** on the target section
3. Select or drag the ZIP file, then click **"Upload & Import"**
4. The parser reads `posts.csv` for metadata and matches HTML files by slug
   - Skips drafts and podcast-type posts
   - Extracts: title, subtitle, slug, content (HTML), published date, canonical URL
   - Generates a ~200-character plain-text excerpt from each post
5. Articles are upserted — re-importing the same ZIP updates existing articles by slug
6. The section's article count updates automatically

#### How articles appear publicly

- `/substack` — All sections as cards with article counts
- `/substack/[section]` — Section hero with description and "Follow on Substack" button, then a chronological list of articles showing date, title, subtitle, and excerpt
- `/substack/[section]/[slug]` — Full article page with:
  - Attribution banner ("Originally published on Substack" + "View original" link)
  - Back link to the section
  - Full HTML content rendered as prose
  - "Subscribe on Substack" CTA at the bottom

#### SEO

- **Sitemap** (`/sitemap.xml`) — Automatically generated. Includes all static pages (`/`, `/tools`, `/about`) plus all dynamic `/substack/*` routes pulled from Supabase. Falls back to static-only if Supabase is not configured.
- **Robots** (`/robots.txt`) — Allows all crawlers. Blocks `/admin/` and `/api/` paths. Points to the sitemap.

---

### For developers

#### Local development

```bash
npm install
npm run dev        # starts at http://localhost:3000
```

#### Project structure (key paths)

```
app/
  page.tsx                          # Home
  about/page.tsx                    # About / CV
  tools/page.tsx                    # Tools directory (card grid)
  tools/[slug]/page.tsx             # Artifact tool embed page
  privacy/page.tsx                  # Privacy Policy
  privacy/cookies/page.tsx          # Cookie Policy (dedicated page)
  terms-of-service/page.tsx         # Terms of Service
  substack/
    page.tsx                        # Newsletter hub
    [section]/page.tsx              # Section article list
    [section]/[slug]/page.tsx       # Full article
  admin/dashboard/
    layout.tsx                      # Admin layout with tab nav
    page.tsx                        # Admin overview (placeholder)
    tools/page.tsx                  # Tools manager (link + artifact types)
    substack/page.tsx               # Substack section manager
  api/admin/tools/
    route.ts                        # GET/POST tools
    [id]/route.ts                   # PUT/DELETE tool
  api/admin/substack/
    sections/route.ts               # GET/POST sections
    sections/[id]/route.ts          # PUT/DELETE section
    upload/route.ts                 # POST ZIP import
  sitemap.ts                        # Dynamic sitemap generator
  robots.ts                         # Robots.txt generator
components/
  Header/Header.tsx                 # Sticky header with nav + social + theme toggle
  Footer/Footer.tsx                 # 4-column footer (company, publications, social, legal)
  SpotifyPlayer/SpotifyPlayer.tsx   # Random artist Spotify embed
  ThemeToggle.tsx                   # Dark/light mode toggle
  theme-provider.tsx                # next-themes wrapper
  ui/                               # 60+ shadcn/ui components
lib/
  utils.ts                          # cn() helper (clsx + tailwind-merge)
  admin-auth.ts                     # admin_session cookie check
  substack-parser.ts                # Substack ZIP parser (adm-zip)
  supabase/
    server.ts                       # Supabase admin client (service role)
    client.ts                       # Supabase browser client (anon key)
```

#### Adding content

- **New Substack section**: Use the admin UI at `/admin/dashboard/substack`, or insert directly into the `substack_sections` table
- **New tool**: Use the admin UI at `/admin/dashboard/tools`. Choose "Link Tool" for external URLs or "Claude Artifact" to embed an artifact at `/tools/[slug]`
- **New artist to Spotify player**: Add to the `ARTISTS` array in `/components/SpotifyPlayer/SpotifyPlayer.tsx`

#### Deployment

Push to `main` on GitHub → Vercel auto-deploys. Make sure Vercel environment variables match `.env.local`.

---

## Standing Instructions

After every session, always:
1. Update CLAUDE.md to reflect any changes made — check `git log` and `git diff` to see exactly what was changed, do not ask.
2. Commit and push all changes to main with a descriptive commit message.

## Remaining work (in priority order)
1. Add Subby + CRITIQ tools via admin dashboard (artifact IDs in Tools system docs above)
2. Build AI contact assistant widget on home page
3. Flesh out About page (Substack, musinique.com, Bear Brown LLC, publications)
4. Add admin login page (currently admin_session cookie must be set manually)
5. Add Substack nav link to public header or About page (Substack button already in social links)
