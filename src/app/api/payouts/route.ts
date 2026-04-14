import { NextRequest, NextResponse } from 'next/server'
import { createPayout, updatePayoutWithTransfer, getPayoutsForEvent } from '@/lib/db/payouts'
import { getTotalRaisedForEvent } from '@/lib/db/donations'
import { getEventById } from '@/lib/db/events'
import { initiatePayout } from '@/lib/payouts/wise'
import { sendPayoutInitiatedEmail } from '@/lib/email/brevo'
import { supabase } from '@/lib/db/supabase'
import { ApiError } from '@/types'

const MIN_PAYOUT_RON = 50

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Verify authenticated organiser session
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as { eventId: string; amount: number }

  const event = await getEventById(body.eventId)
  if (!event) {
    return NextResponse.json<ApiError>({ error: 'Event not found' }, { status: 404 })
  }

  if (event.organiserId !== user.id) {
    return NextResponse.json<ApiError>({ error: 'Forbidden' }, { status: 403 })
  }

  if (body.amount < MIN_PAYOUT_RON) {
    return NextResponse.json<ApiError>(
      { error: `Suma minimă pentru retragere este ${MIN_PAYOUT_RON} RON` },
      { status: 400 }
    )
  }

  const totalRaised = await getTotalRaisedForEvent(event.id)
  if (body.amount > totalRaised) {
    return NextResponse.json<ApiError>(
      { error: 'Suma solicitată depășește totalul strâns' },
      { status: 400 }
    )
  }

  // Create payout record first
  const payout = await createPayout({
    eventId: event.id,
    amount: body.amount,
    organiserIban: event.organiserIban,
  })

  // Initiate Wise transfer
  let wiseTransferId: string
  try {
    const result = await initiatePayout({
      amountRon: body.amount,
      organiserIban: event.organiserIban,
      organiserName: event.name,
      reference: `pentrumomente-${event.slug}`,
    })
    wiseTransferId = result.wiseTransferId
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payout initiation failed'
    return NextResponse.json<ApiError>({ error: message }, { status: 500 })
  }

  await updatePayoutWithTransfer(payout.id, wiseTransferId)

  // Email notification — organiser email from user metadata
  const organiserEmail = user.email ?? ''
  const organiserName = (user.user_metadata?.full_name as string | undefined) ?? event.name

  await sendPayoutInitiatedEmail(organiserEmail, organiserName, event.name, body.amount, wiseTransferId)

  return NextResponse.json({ payoutId: payout.id, wiseTransferId })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get('eventId')
  if (!eventId) {
    return NextResponse.json<ApiError>({ error: 'eventId is required' }, { status: 400 })
  }

  const event = await getEventById(eventId)
  if (!event || event.organiserId !== user.id) {
    return NextResponse.json<ApiError>({ error: 'Forbidden' }, { status: 403 })
  }

  const payouts = await getPayoutsForEvent(eventId)
  return NextResponse.json({ payouts })
}
