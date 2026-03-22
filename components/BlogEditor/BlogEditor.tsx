'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
} from 'lucide-react'

interface BlogPost {
  id?: string
  title: string
  subtitle: string
  slug: string
  content: string
  published: boolean
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function extractExcerpt(html: string): string {
  const text = stripHtml(html)
  if (text.length <= 200) return text
  return text.slice(0, 200).replace(/\s\S*$/, '') + '…'
}

const TOOLBAR_BUTTONS = [
  { command: 'bold', icon: Bold, label: 'Bold' },
  { command: 'italic', icon: Italic, label: 'Italic' },
  { command: 'strikeThrough', icon: Strikethrough, label: 'Strikethrough' },
  { command: 'code', icon: Code, label: 'Code', value: undefined, custom: true },
  { command: 'createLink', icon: LinkIcon, label: 'Link', prompt: true },
  { command: 'formatBlock', icon: Heading2, label: 'H2', value: 'h2' },
  { command: 'formatBlock', icon: Heading3, label: 'H3', value: 'h3' },
  { command: 'insertUnorderedList', icon: List, label: 'Bullet list' },
  { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered list' },
]

export default function BlogEditor({ post }: { post?: BlogPost }) {
  const router = useRouter()
  const editorRef = useRef<HTMLDivElement>(null)
  const [title, setTitle] = useState(post?.title || '')
  const [subtitle, setSubtitle] = useState(post?.subtitle || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [slugEdited, setSlugEdited] = useState(!!post)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Set initial content
  useEffect(() => {
    if (editorRef.current && post?.content) {
      editorRef.current.innerHTML = post.content
    }
  }, [post?.content])

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value)
      if (!slugEdited) {
        setSlug(slugify(value))
      }
    },
    [slugEdited],
  )

  function execCommand(command: string, value?: string) {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  function handleToolbar(btn: (typeof TOOLBAR_BUTTONS)[0]) {
    if (btn.custom && btn.command === 'code') {
      // Wrap selection in <code>
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const code = document.createElement('code')
        code.className = 'bg-muted px-1.5 py-0.5 rounded text-sm font-mono'
        range.surroundContents(code)
      }
      return
    }
    if (btn.prompt) {
      const url = window.prompt('Enter URL:')
      if (url) execCommand(btn.command, url)
      return
    }
    if (btn.value) {
      execCommand(btn.command, btn.value)
      return
    }
    execCommand(btn.command)
  }

  async function save(publish: boolean) {
    const content = editorRef.current?.innerHTML || ''
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!content.trim() || content === '<br>') {
      setError('Content is required')
      return
    }

    setSaving(true)
    setError('')

    const excerpt = extractExcerpt(content)
    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      slug: slug.trim() || slugify(title),
      content,
      excerpt,
      published: publish,
    }

    try {
      const url = post?.id ? `/api/admin/blog/${post.id}` : '/api/admin/blog'
      const method = post?.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }
      router.push('/admin/dashboard/blog')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Title"
        className="w-full text-4xl font-bold tracking-tighter bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
      />

      {/* Subtitle */}
      <input
        type="text"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        placeholder="Add a subtitle..."
        className="w-full text-xl bg-transparent border-none outline-none placeholder:text-muted-foreground/40 italic"
      />

      {/* Slug */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground whitespace-nowrap">
          /blog/
        </Label>
        <Input
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugEdited(true)
          }}
          className="text-sm h-8 font-mono"
          placeholder="post-slug"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border rounded-md p-1.5 bg-muted/30 sticky top-16 z-10">
        {TOOLBAR_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={() => handleToolbar(btn)}
            title={btn.label}
            className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-muted transition-colors"
          >
            <btn.icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[400px] prose prose-neutral dark:prose-invert max-w-none
          focus:outline-none border rounded-md p-6
          prose-headings:font-bold prose-headings:tracking-tighter
          prose-a:text-foreground prose-a:underline
          prose-img:rounded-lg
          [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground/40"
        data-placeholder="Start writing..."
      />

      {/* Actions */}
      <div className="flex items-center gap-3 border-t pt-6">
        <Button
          variant="outline"
          onClick={() => save(false)}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Draft'}
        </Button>
        <Button onClick={() => save(true)} disabled={saving}>
          {saving ? 'Publishing…' : post?.published ? 'Update' : 'Publish'}
        </Button>
        {post?.published && (
          <Button
            variant="outline"
            onClick={() => save(false)}
            disabled={saving}
            className="text-destructive hover:text-destructive"
          >
            Unpublish
          </Button>
        )}
      </div>
    </div>
  )
}
