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
    goalAmount: row.goal_amount as number | undefined,
    organiserId: row.organiser_id as string,
    organiserIban: row.organiser_iban as string,
    isActive: row.is_active as boolean,
    expiresAt: row.expires_at as string | undefined,
    createdAt: row.created_at as string,
  }
}

function rowToEventItem(row: Record<string, unknown>): EventItem {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    name: row.name as string,
    targetAmount: row.target_amount as number,
    raisedAmount: row.raised_amount as number,
    isFullyFunded: row.is_fully_funded as boolean,
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
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('organiser_id', organiserId)
    .maybeSingle()

  console.error('[deleteEvent] ownership check:', { existing, fetchError, eventId, organiserId })

  if (!existing) return false

  const { error } = await supabaseAdmin
    .from('events')
    .delete()
    .eq('id', eventId)

  console.error('[deleteEvent] delete result:', { error })

  return !error
}

export async function createEvent(
  input: Omit<Event, 'id' | 'createdAt'> & { items: Array<{ name: string; targetAmount: number; emoji?: string }> }
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
      goal_amount: eventData.goalAmount,
      organiser_id: eventData.organiserId,
      organiser_iban: eventData.organiserIban,
      is_active: true,
      expires_at: eventData.expiresAt ?? null,
    })
    .select()
    .single()

  if (eventError || !eventRow) throw new Error(eventError?.message ?? 'Failed to create event')

  if (items.length > 0) {
    const itemRows = items.map((item, index) => ({
      event_id: eventRow.id as string,
      name: item.name,
      target_amount: item.targetAmount,
      raised_amount: 0,
      is_fully_funded: false,
      sort_order: index,
    }))

    const { error: itemsError } = await supabaseAdmin.from('event_items').insert(itemRows)
    if (itemsError) throw new Error(itemsError.message)
  }

  return rowToEvent(eventRow)
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
    .select('raised_amount, target_amount')
    .eq('id', itemId)
    .single()

  if (!item) return

  const newRaised = (item.raised_amount as number) + additionalAmount
  const isFullyFunded = newRaised >= (item.target_amount as number)

  await supabaseAdmin
    .from('event_items')
    .update({ raised_amount: newRaised, is_fully_funded: isFullyFunded })
    .eq('id', itemId)
}
