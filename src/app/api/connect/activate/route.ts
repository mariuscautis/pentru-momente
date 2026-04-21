import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase, supabaseAdmin } from '@/lib/db/supabase'
import { ApiError } from '@/types'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

/**
 * Called from the onboarding complete page to activate the event
 * without relying on the account.updated webhook.
 */
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

  let body: { eventSlug: string }
  try {
    body = (await req.json()) as { eventSlug: string }
  } catch {
    return NextResponse.json<ApiError>({ error: 'Invalid request body' }, { status: 400 })
  }

  const { data: eventRow } = await supabase
    .from('events')
    .select('id, organiser_id, stripe_connect_account_id, connect_onboarding_complete')
    .eq('slug', body.eventSlug)
    .single()

  if (!eventRow || (eventRow.organiser_id as string) !== user.id) {
    return NextResponse.json<ApiError>({ error: 'Forbidden' }, { status: 403 })
  }

  // Already active — nothing to do
  if (eventRow.connect_onboarding_complete) {
    return NextResponse.json({ isActive: true })
  }

  const accountId = eventRow.stripe_connect_account_id as string | null
  if (!accountId) {
    return NextResponse.json({ isActive: false })
  }

  // Check directly with Stripe
  try {
    const account = await getStripe().accounts.retrieve(accountId)
    // charges_enabled is only true once Stripe has verified the account
    // and enabled the transfers capability — safe to accept payments at this point.
    if (account.charges_enabled) {
      await supabaseAdmin
        .from('events')
        .update({ connect_onboarding_complete: true, is_active: true })
        .eq('id', eventRow.id as string)
      return NextResponse.json({ isActive: true })
    }
  } catch {
    // Stripe API error — fall through
  }

  return NextResponse.json({ isActive: false })
}
