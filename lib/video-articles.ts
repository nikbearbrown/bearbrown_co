// Static YouTube video articles. Data is produced by scripts/youtube/sync.py and
// committed under data/youtube and content/videos. Server-only (uses fs).
import fs from 'fs'
import path from 'path'
import videosJson from '@/data/youtube/videos.json'
import playlistsJson from '@/data/youtube/playlists.json'

export interface VideoChapter { start: number; end: number | null; title: string }

export interface VideoRecord {
  id: string
  slug: string
  title: string
  description: string
  uploadDate: string | null
  duration: number
  durationISO: string
  durationLabel: string
  tags: string[]
  chapters: VideoChapter[]
  viewCount: number | null
  playlists: string[]
  thumbnail: string
  hasTranscript: boolean
  isShort: boolean
}

export interface PlaylistRecord {
  id: string
  slug: string
  title: string
  description: string
  videoIds: string[]
  url: string
}

export interface TranscriptParagraph { t: number | null; title: string | null; text: string }

export interface ArticleFrontmatter {
  title?: string
  seoTitle?: string
  description?: string
  summary?: string
  keywords?: string[]
  generated?: string
}

export interface VideoArticle { frontmatter: ArticleFrontmatter; body: string }

const CONTENT_DIR = path.join(process.cwd(), 'content', 'videos')
const TRANSCRIPT_DIR = path.join(process.cwd(), 'data', 'youtube', 'transcripts')

const VIDEOS = videosJson as VideoRecord[]
const PLAYLISTS = playlistsJson as PlaylistRecord[]
const BY_SLUG = new Map(VIDEOS.map(v => [v.slug, v]))
const BY_ID = new Map(VIDEOS.map(v => [v.id, v]))
const PLAYLIST_BY_SLUG = new Map(PLAYLISTS.map(p => [p.slug, p]))

export function getAllVideos(): VideoRecord[] { return VIDEOS }
export function getVideoBySlug(slug: string): VideoRecord | undefined { return BY_SLUG.get(slug) }
export function getVideoById(id: string): VideoRecord | undefined { return BY_ID.get(id) }
export function getPlaylists(): PlaylistRecord[] { return PLAYLISTS }
export function getPlaylistBySlug(slug: string): PlaylistRecord | undefined { return PLAYLIST_BY_SLUG.get(slug) }
export function getPlaylistVideos(p: PlaylistRecord): VideoRecord[] {
  return p.videoIds.map(id => BY_ID.get(id)).filter((v): v is VideoRecord => Boolean(v))
}
export function slugByYoutubeId(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const v of VIDEOS) out[v.id] = v.slug
  return out
}

/** Minimal frontmatter parser: `key: <json value>` lines between --- fences. */
export function parseArticle(raw: string): VideoArticle {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { frontmatter: {}, body: raw }
  const fm: Record<string, unknown> = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i < 0) continue
    const key = line.slice(0, i).trim()
    const val = line.slice(i + 1).trim()
    if (!key) continue
    try { fm[key] = JSON.parse(val) } catch { fm[key] = val.replace(/^["']|["']$/g, '') }
  }
  return { frontmatter: fm as ArticleFrontmatter, body: m[2].trim() }
}

export function getArticle(slug: string): VideoArticle | null {
  const file = path.join(CONTENT_DIR, `${slug}.md`)
  if (!fs.existsSync(file)) return null
  return parseArticle(fs.readFileSync(file, 'utf-8'))
}

export function getTranscript(videoId: string): TranscriptParagraph[] {
  const file = path.join(TRANSCRIPT_DIR, `${videoId}.json`)
  if (!fs.existsSync(file)) return []
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { return [] }
}

/** Same-playlist videos first, then videos sharing tags, then most recent. */
export function getRelatedVideos(video: VideoRecord, n = 6): VideoRecord[] {
  const seen = new Set<string>([video.id])
  const out: VideoRecord[] = []
  const push = (v: VideoRecord) => { if (!seen.has(v.id) && out.length < n) { seen.add(v.id); out.push(v) } }
  for (const ps of video.playlists) {
    const p = PLAYLIST_BY_SLUG.get(ps)
    if (!p) continue
    const vids = getPlaylistVideos(p)
    const idx = vids.findIndex(v => v.id === video.id)
    // neighbours in playlist order first
    for (let d = 1; d < vids.length && out.length < n; d++) {
      if (vids[idx + d]) push(vids[idx + d])
      if (vids[idx - d]) push(vids[idx - d])
    }
  }
  if (out.length < n && video.tags.length) {
    const tags = new Set(video.tags.map(t => t.toLowerCase()))
    const scored = VIDEOS
      .filter(v => !seen.has(v.id))
      .map(v => ({ v, s: v.tags.reduce((a, t) => a + (tags.has(t.toLowerCase()) ? 1 : 0), 0) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
    for (const x of scored) push(x.v)
  }
  for (const v of VIDEOS) { if (out.length >= n) break; push(v) }
  return out
}

export function getPrevNext(video: VideoRecord): { prev?: VideoRecord; next?: VideoRecord } {
  const i = VIDEOS.findIndex(v => v.id === video.id) // VIDEOS is newest-first
  return { prev: VIDEOS[i + 1], next: VIDEOS[i - 1] }
}

export function formatTimestamp(sec: number): string {
  const s = Math.floor(sec)
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`
}

export function formatDate(iso: string | null): string {
  if (!iso) return ''
  const [y, mo, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

export function readingTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 220))} min read`
}

/** First paragraph of the description, stripped of YouTube *bold* markers and hashtags.
 *  `skip` (the video title) is passed so a description that opens by repeating the title does not become the lede. */
export function ledeFromDescription(desc: string, limit = 320, skip = ''): string {
  const norm = (t: string) => t.replace(/[\s*]+/g, ' ').trim().toLowerCase()
  const para = (desc || '').split(/\n\s*\n/).map(s => s.trim()).find(s => s && !/^#/.test(s) && !/^\*[^*]+\*:?$/.test(s) && !(skip && norm(s) === norm(skip))) || ''
  const clean = para.replace(/\*/g, '').replace(/\s+/g, ' ').trim()
  if (clean.length <= limit) return clean
  return clean.slice(0, limit).replace(/\s+\S*$/, '') + '…'
}
