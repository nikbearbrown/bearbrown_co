'use client'

import { useState, useEffect } from 'react'

const ARTISTS = [
  { name: 'Nik Bear Brown', id: '0hSpFCJodAYMP2cWK72zI6' },
  { name: 'Mayfield King', id: '6vpw3aw6hEJRPHgYGrN3kX' },
  { name: 'Liam Bear Brown', id: '4SSyKsRubysg99cAIs82uI' },
  { name: 'Tuzi Brown', id: '5DvRo9Gtg5bxsUUbKQBdg6' },
  { name: 'Newton Willams Brown', id: '7Ec9DTFD4EMsxdpiiGos2p' },
  { name: 'Parvati Patel Brown', id: '0tYk1RYgGD7k9MN0bd1p8u' },
  { name: 'Dijit Arjun Bear Brown', id: '55YYr6d7P8x8LVZWaOd5SZ' },
  { name: 'Prarthana Maha Brown', id: '1sPHt959TSCSgctMB5Xdop' },
  { name: 'Marley Bear Brown', id: '09UwgY1zJ63aJUkM4xgOb1' },
  { name: 'Humanitarians AI', id: '3cj3R4pDpYQHaWx0MM2vFV' },
  { name: 'Jingle Yankel', id: '3T20r0SBgeL2xUUNCRJZHG' },
  { name: 'Muzack', id: '4V8CzlAfk1VipGmOx5Hv7o' },
  { name: 'Cletus Bear Spuckler', id: '2hmp7X5Qx3K1PZAIm2ciUB' },
]

function pickRandom(excludeId?: string) {
  let pick = ARTISTS[Math.floor(Math.random() * ARTISTS.length)]
  while (pick.id === excludeId && ARTISTS.length > 1) {
    pick = ARTISTS[Math.floor(Math.random() * ARTISTS.length)]
  }
  return pick
}

export default function SpotifyPlayer() {
  const [artist, setArtist] = useState<typeof ARTISTS[0] | null>(null)

  useEffect(() => {
    setArtist(pickRandom())
  }, [])

  if (!artist) return null

  return (
    <div className="w-full">
      <iframe
        key={artist.id}
        src={`https://open.spotify.com/embed/artist/${artist.id}?utm_source=generator&theme=0`}
        width="100%"
        height="352"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-lg"
      />
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-sm text-muted-foreground">
          Now featuring: <span className="font-medium text-foreground">{artist.name}</span>
        </span>
        <button
          onClick={() => setArtist(pickRandom(artist.id))}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          Another artist
        </button>
      </div>
    </div>
  )
}
