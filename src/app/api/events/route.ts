import { NextRequest, NextResponse } from 'next/server'
import { createEvent, slugExists } from '@/lib/db/events'
import { isValidEventType, getEventTypeConfig } from '@/config/event-types'
import { supabase, supabaseAdmin } from '@/lib/db/supabase'
import { ApiError } from '@/types'

// Returns the authenticated organiser's own events, with isBlocked included.
// Uses supabaseAdmin server-side to read blocked_events (not exposed via RLS).
export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: events, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('organiser_id', user.id)
    .neq('is_deleted', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json<ApiError>({ error: 'DB error' }, { status: 500 })

  // Fetch blocked event IDs for this organiser's events in one query
  const eventIds = (events ?? []).map((e) => e.id as string)
  const blockedIds = new Set<string>()
  if (eventIds.length > 0) {
    const { data: blocked } = await supabaseAdmin
      .from('blocked_events')
      .select('event_id')
      .in('event_id', eventIds)
    for (const row of blocked ?? []) blockedIds.add(row.event_id as string)
  }

  const result = (events ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    eventType: row.event_type,
    name: row.name,
    description: row.description,
    coverImageUrl: row.cover_image_url,
    goalAmount: row.goal_amount,
    organiserId: row.organiser_id,
    stripeConnectAccountId: row.stripe_connect_account_id,
    connectOnboardingComplete: row.connect_onboarding_complete ?? false,
    isActive: row.is_active,
    isBlocked: blockedIds.has(row.id as string),
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }))

  return NextResponse.json({ events: result })
}

interface CreateEventBody {
  eventType: string
  name: string
  slug: string
  description?: string
  goalAmount?: number
  expiresAt?: string
  items: Array<{ name: string; targetAmount: number; emoji?: string }>
}

function validateSlug(slug: string): boolean {
  return /^[a-z0-9-]{3,60}$/.test(slug)
}

/**
 * Returns the slug unchanged if it's free, or appends a short random
 * suffix (e.g. "ana-si-mihai-a3f2") until a free one is found.
 */
async function resolveUniqueSlug(base: string): Promise<string> {
  if (!(await slugExists(base))) return base

  // Truncate base so the suffix always fits within the 60-char limit
  const truncated = base.slice(0, 54)
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Math.random().toString(36).slice(2, 6) // 4 chars, e.g. "a3f2"
    const candidate = `${truncated}-${suffix}`
    if (!(await slugExists(candidate))) return candidate
  }

  // Extremely unlikely to reach here, but fall back to a timestamp suffix
  return `${truncated}-${Date.now().toString(36).slice(-4)}`
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: CreateEventBody
  try {
    body = (await req.json()) as CreateEventBody
  } catch {
    return NextResponse.json<ApiError>({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!isValidEventType(body.eventType)) {
    return NextResponse.json<ApiError>({ error: 'Tip de eveniment invalid' }, { status: 400 })
  }

  if (!body.name?.trim()) {
    return NextResponse.json<ApiError>({ error: 'Numele este obligatoriu' }, { status: 400 })
  }

  if (!validateSlug(body.slug)) {
    return NextResponse.json<ApiError>(
      { error: 'Slug-ul trebuie să conțină 3-60 caractere: litere mici, cifre și cratime' },
      { status: 400 }
    )
  }

  const resolvedSlug = await resolveUniqueSlug(body.slug)

  const config = getEventTypeConfig(body.eventType)
  const items = body.items?.length
    ? body.items
    : config.suggestedItems.map((s) => ({ name: s.name, targetAmount: s.defaultAmount, emoji: s.emoji }))

  const event = await createEvent({
    slug: resolvedSlug,
    eventType: body.eventType,
    name: body.name.trim(),
    description: body.description?.trim(),
    goalAmount: body.goalAmount,
    expiresAt: body.expiresAt,
    organiserId: user.id,
    stripeConnectAccountId: undefined,
    connectOnboardingComplete: false,
    isActive: false, // becomes true after Stripe onboarding completes via webhook
    items,
  })

  return NextResponse.json({ event }, { status: 201 })
}
