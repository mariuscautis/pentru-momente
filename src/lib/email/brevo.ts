import { Donation, Event, EventTypeConfig } from '@/types'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const BREVO_API_KEY = process.env.BREVO_API_KEY!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

interface BrevoEmailParams {
  to: Array<{ email: string; name?: string }>
  templateId?: number
  subject?: string
  htmlContent?: string
  params?: Record<string, string | number>
}

async function sendEmail(params: BrevoEmailParams): Promise<void> {
  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Brevo API error ${res.status}: ${text}`)
  }
}

export interface DonationEmailContext {
  donation: Donation
  event: Event
  config: EventTypeConfig
  donorEmail?: string
  organiserEmail: string
  organiserName: string
}

export async function sendDonationConfirmationToDonor(ctx: DonationEmailContext): Promise<void> {
  if (!ctx.donorEmail) return

  const eventUrl = `${APP_URL}/${ctx.event.eventType}/${ctx.event.slug}`

  await sendEmail({
    to: [{ email: ctx.donorEmail, name: ctx.donation.displayName }],
    subject: `Mulțumim pentru contribuția ta — ${ctx.event.name}`,
    params: {
      donorName: ctx.donation.displayName ?? 'Anonim',
      eventName: ctx.event.name,
      amount: ctx.donation.amount,
      tipAmount: ctx.donation.tipAmount,
      message: ctx.donation.message ?? '',
      eventUrl,
      organiserName: ctx.organiserName,
    },
  })
}

export async function sendDonationNotificationToOrganiser(
  ctx: DonationEmailContext
): Promise<void> {
  const eventUrl = `${APP_URL}/${ctx.event.eventType}/${ctx.event.slug}`

  await sendEmail({
    to: [{ email: ctx.organiserEmail, name: ctx.organiserName }],
    subject: `Ai primit o donație pentru ${ctx.event.name}`,
    params: {
      donorName: ctx.donation.isAnonymous ? 'Anonim' : (ctx.donation.displayName ?? 'Anonim'),
      eventName: ctx.event.name,
      amount: ctx.donation.amount,
      tipAmount: ctx.donation.tipAmount,
      message: ctx.donation.message ?? '',
      eventUrl,
      organiserName: ctx.organiserName,
    },
  })
}

export async function sendMilestoneEmail(
  ctx: DonationEmailContext,
  milestonePercent: number
): Promise<void> {
  const message = ctx.config.milestoneMessages[milestonePercent]
  if (!message) return

  const eventUrl = `${APP_URL}/${ctx.event.eventType}/${ctx.event.slug}`

  await sendEmail({
    to: [{ email: ctx.organiserEmail, name: ctx.organiserName }],
    subject: `Milestone atins: ${milestonePercent}% — ${ctx.event.name}`,
    params: {
      donorName: '',
      eventName: ctx.event.name,
      amount: 0,
      tipAmount: 0,
      message,
      eventUrl,
      organiserName: ctx.organiserName,
    },
  })
}

// Triggered by Stripe Connect payout.created webhook
export async function sendPayoutSentEmail(
  organiserEmail: string,
  organiserName: string,
  eventName: string,
  amountRon: number
): Promise<void> {
  await sendEmail({
    to: [{ email: organiserEmail, name: organiserName }],
    subject: `Plata a fost inițiată — ${eventName}`,
    params: {
      donorName: '',
      eventName,
      amount: amountRon,
      tipAmount: 0,
      message: 'Suma ta este pe drum. Stripe va efectua plata în contul tău.',
      eventUrl: '',
      organiserName,
    },
  })
}

// Triggered by Stripe Connect payout.paid webhook
export async function sendPayoutConfirmedEmail(
  organiserEmail: string,
  organiserName: string,
  eventName: string,
  amountRon: number
): Promise<void> {
  await sendEmail({
    to: [{ email: organiserEmail, name: organiserName }],
    subject: `Plata a fost finalizată — ${eventName}`,
    params: {
      donorName: '',
      eventName,
      amount: amountRon,
      tipAmount: 0,
      message: 'Suma a ajuns în contul tău bancar.',
      eventUrl: '',
      organiserName,
    },
  })
}
