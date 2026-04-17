import { supabase, supabaseAdmin } from './supabase'
import { Payout } from '@/types'

function rowToPayout(row: Record<string, unknown>): Payout {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    stripePayoutId: row.stripe_payout_id as string | undefined,
    amount: row.amount as number,
    status: row.status as Payout['status'],
    arrivalDate: row.arrival_date as string | undefined,
    createdAt: row.created_at as string,
  }
}

export async function getPayoutsForEvent(eventId: string): Promise<Payout[]> {
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map(rowToPayout)
}

export async function upsertPayoutFromStripe(
  stripePayoutId: string,
  eventId: string,
  amount: number,
  status: Payout['status'],
  arrivalDate?: string
): Promise<void> {
  await supabaseAdmin
    .from('payouts')
    .upsert(
      {
        stripe_payout_id: stripePayoutId,
        event_id: eventId,
        amount,
        status,
        arrival_date: arrivalDate ?? null,
      },
      { onConflict: 'stripe_payout_id' }
    )
}

export async function updatePayoutStatus(
  stripePayoutId: string,
  status: Payout['status']
): Promise<void> {
  await supabaseAdmin
    .from('payouts')
    .update({ status })
    .eq('stripe_payout_id', stripePayoutId)
}
