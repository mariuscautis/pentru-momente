import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent } from '@/lib/payments/stripe'
import { createDonation } from '@/lib/db/donations'
import { getEventBySlug } from '@/lib/db/events'
import { isValidEventType } from '@/config/event-types'
import { ApiError } from '@/types'

interface CreateDonationBody {
  eventType: string
  eventSlug: string
  itemId?: string
  amount: number       // RON
  tipAmount: number    // RON
  displayName?: string
  message?: string
  isAnonymous: boolean
  showAmount: boolean
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: CreateDonationBody

  try {
    body = (await req.json()) as CreateDonationBody
  } catch {
    return NextResponse.json<ApiError>({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!isValidEventType(body.eventType)) {
    return NextResponse.json<ApiError>({ error: 'Invalid event type' }, { status: 400 })
  }

  if (!body.amount || body.amount < 1) {
    return NextResponse.json<ApiError>({ error: 'Amount must be at least 1 RON' }, { status: 400 })
  }

  const event = await getEventBySlug(body.eventType, body.eventSlug)
  if (!event) {
    return NextResponse.json<ApiError>({ error: 'Event not found' }, { status: 404 })
  }

  let paymentIntent
  try {
    paymentIntent = await createPaymentIntent({
      amountRon: body.amount,
      tipAmountRon: body.tipAmount ?? 0,
      eventId: event.id,
      itemId: body.itemId,
      displayName: body.displayName,
      message: body.message,
      isAnonymous: body.isAnonymous,
      showAmount: body.showAmount,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment processing error'
    return NextResponse.json<ApiError>({ error: message }, { status: 500 })
  }

  await createDonation({
    eventId: event.id,
    itemId: body.itemId,
    amount: body.amount,
    tipAmount: body.tipAmount ?? 0,
    displayName: body.displayName,
    message: body.message,
    isAnonymous: body.isAnonymous,
    showAmount: body.showAmount,
    stripePaymentIntentId: paymentIntent.id,
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  })
}
