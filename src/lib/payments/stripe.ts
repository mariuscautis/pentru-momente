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
 * Calculate the Stripe processing fee to pass through to the donor.
 * EU card rate: 1.5% + €0.25 (≈1.25 RON at 5 RON/EUR), rounded up to nearest 0.5 RON.
 * Applied to the donation + tip total (the full amount Stripe processes).
 */
export function calculateStripeFee(donationRon: number, tipRon: number): number {
  const base = donationRon + tipRon
  const raw = base * 0.015 + 1.25
  // Round up to nearest 0.5 RON so the platform is never under
  return Math.ceil(raw * 2) / 2
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}
