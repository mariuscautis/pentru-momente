import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { calculateFees } from '@/lib/payments/stripe'
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
  // ISO 3166-1 alpha-2 card country — used to determine Stripe processing rate.
  // Populated by Stripe.js after payment method creation; optional (falls back to organiser country).
  cardCountry?: string
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

  // Retrieve the Connect account to check charges_enabled and resolve the organiser's
  // default currency. The payment intent is always created in the organiser's currency
  // so funds arrive without conversion. Donors with foreign cards pay Stripe's conversion.
  let connectAccount: Stripe.Account
  try {
    connectAccount = await getStripe().accounts.retrieve(event.stripeConnectAccountId)
    if (!connectAccount.charges_enabled) {
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

  // Use the organiser's default currency (set by their country at onboarding).
  // Falls back to 'ron' for safety.
  const currency = (connectAccount.default_currency ?? 'ron').toLowerCase()

  const tipAmount = body.tipAmount ?? 0
  // Card country: use what the donor declared, fall back to organiser country.
  const cardCountry = body.cardCountry ?? connectAccount.country ?? 'RO'

  // Calculate application_fee_amount: Stripe processing fee + 1% platform fee + tip.
  // All deducted from the organiser's share — donor pays exactly their stated amount.
  const fees = calculateFees(body.amount, tipAmount, cardCountry, currency)

  let paymentIntent
  try {
    paymentIntent = await createPaymentIntent({
      amount: Math.round(body.amount * (currency === 'huf' ? 1 : 100)),
      applicationFee: fees.applicationFee,
      currency,
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

  const multiplier = currency === 'huf' ? 1 : 100
  const donorTip = tipAmount                                          // donor tip in major unit
  const platformFeeAmount = (fees.stripeFeeParts + fees.platformFee) / multiplier  // Stripe fee + 1%

  if (selectedItems.length > 0) {
    for (const [i, selected] of selectedItems.entries()) {
      await createDonation({
        eventId: event.id,
        itemId: selected.itemId,
        amount: selected.amount,
        tipAmount: i === 0 ? donorTip : 0,
        platformFee: i === 0 ? platformFeeAmount : 0,
        cardCountry: body.cardCountry,
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
      tipAmount: donorTip,
      platformFee: platformFeeAmount,
      cardCountry: body.cardCountry,
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
    currency,
    platformFee: fees.platformFee / (currency === 'huf' ? 1 : 100),
    stripeFee: fees.stripeFeeParts / (currency === 'huf' ? 1 : 100),
    tipAmount,
  })
}
