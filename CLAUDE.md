# CLAUDE.md — bearbrown.co

## Who this site is for
Nik Bear Brown — professor, educator, artist, musician, and AI innovator at Northeastern University. Owner of Bear Brown, LLC AI Consulting and assisting with finding the best recent engineering grads.
Primary audiences hitting this site:
- Educators and instructional leaders looking for AI tools
- Conference organizers and editors considering him as a speaker or contributor
- Artists and students he collaborates with
- General public who found him via Substack, EdSurge, ISTE+ASCD, or YouTube

## Tech stack
- Next.js (App Router)
- Deployed on Vercel via GitHub repo: nikbearbrown/bearbrown_co
- Tailwind CSS
- TypeScript

## Site structure — four pages only
1. `/` — Home (business card + AI contact assistant)
2. `/tools` — Tools directory (existing component, wrap in layout)
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
- Right: embedded Spotify player — randomly selects one of 10 artist embeds on each page load (see Spotify section below)
- Below fold: AI contact assistant (see AI Assistant section below)

## Tools directory (`/tools`)
- Already built as a standalone component
- Shows tool cards with: name, description, Claude/ChatGPT links, access badge
- Has search and admin mode
- Wrap in the persistent header/footer layout — do not rebuild the tool logic
- Source file: [locate in /components or /app/tools]

## About page (`/about`)
- CV format: bio, academic role at NEU, publications, speaking, projects
- Links to: Substack, EdSurge articles, GitHub, YouTube, Humanitarians AI (501c3)
- Keep it prose-forward, not a bulleted resume dump

## Privacy Policy (`/privacy`)
- Standard static page
- Required because the site collects contact form submissions
- Generate a reasonable privacy policy for a personal/educational website

## AI Contact Assistant (Home page)
- Embedded Claude-powered chat widget
- Purpose: help visitors who email bear@bearbrown.co — answer common questions before they reach out
- System prompt context: Bear is a professor at NEU, builds AI tools for education, speaks at conferences, writes for EdSurge and ISTE+ASCD, runs Humanitarians AI (501c3), open to consulting and collaboration
- Calls Anthropic API — auth handled by Claude.ai if published as artifact, or needs NEXT_PUBLIC_ANTHROPIC_API_KEY env var if embedded directly
- Keep UI minimal: small chat box, not a full-page experience

## Spotify player
Randomly selects one of 10 embedded Spotify players on each page load.
Use Math.random() to pick index on mount (client component).
Spotify embed format:
```
<iframe
  src="https://open.spotify.com/embed/artist/[ARTIST_ID]"
  width="100%"
  height="352"
  frameBorder="0"
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  loading="lazy"
/>
```
Artist IDs to rotate (replace with actual IDs — Bear to supply):
- Humanitarians AI: [ID]
- [Artist 2]: [ID]
- [Artist 3]: [ID]
- [Artist 4]: [ID]
- [Artist 5]: [ID]
- [Artist 6]: [ID]
- [Artist 7]: [ID]
- [Artist 8]: [ID]
- [Artist 9]: [ID]
- [Artist 10]: [ID]

## Design direction
- Clean, editorial — not a portfolio showoff site
- Dark mode default (toggle available)
- Typography: distinctive serif for headings, clean mono or sans for UI
- Color: restrained — ink/paper palette, single accent
- No purple gradients, no generic AI aesthetics
- Reference: the existing site's black button style is good — keep that boldness

## Environment variables needed
```
NEXT_PUBLIC_ANTHROPIC_API_KEY=   # only if embedding AI assistant directly (not via Claude artifact)
```

## Deployment
- Push to main branch → auto-deploys to Vercel
- Preview deployments on PRs
- Domain: bearbrown.co

## What NOT to do
- Do not rebuild the tools directory logic — only wrap it in the layout
- Do not add more pages without asking
- Do not use localStorage (use state or sessionStorage if persistence needed)
- Do not add analytics or tracking beyond what's already there
- Keep nav to four items: Home, Tools, About, Contact

## First session priorities (in order)
1. Set up persistent layout component (header + footer)
2. Wrap existing tools directory in layout
3. Build Spotify random player component
4. Home page with business card layout
5. AI contact assistant widget
6. About and Privacy pages last