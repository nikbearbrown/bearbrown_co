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

## Site structure — four pages only
1. `/` — Home (business card + AI contact assistant)
2. `/tools` — Tools directory
3. `/about` — CV / bio page
4. `/privacy` — Privacy policy (static)

## Persistent layout (every page)
### Header
- Logo (Bear Brown signature mark, top left)
- Nav: Home | Tools | About | Contact
- Social buttons (top right): GitHub, YouTube, Spotify
- Dark/light mode toggle

### Footer
- Same social links as header
- Copyright line
- Link to privacy policy

## Home page
- Left: name, tagline ("Educator, artist, musician, and AI innovator dedicated to advancing artificial intelligence for social good.")
- Right: SpotifyPlayer component (random artist on each load — see below)
- Below fold: AI contact assistant widget

## Tools directory (`/tools`)
The tools directory is a card grid. Currently two published tools — more will be added later.
Do NOT rebuild the card logic from scratch if it already exists in the repo.

### Current tools (2):
1. **Subby** — Substack writing assistant
   - iframe: `<iframe src="https://claude.site/public/artifacts/6dc0c6cf-32e0-4f53-94b9-f6d01cc4df9c/embed" title="Subby" width="100%" height="600" frameborder="0" allow="clipboard-write" allowfullscreen></iframe>`

2. **CRITIQ** — Peer review & paper development protocol
   - iframe: `<iframe src="https://claude.site/public/artifacts/a53d969f-5aaf-45f6-9992-2c6a00a4122f/embed" title="CRITIQ" width="100%" height="600" frameborder="0" allow="clipboard-write" allowfullscreen></iframe>`

Card fields: name, short description, iframe embed or link, category tag.
Adding more tools later = adding a new object to the tools data array. Keep it data-driven.

## About page (`/about`)
- CV format: bio, academic role at NEU, publications, speaking, projects
- Links to: Substack, EdSurge articles, GitHub, YouTube, Humanitarians AI (501c3), musinique.com
- Bear Brown LLC: AI consulting + engineering grad placement
- Keep it prose-forward, not a bulleted resume dump

## Privacy Policy (`/privacy`)
- Standard static page
- Required because the site collects contact form submissions

## AI Contact Assistant (Home page)
- Embedded Claude-powered chat widget
- Purpose: help visitors answer common questions before emailing bear@bearbrown.co
- System prompt context: Bear is a professor at NEU, builds AI tools for education, speaks at conferences, writes for EdSurge and ISTE+ASCD, runs Humanitarians AI (501c3), runs Bear Brown LLC (AI consulting + engineering grad placement), open to consulting and collaboration
- Calls Anthropic API — auth handled by Claude.ai if published as artifact
- Keep UI minimal: small chat box, not full-page

## Spotify player (`/components/SpotifyPlayer.tsx`)
Client component. Randomly picks one artist on mount. "Another artist →" button shuffles without repeating.
Use `key={artist.id}` on the iframe to force reload on shuffle.

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

Embed format:
```
src="https://open.spotify.com/embed/artist/[ID]?utm_source=generator&theme=0"
width="100%" height="352" frameBorder="0"
allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
loading="lazy"
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
- Dark mode default (toggle available)
- Clean, editorial — not a portfolio showoff site
- Typography: distinctive serif for headings, clean mono or sans for UI
- Color: restrained — ink/paper palette, single accent
- No purple gradients, no generic AI aesthetics
- The existing site's black button style is good — keep that boldness

## Environment variables
```
NEXT_PUBLIC_ANTHROPIC_API_KEY=   # only if embedding AI assistant directly
```

## Deployment
- Push to main → auto-deploys to Vercel
- Domain: bearbrown.co

## What NOT to do
- Do not rebuild tools directory logic if it exists — only wrap in layout
- Do not add pages beyond the four listed without asking
- Do not use localStorage — use React state or sessionStorage
- Do not add analytics or tracking beyond what's already present
- Keep nav to four items: Home, Tools, About, Contact

## Session priorities (in order)
1. Set up persistent layout (header + footer)
2. Wrap tools directory in layout, populate with Subby + CRITIQ cards
3. Add SpotifyPlayer component to home page
4. Home page business card layout
5. AI contact assistant widget
6. About and Privacy pages last

## Existing components (do not rebuild — edit only)

### Footer.tsx — exists at /components/Footer.tsx
Already built and working. Uses:
- next-themes for dark/light logo swap (mounted check to avoid hydration mismatch)
- ThemeToggle component
- Social icons: GitHub, YouTube, Spotify, Apple Music, Email

**ONLY CHANGE NEEDED:** Update the Navigation section links from the old six pages to the new four:
- REMOVE: /art, /blog, /books, /classes, /consulting, /projects
- ADD: / (Home), /tools, /about, /contact (or mailto:bear@bearbrown.co)

Do not touch the social links, logo, copyright, or component structure.

### ThemeToggle.tsx — exists at /components/ThemeToggle.tsx
Already built. Import and use as-is.

### Logo paths (already in repo)
- Dark mode: /svg-logos/NikBearBrown_white_logo.svg
- Light mode: /svg-logos/NikBearBrown_black_logo.svg
