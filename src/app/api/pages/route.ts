import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/supabase'

// Public endpoint — returns published site pages for the Nav menu.
// No authentication required.

export async function GET(): Promise<NextResponse> {
  const { data, error } = await supabaseAdmin
    .from('site_pages')
    .select('id, title, slug, parent_id, menu_position')
    .eq('is_published', true)
    .order('menu_position', { ascending: true })

  if (error) return NextResponse.json({ pages: [] })

  const pages = (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    title: r.title as string,
    slug: r.slug as string,
    parentId: r.parent_id as string | null,
    menuPosition: r.menu_position as number,
  }))

  return NextResponse.json({ pages })
}
