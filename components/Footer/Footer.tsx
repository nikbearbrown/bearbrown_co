'use client'

import Link from 'next/link'

const SOCIAL_LINKS = [
  { name: 'GitHub', href: 'https://github.com/nikbearbrown' },
  { name: 'YouTube', href: 'https://www.youtube.com/@NikBearBrown' },
  { name: 'Spotify', href: 'https://open.spotify.com/artist/0hSpFCJodAYMP2cWK72zI6' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t bg-background">
      <div className="container px-4 md:px-6 mx-auto py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span>&middot;</span>
            <span>&copy; {currentYear} Bear Brown, LLC</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
