import Stripe from 'stripe'

// Server-side Stripe client — lazy to avoid build-time env access
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

/**
 * Calculate the mandatory platform commission charged on every donation.
 * Combined rate: 2.5% + 1.25 RON
 *   – covers Stripe card processing (1.5% + €0.25 ≈ 1.25 RON for EU cards)
 *   – plus platform fee (1%)
 * Rounded up to nearest 0.01 RON.
 * The full commission is captured via application_fee_amount and goes to the platform account.
 * The organiser receives exactly the donation amount.
 */
export function calculateCommission(donationRon: number): number {
  const raw = donationRon * 0.025 + 1.25
  return Math.round(raw * 100) / 100
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}
