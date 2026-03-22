import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  try {
    const rows = await sql`
      SELECT title, subtitle, excerpt FROM blog_posts WHERE slug = ${slug} AND published = true
    `
    if (rows.length > 0) {
      return {
        title: `${rows[0].title} - Bear Brown`,
        description: rows[0].excerpt || rows[0].subtitle || rows[0].title,
      }
    }
  } catch {}
  return { title: 'Blog - Bear Brown' }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug} AND published = true`

  if (rows.length === 0) notFound()
  const post = rows[0]

  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">
            ← Back to Blog
          </Link>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">{post.title}</h1>
          {post.subtitle && <p className="text-xl text-muted-foreground mt-3">{post.subtitle}</p>}
          {post.published_at && <time className="text-sm text-muted-foreground mt-4 block">{formatDate(post.published_at)}</time>}
        </header>
        <div
          className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tighter prose-a:text-foreground prose-a:underline prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div className="mt-16 pt-8 border-t">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">← Back to Blog</Link>
        </div>
      </div>
    </div>
  )
}
