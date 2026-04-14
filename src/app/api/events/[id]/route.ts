import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/db/supabase'
import { deleteEvent } from '@/lib/db/events'
import { ApiError } from '@/types'

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

  // Verify ownership
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('events')
    .select('id, organiser_id')
    .eq('id', eventId)
    .eq('organiser_id', user.id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json<ApiError>({ error: 'Event not found' }, { status: 404 })
  }

  const body = await req.json() as {
    name?: string
    description?: string
    goalAmount?: number | null
    expiresAt?: string | null
    isActive?: boolean
  }

  const update: Record<string, unknown> = {}
  if (body.name !== undefined) {
    if (!body.name.trim()) {
      return NextResponse.json<ApiError>({ error: 'Numele este obligatoriu' }, { status: 400 })
    }
    update.name = body.name.trim()
  }
  if (body.description !== undefined) update.description = body.description.trim() || null
  if (body.goalAmount !== undefined) update.goal_amount = body.goalAmount ?? null
  if (body.expiresAt !== undefined) update.expires_at = body.expiresAt ?? null
  if (body.isActive !== undefined) update.is_active = body.isActive

  if (Object.keys(update).length === 0) {
    return NextResponse.json<ApiError>({ error: 'No fields to update' }, { status: 400 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('events')
    .update(update)
    .eq('id', eventId)

  if (updateError) {
    return NextResponse.json<ApiError>({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

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

  const ok = await deleteEvent(eventId, user.id)
  if (!ok) {
    console.error('[DELETE /api/events] not found or ownership mismatch', { eventId, userId: user.id })
    return NextResponse.json<ApiError>({ error: `Event not found (id=${eventId}, user=${user.id})` }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
