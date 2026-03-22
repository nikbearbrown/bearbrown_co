import AdmZip from 'adm-zip'

export interface ParsedPost {
  title: string
  subtitle: string
  slug: string
  content: string
  publishedAt: string | null
  displayDate: string
  excerpt: string
  canonicalUrl: string
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        fields.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }
  fields.push(current)
  return fields
}

export function parseSubstackZip(buffer: Buffer): ParsedPost[] {
  const zip = new AdmZip(buffer)
  const entries = zip.getEntries()

  // Find posts.csv
  const csvEntry = entries.find(
    (e) => e.entryName === 'posts.csv' || e.entryName.endsWith('/posts.csv'),
  )
  if (!csvEntry) {
    throw new Error('No posts.csv found in ZIP archive')
  }

  const csvText = csvEntry.getData().toString('utf-8')
  const lines = csvText.split('\n').filter((l) => l.trim())
  if (lines.length < 2) {
    throw new Error('posts.csv has no data rows')
  }

  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase())
  const titleIdx = headers.indexOf('title')
  const subtitleIdx = headers.indexOf('subtitle')
  const postDateIdx = headers.indexOf('post_date')
  const urlIdx = headers.indexOf('post_url') !== -1 ? headers.indexOf('post_url') : headers.indexOf('url')
  const slugIdx = headers.indexOf('slug')
  const typeIdx = headers.indexOf('type')
  const isPublishedIdx = headers.indexOf('is_published')

  // Build a map of HTML files by name
  const htmlMap = new Map<string, string>()
  for (const entry of entries) {
    if (entry.entryName.endsWith('.html')) {
      const name = entry.entryName.split('/').pop()!.replace('.html', '')
      htmlMap.set(name, entry.getData().toString('utf-8'))
    }
  }

  const posts: ParsedPost[] = []

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i])
    if (fields.length < headers.length) continue

    // Skip drafts and non-newsletter types
    const isPublished = isPublishedIdx >= 0 ? fields[isPublishedIdx]?.trim().toLowerCase() : 'true'
    if (isPublished === 'false') continue

    const type = typeIdx >= 0 ? fields[typeIdx]?.trim().toLowerCase() : 'newsletter'
    if (type === 'podcast') continue

    const title = fields[titleIdx]?.trim() || 'Untitled'
    const subtitle = subtitleIdx >= 0 ? fields[subtitleIdx]?.trim() || '' : ''
    const postDate = postDateIdx >= 0 ? fields[postDateIdx]?.trim() || '' : ''
    const url = urlIdx >= 0 ? fields[urlIdx]?.trim() || '' : ''

    // Derive slug from CSV slug column, URL, or title
    let slug = ''
    if (slugIdx >= 0 && fields[slugIdx]?.trim()) {
      slug = fields[slugIdx].trim()
    } else if (url) {
      const parts = url.split('/')
      slug = parts[parts.length - 1] || slugify(title)
    } else {
      slug = slugify(title)
    }

    // Find matching HTML content
    const content = htmlMap.get(slug) || ''

    // Build excerpt from content
    const plainText = stripHtml(content)
    const excerpt = plainText.length > 200
      ? plainText.slice(0, 200).replace(/\s\S*$/, '') + '…'
      : plainText

    // Parse date
    let publishedAt: string | null = null
    let displayDate = ''
    if (postDate) {
      try {
        const d = new Date(postDate)
        if (!isNaN(d.getTime())) {
          publishedAt = d.toISOString()
          displayDate = d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }
      } catch {
        displayDate = postDate
      }
    }

    posts.push({
      title,
      subtitle,
      slug,
      content,
      publishedAt,
      displayDate,
      excerpt,
      canonicalUrl: url,
    })
  }

  return posts
}
