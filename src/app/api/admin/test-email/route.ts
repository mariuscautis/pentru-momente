import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
  const apiKey = process.env.BREVO_API_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!apiKey) {
    return NextResponse.json({ error: 'BREVO_API_KEY not set' }, { status: 500 })
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'pentrumomente.ro', email: 'noreply@pentrumomente.ro' },
      to: [{ email: 'cautismar@gmail.com' }],
      subject: 'Test from Vercel',
      htmlContent: `<p>Brevo key works from Vercel. APP_URL=${appUrl}</p>`,
    }),
  })

  const data = await res.json() as Record<string, unknown>
  return NextResponse.json({ status: res.status, data })
}
