import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export async function createConnectAccount(
  organiserEmail: string,
  // business_type is intentionally NOT pre-set — Stripe Express onboarding asks
  // the organiser to identify themselves as individual or company in their own
  // flow. Pre-setting it (especially with an MCC) caused Stripe to show
  // business/company questions even for regular people.
  _businessType: 'individual' | 'company' = 'individual',
  // ISO 3166-1 alpha-2 country code for the organiser's bank account country.
  // Determines the default payout currency — RO → RON, GB → GBP, etc.
  // Defaults to RO so existing behaviour is unchanged for Romanian organisers.
  country: string = 'RO'
): Promise<Stripe.Account> {
  const stripe = getStripe()

  const account = await stripe.accounts.create({
    type: 'express',
    country: country.toUpperCase(),
    email: organiserEmail,
    // business_profile.url is required; product_description helps Stripe's
    // risk review understand what the platform does.
    business_profile: {
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
