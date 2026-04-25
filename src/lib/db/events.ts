import { createClient } from '@supabase/supabase-js'
import { supabase, supabaseAdmin } from './supabase'
import { Event, EventItem } from '@/types'

function rowToEvent(row: Record<string, unknown>): Event {
  return {
    id: row.id as string,
    slug: row.slug as string,
    eventType: row.event_type as string,
    name: row.name as string,
    description: row.description as string | undefined,
    coverImageUrl: row.cover_image_url as string | undefined,
    coverHeroHeight: (row.cover_hero_height as number | null) ?? undefined,
    goalAmount: row.goal_amount as number | undefined,
    organiserId: row.organiser_id as string,
    stripeConnectAccountId: row.stripe_connect_account_id as string | undefined,
    connectOnboardingComplete: (row.connect_onboarding_complete as boolean) ?? false,
    isActive: row.is_active as boolean,
    isDeleted: (row.is_deleted as boolean) ?? false,
    expiresAt: row.expires_at as string | undefined,
    createdAt: row.created_at as string,
  }
}

function rowToEventItem(row: Record<string, unknown>): EventItem {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    name: row.name as string,
    emoji: (row.emoji as string | undefined) ?? undefined,
    targetAmount: (row.target_amount as number) ?? 0,
    raisedAmount: (row.raised_amount as number) ?? 0,
    isFullyFunded: (row.is_fully_funded as boolean) ?? false,
    isCustomAmount: (row.is_custom_amount as boolean) ?? false,
  }
}

export async function getEventBySlug(eventType: string, slug: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_type', eventType)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  const event = rowToEvent(data)
  // Treat expired events as not found
  if (event.expiresAt && new Date(event.expiresAt) < new Date()) return null

  return event
}

// Fetches any event regardless of active status — used for the inactive/closed page notice.
// Creates a fresh admin client directly (no proxy/singleton) to guarantee RLS bypass
// even when called from a Server Component page render.
export async function getEventBySlugAnyStatus(eventType: string, slug: string): Promise<Event | null> {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await admin
    .from('events')
    .select('*')
    .eq('event_type', eventType)
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return rowToEvent(data)
}

export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return rowToEvent(data)
}

export async function getEventsByOrganiser(organiserId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organiser_id', organiserId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map(rowToEvent)
}

export async function getEventItems(eventId: string): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from('event_items')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data.map(rowToEventItem)
}

export async function deleteEvent(eventId: string, organiserId: string): Promise<boolean> {
  // Verify ownership first
  const { data: existing } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('organiser_id', organiserId)
    .maybeSingle()

  if (!existing) return false

  // Soft-delete: mark inactive and flag as deleted so it stays in the archive.
  // Donations and items are preserved for reporting purposes.
  const { error } = await supabaseAdmin
    .from('events')
    .update({ is_active: false, is_deleted: true })
    .eq('id', eventId)

  return !error
}

export async function createEvent(
  input: Omit<Event, 'id' | 'createdAt'> & { items: Array<{ name: string; targetAmount: number; emoji?: string; isCustomAmount?: boolean }> }
): Promise<Event> {
  const { items, ...eventData } = input

  const { data: eventRow, error: eventError } = await supabaseAdmin
    .from('events')
    .insert({
      slug: eventData.slug,
      event_type: eventData.eventType,
      name: eventData.name,
      description: eventData.description,
      cover_image_url: eventData.coverImageUrl,
      cover_hero_height: eventData.coverHeroHeight ?? null,
      goal_amount: eventData.goalAmount,
      organiser_id: eventData.organiserId,
      stripe_connect_account_id: eventData.stripeConnectAccountId ?? null,
      connect_onboarding_complete: eventData.connectOnboardingComplete,
      is_active: eventData.isActive,
      expires_at: eventData.expiresAt ?? null,
    })
    .select()
    .single()

  if (eventError || !eventRow) throw new Error(eventError?.message ?? 'Failed to create event')

  if (items.length > 0) {
    const itemRows = items.map((item, index) => ({
      event_id: eventRow.id as string,
      name: item.name,
      emoji: item.emoji ?? null,
      target_amount: item.targetAmount,
      raised_amount: 0,
      is_fully_funded: false,
      is_custom_amount: item.isCustomAmount ?? false,
      sort_order: index,
    }))

    const { error: itemsError } = await supabaseAdmin.from('event_items').insert(itemRows)
    if (itemsError) throw new Error(itemsError.message)
  }

  return rowToEvent(eventRow)
}

export async function createEventItem(
  eventId: string,
  item: { name: string; targetAmount: number; emoji?: string; isCustomAmount?: boolean; sortOrder?: number }
): Promise<EventItem> {
  const { data, error } = await supabaseAdmin
    .from('event_items')
    .insert({
      event_id: eventId,
      name: item.name,
      emoji: item.emoji ?? null,
      target_amount: item.targetAmount,
      raised_amount: 0,
      is_fully_funded: false,
      is_custom_amount: item.isCustomAmount ?? false,
      sort_order: item.sortOrder ?? 0,
    })
    .select()
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Failed to create item')
  return rowToEventItem(data)
}

export async function updateEventItem(
  itemId: string,
  update: { name?: string; targetAmount?: number; emoji?: string | null; isCustomAmount?: boolean }
): Promise<void> {
  const payload: Record<string, unknown> = {}
  if (update.name !== undefined) payload.name = update.name
  if (update.targetAmount !== undefined) payload.target_amount = update.targetAmount
  if ('emoji' in update) payload.emoji = update.emoji ?? null
  if (update.isCustomAmount !== undefined) payload.is_custom_amount = update.isCustomAmount

  if (Object.keys(payload).length === 0) return
  await supabaseAdmin.from('event_items').update(payload).eq('id', itemId)
}

export async function deleteEventItem(itemId: string): Promise<void> {
  await supabaseAdmin.from('event_items').delete().eq('id', itemId)
}

export async function slugExists(slug: string): Promise<boolean> {
  const { count } = await supabase
    .from('events')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug)

  return (count ?? 0) > 0
}

export async function updateEventItemRaisedAmount(
  itemId: string,
  additionalAmount: number
): Promise<void> {
  const { data: item } = await supabaseAdmin
    .from('event_items')
    .select('raised_amount, target_amount, is_custom_amount')
    .eq('id', itemId)
    .single()

  if (!item) return

  const newRaised = (item.raised_amount as number) + additionalAmount
  // Custom-amount items have no target — they can never be fully funded
  const isFullyFunded = !(item.is_custom_amount as boolean) && newRaised >= (item.target_amount as number)

  await supabaseAdmin
    .from('event_items')
    .update({ raised_amount: newRaised, is_fully_funded: isFullyFunded })
    .eq('id', itemId)
}
