import { NextRequest, NextResponse } from 'next/server'
import { calculateCommission } from '@/lib/payments/stripe'
import { createPaymentIntent } from '@/lib/connect/createPaymentIntent'
import { createDonation } from '@/lib/db/donations'
import { getEventBySlug } from '@/lib/db/events'
import { isValidEventType } from '@/config/event-types'
import { ApiError } from '@/types'

interface SelectedItem {
  itemId: string
  amount: number
}

interface CreateDonationBody {
  eventType: string
  eventSlug: string
  // Multi-item: array of { itemId, amount }
  selectedItems?: SelectedItem[]
  // Total donation amount (sum of items or general fund)
  amount: number
  displayName?: string
  donorEmail?: string
  message?: string
  isAnonymous: boolean
  showAmount: boolean
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    return await handlePost(req)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[donations] unhandled error:', err)
    return NextResponse.json<ApiError>({ error: message }, { status: 500 })
  }
}

async function handlePost(req: NextRequest): Promise<NextResponse> {
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

  const selectedItems = body.selectedItems ?? []

  if (!event.connectOnboardingComplete || !event.stripeConnectAccountId) {
    return NextResponse.json<ApiError>(
      { error: 'Pagina nu este încă activată pentru donații.' },
      { status: 400 }
    )
  }

  // Mandatory platform commission: 2.5% + 1.25 RON
  const commissionRon = calculateCommission(body.amount)

  // One payment intent for the full total (donation + commission).
  // Funds route directly to organiser's Stripe Express account via destination charge.
  // application_fee_amount = commission → captured by platform account.
  let paymentIntent
  try {
    paymentIntent = await createPaymentIntent({
      amount: Math.round(body.amount * 100),                 // RON → bani
      commissionAmount: Math.round(commissionRon * 100),     // RON → bani
      connectAccountId: event.stripeConnectAccountId,
      eventId: event.id,
      itemId: selectedItems.length === 1 ? selectedItems[0].itemId : undefined,
      displayName: body.displayName,
      donorEmail: body.donorEmail,
      message: body.message,
      isAnonymous: body.isAnonymous,
      showAmount: body.showAmount,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment processing error'
    return NextResponse.json<ApiError>({ error: message }, { status: 500 })
  }

  // Create one donation record per selected item, or one general fund record.
  // tipAmount stores the commission so the superadmin "Comision" column reflects it.
  if (selectedItems.length > 0) {
    for (const [i, selected] of selectedItems.entries()) {
      await createDonation({
        eventId: event.id,
        itemId: selected.itemId,
        amount: selected.amount,
        tipAmount: i === 0 ? commissionRon : 0, // attribute commission to first item
        displayName: body.displayName,
        message: body.message,
        isAnonymous: body.isAnonymous,
        showAmount: body.showAmount,
        stripePaymentIntentId: paymentIntent.id,
      })
    }
  } else {
    await createDonation({
      eventId: event.id,
      itemId: undefined,
      amount: body.amount,
      tipAmount: commissionRon,
      displayName: body.displayName,
      message: body.message,
      isAnonymous: body.isAnonymous,
      showAmount: body.showAmount,
      stripePaymentIntentId: paymentIntent.id,
    })
  }

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    commissionAmount: commissionRon,
  })
}
