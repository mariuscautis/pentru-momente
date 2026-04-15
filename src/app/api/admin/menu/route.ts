import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/db/supabase'
import { ApiError } from '@/types'

// Stores the full menu order (including static page positions) in menu_items table.
// Each row: id (matches static page id or site_pages.id), title, slug, menu_position, parent_id

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('menu_items')
    .select('id, title, slug, menu_position, parent_id')
    .order('menu_position', { ascending: true })

  const items = (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    title: r.title as string,
    slug: r.slug as string,
    menuPosition: r.menu_position as number,
    parentId: r.parent_id as string | null,
  }))

  return NextResponse.json({ items })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    items: { id: string; title: string; slug: string; menuPosition: number; parentId: string | null }[]
  }

  if (!Array.isArray(body.items)) {
    return NextResponse.json<ApiError>({ error: 'items array required' }, { status: 400 })
  }

  // Replace the entire menu: delete all existing rows, then insert the new set.
  // This ensures removed items are actually gone rather than persisting from a prior save.
  await supabaseAdmin.from('menu_items').delete().neq('id', '__never_matches__')

  if (body.items.length > 0) {
    await supabaseAdmin.from('menu_items').insert(
      body.items.map(item => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        menu_position: item.menuPosition,
        parent_id: item.parentId,
        updated_at: new Date().toISOString(),
      }))
    )
  }

  return NextResponse.json({ ok: true })
}
