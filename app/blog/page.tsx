import Link from 'next/link'
import type { Metadata } from 'next'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog - Bear Brown',
  description: 'Writing on AI, startups, education, and technology by Nik Bear Brown.',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPage() {
  let posts: { id: string; title: string; subtitle: string | null; slug: string; excerpt: string | null; published_at: string | null }[] = []
  try {
    posts = await sql`
      SELECT id, title, subtitle, slug, excerpt, published_at
      FROM blog_posts WHERE published = true
      ORDER BY published_at DESC
    `
  } catch {}

  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter mb-4">Blog</h1>
        <p className="text-muted-foreground mb-10">
          Writing on AI, startups, education, and technology.
        </p>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet. Check back soon.</p>
        ) : (
          <div className="divide-y">
            {posts.map((post) => (
              <article key={post.id} className="py-8 first:pt-0">
                <Link href={`/blog/${post.slug}`} className="group block">
                  {post.published_at && (
                    <time className="text-sm text-muted-foreground">
                      {formatDate(post.published_at)}
                    </time>
                  )}
                  <h2 className="text-2xl font-semibold mt-1 group-hover:underline">
                    {post.title}
                  </h2>
                  {post.subtitle && (
                    <p className="text-lg text-muted-foreground mt-1">
                      {post.subtitle}
                    </p>
                  )}
                  {post.excerpt && (
                    <p className="text-muted-foreground mt-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="text-sm font-medium mt-3 inline-block group-hover:underline">
                    Read →
                  </span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
