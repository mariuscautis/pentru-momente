import { NextRequest, NextResponse } from 'next/server'
import { ApiError } from '@/types'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const ADMIN_EMAIL = 'info@pentrumomente.ro'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pentrumomente.ro'

const REASON_LABELS: Record<string, string> = {
  fraud:       'Fraudă sau înșelătorie',
  fake:        'Eveniment fals',
  offensive:   'Conținut ofensator',
  spam:        'Spam',
  other:       'Alt motiv',
}

interface ReportBody {
  eventId: string
  eventSlug: string
  eventType: string
  eventName: string
  reason: string
  details: string
  reporterEmail?: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: ReportBody
  try {
    body = await req.json() as ReportBody
  } catch {
    return NextResponse.json<ApiError>({ error: 'Invalid request body' }, { status: 400 })
  }

  const { eventId, eventSlug, eventType, eventName, reason, details, reporterEmail } = body

  if (!eventId || !reason || !details?.trim() || !reporterEmail?.trim()) {
    return NextResponse.json<ApiError>({ error: 'eventId, reason, details and reporterEmail are required' }, { status: 400 })
  }

  if (details.trim().length < 10) {
    return NextResponse.json<ApiError>({ error: 'Details too short' }, { status: 400 })
  }

  const eventUrl = `${APP_URL}/${eventType}/${eventSlug}`
  const reasonLabel = REASON_LABELS[reason] ?? reason
  const reportedAt = new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1C1209">
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#B91C1C">
        Pagina &ldquo;${eventName}&rdquo; a fost raportata.
      </h2>

      <p style="margin:0 0 20px;font-size:14px;color:#5A3D25">
        <strong>${eventName}</strong> &mdash;
        <a href="${eventUrl}" style="color:#C4956A">${eventUrl}</a><br/>
        Motiv raportat: <strong>${reasonLabel}</strong>
      </p>

      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr>
          <td style="padding:8px 12px;background:#FFF5F5;font-weight:600;width:140px;border:1px solid #FCA5A5">Detalii</td>
          <td style="padding:8px 12px;background:#FFFDFB;border:1px solid #EDE0D0;white-space:pre-wrap">${details.trim()}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#FFF5F5;font-weight:600;border:1px solid #FCA5A5">Reporter</td>
          <td style="padding:8px 12px;background:#FFFDFB;border:1px solid #EDE0D0">${reporterEmail?.trim() || '(anonim)'}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#FFF5F5;font-weight:600;border:1px solid #FCA5A5">Event ID</td>
          <td style="padding:8px 12px;background:#FFFDFB;border:1px solid #EDE0D0;font-family:monospace;font-size:12px">${eventId}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#FFF5F5;font-weight:600;border:1px solid #FCA5A5">Data</td>
          <td style="padding:8px 12px;background:#FFFDFB;border:1px solid #EDE0D0">${reportedAt}</td>
        </tr>
      </table>

      <p style="margin:20px 0 0;font-size:12px;color:#9A7B60">
        Trimis automat de la pentrumomente.ro
      </p>
    </div>
  `

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'pentrumomente.ro', email: 'noreply@pentrumomente.ro' },
        to: [{ email: ADMIN_EMAIL, name: 'Admin' }],
        subject: `Pagina "${eventName}" a fost raportata — ${reasonLabel}`,
        htmlContent: html,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[report] Brevo error:', res.status, text)
      return NextResponse.json<ApiError>({ error: 'Failed to send report' }, { status: 502 })
    }
  } catch (err) {
    console.error('[report] unexpected error:', err)
    return NextResponse.json<ApiError>({ error: 'Failed to send report' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
