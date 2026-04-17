import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export async function createConnectAccount(organiserEmail: string): Promise<Stripe.Account> {
  const account = await getStripe().accounts.create({
    type: 'express',
    country: 'RO',
    email: organiserEmail,
    business_type: 'individual',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })
  return account
}
