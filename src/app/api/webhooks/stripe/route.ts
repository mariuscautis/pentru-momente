import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { constructWebhookEvent } from '@/lib/payments/stripe'
import { confirmDonation, getDonationsByPaymentIntent, getTotalRaisedForEvent } from '@/lib/db/donations'
import { updateEventItemRaisedAmount, getEventById } from '@/lib/db/events'
import { upsertPayoutFromStripe, updatePayoutStatus } from '@/lib/db/payouts'
import { sendMilestoneEmail, sendPayoutSentEmail, sendPayoutConfirmedEmail } from '@/lib/email/brevo'
import { getEventTypeConfig } from '@/config/event-types'
import { supabaseAdmin } from '@/lib/db/supabase'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  // Try the standard webhook secret first, then the Connect webhook secret.
  // Stripe signs Connect account events with STRIPE_CONNECT_WEBHOOK_SECRET.
  let event: Stripe.Event | null = null
  let isConnectEvent = false

  const standardSecret = process.env.STRIPE_WEBHOOK_SECRET!
  const connectSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET

  try {
    event = constructWebhookEvent(body, signature, standardSecret)
  } catch {
    if (connectSecret) {
      try {
        event = constructWebhookEvent(body, signature, connectSecret)
        isConnectEvent = true
      } catch {
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }
  }

  if (!event) {
    return NextResponse.json({ error: 'Could not parse webhook event' }, { status: 400 })
  }

  if (!isConnectEvent) {
    // Standard platform events
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentSucceeded(paymentIntent)
    }
  } else {
    // Connect account events — payout lifecycle and onboarding completion
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        await handleAccountUpdated(account)
        break
      }

      case 'payout.created': {
        const payout = event.data.object as Stripe.Payout
        // event.account is the connected account ID — find the matching event
        const connectedAccountId = (event as Stripe.Event & { account?: string }).account
        if (connectedAccountId) {
          await handlePayoutCreated(payout, connectedAccountId)
        }
        break
      }

      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout
        const connectedAccountId = (event as Stripe.Event & { account?: string }).account
        if (connectedAccountId) {
          await handlePayoutPaid(payout, connectedAccountId)
        }
        break
      }

      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout
        await updatePayoutStatus(payout.id, 'failed')
        break
      }
    }
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const donation = await confirmDonation(paymentIntent.id)
  if (!donation) return

  // Update raised amounts for all confirmed items on this payment intent
  const allDonations = await getDonationsByPaymentIntent(paymentIntent.id)
  for (const d of allDonations) {
    if (d.itemId) {
      await updateEventItemRaisedAmount(d.itemId, d.amount)
    }
  }

  const event = await getEventById(donation.eventId)
  if (!event) return

  const config = getEventTypeConfig(event.eventType)

  // Check milestones
  if (event.goalAmount) {
    const totalRaised = await getTotalRaisedForEvent(event.id)
    const pct = Math.floor((totalRaised / event.goalAmount) * 100)

    for (const milestone of [25, 50, 100]) {
      const prevPct = Math.floor(((totalRaised - donation.amount) / event.goalAmount) * 100)
      if (prevPct < milestone && pct >= milestone) {
        await sendMilestoneEmail(
          { donation, event, config, organiserEmail: '', organiserName: event.name },
          milestone
        )
      }
    }
  }
}

async function handleAccountUpdated(account: Stripe.Account): Promise<void> {
  if (!account.details_submitted || !account.charges_enabled) return

  // Mark the event active once onboarding is complete
  await supabaseAdmin
    .from('events')
    .update({ connect_onboarding_complete: true, is_active: true })
    .eq('stripe_connect_account_id', account.id)
}

async function handlePayoutCreated(payout: Stripe.Payout, connectedAccountId: string): Promise<void> {
  // Look up the event by connect account ID
  const { data: eventRow } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('stripe_connect_account_id', connectedAccountId)
    .single()

  if (!eventRow) return

  const arrivalDate = payout.arrival_date
    ? new Date(payout.arrival_date * 1000).toISOString()
    : undefined

  await upsertPayoutFromStripe(
    payout.id,
    eventRow.id as string,
    payout.amount / 100, // bani → RON
    'pending',
    arrivalDate
  )

  // Email organiser
  const event = await getEventById(eventRow.id as string)
  if (!event) return

  const organiserUser = await supabaseAdmin.auth.admin.getUserById(event.organiserId)
  const organiserEmail = organiserUser.data.user?.email ?? ''
  const organiserName = (organiserUser.data.user?.user_metadata?.full_name as string | undefined) ?? event.name

  await sendPayoutSentEmail(organiserEmail, organiserName, event.name, payout.amount / 100)
}

async function handlePayoutPaid(payout: Stripe.Payout, connectedAccountId: string): Promise<void> {
  await updatePayoutStatus(payout.id, 'paid')

  // Email organiser
  const { data: eventRow } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('stripe_connect_account_id', connectedAccountId)
    .single()

  if (!eventRow) return

  const event = await getEventById(eventRow.id as string)
  if (!event) return

  const organiserUser = await supabaseAdmin.auth.admin.getUserById(event.organiserId)
  const organiserEmail = organiserUser.data.user?.email ?? ''
  const organiserName = (organiserUser.data.user?.user_metadata?.full_name as string | undefined) ?? event.name

  await sendPayoutConfirmedEmail(organiserEmail, organiserName, event.name, payout.amount / 100)
}
