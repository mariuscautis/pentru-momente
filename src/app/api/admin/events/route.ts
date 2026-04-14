import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { blockEvent, unblockEvent, getAllBlockedEvents } from '@/lib/db/admin'
import { supabaseAdmin } from '@/lib/db/supabase'
import { ApiError } from '@/types'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  // Return all events with their blocked status
  const { data: events, error } = await supabaseAdmin
    .from('events')
    .select('id, slug, event_type, name, is_active, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json<ApiError>({ error: 'DB error' }, { status: 500 })

  const blocked = await getAllBlockedEvents()
  const blockedIds = new Set(blocked.map((b) => b.eventId))

  const eventsWithStatus = (events ?? []).map((e: Record<string, unknown>) => ({
    id: e.id,
    slug: e.slug,
    eventType: e.event_type,
    name: e.name,
    isActive: e.is_active,
    isBlocked: blockedIds.has(e.id as string),
    createdAt: e.created_at,
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

  if (body.action === 'block') {
    await blockEvent(body.eventId, body.reason ?? '', adminEmail)
  } else {
    await unblockEvent(body.eventId)
  }

  return NextResponse.json({ ok: true })
}
