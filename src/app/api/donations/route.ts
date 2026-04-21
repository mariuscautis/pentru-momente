import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { calculateCommission } from '@/lib/payments/stripe'
import { createPaymentIntent } from '@/lib/connect/createPaymentIntent'
import { createDonation } from '@/lib/db/donations'
import { getEventBySlug } from '@/lib/db/events'
import { isValidEventType } from '@/config/event-types'
import { ApiError } from '@/types'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

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
  // Optional donor tip on top of the donation (0 if declined)
  tipAmount?: number
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

  // Verify the Connect account actually has transfers enabled before charging.
  // charges_enabled is false until Stripe completes identity/capability verification.
  try {
    const account = await getStripe().accounts.retrieve(event.stripeConnectAccountId)
    if (!account.charges_enabled) {
      return NextResponse.json<ApiError>(
        { error: 'Contul organizatorului nu este încă verificat de Stripe. Reîncearcă în câteva minute.' },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'Nu s-a putut verifica contul de plăți al organizatorului.' },
      { status: 500 }
    )
  }

  const tipRon = body.tipAmount ?? 0
  // Mandatory commission: deducted from organiser's share (not added to donor's charge)
  const commissionRon = calculateCommission(body.amount)

  // Donor pays: donation + tip only.
  // Platform application_fee = commission + tip → routes to platform account.
  // Organiser receives: donation − commission.
  let paymentIntent
  try {
    paymentIntent = await createPaymentIntent({
      amount: Math.round(body.amount * 100),             // RON → bani
      tipAmount: Math.round(tipRon * 100),               // RON → bani
      commissionAmount: Math.round(commissionRon * 100), // RON → bani
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

  // Store commission + tip together in tip_amount so superadmin "Comision" column reflects total platform revenue.
  const totalPlatformRevenue = commissionRon + tipRon

  if (selectedItems.length > 0) {
    for (const [i, selected] of selectedItems.entries()) {
      await createDonation({
        eventId: event.id,
        itemId: selected.itemId,
        amount: selected.amount,
        tipAmount: i === 0 ? totalPlatformRevenue : 0,
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
      tipAmount: totalPlatformRevenue,
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
    tipAmount: tipRon,
  })
}
