import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export async function createOnboardingLink(
  accountId: string,
  eventSlug: string
): Promise<string> {
  const accountLink = await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/onboarding/refresh?slug=${eventSlug}`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/onboarding/complete?slug=${eventSlug}`,
    type: 'account_onboarding',
  })
  return accountLink.url
}
