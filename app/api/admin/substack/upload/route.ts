import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin-auth'
import { parseSubstackZip } from '@/lib/substack-parser'

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('zip') as File | null
  const sectionId = formData.get('sectionId') as string | null

  if (!file || !sectionId) {
    return NextResponse.json({ error: 'Missing zip file or sectionId' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  let posts
  try {
    posts = parseSubstackZip(buffer)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse ZIP'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (posts.length === 0) {
    return NextResponse.json({ error: 'No posts found in ZIP' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Upsert articles
  const rows = posts.map((p) => ({
    section_id: sectionId,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle || null,
    excerpt: p.excerpt || null,
    content: p.content || null,
    original_url: p.canonicalUrl || null,
    published_at: p.publishedAt,
    display_date: p.displayDate || null,
  }))

  const { error: upsertError } = await supabase
    .from('substack_articles')
    .upsert(rows, { onConflict: 'section_id,slug' })

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  // Update article count
  const { count } = await supabase
    .from('substack_articles')
    .select('*', { count: 'exact', head: true })
    .eq('section_id', sectionId)

  await supabase
    .from('substack_sections')
    .update({ article_count: count ?? 0, updated_at: new Date().toISOString() })
    .eq('id', sectionId)

  return NextResponse.json({ imported: posts.length, total: count ?? 0 })
}
