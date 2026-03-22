'use client'

import { useState, useRef, useCallback } from 'react'
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

type WrapAction =
  | { type: 'wrap'; before: string; after: string }
  | { type: 'line'; prefix: string }
  | { type: 'link' }

const TOOLBAR: { icon: typeof Bold; label: string; action: WrapAction }[] = [
  { icon: Bold, label: 'Bold', action: { type: 'wrap', before: '<strong>', after: '</strong>' } },
  { icon: Italic, label: 'Italic', action: { type: 'wrap', before: '<em>', after: '</em>' } },
  { icon: Strikethrough, label: 'Strikethrough', action: { type: 'wrap', before: '<s>', after: '</s>' } },
  { icon: Code, label: 'Code', action: { type: 'wrap', before: '<code>', after: '</code>' } },
  { icon: LinkIcon, label: 'Link', action: { type: 'link' } },
  { icon: Heading2, label: 'H2', action: { type: 'line', prefix: '<h2>' } },
  { icon: Heading3, label: 'H3', action: { type: 'line', prefix: '<h3>' } },
  { icon: List, label: 'Bullet list', action: { type: 'line', prefix: '<li>' } },
  { icon: ListOrdered, label: 'Numbered list', action: { type: 'line', prefix: '<li>' } },
]

export default function BlogEditor({ post }: { post?: BlogPost }) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [title, setTitle] = useState(post?.title || '')
  const [subtitle, setSubtitle] = useState(post?.subtitle || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [slugEdited, setSlugEdited] = useState(!!post)
  const [content, setContent] = useState(post?.content || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value)
      if (!slugEdited) {
        setSlug(slugify(value))
      }
    },
    [slugEdited],
  )

  function applyAction(action: WrapAction) {
    const ta = textareaRef.current
    if (!ta) return

    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.slice(start, end)

    let newContent: string
    let cursorPos: number

    if (action.type === 'wrap') {
      const wrapped = `${action.before}${selected || 'text'}${action.after}`
      newContent = content.slice(0, start) + wrapped + content.slice(end)
      cursorPos = start + action.before.length + (selected ? selected.length : 4)
    } else if (action.type === 'line') {
      const closing = action.prefix === '<h2>' ? '</h2>' : action.prefix === '<h3>' ? '</h3>' : '</li>'
      const wrapped = `${action.prefix}${selected || ''}${closing}`
      newContent = content.slice(0, start) + wrapped + content.slice(end)
      cursorPos = start + action.prefix.length + (selected ? selected.length : 0)
    } else {
      // link
      const url = window.prompt('Enter URL:')
      if (!url) return
      const linkText = selected || 'link text'
      const wrapped = `<a href="${url}">${linkText}</a>`
      newContent = content.slice(0, start) + wrapped + content.slice(end)
      cursorPos = start + wrapped.length
    }

    setContent(newContent)
    // Restore focus and cursor after React re-render
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(cursorPos, cursorPos)
    })
  }

  async function save(publish: boolean) {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!content.trim()) {
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
      <div className="flex flex-wrap items-center gap-1 border rounded-md p-1.5 bg-muted/30 sticky top-16 z-10">
        {TOOLBAR.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={() => applyAction(btn.action)}
            title={btn.label}
            className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-muted transition-colors"
          >
            <btn.icon className="h-4 w-4" />
          </button>
        ))}
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="h-8 px-3 text-xs font-medium rounded hover:bg-muted transition-colors"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div
          className="min-h-[400px] prose prose-neutral dark:prose-invert max-w-none border rounded-md p-6
            prose-headings:font-bold prose-headings:tracking-tighter
            prose-a:text-foreground prose-a:underline
            prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post in HTML..."
          className="w-full min-h-[400px] font-mono text-sm border rounded-md p-6 bg-background resize-y focus:outline-none focus:ring-1 focus:ring-ring"
        />
      )}

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
