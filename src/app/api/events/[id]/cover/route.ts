import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/db/supabase'
import { ApiError } from '@/types'

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

  // Verify the event belongs to this user
  const { data: event, error: eventError } = await supabaseAdmin
    .from('events')
    .select('id, organiser_id')
    .eq('id', eventId)
    .eq('organiser_id', user.id)
    .single()

  if (eventError || !event) {
    return NextResponse.json<ApiError>({ error: 'Event not found' }, { status: 404 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json<ApiError>({ error: 'No file provided' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json<ApiError>({ error: 'Only image files are allowed' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json<ApiError>({ error: 'File too large — maximum 5MB' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  // Include timestamp in filename so each upload is a new unique file —
  // this busts both the Supabase CDN cache and Next.js image cache
  const ts = Date.now()
  const path = `covers/${eventId}-${ts}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error: uploadError } = await supabaseAdmin.storage
    .from('event-covers')
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json<ApiError>({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('event-covers')
    .getPublicUrl(path)

  // Save URL to events table
  await supabaseAdmin
    .from('events')
    .update({ cover_image_url: publicUrl })
    .eq('id', eventId)

  return NextResponse.json({ url: publicUrl })
}
