import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase
      .from('blog_posts')
      .select('title, subtitle, excerpt')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (data) {
      return {
        title: `${data.title} - Bear Brown`,
        description: data.excerpt || data.subtitle || data.title,
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
  const supabase = getSupabaseAdmin()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
          >
            ← Back to Blog
          </Link>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-xl text-muted-foreground mt-3">{post.subtitle}</p>
          )}
          {post.published_at && (
            <time className="text-sm text-muted-foreground mt-4 block">
              {formatDate(post.published_at)}
            </time>
          )}
        </header>

        <div
          className="prose prose-neutral dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tighter
            prose-a:text-foreground prose-a:underline
            prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-16 pt-8 border-t">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    </div>
  )
}
