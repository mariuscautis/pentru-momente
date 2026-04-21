import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { constructWebhookEvent } from '@/lib/payments/stripe'
import { confirmDonation, getDonationsByPaymentIntent, getTotalRaisedForEvent } from '@/lib/db/donations'
import { updateEventItemRaisedAmount, getEventById } from '@/lib/db/events'
import { upsertPayoutFromStripe, updatePayoutStatus } from '@/lib/db/payouts'
import { sendDonationConfirmationToDonor, sendMilestoneEmail, sendPayoutSentEmail, sendPayoutConfirmedEmail } from '@/lib/email/brevo'
import { getEventTypeConfig } from '@/config/event-types'
import { supabaseAdmin } from '@/lib/db/supabase'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  console.log('[webhook] received, signature present:', !!signature)

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event | null = null
  let isConnectEvent = false

  const standardSecret = process.env.STRIPE_WEBHOOK_SECRET!
  const connectSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET

  console.log('[webhook] standardSecret present:', !!standardSecret, 'connectSecret present:', !!connectSecret)

  try {
    event = constructWebhookEvent(body, signature, standardSecret)
    console.log('[webhook] verified with standard secret')
  } catch (e1) {
    console.log('[webhook] standard secret failed:', (e1 as Error).message)
    if (connectSecret) {
      try {
        event = constructWebhookEvent(body, signature, connectSecret)
        isConnectEvent = true
        console.log('[webhook] verified with connect secret')
      } catch (e2) {
        console.log('[webhook] connect secret also failed:', (e2 as Error).message)
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }
  }

  if (!event) {
    return NextResponse.json({ error: 'Could not parse webhook event' }, { status: 400 })
  }

  console.log('[webhook] event type:', event.type, '| isConnectEvent:', isConnectEvent)

  if (!isConnectEvent) {
    // Standard platform events
    if (event.type === 'payment_intent.succeeded') {
      const obj = event.data.object as Stripe.PaymentIntent | Stripe.Charge
      // Stripe sometimes delivers a Charge object even on payment_intent.succeeded —
      // normalise to a PaymentIntent by fetching it if needed.
      let paymentIntent: Stripe.PaymentIntent
      if (obj.object === 'charge') {
        const charge = obj as Stripe.Charge
        const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
        if (!piId) return NextResponse.json({ received: true })
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
        paymentIntent = await stripe.paymentIntents.retrieve(piId)
      } else {
        paymentIntent = obj as Stripe.PaymentIntent
      }
      await handlePaymentSucceeded(paymentIntent)
    }
  } else {
    // Connect account events — payout lifecycle, onboarding completion, and payment confirmation
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const obj = event.data.object as Stripe.PaymentIntent | Stripe.Charge
        let paymentIntent: Stripe.PaymentIntent
        if (obj.object === 'charge') {
          const charge = obj as Stripe.Charge
          const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
          if (!piId) break
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
          paymentIntent = await stripe.paymentIntents.retrieve(piId)
        } else {
          paymentIntent = obj as Stripe.PaymentIntent
        }
        await handlePaymentSucceeded(paymentIntent)
        break
      }

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

  // Send donation confirmation to donor if they provided an email
  const donorEmail = (paymentIntent.metadata?.donorEmail as string | undefined) || undefined
  console.log('[webhook] donorEmail from metadata:', donorEmail ?? '(none)')
  console.log('[webhook] full metadata:', JSON.stringify(paymentIntent.metadata))
  if (donorEmail) {
    try {
      await sendDonationConfirmationToDonor({
        donation,
        event,
        config,
        donorEmail,
        organiserEmail: '',
        organiserName: event.name,
      })
      console.log('[webhook] donor confirmation email sent to:', donorEmail)
    } catch (err) {
      console.error('[webhook] failed to send donor confirmation email:', err)
      console.error('[webhook] BREVO_API_KEY present:', !!process.env.BREVO_API_KEY)
      console.error('[webhook] BREVO_API_KEY prefix:', process.env.BREVO_API_KEY?.slice(0, 20))
    }
  } else {
    console.log('[webhook] no donorEmail in metadata — skipping confirmation email')
  }

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
  // Only activate when Stripe has verified the account and enabled charges.
  // charges_enabled requires both card_payments and transfers capabilities to
  // be active — this is the correct signal that destination charges will succeed.
  if (!account.charges_enabled) return

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
