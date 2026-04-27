import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase, supabaseAdmin } from '@/lib/db/supabase'
import { ApiError } from '@/types'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

// Creates a short-lived AccountSession token for embedded Connect components.
// Called client-side each time the onboarding page mounts.
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

  const { eventId } = await req.json() as { eventId: string }
  if (!eventId) return NextResponse.json<ApiError>({ error: 'eventId required' }, { status: 400 })

  // Verify the event belongs to this organiser and get the Connect account ID
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, organiser_id, stripe_connect_account_id')
    .eq('id', eventId)
    .eq('organiser_id', user.id)
    .maybeSingle()

  if (!event || !event.stripe_connect_account_id) {
    return NextResponse.json<ApiError>({ error: 'Event or Connect account not found' }, { status: 404 })
  }

  const accountSession = await getStripe().accountSessions.create({
    account: event.stripe_connect_account_id as string,
    components: {
      account_onboarding: { enabled: true },
    },
  })

  return NextResponse.json({ clientSecret: accountSession.client_secret })
}
