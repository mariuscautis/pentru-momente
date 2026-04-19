import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/supabase'
import { getEventById } from '@/lib/db/events'
import { getEventSummaryStats } from '@/lib/db/donations'
import { sendEventClosedSummaryEmail } from '@/lib/email/brevo'
import { getEventTypeConfig } from '@/config/event-types'

// Called daily by Vercel Cron (see vercel.json).
// Finds all active events whose expires_at has passed, deactivates them,
// and sends a summary email to the organiser.
export async function GET(req: NextRequest): Promise<NextResponse> {
  // Verify the request comes from Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()

  // Find active events that have expired
  const { data: expiredRows, error } = await supabaseAdmin
    .from('events')
    .select('id, organiser_id')
    .eq('is_active', true)
    .not('expires_at', 'is', null)
    .lte('expires_at', now)

  if (error) {
    console.error('[cron/expire-events] query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!expiredRows || expiredRows.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  let processed = 0
  for (const row of expiredRows) {
    const eventId = row.id as string
    const organiserId = row.organiser_id as string

    // Deactivate
    await supabaseAdmin
      .from('events')
      .update({ is_active: false })
      .eq('id', eventId)

    // Send summary email
    try {
      const eventData = await getEventById(eventId)
      if (eventData) {
        const organiserUser = await supabaseAdmin.auth.admin.getUserById(organiserId)
        const organiserEmail = organiserUser.data.user?.email ?? ''
        const organiserName = (organiserUser.data.user?.user_metadata?.full_name as string | undefined) ?? eventData.name
        const stats = await getEventSummaryStats(eventId)
        const config = getEventTypeConfig(eventData.eventType)
        await sendEventClosedSummaryEmail(organiserEmail, organiserName, eventData, config, stats, 'expired')
      }
    } catch (err) {
      console.error(`[cron/expire-events] failed to send email for event ${eventId}:`, err)
    }

    processed++
  }

  console.log(`[cron/expire-events] processed ${processed} expired events`)
  return NextResponse.json({ processed })
}
