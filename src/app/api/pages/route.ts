import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/supabase'

// Public endpoint — returns the ordered menu items for the Nav.
// Reads from menu_items (which includes both static hardcoded pages and any DB pages).
// Falls back to the hardcoded static pages if no saved menu order exists yet.

const STATIC_FALLBACK = [
  { id: '__despre-noi__',          title: 'Despre noi',          slug: 'despre-noi',          parentId: null, menuPosition: 10 },
  { id: '__contact__',             title: 'Contact',             slug: 'contact',             parentId: null, menuPosition: 20 },
  { id: '__termeni-si-conditii__', title: 'Termeni și Condiții', slug: 'termeni-si-conditii', parentId: null, menuPosition: 30 },
]

export async function GET(): Promise<NextResponse> {
  const { data } = await supabaseAdmin
    .from('menu_items')
    .select('id, title, slug, menu_position, parent_id')
    .order('menu_position', { ascending: true })

  if (!data || data.length === 0) {
    return NextResponse.json({ pages: STATIC_FALLBACK })
  }

  const pages = data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    title: r.title as string,
    slug: r.slug as string,
    parentId: r.parent_id as string | null,
    menuPosition: r.menu_position as number,
  }))

  return NextResponse.json({ pages })
}
