import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/db/supabase'
import { ApiError } from '@/types'

// Returns confirmed donations for a specific event, authenticated as the organiser.
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

  const eventId = req.nextUrl.searchParams.get('eventId')
  if (!eventId) {
    return NextResponse.json<ApiError>({ error: 'eventId is required' }, { status: 400 })
  }

  // Verify the event belongs to this organiser
  const { data: eventRow } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('organiser_id', user.id)
    .maybeSingle()

  if (!eventRow) {
    return NextResponse.json<ApiError>({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: donations, error } = await supabaseAdmin
    .from('donations')
    .select('id, amount, display_name, is_anonymous, message, card_country, created_at')
    .eq('event_id', eventId)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json<ApiError>({ error: 'DB error' }, { status: 500 })

  const result = (donations ?? []).map((row) => ({
    id: row.id as string,
    amount: row.amount as number,
    displayName: row.display_name as string | null,
    isAnonymous: row.is_anonymous as boolean,
    message: row.message as string | null,
    cardCountry: (row.card_country as string | null) ?? null,
    createdAt: row.created_at as string,
  }))

  return NextResponse.json({ donations: result })
}
