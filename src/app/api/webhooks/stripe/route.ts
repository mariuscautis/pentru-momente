import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { constructWebhookEvent } from '@/lib/payments/stripe'
import { confirmDonation, getDonationByPaymentIntent, getTotalRaisedForEvent } from '@/lib/db/donations'
import { updateEventItemRaisedAmount, getEventById } from '@/lib/db/events'
import { sendDonationNotificationToOrganiser, sendMilestoneEmail } from '@/lib/email/brevo'
import { getEventTypeConfig } from '@/config/event-types'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    await handlePaymentSucceeded(paymentIntent)
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const donation = await confirmDonation(paymentIntent.id)
  if (!donation) return

  // Update item raised amount if this was an item donation
  if (donation.itemId) {
    await updateEventItemRaisedAmount(donation.itemId, donation.amount)
  }

  // Send organiser notification
  const event = await getEventById(donation.eventId)
  if (!event) return

  const config = getEventTypeConfig(event.eventType)

  // Organiser email — fetch from auth (we use user metadata stored at creation)
  // For now we skip organiser email lookup to avoid supabase auth import complexity;
  // it's wired once the dashboard auth is in place.

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
