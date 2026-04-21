import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { calculateCommission, isEuCard } from '@/lib/payments/stripe'
import { ApiError } from '@/types'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

/**
 * PATCH /api/donations/update-fee
 * Called when the Payment Element detects a card country.
 * Updates the PaymentIntent's application_fee_amount based on EU vs non-EU card.
 * Donor-facing total never changes — only the platform/organiser split adjusts.
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  let body: { paymentIntentId: string; cardCountry: string; donationAmount: number; tipAmount: number }
  try {
    body = (await req.json()) as { paymentIntentId: string; cardCountry: string; donationAmount: number; tipAmount: number }
  } catch {
    return NextResponse.json<ApiError>({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.paymentIntentId || !body.cardCountry) {
    return NextResponse.json<ApiError>({ error: 'Missing paymentIntentId or cardCountry' }, { status: 400 })
  }

  const stripe = getStripe()

  // Verify the PaymentIntent exists and is still updatable
  let pi: Stripe.PaymentIntent
  try {
    pi = await stripe.paymentIntents.retrieve(body.paymentIntentId)
  } catch {
    return NextResponse.json<ApiError>({ error: 'PaymentIntent not found' }, { status: 404 })
  }

  if (pi.status !== 'requires_payment_method' && pi.status !== 'requires_confirmation') {
    // Already confirmed — too late to update
    return NextResponse.json({ ok: true, unchanged: true })
  }

  const commissionRon = calculateCommission(body.donationAmount, body.cardCountry)
  const newFee = Math.round((commissionRon + body.tipAmount) * 100) // bani

  try {
    await stripe.paymentIntents.update(body.paymentIntentId, {
      application_fee_amount: newFee,
      metadata: {
        commissionAmount: String(commissionRon),
        cardCountry: body.cardCountry,
        isEuCard: String(isEuCard(body.cardCountry)),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update fee'
    return NextResponse.json<ApiError>({ error: message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    commissionAmount: commissionRon,
    isEuCard: isEuCard(body.cardCountry),
  })
}
