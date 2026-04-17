import { NextRequest, NextResponse } from 'next/server'
import { getPayoutsForEvent } from '@/lib/db/payouts'
import { getEventById } from '@/lib/db/events'
import { supabase } from '@/lib/db/supabase'
import { ApiError } from '@/types'

/**
 * GET /api/payouts?eventId=xxx
 * Returns payout history for an event. Payouts are created automatically
 * by the Stripe Connect webhook handler — there is no manual withdrawal flow.
 */
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

  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get('eventId')
  if (!eventId) {
    return NextResponse.json<ApiError>({ error: 'eventId is required' }, { status: 400 })
  }

  const event = await getEventById(eventId)
  if (!event || event.organiserId !== user.id) {
    return NextResponse.json<ApiError>({ error: 'Forbidden' }, { status: 403 })
  }

  const payouts = await getPayoutsForEvent(eventId)
  return NextResponse.json({ payouts })
}
