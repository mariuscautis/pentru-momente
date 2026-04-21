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

// EU/EEA country codes — Stripe uses ISO 3166-1 alpha-2
export const EU_COUNTRY_CODES = new Set([
  'AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI','FR','GR','HR','HU',
  'IE','IT','LT','LU','LV','MT','NL','PL','PT','RO','SE','SI','SK',
  // EEA (same Stripe card fee tier as EU)
  'IS','LI','NO',
  // UK still uses EU domestic rates via Stripe
  'GB',
])

export function isEuCard(countryCode: string): boolean {
  return EU_COUNTRY_CODES.has(countryCode.toUpperCase())
}

/**
 * Calculate the mandatory platform commission charged on every donation.
 *
 * EU cards:     Stripe fee ≈ 1.5% + 0.25€ (≈1.25 RON) → commission 2.5% + 1.25 RON
 *               leaves ~1% for the platform after covering Stripe.
 *
 * Non-EU cards: Stripe fee ≈ 3.25% + 0.25€ (≈1.25 RON) → commission 4.25% + 1.25 RON
 *               leaves ~1% for the platform after covering Stripe.
 *
 * Rounded to nearest 0.01 RON.
 * Captured via application_fee_amount — organiser receives donation minus commission.
 */
export function calculateCommission(donationRon: number, cardCountry = 'RO'): number {
  const rate = isEuCard(cardCountry) ? 0.025 : 0.0425
  const raw = donationRon * rate + 1.25
  return Math.round(raw * 100) / 100
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}
