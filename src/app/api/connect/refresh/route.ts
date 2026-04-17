import { NextRequest, NextResponse } from 'next/server'
import { createOnboardingLink } from '@/lib/connect/createOnboardingLink'
import { supabase } from '@/lib/db/supabase'
import { ApiError } from '@/types'

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { eventSlug: string }
  try {
    body = (await req.json()) as { eventSlug: string }
  } catch {
    return NextResponse.json<ApiError>({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.eventSlug) {
    return NextResponse.json<ApiError>({ error: 'eventSlug is required' }, { status: 400 })
  }

  const { data: event } = await supabase
    .from('events')
    .select('stripe_connect_account_id')
    .eq('slug', body.eventSlug)
    .single()

  if (!event?.stripe_connect_account_id) {
    return NextResponse.json<ApiError>({ error: 'No Connect account found' }, { status: 404 })
  }

  try {
    const onboardingUrl = await createOnboardingLink(
      event.stripe_connect_account_id as string,
      body.eventSlug
    )
    return NextResponse.json({ onboardingUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to refresh onboarding link'
    return NextResponse.json<ApiError>({ error: message }, { status: 500 })
  }
}
