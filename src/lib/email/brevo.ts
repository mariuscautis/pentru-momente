import { Donation, Event, EventTypeConfig } from '@/types'
import type { EventSummaryStats } from '@/lib/db/donations'

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
  const payload = {
    sender: { name: 'pentrumomente.ro', email: 'noreply@pentrumomente.ro' },
    ...params,
  }
  console.log('[brevo] sending email to:', JSON.stringify(params.to))

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[brevo] API error:', res.status, text)
    throw new Error(`Brevo API error ${res.status}: ${text}`)
  }
  console.log('[brevo] email sent successfully')
}

export interface DonationEmailContext {
  donation: Donation
  event: Event
  config: EventTypeConfig
  donorEmail?: string
  organiserEmail: string
  organiserName: string
}

// Resolve {eventName} token in copy strings
function resolveCopy(template: string, eventName: string): string {
  return template.replace(/\{eventName\}/g, eventName)
}

function buildDonorConfirmationHtml(ctx: DonationEmailContext): string {
  const { donation, event, config } = ctx
  const eventUrl = `${APP_URL}/${event.eventType}/${event.slug}`
  const primary = config.palette.primary
  const donorName = donation.isAnonymous ? 'Donator anonim' : (donation.displayName ?? 'Donator')

  // tip_amount in DB = commission + optional donor tip. Recalculate commission to extract tip.
  const commission = Math.round((donation.amount * 0.025 + 1.25) * 100) / 100
  const donorTip = Math.round(Math.max(0, donation.tipAmount - commission) * 100) / 100
  // Donor paid: donation + tip (commission is deducted from organiser, not added to donor charge)
  const totalAmount = donation.amount + donorTip

  const subject = resolveCopy(config.copy.donationEmailSubject, event.name)
  const intro = resolveCopy(config.copy.donationEmailIntro, event.name)

  const tipRow = donorTip > 0
    ? `<tr>
        <td style="padding:6px 0;color:#9A7B60;font-size:14px;">Contribuție platformă</td>
        <td style="padding:6px 0;color:#9A7B60;font-size:14px;text-align:right;">${donorTip} Lei</td>
      </tr>`
    : ''

  const messageBlock = donation.message
    ? `<div style="margin:24px 0;padding:16px 20px;background:#F5EDE3;border-left:3px solid ${primary};border-radius:8px;">
        <p style="margin:0;font-size:14px;color:#7A6652;font-style:italic;">"${donation.message}"</p>
      </div>`
    : ''

  const anonymousNote = donation.isAnonymous
    ? `<p style="margin:16px 0 0;font-size:13px;color:#9A7B60;text-align:center;">
        Donația ta este anonimă față de organizator — numele tău nu va fi afișat pe pagină.
      </p>`
    : ''

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#FAF6F1;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F1;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #EDE0D0;">

          <!-- Header band -->
          <tr>
            <td style="background:${primary};padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.75);">pentrumomente.ro</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#FFFFFF;line-height:1.3;">Mulțumim pentru donația ta!</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <p style="margin:0 0 20px;font-size:15px;color:#4A3728;line-height:1.6;">
                Bună, <strong>${donorName}</strong>,
              </p>

              <p style="margin:0 0 24px;font-size:15px;color:#4A3728;line-height:1.6;">
                ${intro}
              </p>

              ${messageBlock}

              <!-- Amount summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5EDE3;border-radius:10px;padding:16px 20px;margin:24px 0;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;color:#7A6652;font-size:14px;">Donație pentru ${event.name}</td>
                        <td style="padding:6px 0;color:#7A6652;font-size:14px;text-align:right;">${donation.amount} Lei</td>
                      </tr>
                      ${tipRow}
                      <tr>
                        <td style="padding:10px 0 4px;font-size:15px;font-weight:700;color:#2D2016;border-top:1px solid #EDE0D0;">Total plătit</td>
                        <td style="padding:10px 0 4px;font-size:15px;font-weight:700;color:#2D2016;text-align:right;border-top:1px solid #EDE0D0;">${totalAmount} Lei</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${anonymousNote}

              <!-- CTA -->
              <div style="text-align:center;margin:32px 0 8px;">
                <a href="${eventUrl}"
                   style="display:inline-block;background:${primary};color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:10px;">
                  Vezi pagina evenimentului
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#FAF6F1;padding:20px 32px;text-align:center;border-top:1px solid #EDE0D0;">
              <p style="margin:0;font-size:12px;color:#B09070;line-height:1.6;">
                Acest email este confirmarea donației tale. Păstrează-l pentru evidența personală.<br/>
                <a href="${APP_URL}" style="color:#C4956A;text-decoration:none;">pentrumomente.ro</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendDonationConfirmationToDonor(ctx: DonationEmailContext): Promise<void> {
  if (!ctx.donorEmail) return

  const subject = resolveCopy(ctx.config.copy.donationEmailSubject, ctx.event.name)
  const html = buildDonorConfirmationHtml(ctx)
  const donorName = ctx.donation.isAnonymous ? undefined : (ctx.donation.displayName ?? undefined)

  await sendEmail({
    to: [{ email: ctx.donorEmail, name: donorName }],
    subject,
    htmlContent: html,
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

// Triggered when an event is closed (manually or by expiry)
export async function sendEventClosedSummaryEmail(
  organiserEmail: string,
  organiserName: string,
  event: Event,
  config: EventTypeConfig,
  stats: EventSummaryStats,
  reason: 'manual' | 'expired'
): Promise<void> {
  const html = buildEventClosedHtml(organiserName, event, config, stats, reason)
  await sendEmail({
    to: [{ email: organiserEmail, name: organiserName }],
    subject: `Rezumatul paginii tale — ${event.name}`,
    htmlContent: html,
  })
}

function fmt(n: number): string {
  return new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function buildEventClosedHtml(
  organiserName: string,
  event: Event,
  config: EventTypeConfig,
  stats: EventSummaryStats,
  reason: 'manual' | 'expired'
): string {
  const primary = config.palette.primary
  const eventUrl = `${APP_URL}/${event.eventType}/${event.slug}`

  const reasonLine = reason === 'expired'
    ? 'Pagina ta a ajuns la data de expirare și a fost închisă automat.'
    : 'Pagina ta de donații a fost închisă.'

  const durationLine = stats.firstDonationAt && stats.lastDonationAt
    ? `<p style="margin:0 0 24px;font-size:14px;color:#9A7B60;text-align:center;">
        ${fmtDate(stats.firstDonationAt)} — ${fmtDate(stats.lastDonationAt)}
      </p>`
    : ''

  const statsRows = [
    { label: 'Total strâns', value: `${fmt(stats.totalRaised)} Lei`, highlight: true },
    { label: 'Număr donații', value: String(stats.donationCount) },
    { label: 'Donatori unici', value: String(stats.uniqueDonors) },
    { label: 'Donația cea mai mare', value: `${fmt(stats.largestDonation)} Lei` },
  ].filter((r) => stats.donationCount > 0 || r.label === 'Total strâns')

  const statsHtml = statsRows.map((row) => `
    <tr>
      <td style="padding:12px 20px;font-size:14px;color:#7A6652;border-bottom:1px solid #F0E8DC;">${row.label}</td>
      <td style="padding:12px 20px;font-size:${row.highlight ? '18px' : '14px'};font-weight:${row.highlight ? '700' : '500'};color:${row.highlight ? primary : '#2D2016'};text-align:right;border-bottom:1px solid #F0E8DC;">${row.value}</td>
    </tr>`).join('')

  const noDonationsNote = stats.donationCount === 0
    ? `<p style="margin:24px 0;font-size:14px;color:#9A7B60;text-align:center;font-style:italic;">
        Nu au fost înregistrate donații pe această pagină.
      </p>`
    : ''

  const goalBlock = event.goalAmount && stats.donationCount > 0
    ? (() => {
        const pct = Math.min(100, Math.round((stats.totalRaised / event.goalAmount!) * 100))
        return `
        <div style="margin:24px 0;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:13px;color:#9A7B60;">Progres față de obiectiv</span>
            <span style="font-size:13px;font-weight:600;color:${primary};">${pct}%</span>
          </div>
          <div style="background:#EDE0D0;border-radius:99px;height:8px;overflow:hidden;">
            <div style="background:${primary};height:8px;border-radius:99px;width:${pct}%;"></div>
          </div>
          <p style="margin:6px 0 0;font-size:12px;color:#B09070;text-align:right;">
            ${fmt(stats.totalRaised)} Lei din ${fmt(event.goalAmount!)} Lei
          </p>
        </div>`
      })()
    : ''

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rezumatul paginii — ${event.name}</title>
</head>
<body style="margin:0;padding:0;background:#FAF6F1;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F1;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #EDE0D0;">

          <!-- Header -->
          <tr>
            <td style="background:${primary};padding:36px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.65);">pentrumomente.ro</p>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#FFFFFF;line-height:1.3;">${event.name}</h1>
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.80);">${reasonLine}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 0;">

              <p style="margin:0 0 8px;font-size:15px;color:#4A3728;line-height:1.6;">
                Bună, <strong>${organiserName}</strong>,
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#4A3728;line-height:1.6;">
                Îți mulțumim că ai folosit pentrumomente.ro pentru a strânge fonduri în acest moment important. Mai jos găsești un rezumat complet al activității paginii tale.
              </p>

              <!-- Stats table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #EDE0D0;margin-bottom:8px;">
                <thead>
                  <tr style="background:#F5EDE3;">
                    <td colspan="2" style="padding:14px 20px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9A7B60;">
                      Statistici pagină
                    </td>
                  </tr>
                </thead>
                <tbody>
                  ${statsHtml}
                </tbody>
              </table>

              ${noDonationsNote}
              ${durationLine}
              ${goalBlock}

            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px 32px;">
              <div style="text-align:center;">
                <a href="${eventUrl}"
                   style="display:inline-block;background:${primary};color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:10px;">
                  Vezi pagina
                </a>
              </div>
            </td>
          </tr>

          <!-- Thank you divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="border-top:1px solid #F0E8DC;"></div>
            </td>
          </tr>

          <!-- Thank you message -->
          <tr>
            <td style="padding:32px;text-align:center;">
              <p style="margin:0 0 10px;font-size:22px;">🤍</p>
              <h2 style="margin:0 0 12px;font-size:17px;font-weight:700;color:#2D2016;">Mulțumim că ai ales pentrumomente.ro</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#7A6652;line-height:1.7;max-width:420px;margin-left:auto;margin-right:auto;">
                Fie că a fost un moment de bucurie sau unul de grea cumpănă, suntem onorati că am putut fi alături de tine și de cei dragi în acest timp. Fiecare donație strânsă pe pagina ta reprezintă un gest de solidaritate uman — și asta contează enorm.
              </p>
              <p style="margin:0;font-size:14px;color:#7A6652;line-height:1.7;">
                Dacă vei mai avea nevoie de noi, ne găsești oricând pe <a href="${APP_URL}" style="color:${primary};text-decoration:none;font-weight:600;">pentrumomente.ro</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#FAF6F1;padding:20px 32px;text-align:center;border-top:1px solid #EDE0D0;">
              <p style="margin:0;font-size:12px;color:#B09070;line-height:1.6;">
                Acest email a fost trimis automat la închiderea paginii tale de donații.<br/>
                <a href="${APP_URL}" style="color:#C4956A;text-decoration:none;">pentrumomente.ro</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
