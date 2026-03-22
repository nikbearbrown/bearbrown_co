import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin-auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const {
    name,
    slug,
    description,
    tool_type,
    url,
    artifact_id,
    artifact_embed_code,
    tags,
  } = body

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('tools')
    .update({
      name,
      slug,
      description: description || null,
      tool_type: tool_type || 'link',
      url: url || null,
      artifact_id: artifact_id || null,
      artifact_embed_code: artifact_embed_code || null,
      tags: tags || [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('tools')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
