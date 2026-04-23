import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export interface CreatePaymentIntentParams {
  // Donation amount in the currency's smallest unit (e.g. bani for RON, cents for EUR)
  amount: number
  // application_fee_amount in smallest unit: covers Stripe fee + 1% platform fee + donor tip.
  // Pre-calculated by calculateFees() in src/lib/payments/stripe.ts.
  applicationFee: number
  // ISO 4217 currency code in lowercase (e.g. 'ron', 'eur', 'gbp').
  // Determined by the organiser's Connect account default currency.
  // Donor pays in this currency; if their card is in a different currency,
  // Stripe converts at their expense (no conversion cost to organiser or platform).
  currency: string
  connectAccountId: string   // organiser's Stripe Express account ID
  eventId: string
  itemId?: string
  displayName?: string
  donorEmail?: string
  message?: string
  isAnonymous: boolean
  showAmount: boolean
}

export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe()

  // Destination charge:
  //   - Donor is charged `amount` in `currency`.
  //   - `application_fee_amount` is captured by the platform (Peachfuzz Media).
  //   - Remaining funds transfer to organiser's Express account automatically.
  //
  // on_behalf_of is set so Stripe treats the charge as originating from the
  // connected account's country — ensures correct statement descriptor and
  // regulatory treatment for Romanian organisers.
  return stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency,
    application_fee_amount: params.applicationFee,
    on_behalf_of: params.connectAccountId,
    transfer_data: {
      destination: params.connectAccountId,
    },
    automatic_payment_methods: { enabled: true },
    metadata: {
      eventId: params.eventId,
      itemId: params.itemId ?? '',
      donationAmount: String(params.amount),
      applicationFee: String(params.applicationFee),
      currency: params.currency,
      displayName: params.displayName ?? '',
      donorEmail: params.donorEmail ?? '',
      message: params.message ?? '',
      isAnonymous: String(params.isAnonymous),
      showAmount: String(params.showAmount),
    },
  })
}
