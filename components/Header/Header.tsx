'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/ThemeToggle'

const NAV_ITEMS = [
  { name: 'Blog',     href: '/blog' },
  { name: 'Projects', href: '/projects' },
  { name: 'Tools',    href: '/tools' },
]

const SOCIAL_LINKS = [
  { name: 'GitHub',   href: 'https://github.com/nikbearbrown' },
  { name: 'YouTube',  href: 'https://www.youtube.com/@NikBearBrown' },
  { name: 'Spotify',  href: 'https://open.spotify.com/artist/0hSpFCJodAYMP2cWK72zI6' },
  { name: 'Substack', href: 'https://bearbrownco.substack.com/' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-opacity-95"
      style={{
        background: 'var(--m-bg)',
        borderBottom: '1px solid var(--m-border)',
      }}
    >
      <div className="container px-4 md:px-6 mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 400,
              letterSpacing: '0.02em',
              color: 'var(--m-text-primary)',
              textDecoration: 'none',
            }}
          >
            Bear Brown
          </Link>
          <nav className="hidden lg:flex gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  letterSpacing: '0.02em',
                  color: pathname === item.href ? 'var(--m-text-primary)' : 'var(--m-text-tertiary)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--m-text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = pathname === item.href ? 'var(--m-text-primary)' : 'var(--m-text-tertiary)')}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--m-text-tertiary)',
                  border: '1px solid var(--m-border-strong)',
                  background: 'transparent',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  textDecoration: 'none',
                  transition: 'color 0.15s, border-color 0.15s',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--m-text-primary)'
                  e.currentTarget.style.borderColor = 'var(--m-text-tertiary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--m-text-tertiary)'
                  e.currentTarget.style.borderColor = 'var(--m-border-strong)'
                }}
              >
                {link.name}
              </a>
            ))}
          </div>
          <ThemeToggle />
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:hidden"
            style={{ color: 'var(--m-text-tertiary)' }}
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-50 backdrop-blur-sm"
            style={{ background: 'rgba(26,10,0,0.7)' }}
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            ref={menuRef}
            className="fixed inset-x-0 top-14 z-50 mt-px p-6 shadow-lg"
            style={{ background: 'var(--m-bg)', borderBottom: '1px solid var(--m-border)' }}
          >
            <nav className="flex flex-col space-y-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '15px',
                    color: pathname === item.href ? 'var(--m-text-primary)' : 'var(--m-text-secondary)',
                    textDecoration: 'none',
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4" style={{ borderTop: '1px solid var(--m-border)' }}>
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--m-text-secondary)',
                      textDecoration: 'none',
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
