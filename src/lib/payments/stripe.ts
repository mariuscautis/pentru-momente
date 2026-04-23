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
// UK is NOT included — post-Brexit it attracts non-EU Stripe processing rates
export const EU_COUNTRY_CODES = new Set([
  'AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI','FR','GR','HR','HU',
  'IE','IT','LT','LU','LV','MT','NL','PL','PT','RO','SE','SI','SK',
  // EEA (same Stripe card fee tier as EU)
  'IS','LI','NO',
])

export function isEuCard(countryCode: string): boolean {
  return EU_COUNTRY_CODES.has(countryCode.toUpperCase())
}

// Stripe processing rates by card origin.
// These are the rates Stripe charges the platform on destination charges.
// source: https://stripe.com/en-ro/pricing
const STRIPE_RATE_EU     = 0.015  // 1.5%  + fixed fee (EU/EEA cards)
const STRIPE_RATE_NON_EU = 0.0325 // 3.25% + fixed fee (non-EU cards)
const PLATFORM_FEE_RATE  = 0.01   // 1% platform fee (Peachfuzz Media)

/**
 * Calculate the application_fee_amount (in smallest currency unit) to capture on a donation.
 *
 * Fee model:
 *   - Donor pays exactly `donationAmount` (no surcharge).
 *   - Organiser absorbs: Stripe processing fee + 1% platform fee.
 *   - Optional donor tip is added on top of the application fee — also goes to the platform.
 *
 * application_fee = (donation × (stripe_rate + platform_rate)) + stripe_fixed_fee + tip
 * Organiser nets  = donation - (donation × (stripe_rate + platform_rate)) - stripe_fixed_fee
 *
 * @param donationAmount  Donation amount in the currency's major unit (e.g. RON, EUR, GBP)
 * @param tipAmount       Optional donor tip in the same major unit (default 0)
 * @param cardCountry     ISO 3166-1 alpha-2 card-issuing country (determines Stripe rate)
 * @param currency        ISO 4217 currency code — used to look up the correct fixed fee
 * @returns               Object with fee components, all in smallest currency unit (bani/cents/pence)
 */
export function calculateFees(
  donationAmount: number,
  tipAmount: number = 0,
  cardCountry: string = 'RO',
  currency: string = 'ron'
): {
  stripeFeeParts: number  // Stripe processing fee in smallest unit
  platformFee: number     // 1% platform fee in smallest unit
  tipSmallestUnit: number // tip in smallest unit
  applicationFee: number  // total application_fee_amount = stripeFeeParts + platformFee + tip
} {
  const isEU = isEuCard(cardCountry)
  const stripeRate = isEU ? STRIPE_RATE_EU : STRIPE_RATE_NON_EU
  const stripeFixed = getStripeFixedFee(currency)
  const multiplier = getCurrencyMultiplier(currency)

  const stripeFeeParts = Math.round((donationAmount * stripeRate + stripeFixed) * multiplier)
  const platformFee    = Math.round(donationAmount * PLATFORM_FEE_RATE * multiplier)
  const tipSmallestUnit = Math.round(tipAmount * multiplier)
  const applicationFee  = stripeFeeParts + platformFee + tipSmallestUnit

  return { stripeFeeParts, platformFee, tipSmallestUnit, applicationFee }
}

/**
 * Stripe's fixed fee per successful charge, in major currency units.
 * Source: Stripe pricing pages per currency.
 */
function getStripeFixedFee(currency: string): number {
  switch (currency.toLowerCase()) {
    case 'ron': return 1.25   // ≈ 0.25 EUR in RON
    case 'eur': return 0.25
    case 'gbp': return 0.20
    case 'usd': return 0.30
    case 'chf': return 0.30
    case 'sek': return 1.80
    case 'dkk': return 1.80
    case 'nok': return 2.00
    case 'pln': return 1.00
    case 'czk': return 6.50
    case 'huf': return 85.00
    default:    return 0.25   // fallback to EUR-equivalent
  }
}

/**
 * Number of smallest units per major unit for a given currency.
 * All currencies here use 100 (cents/bani/pence etc.) — no zero-decimal currencies in scope.
 */
function getCurrencyMultiplier(currency: string): number {
  switch (currency.toLowerCase()) {
    case 'huf': return 1  // HUF is a zero-decimal currency in Stripe
    default:    return 100
  }
}

// Legacy wrapper kept for any callers that haven't migrated yet.
// Returns the total application fee in major currency units (RON).
export function calculateCommission(donationRon: number, cardCountry = 'RO'): number {
  const { stripeFeeParts, platformFee } = calculateFees(donationRon, 0, cardCountry, 'ron')
  return (stripeFeeParts + platformFee) / 100
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}
