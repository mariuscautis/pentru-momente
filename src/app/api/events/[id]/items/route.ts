import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/db/supabase'
import { getEventItems, createEventItem, updateEventItem, deleteEventItem } from '@/lib/db/events'
import { ApiError } from '@/types'

type Params = { params: Promise<{ id: string }> }

async function authorise(req: NextRequest, eventId: string): Promise<{ ok: true } | NextResponse> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: existing } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('organiser_id', user.id)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json<ApiError>({ error: 'Event not found' }, { status: 404 })
  }

  return { ok: true }
}

// GET /api/events/[id]/items — return all items for the event
export async function GET(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const { id: eventId } = await params
  const authCheck = await authorise(req, eventId)
  if (authCheck instanceof NextResponse) return authCheck

  const items = await getEventItems(eventId)
  return NextResponse.json({ items })
}

// POST /api/events/[id]/items — create a new item
export async function POST(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const { id: eventId } = await params
  const authCheck = await authorise(req, eventId)
  if (authCheck instanceof NextResponse) return authCheck

  const body = await req.json() as {
    name: string
    targetAmount?: number
    emoji?: string
    isCustomAmount?: boolean
    sortOrder?: number
  }

  if (!body.name?.trim()) {
    return NextResponse.json<ApiError>({ error: 'Numele articolului este obligatoriu' }, { status: 400 })
  }

  const item = await createEventItem(eventId, {
    name: body.name.trim(),
    targetAmount: body.targetAmount ?? 0,
    emoji: body.emoji,
    isCustomAmount: body.isCustomAmount ?? false,
    sortOrder: body.sortOrder ?? 0,
  })

  return NextResponse.json({ item }, { status: 201 })
}

// PATCH /api/events/[id]/items?itemId=xxx — update a single item
export async function PATCH(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const { id: eventId } = await params
  const authCheck = await authorise(req, eventId)
  if (authCheck instanceof NextResponse) return authCheck

  const itemId = req.nextUrl.searchParams.get('itemId')
  if (!itemId) {
    return NextResponse.json<ApiError>({ error: 'itemId is required' }, { status: 400 })
  }

  const body = await req.json() as {
    name?: string
    targetAmount?: number
    emoji?: string | null
    isCustomAmount?: boolean
  }

  await updateEventItem(itemId, body)
  return NextResponse.json({ ok: true })
}

// DELETE /api/events/[id]/items?itemId=xxx — delete a single item
export async function DELETE(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const { id: eventId } = await params
  const authCheck = await authorise(req, eventId)
  if (authCheck instanceof NextResponse) return authCheck

  const itemId = req.nextUrl.searchParams.get('itemId')
  if (!itemId) {
    return NextResponse.json<ApiError>({ error: 'itemId is required' }, { status: 400 })
  }

  await deleteEventItem(itemId)
  return NextResponse.json({ ok: true })
}
