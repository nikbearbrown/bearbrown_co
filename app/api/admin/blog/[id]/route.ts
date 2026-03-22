import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const rows = await sql`SELECT * FROM blog_posts WHERE id = ${id}`
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { title, subtitle, slug, byline, content, excerpt, published } = body

  try {
    // Check if we need to set published_at on first publish
    let publishedAt = undefined
    if (published) {
      const existing = await sql`SELECT published_at FROM blog_posts WHERE id = ${id}`
      if (existing.length > 0 && !existing[0].published_at) {
        publishedAt = new Date().toISOString()
      }
    }

    const rows = await sql`
      UPDATE blog_posts SET
        title = ${title},
        subtitle = ${subtitle || null},
        slug = ${slug},
        byline = ${byline || null},
        content = ${content},
        excerpt = ${excerpt || null},
        published = ${published ?? false},
        published_at = COALESCE(${publishedAt ?? null}::timestamptz, published_at),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await sql`DELETE FROM blog_posts WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
