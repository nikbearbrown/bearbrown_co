'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Pencil, Trash2, Plus } from 'lucide-react'

interface Post {
  id: string
  title: string
  subtitle: string | null
  slug: string
  published: boolean
  published_at: string | null
  created_at: string
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/blog')
      if (!res.ok) throw new Error('Failed to load posts')
      setPosts(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading posts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting post')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter">Blog Posts</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage blog posts
          </p>
        </div>
        <Link href="/admin/dashboard/blog/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet. Create one to get started.</p>
      ) : (
        <div className="grid gap-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {post.title}
                    <Badge variant={post.published ? 'default' : 'secondary'}>
                      {post.published ? 'Published' : 'Draft'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {post.published
                      ? `Published ${formatDate(post.published_at)}`
                      : `Created ${formatDate(post.created_at)}`}
                    {' · '}
                    <span className="font-mono text-xs">/blog/{post.slug}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link href={`/admin/dashboard/blog/${post.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePost(post.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
