import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Boxes,
  ClipboardCheck,
  Briefcase,
  Users,
  ArrowUpRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bear Brown & Co.',
  description:
    'Nik Bear Brown — professor, builder, connector. An audited Claude tools directory, a corpus you can check the method of, consulting, and AI talent from a program that graduates thousands.',
}

const sans = 'var(--font-sans)'
const serif = 'var(--font-serif)'

/* One card per item in the primary menu. */
const MENU_CARDS = [
  { name: 'Agents', href: '/agents', Icon: Boxes, heading: 'The workflow library', body: 'Search documented n8n workflows, inspect their connections and setup requirements, and download a starting point to configure and test.', cta: 'Explore N8N workflows' },
  {
    name: 'Claude',
    href: '/directory',
    Icon: Boxes,
    heading: 'The Claude directory',
    body:
      'The hand-audited listings, sitting on top of the corpus-wide scan. Every entry installed, risk-scanned, and signed with the commit sha it ran against. No stars. No copy-click rankings.',
    cta: 'Browse the directory',
  },
  {
    name: 'Corpus',
    href: '/corpus',
    Icon: ClipboardCheck,
    heading: 'The corpus',
    body:
      'What the corpus is, and how a repository gets into it: what the checker reads, how it routes on discovered capability rather than declared type, and — said plainly — what it does not assess. The part most directories leave out.',
    cta: 'How it works',
  },
  {
    name: 'Consulting',
    href: '/consulting',
    Icon: Briefcase,
    heading: 'Consulting',
    body:
      'Bespoke AI for startups that need to move — as consultant, equity advisor, and talent connector. No bloated retainers, no generalists, no team of five where one will do.',
    cta: 'How I work',
  },
  {
    name: 'Talent',
    href: '/talent',
    Icon: Users,
    heading: 'Talent',
    body:
      'I teach thousands of students. The best of them still spend close to a year landing a big-tech job — and you need something built now. I connect the two ends of that year.',
    cta: 'Hire them away',
  },
]

/* The Claude ▾ submenu, kept in sync with components/Header/Header.tsx */
const CLAUDE_MENU = [
  { name: 'Plugins', href: '/directory' },
  { name: 'Artifacts', href: '/claude/artifacts' },
  { name: 'Skills', href: '/claude/skills' },
  { name: 'Agents', href: '/claude/agents' },
  { name: 'Commands', href: '/claude/commands' },
  { name: 'Hooks', href: '/claude/hooks' },
  { name: 'MCP Servers', href: '/claude/mcp-servers' },
  { name: 'LSP Servers', href: '/claude/lsp-servers' },
  { name: 'Output Styles', href: '/claude/output-styles' },
  { name: 'Themes', href: '/claude/themes' },
  { name: 'Monitors', href: '/claude/monitors' },
  { name: 'Workflows', href: '/claude/workflows' },
  { name: 'Roll your own', href: '/roll-your-own' },
]

const CONNECT = [
  { name: 'GitHub', href: 'https://github.com/nikbearbrown' },
  { name: 'YouTube', href: 'https://www.youtube.com/@NikBearBrown' },
  { name: 'Substack', href: 'https://bearbrownco.substack.com/' },
  { name: 'Humanitarians AI', href: 'https://www.humanitarians.ai/' },
  { name: 'nikbearbrown.com', href: 'https://nikbearbrown.com' },
]

const eyebrow: React.CSSProperties = {
  fontFamily: sans,
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--p-terra)',
  margin: 0,
}

function Pill({
  href,
  children,
  filled = false,
}: {
  href: string
  children: React.ReactNode
  filled?: boolean
}) {
  const external = href.startsWith('http') || href.startsWith('mailto:')
  const style: React.CSSProperties = {
    fontFamily: sans,
    fontSize: '13px',
    letterSpacing: '0.02em',
    padding: '10px 18px',
    borderRadius: '4px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid var(--p-border-strong)',
    background: filled ? 'var(--p-ink)' : 'transparent',
    color: filled ? 'var(--p-bg)' : 'var(--p-ink-soft)',
  }
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
      {children}
    </a>
  ) : (
    <Link href={href} style={style}>
      {children}
    </Link>
  )
}

