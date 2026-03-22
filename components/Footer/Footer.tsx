'use client'

import Link from 'next/link'

const SOCIAL_LINKS = [
  { name: 'GitHub', href: 'https://github.com/nikbearbrown' },
  { name: 'YouTube', href: 'https://www.youtube.com/@NikBearBrown' },
  { name: 'Spotify', href: 'https://open.spotify.com/artist/0hSpFCJodAYMP2cWK72zI6' },
  { name: 'Substack', href: 'https://bearbrownco.substack.com/' },
]

const SUBSTACK_PUBLICATIONS = [
  { name: 'Bear Brown Co', href: 'https://bearbrownco.substack.com/' },
  { name: 'Skepticism AI', href: 'https://www.skepticism.ai/' },
  { name: 'Theorist AI', href: 'https://www.theorist.ai/' },
  { name: 'Hypothetical AI', href: 'https://www.hypothetical.ai/' },
  { name: 'Musinique', href: 'https://www.musinique.net/' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t bg-background">
      <div className="container px-4 md:px-6 mx-auto py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Bear Brown LLC</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>30 N Gould St Ste N</p>
              <p>Sheridan, WY 82801</p>
              <p>
                <a href="mailto:bear@bearbrown.co" className="hover:text-foreground transition-colors">
                  bear@bearbrown.co
                </a>
              </p>
              <p>EIN: 41-4226710</p>
            </div>
          </div>

          {/* Substack Publications */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Publications</h3>
            <div className="flex flex-col gap-2">
              {SUBSTACK_PUBLICATIONS.map((pub) => (
                <a
                  key={pub.name}
                  href={pub.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {pub.name}
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Connect</h3>
            <div className="flex flex-col gap-2">
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
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Legal</h3>
            <div className="flex flex-col gap-2">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/privacy#cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
              <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          &copy; {currentYear} Bear Brown, LLC. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
