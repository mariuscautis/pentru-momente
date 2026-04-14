import { supabase, supabaseAdmin } from './supabase'
import { Payout } from '@/types'

function rowToPayout(row: Record<string, unknown>): Payout {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    amount: row.amount as number,
    wiseTransferId: row.wise_transfer_id as string | undefined,
    organiserIban: row.organiser_iban as string,
    status: row.status as Payout['status'],
    requestedAt: row.requested_at as string,
    completedAt: row.completed_at as string | undefined,
  }
}

export async function getPayoutsForEvent(eventId: string): Promise<Payout[]> {
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('event_id', eventId)
    .order('requested_at', { ascending: false })

  if (error || !data) return []
  return data.map(rowToPayout)
}

export async function createPayout(
  input: Pick<Payout, 'eventId' | 'amount' | 'organiserIban'>
): Promise<Payout> {
  const { data, error } = await supabaseAdmin
    .from('payouts')
    .insert({
      event_id: input.eventId,
      amount: input.amount,
      organiser_iban: input.organiserIban,
      status: 'pending',
    })
    .select()
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Failed to create payout')
  return rowToPayout(data)
}

export async function updatePayoutWithTransfer(
  payoutId: string,
  wiseTransferId: string
): Promise<void> {
  await supabaseAdmin
    .from('payouts')
    .update({ wise_transfer_id: wiseTransferId, status: 'processing' })
    .eq('id', payoutId)
}

export async function markPayoutCompleted(wiseTransferId: string): Promise<Payout | null> {
  const { data, error } = await supabaseAdmin
    .from('payouts')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('wise_transfer_id', wiseTransferId)
    .select()
    .single()

  if (error || !data) return null
  return rowToPayout(data)
}
