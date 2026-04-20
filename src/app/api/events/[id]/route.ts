import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/db/supabase'
import { deleteEvent, getEventById } from '@/lib/db/events'
import { getEventSummaryStats } from '@/lib/db/donations'
import { sendEventClosedSummaryEmail } from '@/lib/email/brevo'
import { getEventTypeConfig } from '@/config/event-types'
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
    .select('id, organiser_id, is_active')
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
  if (body.isActive !== undefined) {
    update.is_active = body.isActive
    // Reactivating a page clears any stale is_deleted flag
    if (body.isActive === true) update.is_deleted = false
  }

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

  // Send summary email when organiser manually deactivates an active page
  const isBeingClosed = body.isActive === false && (existing.is_active as boolean) === true
  if (isBeingClosed) {
    try {
      const eventData = await getEventById(eventId)
      if (eventData) {
        const organiserUser = await supabaseAdmin.auth.admin.getUserById(user.id)
        const organiserEmail = organiserUser.data.user?.email ?? ''
        const organiserName = (organiserUser.data.user?.user_metadata?.full_name as string | undefined) ?? eventData.name
        const stats = await getEventSummaryStats(eventId)
        const config = getEventTypeConfig(eventData.eventType)
        await sendEventClosedSummaryEmail(organiserEmail, organiserName, eventData, config, stats, 'manual')
      }
    } catch (err) {
      console.error('[events] failed to send closed summary email:', err)
    }
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

  // Fetch event data before deleting so we can send the summary email
  const eventData = await getEventById(eventId)

  const ok = await deleteEvent(eventId, user.id)
  if (!ok) {
    return NextResponse.json<ApiError>({ error: 'Event not found' }, { status: 404 })
  }

  if (eventData) {
    try {
      const organiserUser = await supabaseAdmin.auth.admin.getUserById(user.id)
      const organiserEmail = organiserUser.data.user?.email ?? ''
      const organiserName = (organiserUser.data.user?.user_metadata?.full_name as string | undefined) ?? eventData.name
      const stats = await getEventSummaryStats(eventId)
      const config = getEventTypeConfig(eventData.eventType)
      await sendEventClosedSummaryEmail(organiserEmail, organiserName, eventData, config, stats, 'manual')
    } catch (err) {
      console.error('[events] failed to send deleted summary email:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
