'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

/**
 * Click-to-load YouTube embed. Renders a static thumbnail until the visitor
 * presses play, so hundreds of article pages stay fast.
 */
export default function LiteYouTube({ videoId, title, className = '' }: { videoId: string; title: string; className?: string }) {
  const [playing, setPlaying] = useState(false)
  const [src, setSrc] = useState(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`)

  if (playing) {
    return (
      <div className={`relative aspect-video w-full overflow-hidden rounded-lg bg-black ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      className={`group relative block aspect-video w-full overflow-hidden rounded-lg bg-black text-left ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        onError={() => setSrc(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        loading="eager"
        fetchPriority="high"
      />
      <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
        <Play className="ml-1 h-7 w-7 fill-current" />
      </span>
    </button>
  )
}
