import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bearbrown.co'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/tools`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/substack`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/privacy/cookies`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/terms-of-service`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Tools with slugs (artifact tools have their own pages)
    const { data: tools } = await supabase
      .from('tools')
      .select('slug, updated_at')
      .eq('tool_type', 'artifact')

    if (tools) {
      for (const t of tools) {
        entries.push({
          url: `${BASE_URL}/tools/${t.slug}`,
          lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    }

    // Substack sections
    const { data: sections } = await supabase
      .from('substack_sections')
      .select('id, slug, updated_at')

    if (sections) {
      for (const s of sections) {
        entries.push({
          url: `${BASE_URL}/substack/${s.slug}`,
          lastModified: new Date(s.updated_at),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }

      const idToSlug = new Map(sections.map((s) => [s.id, s.slug]))

      const { data: articles } = await supabase
        .from('substack_articles')
        .select('slug, published_at, section_id')

      if (articles) {
        for (const a of articles) {
          const sectionSlug = idToSlug.get(a.section_id)
          if (sectionSlug) {
            entries.push({
              url: `${BASE_URL}/substack/${sectionSlug}/${a.slug}`,
              lastModified: a.published_at ? new Date(a.published_at) : new Date(),
              changeFrequency: 'monthly',
              priority: 0.6,
            })
          }
        }
      }
    }
  } catch {
    // If Supabase is not configured, just return static pages
  }

  return entries
}
