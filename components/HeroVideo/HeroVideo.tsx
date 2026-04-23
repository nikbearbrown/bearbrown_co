'use client'

import { useState, useEffect } from 'react'

const VIDEOS = [
  { id: 'JcAFZuSDw80', si: 'iDD6XLUEWmMehmdG' },
  { id: 'TwSCHSjN7i0', si: 'F1ezZCRYz6hLF8IG' },
]

export default function HeroVideo() {
  const [video, setVideo] = useState<typeof VIDEOS[0] | null>(null)

  useEffect(() => {
    setVideo(VIDEOS[Math.floor(Math.random() * VIDEOS.length)])
  }, [])

  if (!video) return <div style={{ width: '100%', aspectRatio: '16/9' }} />

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
      <iframe
        src={`https://www.youtube.com/embed/${video.id}?si=${video.si}`}
        title="Bear Brown"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          border: 'none',
          borderRadius: '6px',
        }}
      />
    </div>
  )
}
