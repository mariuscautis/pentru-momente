import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export async function createConnectAccount(
  organiserEmail: string,
  businessType: 'individual' | 'company' = 'individual'
): Promise<Stripe.Account> {
  const stripe = getStripe()

  const account = await stripe.accounts.create({
    type: 'express',
    country: 'RO',
    email: organiserEmail,
    business_type: businessType,
    ...(businessType === 'individual'
      ? { individual: { email: organiserEmail } }
      : { company: {} }
    ),
    business_profile: {
      mcc: '8398',          // charitable/social service organisations
      url: process.env.NEXT_PUBLIC_APP_URL,
      product_description: 'Platformă de strângere de fonduri pentru momente de viață',
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })

  return account
}
