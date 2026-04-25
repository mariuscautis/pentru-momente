import { supabaseAdmin } from './supabase'
import { EventPhoto } from '@/components/PhotoSlider/PhotoSlider'

export async function getEventPhotos(eventId: string): Promise<EventPhoto[]> {
  const { data, error } = await supabaseAdmin
    .from('event_photos')
    .select('id, image_url, caption, sort_order')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    imageUrl: row.image_url as string,
    caption: (row.caption as string | null) ?? null,
    sortOrder: row.sort_order as number,
  }))
}
