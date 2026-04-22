import { NextRequest, NextResponse } from 'next/server'
import { createEvent, slugExists } from '@/lib/db/events'
import { isValidEventType, getEventTypeConfig } from '@/config/event-types'
import { supabase } from '@/lib/db/supabase'
import { ApiError } from '@/types'

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