export default function Home() {
  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh' }}>
      {/* ---------- Hero: the business card ---------- */}
      <section
        style={{
          padding:
            'clamp(48px, 7vw, 88px) clamp(24px, 5vw, 80px) clamp(40px, 5vw, 64px)',
        }}
      >
        <div
          style={{
            gap: 'clamp(28px, 4vw, 48px)',
            alignItems: 'center',
            maxWidth: '1180px',
            margin: '0 auto',
          }}
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
        >
          <div>
            <p style={{ ...eyebrow, marginBottom: '20px' }}>
              Bear Brown &amp; Co. · Boston
            </p>
            <h1
              style={{
                fontFamily: serif,
                fontSize: 'clamp(36px, 5.5vw, 60px)',
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                color: 'var(--p-ink)',
                margin: '0 0 18px',
              }}
            >
              Nik Bear Brown
            </h1>
            <p
              style={{
                fontFamily: serif,
                fontSize: 'clamp(18px, 2vw, 22px)',
                fontStyle: 'italic',
                lineHeight: 1.4,
                color: 'var(--p-ink-soft)',
                margin: '0 0 20px',
              }}
            >
              Professor. Builder. Connector.
            </p>
            <p
              style={{
                fontFamily: sans,
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'var(--p-ink-soft)',
                maxWidth: '520px',
                margin: '0 0 28px',
              }}
            >
              I audit Claude tools and publish the receipts, build AI-era software
              for people who need it, and hand the best engineering graduates I
              teach to the companies that should be hiring them. Four doors below —
              take whichever one you came for.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Pill href="/directory" filled>
                Browse the directory
              </Pill>
              <Pill href="/talent">Hire AI talent</Pill>
            </div>
          </div>

          <div style={{ width: '100%' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
              <iframe
                src="https://www.youtube.com/embed/aEjgD65h1mY?si=UX-tdS58VJ5WzIPn"
                title="Nik Bear Brown — introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: '1px solid var(--p-border-strong)',
                  borderRadius: '6px',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- One card per menu item ---------- */}
      <section
        style={{
          padding: 'clamp(40px, 5vw, 72px) clamp(24px, 5vw, 80px)',
          background: 'var(--p-bg-card)',
          borderTop: '1px solid var(--p-border)',
          borderBottom: '1px solid var(--p-border)',
        }}
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <p style={{ ...eyebrow, marginBottom: '10px' }}>Where to go</p>
          <h2
            style={{
              fontFamily: serif,
              fontSize: 'clamp(26px, 3.2vw, 36px)',
              fontWeight: 400,
              color: 'var(--p-ink)',
              lineHeight: 1.15,
              margin: '0 0 32px',
              maxWidth: '640px',
            }}
          >
            Four things live here, and they are not the same thing.
          </h2>

          <div
            style={{ gap: '20px' }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
          >
            {MENU_CARDS.map(({ name, href, Icon, heading, body, cta }) => (
              <Link
                key={name}
                href={href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--p-bg)',
                  border: '1px solid var(--p-border-strong)',
                  borderTop: '3px solid var(--p-terra)',
                  borderRadius: '6px',
                  padding: '26px 24px',
                  textDecoration: 'none',
                }}
              >
                <Icon
                  size={26}
                  strokeWidth={1.4}
                  aria-hidden="true"
                  style={{ color: 'var(--p-ink)', marginBottom: '16px' }}
                />
                <p style={{ ...eyebrow, marginBottom: '8px' }}>{name}</p>
                <h3
                  style={{
                    fontFamily: serif,
                    fontSize: '21px',
                    fontWeight: 400,
                    color: 'var(--p-ink)',
                    lineHeight: 1.25,
                    margin: '0 0 12px',
                  }}
                >
                  {heading}
                </h3>
                <p
                  style={{
                    fontFamily: sans,
                    fontSize: '14px',
                    lineHeight: 1.65,
                    color: 'var(--p-ink-soft)',
                    margin: '0 0 20px',
                    flexGrow: 1,
                  }}
                >
                  {body}
                </p>
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: '13px',
                    color: 'var(--p-blue)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {cta} <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- The Claude submenu, one chip per item ---------- */}
      <section style={{ padding: 'clamp(40px, 5vw, 72px) clamp(24px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <p style={{ ...eyebrow, marginBottom: '10px' }}>
            The Claude directory — by component type
          </p>
          <p
            style={{
              fontFamily: sans,
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'var(--p-ink-soft)',
              maxWidth: '640px',
              margin: '0 0 28px',
            }}
          >
            A plugin is just components packaged together. The directory is sliced by
            what each component actually is, so you can go straight to the kind you
            need — or assemble your own bundle and have it audited.
          </p>

          <div
            style={{
              display: 'grid',
              gap: '12px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
            }}
          >
            {CLAUDE_MENU.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid var(--p-border-strong)',
                  borderRadius: '6px',
                  padding: '16px 18px',
                  textDecoration: 'none',
                  background: 'var(--p-bg)',
                }}
              >
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: '14px',
                    color: 'var(--p-ink)',
                  }}
                >
                  {item.name}
                </span>
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  style={{ color: 'var(--p-ink-muted)', marginLeft: 'auto', flexShrink: 0 }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Connect ---------- */}
      <section
        style={{
          padding: 'clamp(48px, 6vw, 80px) clamp(24px, 5vw, 80px)',
          background: 'var(--p-bg-card)',
          borderTop: '1px solid var(--p-border)',
        }}
      >
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ ...eyebrow, marginBottom: '14px' }}>Get in touch</p>
          <h2
            style={{
              fontFamily: serif,
              fontSize: 'clamp(28px, 3.6vw, 42px)',
              fontWeight: 400,
              color: 'var(--p-ink)',
              lineHeight: 1.15,
              margin: '0 0 18px',
            }}
          >
            Something to build, or someone to hire?
          </h2>
          <p
            style={{
              fontFamily: sans,
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--p-ink-soft)',
              margin: '0 auto 28px',
              maxWidth: '560px',
            }}
          >
            Email a rough description of what you want built — or of the role you
            are trying to fill. Short call, honest scope, no pitch deck.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '32px',
            }}
          >
            <Pill href="mailto:bear@bearbrown.co" filled>
              bear@bearbrown.co
            </Pill>
            {CONNECT.map((c) => (
              <Pill key={c.name} href={c.href}>
                {c.name}
              </Pill>
            ))}
          </div>
          <p
            style={{
              fontFamily: sans,
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--p-ink-muted)',
              margin: 0,
            }}
          >
            Nik Bear Brown, PhD · Associate Teaching Professor, College of
            Engineering, Northeastern University
          </p>
        </div>
      </section>
    </div>
  )
}
