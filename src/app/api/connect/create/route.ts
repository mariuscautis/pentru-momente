import { NextRequest, NextResponse } from 'next/server'
import { createConnectAccount } from '@/lib/connect/createAccount'
import { createOnboardingLink } from '@/lib/connect/createOnboardingLink'
import { supabase, supabaseAdmin } from '@/lib/db/supabase'
import { ApiError } from '@/types'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { eventId: string; eventSlug: string }
  try {
    body = (await req.json()) as { eventId: string; eventSlug: string }
  } catch {
    return NextResponse.json<ApiError>({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.eventId || !body.eventSlug) {
    return NextResponse.json<ApiError>({ error: 'eventId and eventSlug are required' }, { status: 400 })
  }

  // Verify the event belongs to this organiser
  const { data: event } = await supabase
    .from('events')
    .select('id, organiser_id, stripe_connect_account_id')
    .eq('id', body.eventId)
    .single()

  if (!event || (event.organiser_id as string) !== user.id) {
    return NextResponse.json<ApiError>({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    let accountId = event.stripe_connect_account_id as string | null

    // Create Express account only if one doesn't exist yet
    if (!accountId) {
      const account = await createConnectAccount(user.email ?? '')
      accountId = account.id

      await supabaseAdmin
        .from('events')
        .update({ stripe_connect_account_id: accountId })
        .eq('id', body.eventId)
    }

    const onboardingUrl = await createOnboardingLink(accountId, body.eventSlug)
    return NextResponse.json({ onboardingUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create Connect account'
    return NextResponse.json<ApiError>({ error: message }, { status: 500 })
  }
}
