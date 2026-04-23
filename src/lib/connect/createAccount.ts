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

  // For individual organisers (the vast majority), pre-set business_type to
  // 'individual' so Stripe skips the business-type question and goes straight
  // to personal identity fields (name, DOB, address, IBAN).
  // For company accounts, leave Stripe to collect business details.
  const isIndividual = _businessType !== 'company'

  const account = await stripe.accounts.create({
    type: 'express',
    country: country.toUpperCase(),
    email: organiserEmail,
    ...(isIndividual ? {
      business_type: 'individual',
      individual: { email: organiserEmail },
    } : {
      // For company accounts, provide business profile so Stripe has context.
      business_profile: {
        url: process.env.NEXT_PUBLIC_APP_URL,
        product_description: 'Platformă de strângere de fonduri pentru momente de viață',
      },
    }),
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })

  return account
}
