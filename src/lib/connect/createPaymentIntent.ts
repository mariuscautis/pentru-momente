import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export interface CreatePaymentIntentParams {
  amount: number           // donation amount in RON bani (RON × 100)
  tipAmount: number        // platform tip in RON bani
  stripeFee: number        // Stripe processing fee in RON bani (passed through to donor)
  connectAccountId: string // organiser's Stripe Express account ID
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

  // Verify the destination account has transfers capability before attempting the charge.
  // Without it Stripe throws a confusing raw error instead of a clean decline.
  const account = await stripe.accounts.retrieve(params.connectAccountId)
  const caps = account.capabilities ?? {}
  const hasTransfers = caps.transfers === 'active' || caps.legacy_payments === 'active'
  if (!hasTransfers) {
    throw new Error(
      'Pagina nu este complet activată pentru plăți. Organizatorul trebuie să finalizeze configurarea contului Stripe.'
    )
  }

  // Donor pays: donation + tip + stripe fee
  const totalAmount = params.amount + params.tipAmount + params.stripeFee
  // Platform receives the tip as application_fee; stripe fee covers processing cost
  const applicationFee = params.tipAmount + params.stripeFee

  return stripe.paymentIntents.create({
    amount: totalAmount,
    currency: 'ron',
    application_fee_amount: applicationFee,
    transfer_data: {
      destination: params.connectAccountId,
    },
    automatic_payment_methods: { enabled: true },
    metadata: {
      eventId: params.eventId,
      itemId: params.itemId ?? '',
      donationAmount: String(params.amount),
      tipAmount: String(params.tipAmount),
      stripeFee: String(params.stripeFee),
      displayName: params.displayName ?? '',
      donorEmail: params.donorEmail ?? '',
      message: params.message ?? '',
      isAnonymous: String(params.isAnonymous),
      showAmount: String(params.showAmount),
    },
  })
}
