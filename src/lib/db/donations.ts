import { supabase, supabaseAdmin } from './supabase'
import { Donation } from '@/types'

function rowToDonation(row: Record<string, unknown>): Donation {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    itemId: row.item_id as string | undefined,
    amount: row.amount as number,
    tipAmount: row.tip_amount as number,
    displayName: row.display_name as string | undefined,
    message: row.message as string | undefined,
    isAnonymous: row.is_anonymous as boolean,
    showAmount: row.show_amount as boolean,
    stripePaymentIntentId: row.stripe_payment_intent_id as string,
    status: row.status as Donation['status'],
    createdAt: row.created_at as string,
  }
}

export async function getDonationsForEvent(eventId: string): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map(rowToDonation)
}

export async function createDonation(
  input: Omit<Donation, 'id' | 'createdAt' | 'status'>
): Promise<Donation> {
  // Check if a donation already exists for this payment intent + item combination
  // to guard against duplicate calls (e.g. user navigating back to payment step)
  const existingQuery = supabaseAdmin
    .from('donations')
    .select()
    .eq('stripe_payment_intent_id', input.stripePaymentIntentId)

  if (input.itemId) {
    existingQuery.eq('item_id', input.itemId)
  } else {
    existingQuery.is('item_id', null)
  }

  const { data: existing } = await existingQuery.maybeSingle()
  if (existing) return rowToDonation(existing)

  const { data, error } = await supabaseAdmin
    .from('donations')
    .insert({
      event_id: input.eventId,
      item_id: input.itemId ?? null,
      amount: input.amount,
      tip_amount: input.tipAmount,
      display_name: input.displayName ?? null,
      message: input.message ?? null,
      is_anonymous: input.isAnonymous,
      show_amount: input.showAmount,
      stripe_payment_intent_id: input.stripePaymentIntentId,
      status: 'pending',
    })
    .select()
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Failed to create donation')
  return rowToDonation(data)
}

export async function confirmDonation(stripePaymentIntentId: string): Promise<Donation | null> {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .update({ status: 'confirmed' })
    .eq('stripe_payment_intent_id', stripePaymentIntentId)
    .select()

  if (error || !data || data.length === 0) return null
  // Return first row — caller uses it for event lookup / item update
  return rowToDonation(data[0])
}

export async function getDonationByPaymentIntent(
  stripePaymentIntentId: string
): Promise<Donation | null> {
  const { data } = await supabaseAdmin
    .from('donations')
    .select('*')
    .eq('stripe_payment_intent_id', stripePaymentIntentId)
    .limit(1)
    .maybeSingle()

  if (!data) return null
  return rowToDonation(data)
}

export async function getDonationsByPaymentIntent(
  stripePaymentIntentId: string
): Promise<Donation[]> {
  const { data } = await supabaseAdmin
    .from('donations')
    .select('*')
    .eq('stripe_payment_intent_id', stripePaymentIntentId)

  return (data ?? []).map(rowToDonation)
}

export async function getTotalRaisedForEvent(eventId: string): Promise<number> {
  const { data, error } = await supabase
    .from('donations')
    .select('amount')
    .eq('event_id', eventId)
    .eq('status', 'confirmed')

  if (error || !data) return 0
  return data.reduce((sum, row) => sum + (row.amount as number), 0)
}
