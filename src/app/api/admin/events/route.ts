import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { blockEvent, unblockEvent, getAllBlockedEvents } from '@/lib/db/admin'
import { supabaseAdmin } from '@/lib/db/supabase'
import { sendEventBlockedEmail, sendEventUnblockedEmail } from '@/lib/email/brevo'
import { ApiError } from '@/types'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  // Fetch all events with goal and expiry
  const { data: events, error } = await supabaseAdmin
    .from('events')
    .select('id, slug, event_type, name, is_active, is_deleted, goal_amount, expires_at, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json<ApiError>({ error: 'DB error' }, { status: 500 })

  const blocked = await getAllBlockedEvents()
  const blockedIds = new Set(blocked.map((b) => b.eventId))

  // Aggregate donations per event (total raised + total tips)
  const { data: donationAgg } = await supabaseAdmin
    .from('donations')
    .select('event_id, amount, tip_amount')
    .eq('status', 'confirmed')

  // Build per-event sums
  const raisedByEvent: Record<string, number> = {}
  const tipsByEvent: Record<string, number> = {}
  for (const d of donationAgg ?? []) {
    const eid = d.event_id as string
    raisedByEvent[eid] = (raisedByEvent[eid] ?? 0) + (d.amount as number)
    tipsByEvent[eid] = (tipsByEvent[eid] ?? 0) + ((d.tip_amount as number) ?? 0)
  }

  const eventsWithStatus = (events ?? []).map((e: Record<string, unknown>) => ({
    id: e.id,
    slug: e.slug,
    eventType: e.event_type,
    name: e.name,
    isActive: e.is_active,
    isDeleted: (e.is_deleted as boolean) ?? false,
    isBlocked: blockedIds.has(e.id as string),
    createdAt: e.created_at,
    goalAmount: (e.goal_amount as number | null) ?? null,
    expiresAt: (e.expires_at as string | null) ?? null,
    totalRaised: raisedByEvent[e.id as string] ?? 0,
    totalTips: tipsByEvent[e.id as string] ?? 0,
    blockInfo: blocked.find((b) => b.eventId === e.id) ?? null,
  }))

  return NextResponse.json({ events: eventsWithStatus })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { eventId: string; action: 'block' | 'unblock'; reason?: string }

  if (!body.eventId || !body.action) {
    return NextResponse.json<ApiError>({ error: 'eventId and action are required' }, { status: 400 })
  }

  // Fetch event + organiser details for the notification email
  const { data: eventRow } = await supabaseAdmin
    .from('events')
    .select('name, slug, event_type, organiser_id')
    .eq('id', body.eventId)
    .single()

  if (body.action === 'block') {
    await blockEvent(body.eventId, body.reason ?? '', adminEmail)
  } else {
    await unblockEvent(body.eventId)
  }

  // Send notification email to organiser (fire-and-forget — don't fail the request on email error)
  if (eventRow) {
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(eventRow.organiser_id as string)
      const organiserEmail = userData?.user?.email
      const organiserName = (userData?.user?.user_metadata?.full_name as string | undefined)
        ?? (userData?.user?.user_metadata?.name as string | undefined)
        ?? organiserEmail
        ?? 'Organizator'

      if (organiserEmail) {
        if (body.action === 'block') {
          await sendEventBlockedEmail(organiserEmail, organiserName, eventRow.name as string, body.reason)
        } else {
          await sendEventUnblockedEmail(
            organiserEmail,
            organiserName,
            eventRow.name as string,
            eventRow.event_type as string,
            eventRow.slug as string
          )
        }
      }
    } catch (err) {
      console.error('[admin/events] notification email failed:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
