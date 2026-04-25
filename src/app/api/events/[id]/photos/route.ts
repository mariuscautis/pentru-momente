import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { supabase, supabaseAdmin } from '@/lib/db/supabase'
import { ApiError } from '@/types'

// ── GET — list photos for an event (public) ──────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: eventId } = await params

  const { data, error } = await supabaseAdmin
    .from('event_photos')
    .select('id, image_url, caption, sort_order')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json<ApiError>({ error: 'DB error' }, { status: 500 })

  const photos = (data ?? []).map((row) => ({
    id: row.id as string,
    imageUrl: row.image_url as string,
    caption: (row.caption as string | null) ?? null,
    sortOrder: row.sort_order as number,
  }))

  return NextResponse.json({ photos })
}

// ── POST — upload a new photo ─────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: eventId } = await params

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('organiser_id', user.id)
    .maybeSingle()

  if (!event) return NextResponse.json<ApiError>({ error: 'Event not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const caption = (formData.get('caption') as string | null) ?? null

  if (!file) return NextResponse.json<ApiError>({ error: 'No file provided' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json<ApiError>({ error: 'Only images allowed' }, { status: 400 })
  if (file.size > 20 * 1024 * 1024) return NextResponse.json<ApiError>({ error: 'Max 20MB' }, { status: 400 })

  // Enforce max 20 photos per event
  const { count } = await supabaseAdmin
    .from('event_photos')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)

  if ((count ?? 0) >= 20) {
    return NextResponse.json<ApiError>({ error: 'Maximum 20 photos per event' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const processed = await sharp(Buffer.from(bytes))
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

  const ts = Date.now()
  const path = `photos/${eventId}-${ts}.webp`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('event-covers')
    .upload(path, processed, { contentType: 'image/webp', upsert: false })

  if (uploadError) return NextResponse.json<ApiError>({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('event-covers')
    .getPublicUrl(path)

  // Get next sort order
  const { data: existing } = await supabaseAdmin
    .from('event_photos')
    .select('sort_order')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = ((existing?.[0]?.sort_order as number | undefined) ?? -1) + 1

  const { data: photoRow, error: dbError } = await supabaseAdmin
    .from('event_photos')
    .insert({ event_id: eventId, image_url: publicUrl, caption, sort_order: nextOrder })
    .select()
    .single()

  if (dbError || !photoRow) return NextResponse.json<ApiError>({ error: 'DB error' }, { status: 500 })

  return NextResponse.json({
    photo: {
      id: photoRow.id,
      imageUrl: photoRow.image_url,
      caption: photoRow.caption ?? null,
      sortOrder: photoRow.sort_order,
    }
  }, { status: 201 })
}

// ── DELETE — remove a photo ───────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: eventId } = await params

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const photoId = searchParams.get('photoId')
  if (!photoId) return NextResponse.json<ApiError>({ error: 'photoId required' }, { status: 400 })

  // Verify ownership via event
  const { data: photo } = await supabaseAdmin
    .from('event_photos')
    .select('id, event_id')
    .eq('id', photoId)
    .eq('event_id', eventId)
    .maybeSingle()

  if (!photo) return NextResponse.json<ApiError>({ error: 'Photo not found' }, { status: 404 })

  // Verify event ownership
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('organiser_id', user.id)
    .maybeSingle()

  if (!event) return NextResponse.json<ApiError>({ error: 'Forbidden' }, { status: 403 })

  await supabaseAdmin.from('event_photos').delete().eq('id', photoId)

  return NextResponse.json({ ok: true })
}

// ── PATCH — update caption ────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: eventId } = await params

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  const { photoId, caption } = await req.json() as { photoId: string; caption: string | null }
  if (!photoId) return NextResponse.json<ApiError>({ error: 'photoId required' }, { status: 400 })

  // Verify event ownership
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('organiser_id', user.id)
    .maybeSingle()

  if (!event) return NextResponse.json<ApiError>({ error: 'Forbidden' }, { status: 403 })

  await supabaseAdmin
    .from('event_photos')
    .update({ caption: caption ?? null })
    .eq('id', photoId)
    .eq('event_id', eventId)

  return NextResponse.json({ ok: true })
}
