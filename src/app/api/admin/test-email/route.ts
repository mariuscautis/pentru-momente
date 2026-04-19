import { NextRequest, NextResponse } from 'next/server'
import { sendDonationConfirmationToDonor } from '@/lib/email/brevo'
import { getEventTypeConfig } from '@/config/event-types'
import type { Donation, Event } from '@/types'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const to = searchParams.get('to') ?? 'cautismar@gmail.com'
  const mode = searchParams.get('mode') ?? 'full'

  const apiKey = process.env.BREVO_API_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  // Step 1: raw Brevo ping
  if (mode === 'ping') {
    if (!apiKey) return NextResponse.json({ error: 'BREVO_API_KEY not set' }, { status: 500 })

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'pentrumomente.ro', email: 'noreply@pentrumomente.ro' },
        to: [{ email: to }],
        subject: 'Brevo ping test',
        htmlContent: `<p>Raw Brevo ping OK. APP_URL=${appUrl}, key prefix=${apiKey.slice(0, 20)}</p>`,
      }),
    })
    const data = await res.json() as Record<string, unknown>
    return NextResponse.json({ mode: 'ping', to, brevoStatus: res.status, data })
  }

  // Step 2: full donor confirmation email via the real sendDonationConfirmationToDonor path
  const mockDonation: Donation = {
    id: 'test-id',
    eventId: 'test-event-id',
    amount: 100,
    tipAmount: 0,
    displayName: 'Donator Test',
    message: 'Acesta este un mesaj de test.',
    isAnonymous: false,
    showAmount: true,
    stripePaymentIntentId: 'pi_test',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }

  const mockEvent: Event = {
    id: 'test-event-id',
    slug: 'test-page',
    eventType: 'inmormantare',
    name: 'Ion Popescu',
    organiserId: 'test-organiser',
    connectOnboardingComplete: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  }

  const config = getEventTypeConfig('inmormantare')

  try {
    await sendDonationConfirmationToDonor({
      donation: mockDonation,
      event: mockEvent,
      config,
      donorEmail: to,
      organiserEmail: '',
      organiserName: mockEvent.name,
    })
    return NextResponse.json({ mode: 'full', to, result: 'email sent — check inbox' })
  } catch (err) {
    return NextResponse.json({
      mode: 'full',
      to,
      error: err instanceof Error ? err.message : String(err),
      brevoKeyPresent: !!apiKey,
      brevoKeyPrefix: apiKey?.slice(0, 20),
    }, { status: 500 })
  }
}
