'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/ThemeToggle'

const NAV_ITEMS = [
  { name: 'Plugins',    href: '/' },
  { name: 'Criteria',   href: '/criteria' },
  { name: 'Videos',     href: '/videos' },
  { name: 'Essays',     href: '/essays' },
  { name: 'Consulting', href: '/consulting' },
]

const SECONDARY_ITEMS = [
  { name: 'Blog', href: '/blog' },
]

const SOCIAL_LINKS = [
  { name: 'GitHub',   href: 'https://github.com/nikbearbrown' },
  { name: 'YouTube',  href: 'https://www.youtube.com/@NikBearBrown' },
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

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-opacity-95"
      style={{
        background: 'var(--p-bg)',
        borderBottom: '1px solid var(--p-border)',
      }}
    >
      <div className="container px-4 md:px-6 mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '17px',
              fontWeight: 400,
              letterSpacing: '0.02em',
              color: 'var(--p-ink)',
              textDecoration: 'none',
            }}
          >
            Bear Brown
          </Link>

          {/* Primary nav */}
          <nav className="hidden lg:flex gap-5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  letterSpacing: '0.02em',
                  color: isActive(item.href) ? 'var(--p-ink)' : 'var(--p-ink-soft)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                  ...(isActive(item.href) ? { fontWeight: 500 } : {}),
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--p-ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = isActive(item.href) ? 'var(--p-ink)' : 'var(--p-ink-soft)')}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Divider + secondary */}
          <div className="hidden lg:flex items-center gap-4">
            <span style={{ width: '1px', height: '14px', background: 'var(--p-border-strong)' }} />
            {SECONDARY_ITEMS.map(item => (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  letterSpacing: '0.02em',
                  color: 'var(--p-ink-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--p-ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--p-ink-muted)')}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Social pills — desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '10px',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: 'var(--p-ink-muted)',
                  border: '1px solid var(--p-border-strong)',
                  background: 'transparent',
                  borderRadius: '3px',
                  padding: '4px 9px',
                  textDecoration: 'none',
                  transition: 'color 0.15s, border-color 0.15s',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--p-ink)'
                  e.currentTarget.style.borderColor = 'var(--p-ink-soft)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--p-ink-muted)'
                  e.currentTarget.style.borderColor = 'var(--p-border-strong)'
                }}
              >
                {link.name}
              </a>
            ))}
          </div>
          <ThemeToggle />
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:hidden"
            style={{ color: 'var(--p-ink-soft)' }}
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-50 backdrop-blur-sm"
            style={{ background: 'rgba(61,57,41,0.4)' }}
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            ref={menuRef}
            className="fixed inset-x-0 top-14 z-50 mt-px p-6 shadow-lg"
            style={{ background: 'var(--p-bg)', borderBottom: '1px solid var(--p-border)' }}
          >
            <nav className="flex flex-col space-y-4">
              {[...NAV_ITEMS, ...SECONDARY_ITEMS].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '15px',
                    color: isActive(item.href) ? 'var(--p-ink)' : 'var(--p-ink-soft)',
                    textDecoration: 'none',
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4" style={{ borderTop: '1px solid var(--p-border)' }}>
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--p-ink-muted)',
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
