import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export interface CreatePaymentIntentParams {
  amount: number             // donation amount in RON bani (RON × 100)
  commissionAmount: number   // mandatory platform commission in RON bani
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

  // Donor pays: donation + commission
  const totalAmount = params.amount + params.commissionAmount
  // Platform captures the commission; organiser receives exactly params.amount
  const applicationFee = params.commissionAmount

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
      commissionAmount: String(params.commissionAmount),
      displayName: params.displayName ?? '',
      donorEmail: params.donorEmail ?? '',
      message: params.message ?? '',
      isAnonymous: String(params.isAnonymous),
      showAmount: String(params.showAmount),
    },
  })
}
