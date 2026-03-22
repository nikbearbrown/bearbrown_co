'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ArtistLink {
  type: 'spotify' | 'apple' | 'musinique' | 'website'
  label: string
  href: string
}

interface Artist {
  name: string
  tagline: string
  spotifyId: string
  links: ArtistLink[]
}

const ARTISTS: Artist[] = [
  {
    name: 'Nik Bear Brown',
    tagline: 'For more by this artist',
    spotifyId: '0hSpFCJodAYMP2cWK72zI6',
    links: [
      { type: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/artist/0hSpFCJodAYMP2cWK72zI6' },
      { type: 'apple', label: 'Apple Music', href: 'https://music.apple.com/us/artist/nik-bear-brown/1779725275' },
      { type: 'musinique', label: 'Musinique', href: 'https://nikbear.musinique.com' },
    ],
  },
  {
    name: 'Mayfield King',
    tagline: 'The voice of conscious soul',
    spotifyId: '6vpw3aw6hEJRPHgYGrN3kX',
    links: [
      { type: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/artist/6vpw3aw6hEJRPHgYGrN3kX' },
      { type: 'apple', label: 'Apple Music', href: 'https://music.apple.com/gb/artist/mayfield-king/1846526759' },
      { type: 'musinique', label: 'Musinique', href: 'https://mayfield.musinique.com' },
    ],
  },
  {
    name: 'Liam Bear Brown',
    tagline: 'Faith-based music',
    spotifyId: '4SSyKsRubysg99cAIs82uI',
    links: [
      { type: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/artist/4SSyKsRubysg99cAIs82uI' },
      { type: 'apple', label: 'Apple Music', href: 'https://music.apple.com/us/artist/liam-bear-brown/1780970474' },
      { type: 'musinique', label: 'Musinique', href: 'https://liam.musinique.com' },
    ],
  },
  {
    name: 'Tuzi Brown',
    tagline: "For more of Tuzi's music",
    spotifyId: '5DvRo9Gtg5bxsUUbKQBdg6',
    links: [
      { type: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/artist/5DvRo9Gtg5bxsUUbKQBdg6' },
      { type: 'apple', label: 'Apple Music', href: 'https://music.apple.com/us/artist/tuzi-brown/1838852692' },
      { type: 'musinique', label: 'Musinique', href: 'https://tuzi.musinique.com' },
    ],
  },
  {
    name: 'Newton Willams Brown',
    tagline: 'For more by Newton',
    spotifyId: '7Ec9DTFD4EMsxdpiiGos2p',
    links: [
      { type: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/artist/7Ec9DTFD4EMsxdpiiGos2p' },
      { type: 'apple', label: 'Apple Music', href: 'https://music.apple.com/gb/artist/newton-willams-brown/1781653273' },
      { type: 'musinique', label: 'Musinique', href: 'https://newton.musinique.com' },
    ],
  },
  {
    name: 'Parvati Patel Brown',
    tagline: 'For more',
    spotifyId: '0tYk1RYgGD7k9MN0bd1p8u',
    links: [
      { type: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/artist/0tYk1RYgGD7k9MN0bd1p8u' },
      { type: 'apple', label: 'Apple Music', href: 'https://music.apple.com/gb/artist/parvati-patel-brown/1781528271' },
      { type: 'musinique', label: 'Musinique', href: 'https://parvati.musinique.com' },
    ],
  },
  {
    name: 'Dijit Arjun Bear Brown',
    tagline: 'For more',
    spotifyId: '55YYr6d7P8x8LVZWaOd5SZ',
    links: [
      { type: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/artist/55YYr6d7P8x8LVZWaOd5SZ' },
      { type: 'apple', label: 'Apple Music', href: 'https://music.apple.com/us/artist/dijit-arjun-bear-brown/1842722191' },
      { type: 'musinique', label: 'Musinique', href: 'https://dijit.musinique.com' },
    ],
  },
  {
    name: 'Prarthana Maha Brown',
    tagline: 'For more',
    spotifyId: '1sPHt959TSCSgctMB5Xdop',
    links: [
      { type: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/artist/1sPHt959TSCSgctMB5Xdop' },
      { type: 'apple', label: 'Apple Music', href: 'https://music.apple.com/us/artist/prarthana-maha-brown/1840725199' },
      { type: 'musinique', label: 'Musinique', href: 'https://prarthana.musinique.com' },
    ],
  },
  {
    name: 'Marley Bear Brown',
    tagline: 'For more',
    spotifyId: '09UwgY1zJ63aJUkM4xgOb1',
    links: [
      { type: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/artist/09UwgY1zJ63aJUkM4xgOb1' },
      { type: 'apple', label: 'Apple Music', href: 'https://music.apple.com/us/artist/marley-bear-brown/1835745524' },
      { type: 'musinique', label: 'Musinique', href: 'https://marley.musinique.com' },
    ],
  },
  {
    name: 'Humanitarians AI',
    tagline: 'For more',
    spotifyId: '3cj3R4pDpYQHaWx0MM2vFV',
    links: [
      { type: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/artist/3cj3R4pDpYQHaWx0MM2vFV' },
      { type: 'apple', label: 'Apple Music', href: 'https://music.apple.com/ca/artist/humanitarians-ai/1781414009' },
      { type: 'website', label: 'Website', href: 'https://www.humanitarians.ai/' },
    ],
  },
  {
    name: 'Jingle Yankel',
    tagline: 'For more',
    spotifyId: '3T20r0SBgeL2xUUNCRJZHG',
    links: [
      { type: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/artist/3T20r0SBgeL2xUUNCRJZHG' },
      { type: 'apple', label: 'Apple Music', href: 'https://music.apple.com/gb/artist/mayfield-king/1846526759' },
    ],
  },
  {
    name: 'Muzack',
    tagline: 'For more',
    spotifyId: '4V8CzlAfk1VipGmOx5Hv7o',
    links: [
      { type: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/artist/4V8CzlAfk1VipGmOx5Hv7o' },
    ],
  },
  {
    name: 'Cletus Bear Spuckler',
    tagline: 'For more',
    spotifyId: '2hmp7X5Qx3K1PZAIm2ciUB',
    links: [
      { type: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/artist/2hmp7X5Qx3K1PZAIm2ciUB' },
    ],
  },
]

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

function AppleMusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043A5.022 5.022 0 0 0 19.63.28a10.1 10.1 0 0 0-1.87-.2C17.15.03 16.53.01 15.9 0H8.1c-.63.01-1.25.03-1.86.08-.62.05-1.24.14-1.84.32A5.13 5.13 0 0 0 2.42.89 5.3 5.3 0 0 0 .88 2.42a5.12 5.12 0 0 0-.49 1.94C.27 5 .24 5.63.22 6.26.2 6.9.18 7.54.18 8.18v7.64c0 .64.02 1.28.04 1.92.02.63.05 1.26.17 1.88.14.75.4 1.46.81 2.1a5.29 5.29 0 0 0 3.07 2.26c.6.18 1.22.27 1.84.32.61.05 1.23.07 1.86.08h7.8c.63-.01 1.25-.03 1.86-.08.62-.05 1.24-.14 1.84-.32a5.29 5.29 0 0 0 3.07-2.26c.41-.64.67-1.35.81-2.1.12-.62.15-1.25.17-1.88.02-.64.04-1.28.04-1.92V8.18c0-.64-.02-1.28-.04-1.92l-.02-.12zM17.16 12c0 .29-.02.58-.05.87l-.02.17a3.31 3.31 0 0 1-.28 1.01 2.1 2.1 0 0 1-1.63 1.23c-.29.04-.58.05-.87.04a1.93 1.93 0 0 1-1.44-.66 1.94 1.94 0 0 1-.5-1.16c-.03-.29-.02-.58.03-.87.08-.49.29-.93.63-1.29a2.1 2.1 0 0 1 1.35-.72c.32-.04.65-.05.97-.02.17.02.34.04.51.08V7.72c0-.1-.01-.2-.03-.3a.46.46 0 0 0-.37-.37c-.06-.01-.12-.02-.18-.02-.5.04-1 .1-1.5.17-.72.1-1.44.22-2.15.36-.12.02-.24.06-.36.1a.47.47 0 0 0-.3.34c-.02.08-.03.16-.03.24v6.98c0 .29-.02.58-.05.87-.03.23-.08.46-.16.68a2.1 2.1 0 0 1-1.75 1.4c-.29.04-.58.05-.87.04a1.93 1.93 0 0 1-1.44-.66 1.94 1.94 0 0 1-.5-1.16c-.03-.29-.02-.58.03-.87.08-.49.29-.93.63-1.29a2.1 2.1 0 0 1 1.35-.72c.32-.04.65-.05.97-.02.17.02.34.04.51.08V7.08c0-.24.01-.47.04-.7.05-.34.18-.65.42-.9.2-.2.44-.34.71-.42.24-.07.48-.12.72-.16.78-.13 1.57-.24 2.36-.34.5-.06 1-.11 1.5-.15.15-.01.3 0 .45.02.33.06.57.24.7.56.05.14.08.28.09.43.01.15.01.3.01.45V12z" />
    </svg>
  )
}

export default function ArtistCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % ARTISTS.length)
  }, [])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + ARTISTS.length) % ARTISTS.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 8000)
    return () => clearInterval(timer)
  }, [paused, next])

  const artist = ARTISTS[index]

  return (
    <div
      className="w-full max-w-2xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Artist name + tagline */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold">{artist.name}</h3>
        <p className="text-sm text-muted-foreground">{artist.tagline}</p>
      </div>

      {/* Carousel body with arrows */}
      <div className="relative">
        <button
          onClick={prev}
          aria-label="Previous artist"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 h-10 w-10 rounded-full bg-background border shadow-sm flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <iframe
          key={artist.spotifyId}
          src={`https://open.spotify.com/embed/artist/${artist.spotifyId}?utm_source=generator`}
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl"
        />

        <button
          onClick={next}
          aria-label="Next artist"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 h-10 w-10 rounded-full bg-background border shadow-sm flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Links row */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {artist.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.type === 'spotify' && <SpotifyIcon className="h-4 w-4" />}
            {link.type === 'apple' && <AppleMusicIcon className="h-4 w-4" />}
            {link.label}
          </a>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {ARTISTS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to artist ${i + 1}`}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? 'bg-foreground' : 'bg-foreground/20 hover:bg-foreground/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
