import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllVideos, getVideoBySlug } from '@/lib/video-articles'
import VideoArticleView, { videoMetadata } from '@/components/videos/VideoArticleView'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllVideos().map(v => ({ slug: v.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const video = getVideoBySlug(slug)
  return video ? videoMetadata(video) : {}
}

export default async function AIArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const video = getVideoBySlug(slug)
  if (!video) notFound()

  return (
    <VideoArticleView
      video={video}
      cta={
        <aside className="mt-12 rounded-lg bg-muted p-6 md:p-8">
          <h2 className="text-xl font-bold tracking-tight">Need this built for your team?</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
            Bear Brown &amp; Co. builds AI-era software for startups that need to move, and connects them with the
            engineering graduates who can build it.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
            <Link href="/consulting" className="underline underline-offset-4">Consulting</Link>
            <Link href="/talent" className="underline underline-offset-4">Talent</Link>
            <a href="https://www.youtube.com/@NikBearBrown?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Subscribe on YouTube</a>
          </div>
        </aside>
      }
    />
  )
}
