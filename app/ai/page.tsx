import type { Metadata } from 'next'
import LibraryBrowser from '@/components/videos/LibraryBrowser'
import { getAllVideos, formatDate } from '@/lib/video-articles'
import { VIDEO_BASE, SITE_URL, CHANNEL_URL } from '@/lib/video-config'

// The "How to AI" playlist on the Nik Bear Brown YouTube channel, one article per video.
// Data comes from scripts/youtube/sync.py (data/youtube, content/videos).
export const metadata: Metadata = {
  title: 'AI - How to AI | Bear Brown',
  description: 'How to AI: each video from the How to AI playlist, published here as a full article too.',
  alternates: { canonical: `${SITE_URL}${VIDEO_BASE}` },
}

export default function AIPage() {
  const videos = getAllVideos()
  const items = videos.map(v => ({
    slug: v.slug, title: v.title, date: formatDate(v.uploadDate), duration: v.durationLabel, playlists: v.playlists, thumbnail: v.thumbnail,
  }))

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-4xl font-bold tracking-tighter">AI</h1>
        <p className="mb-10 max-w-3xl text-lg text-muted-foreground">
          How to AI. Every entry is a video and an article: the video on top, the written version underneath, with
          chapters and a transcript. When something new is made, it comes out as both.
        </p>
        {items.length > 0 ? (
          <LibraryBrowser items={items} playlists={[]} base={VIDEO_BASE} />
        ) : (
          <p className="text-muted-foreground">
            The first How to AI videos are on the way. Until they land, the{' '}
            <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">YouTube channel</a>{' '}
            has everything.
          </p>
        )}
      </div>
    </div>
  )
}
