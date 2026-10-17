import Link from 'next/link'
import { Clock } from 'lucide-react'
import type { VideoRecord } from '@/lib/video-articles'
import { formatDate } from '@/lib/video-articles'
import { VIDEO_BASE } from '@/lib/video-config'

export default function VideoCard({ video, compact = false }: { video: VideoRecord; compact?: boolean }) {
  return (
    <Link href={`${VIDEO_BASE}/${video.slug}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnail}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {video.durationLabel}
        </span>
      </div>
      <h3 className={`mt-3 font-semibold leading-snug group-hover:underline line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
        {video.title}
      </h3>
      {!compact && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDate(video.uploadDate)}
        </p>
      )}
    </Link>
  )
}
