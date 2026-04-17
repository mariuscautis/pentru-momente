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
    individual: {
      email: organiserEmail,
    },
    business_profile: {
      mcc: '8398',          // charitable/social service organisations
      url: process.env.NEXT_PUBLIC_APP_URL,
      product_description: 'Fundraising platform for personal life events',
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })
  return account
}
