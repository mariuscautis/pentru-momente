import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase, supabaseAdmin } from '@/lib/db/supabase'
import { sendPageActivatedEmail, sendNewEventAdminNotification } from '@/lib/email/brevo'
import { getEventTypeConfig } from '@/config/event-types'
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

  let body: { eventId?: string; eventSlug?: string }
  try {
    body = (await req.json()) as { eventId?: string; eventSlug?: string }
  } catch {
    return NextResponse.json<ApiError>({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.eventId && !body.eventSlug) {
    return NextResponse.json<ApiError>({ error: 'eventId or eventSlug required' }, { status: 400 })
  }

  const query = supabase
    .from('events')
    .select('id, slug, event_type, name, organiser_id, stripe_connect_account_id, connect_onboarding_complete')

  const { data: eventRow } = await (
    body.eventId ? query.eq('id', body.eventId).single() : query.eq('slug', body.eventSlug!).single()
  )

  if (!eventRow || (eventRow.organiser_id as string) !== user.id) {
    return NextResponse.json<ApiError>({ error: 'Forbidden' }, { status: 403 })
  }

  const accountId = eventRow.stripe_connect_account_id as string | null
  if (!accountId) {
    return NextResponse.json({ isActive: false })
  }

  // Already fully activated on a previous call — just confirm to the client
  if (eventRow.connect_onboarding_complete) {
    return NextResponse.json({ isActive: true })
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

      // Send both emails on first-time activation — fire-and-forget
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user.id)
        const organiserEmail = userData?.user?.email ?? user.email ?? ''
        const organiserName = (userData?.user?.user_metadata?.full_name as string | undefined)
          ?? (userData?.user?.user_metadata?.name as string | undefined)
          ?? organiserEmail
        const config = getEventTypeConfig(eventRow.event_type as string)

        await Promise.all([
          sendPageActivatedEmail(
            organiserEmail,
            organiserName,
            eventRow.name as string,
            eventRow.event_type as string,
            eventRow.slug as string,
            config.palette.primary
          ),
          sendNewEventAdminNotification(
            organiserEmail,
            organiserName,
            eventRow.name as string,
            eventRow.event_type as string,
            eventRow.slug as string
          ),
        ])
      } catch (err) {
        console.error('[connect/activate] failed to send activation emails:', err)
      }

      return NextResponse.json({ isActive: true })
    }
  } catch {
    // Stripe API error — fall through
  }

  return NextResponse.json({ isActive: false })
}
