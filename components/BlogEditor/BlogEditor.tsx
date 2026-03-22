'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import BlogVizHydrator from '@/components/BlogVizHydrator/BlogVizHydrator'
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  ImageIcon,
  Youtube as YoutubeIcon,
  Music,
  BarChart,
  Braces,
} from 'lucide-react'

interface BlogPost {
  id?: string
  title: string
  subtitle: string
  slug: string
  byline: string
  content: string
  published: boolean
}

const DEFAULT_BYLINE = `Few advisors put skin in the game the way Bear Brown does — building bespoke AI solutions, taking equity instead of checks for early-stage advising, and connecting startups with top engineering graduates before the competition finds them. An Associate Teaching Professor of Engineering at Northeastern University, Ph.D., MBA, and founder of Bear Brown & Company, he's spent years making AI practical, ethical, and accessible — inside the classroom, inside the lab, and inside the cap table.\nFollow his work at https://www.bearbrown.co/`

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

function parseSpotifyUrl(url: string): { type: string; id: string } | null {
  // Handles: https://open.spotify.com/track/ID, /album/ID, /playlist/ID, /episode/ID
  const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/)
  if (match) return { type: match[1], id: match[2] }
  return null
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`h-8 w-8 inline-flex items-center justify-center rounded transition-colors ${
        active ? 'bg-muted text-foreground' : 'hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarSep() {
  return <div className="w-px h-5 bg-border mx-0.5" />
}

export default function BlogEditor({ post }: { post?: BlogPost }) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title || '')
  const [subtitle, setSubtitle] = useState(post?.subtitle || '')
  const [byline, setByline] = useState(post?.byline ?? DEFAULT_BYLINE)
  const [slug, setSlug] = useState(post?.slug || '')
  const [slugEdited, setSlugEdited] = useState(!!post)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg' },
      }),
      Youtube.configure({
        HTMLAttributes: { class: 'rounded-lg' },
        width: 640,
        height: 360,
      }),
      Placeholder.configure({
        placeholder: 'Start writing…',
      }),
    ],
    content: post?.content || '',
    editorProps: {
      attributes: {
        class:
          'min-h-[400px] prose prose-neutral dark:prose-invert max-w-none p-6 focus:outline-none prose-headings:font-bold prose-headings:tracking-tighter prose-a:text-foreground prose-a:underline prose-img:rounded-lg',
      },
    },
  })

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value)
      if (!slugEdited) {
        setSlug(slugify(value))
      }
    },
    [slugEdited],
  )

  function getContent(): string {
    return editor?.getHTML() || ''
  }

  async function save(publish: boolean) {
    const content = getContent()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!content.trim() || content === '<p></p>') {
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
      byline: byline.trim() || null,
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

  function insertSpotify() {
    const url = window.prompt('Spotify URL (track, album, playlist, episode):')
    if (!url) return
    const parsed = parseSpotifyUrl(url)
    if (!parsed) {
      window.alert('Could not parse Spotify URL. Use a link like https://open.spotify.com/track/...')
      return
    }
    const iframe = `<iframe src="https://open.spotify.com/embed/${parsed.type}/${parsed.id}" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" style="border-radius:12px"></iframe>`
    editor?.chain().focus().insertContent(iframe).run()
  }

  function insertYoutube() {
    const url = window.prompt('YouTube URL:')
    if (!url) return
    editor?.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  function insertImage() {
    const url = window.prompt('Image URL:')
    if (!url) return
    const alt = window.prompt('Alt text (optional):') || ''
    editor?.chain().focus().setImage({ src: url, alt }).run()
  }

  function insertLink() {
    const url = window.prompt('URL:')
    if (!url) {
      editor?.chain().focus().unsetLink().run()
      return
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  function insertViz() {
    const name = window.prompt('Viz name (e.g. ai-adoption-bars):')
    if (!name) return
    editor?.chain().focus().insertContent(`<div data-viz="${name}"></div>`).run()
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

      {/* Byline */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">Byline</Label>
        <textarea
          value={byline}
          onChange={(e) => setByline(e.target.value)}
          placeholder="Author byline..."
          rows={4}
          className="w-full text-sm border rounded-md p-3 bg-background resize-y focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

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
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold">
          <BoldIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic">
          <ItalicIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')} title="Strikethrough">
          <StrikeIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} title="Inline code">
          <CodeIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')} title="Code block">
          <Braces className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet list">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Ordered list">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Blockquote">
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton onClick={insertLink} active={editor?.isActive('link')} title="Link">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={insertImage} title="Image">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={insertYoutube} title="YouTube embed">
          <YoutubeIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={insertSpotify} title="Spotify embed">
          <Music className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={insertViz} title="D3 viz embed">
          <BarChart className="h-4 w-4" />
        </ToolbarButton>

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
        <div className="min-h-[400px] prose prose-neutral dark:prose-invert max-w-none border rounded-md p-6 prose-headings:font-bold prose-headings:tracking-tighter prose-a:text-foreground prose-a:underline prose-img:rounded-lg">
          <BlogVizHydrator html={getContent()} />
        </div>
      ) : (
        <div className="border rounded-md bg-background">
          <EditorContent editor={editor} />
        </div>
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
