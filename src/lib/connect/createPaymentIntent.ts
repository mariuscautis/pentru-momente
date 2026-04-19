import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export interface CreatePaymentIntentParams {
  amount: number             // donation amount in RON bani (RON × 100)
  tipAmount: number          // optional platform tip in RON bani (chosen by donor)
  commissionAmount: number   // mandatory platform commission in RON bani (deducted from what organiser receives)
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

  // Donor pays: donation + tip (commission is not added on top — it is deducted from organiser's share)
  const totalAmount = params.amount + params.tipAmount
  // Platform captures: commission (deducted from organiser) + tip (added by donor)
  // Organiser receives: donation − commission
  const applicationFee = params.commissionAmount + params.tipAmount

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
      commissionAmount: String(params.commissionAmount),
      displayName: params.displayName ?? '',
      donorEmail: params.donorEmail ?? '',
      message: params.message ?? '',
      isAnonymous: String(params.isAnonymous),
      showAmount: String(params.showAmount),
    },
  })
}
