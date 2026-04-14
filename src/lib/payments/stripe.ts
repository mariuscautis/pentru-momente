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

export interface CreatePaymentIntentInput {
  amountRon: number      // donation amount in RON
  tipAmountRon: number   // platform tip in RON
  eventId: string
  itemId?: string
  displayName?: string
  message?: string
  isAnonymous: boolean
  showAmount: boolean
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<Stripe.PaymentIntent> {
  const totalBani = Math.round((input.amountRon + input.tipAmountRon) * 100) // RON -> bani

  return stripe.paymentIntents.create({
    amount: totalBani,
    currency: 'ron',
    automatic_payment_methods: { enabled: true },
    metadata: {
      eventId: input.eventId,
      itemId: input.itemId ?? '',
      donationAmount: String(input.amountRon),
      tipAmount: String(input.tipAmountRon),
      displayName: input.displayName ?? '',
      message: input.message ?? '',
      isAnonymous: String(input.isAnonymous),
      showAmount: String(input.showAmount),
    },
  })
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
