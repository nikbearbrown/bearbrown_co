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
- Tailwind CSS
- TypeScript
- next-themes for dark/light mode

## Site structure — four pages only
1. `/` — Home (business card + Spotify player + AI contact assistant)
2. `/tools` — Tools directory (placeholder — card grid coming)
3. `/about` — CV / bio page (prose format)
4. `/privacy` — Privacy policy (static)

## Persistent layout (every page)

### Header (`/components/Header/Header.tsx`) — DONE
- Logo: theme-aware SVG (white for dark, black for light)
- Nav: Home (`/`) | Tools (`/tools`) | About (`/about`) | Contact (`mailto:bear@bearbrown.co`)
- Social buttons (top right): GitHub, YouTube, Spotify — black button style
- Dark/light mode toggle (ThemeToggle component)
- Mobile hamburger menu with backdrop (lg breakpoint)
- Sticky, z-50, backdrop-blur

### Footer (`/components/Footer/Footer.tsx`) — DONE
- Social links: GitHub, YouTube, Spotify (text links, not icons)
- Privacy Policy link
- Copyright: Bear Brown, LLC

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

## Tools directory (`/app/tools/page.tsx`) — PLACEHOLDER
Currently a placeholder page. Needs to be populated with tool cards.

### Tools to add (2 so far):
1. **Subby** — Substack writing assistant
   - iframe: `<iframe src="https://claude.site/public/artifacts/6dc0c6cf-32e0-4f53-94b9-f6d01cc4df9c/embed" title="Subby" width="100%" height="600" frameborder="0" allow="clipboard-write" allowfullscreen></iframe>`

2. **CRITIQ** — Peer review & paper development protocol
   - iframe: `<iframe src="https://claude.site/public/artifacts/a53d969f-5aaf-45f6-9992-2c6a00a4122f/embed" title="CRITIQ" width="100%" height="600" frameborder="0" allow="clipboard-write" allowfullscreen></iframe>`

Card fields: name, short description, iframe embed or link, category tag.
Adding more tools later = adding a new object to a tools data array. Keep it data-driven.

## About page (`/app/about/page.tsx`) — DONE
Prose-forward CV format with sections:
- Bio intro (professor at NEU, AI/ML/prompt engineering)
- Academic Role
- Writing & Speaking (EdSurge, ISTE+ASCD)
- Humanitarians AI (501c3, Fellows Program)
- Music & Art (Spotify link)
- Connect (email, GitHub/YouTube/Spotify buttons)

Still needs: Substack link, musinique.com links, Bear Brown LLC details, publications list.

## Privacy Policy (`/app/privacy/page.tsx`) — DONE
Covers: info collection (contact assistant, analytics), third-party services (Vercel, Spotify, Anthropic), cookies (theme only), rights, contact.

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

## Environment variables
```
NEXT_PUBLIC_ANTHROPIC_API_KEY=   # only if embedding AI assistant directly
```

## Deployment
- Push to main → auto-deploys to Vercel
- Domain: bearbrown.co

## What NOT to do
- Do not add pages beyond the four listed without asking
- Do not use localStorage — use React state or sessionStorage
- Do not add analytics or tracking beyond what's already present
- Keep nav to four items: Home, Tools, About, Contact

## Remaining work (in priority order)
1. Populate tools page with Subby + CRITIQ cards (data-driven)
2. Build AI contact assistant widget on home page
3. Flesh out About page (Substack, musinique.com, Bear Brown LLC, publications)
