import { supabaseAdmin } from './supabase'

export interface SeoOverride {
  id: string
  pageKey: string
  seoTitle: string | null
  metaDescription: string | null
  socialImageUrl: string | null
  updatedAt: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  summary: string | null
  content: string
  coverImageUrl: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BlockedEvent {
  id: string
  eventId: string
  reason: string | null
  blockedAt: string
  blockedBy: string
}

// ─── Admin auth ───────────────────────────────────────────────────────────────

export async function isAdminEmail(email: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .single()
  return !error && !!data
}

// ─── SEO overrides ────────────────────────────────────────────────────────────

export async function getAllSeoOverrides(): Promise<SeoOverride[]> {
  const { data, error } = await supabaseAdmin
    .from('seo_overrides')
    .select('*')
    .order('page_key', { ascending: true })
  if (error || !data) return []
  return data.map(rowToSeo)
}

export async function getSeoOverride(pageKey: string): Promise<SeoOverride | null> {
  const { data, error } = await supabaseAdmin
    .from('seo_overrides')
    .select('*')
    .eq('page_key', pageKey)
    .single()
  if (error || !data) return null
  return rowToSeo(data)
}

export async function upsertSeoOverride(
  pageKey: string,
  seoTitle: string,
  metaDescription: string,
  socialImageUrl?: string
): Promise<void> {
  await supabaseAdmin.from('seo_overrides').upsert(
    {
      page_key: pageKey,
      seo_title: seoTitle,
      meta_description: metaDescription,
      social_image_url: socialImageUrl ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'page_key' }
  )
}

function rowToSeo(row: Record<string, unknown>): SeoOverride {
  return {
    id: row.id as string,
    pageKey: row.page_key as string,
    seoTitle: row.seo_title as string | null,
    metaDescription: row.meta_description as string | null,
    socialImageUrl: row.social_image_url as string | null,
    updatedAt: row.updated_at as string,
  }
}

// ─── Blog posts ───────────────────────────────────────────────────────────────

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map(rowToBlog)
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error || !data) return null
  return rowToBlog(data)
}

export async function createBlogPost(input: {
  slug: string
  title: string
  summary?: string
  content: string
  coverImageUrl?: string
  published: boolean
}): Promise<BlogPost> {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .insert({
      slug: input.slug,
      title: input.title,
      summary: input.summary ?? null,
      content: input.content,
      cover_image_url: input.coverImageUrl ?? null,
      published: input.published,
      published_at: input.published ? new Date().toISOString() : null,
    })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create blog post')
  return rowToBlog(data)
}

export async function updateBlogPost(
  id: string,
  input: Partial<{
    slug: string
    title: string
    summary: string
    content: string
    coverImageUrl: string
    published: boolean
  }>
): Promise<void> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.slug !== undefined) update.slug = input.slug
  if (input.title !== undefined) update.title = input.title
  if (input.summary !== undefined) update.summary = input.summary
  if (input.content !== undefined) update.content = input.content
  if (input.coverImageUrl !== undefined) update.cover_image_url = input.coverImageUrl
  if (input.published !== undefined) {
    update.published = input.published
    if (input.published) update.published_at = new Date().toISOString()
  }
  await supabaseAdmin.from('blog_posts').update(update).eq('id', id)
}

export async function deleteBlogPost(id: string): Promise<void> {
  await supabaseAdmin.from('blog_posts').delete().eq('id', id)
}

function rowToBlog(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    summary: row.summary as string | null,
    content: row.content as string,
    coverImageUrl: row.cover_image_url as string | null,
    published: row.published as boolean,
    publishedAt: row.published_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

// ─── Blocked events ───────────────────────────────────────────────────────────

export async function getAllBlockedEvents(): Promise<BlockedEvent[]> {
  const { data, error } = await supabaseAdmin
    .from('blocked_events')
    .select('*')
    .order('blocked_at', { ascending: false })
  if (error || !data) return []
  return data.map(rowToBlocked)
}

export async function blockEvent(eventId: string, reason: string, adminEmail: string): Promise<void> {
  // Mark event as inactive
  await supabaseAdmin.from('events').update({ is_active: false }).eq('id', eventId)
  // Log the block
  await supabaseAdmin.from('blocked_events').insert({
    event_id: eventId,
    reason,
    blocked_by: adminEmail,
  })
}

export async function unblockEvent(eventId: string): Promise<void> {
  await supabaseAdmin.from('events').update({ is_active: true }).eq('id', eventId)
  await supabaseAdmin.from('blocked_events').delete().eq('event_id', eventId)
}

export async function isEventBlocked(eventId: string): Promise<boolean> {
  const { count } = await supabaseAdmin
    .from('blocked_events')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
  return (count ?? 0) > 0
}

function rowToBlocked(row: Record<string, unknown>): BlockedEvent {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    reason: row.reason as string | null,
    blockedAt: row.blocked_at as string,
    blockedBy: row.blocked_by as string,
  }
}

// ─── Site pages ───────────────────────────────────────────────────────────────

export interface SitePage {
  id: string
  title: string
  slug: string
  content: string
  metaDescription: string | null
  coverImageUrl: string | null
  menuPosition: number
  parentId: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export async function getAllSitePages(): Promise<SitePage[]> {
  const { data, error } = await supabaseAdmin
    .from('site_pages')
    .select('*')
    .order('menu_position', { ascending: true })
  if (error || !data) return []
  return data.map(rowToPage)
}

export async function getSitePageBySlug(slug: string): Promise<SitePage | null> {
  const { data, error } = await supabaseAdmin
    .from('site_pages')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error || !data) return null
  return rowToPage(data)
}

export async function createSitePage(input: {
  title: string
  slug: string
  content: string
  metaDescription?: string
  coverImageUrl?: string
  menuPosition: number
  parentId?: string | null
  isPublished: boolean
}): Promise<SitePage> {
  const { data, error } = await supabaseAdmin
    .from('site_pages')
    .insert({
      title: input.title,
      slug: input.slug,
      content: input.content,
      meta_description: input.metaDescription ?? null,
      cover_image_url: input.coverImageUrl ?? null,
      menu_position: input.menuPosition,
      parent_id: input.parentId ?? null,
      is_published: input.isPublished,
    })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create page')
  return rowToPage(data)
}

export async function updateSitePage(
  id: string,
  input: Partial<{
    title: string
    slug: string
    content: string
    metaDescription: string
    coverImageUrl: string | null
    menuPosition: number
    parentId: string | null
    isPublished: boolean
  }>
): Promise<void> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.title !== undefined) update.title = input.title
  if (input.slug !== undefined) update.slug = input.slug
  if (input.content !== undefined) update.content = input.content
  if (input.metaDescription !== undefined) update.meta_description = input.metaDescription
  if ('coverImageUrl' in input) update.cover_image_url = input.coverImageUrl
  if (input.menuPosition !== undefined) update.menu_position = input.menuPosition
  if ('parentId' in input) update.parent_id = input.parentId
  if (input.isPublished !== undefined) update.is_published = input.isPublished
  await supabaseAdmin.from('site_pages').update(update).eq('id', id)
}

export async function deleteSitePage(id: string): Promise<void> {
  await supabaseAdmin.from('site_pages').delete().eq('id', id)
}

function rowToPage(row: Record<string, unknown>): SitePage {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    content: row.content as string,
    metaDescription: row.meta_description as string | null,
    coverImageUrl: row.cover_image_url as string | null,
    menuPosition: row.menu_position as number,
    parentId: row.parent_id as string | null,
    isPublished: row.is_published as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string
  quote: string
  name: string
  city: string
  eventType: string
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error || !data) return []
  return data.map(rowToTestimonial)
}

export async function createTestimonial(input: {
  quote: string
  name: string
  city: string
  eventType: string
  imageUrl?: string
  sortOrder?: number
  isActive?: boolean
}): Promise<Testimonial> {
  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .insert({
      quote: input.quote,
      name: input.name,
      city: input.city,
      event_type: input.eventType,
      image_url: input.imageUrl ?? null,
      sort_order: input.sortOrder ?? 0,
      is_active: input.isActive ?? true,
    })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create testimonial')
  return rowToTestimonial(data)
}

export async function updateTestimonial(
  id: string,
  input: Partial<{
    quote: string
    name: string
    city: string
    eventType: string
    imageUrl: string | null
    sortOrder: number
    isActive: boolean
  }>
): Promise<void> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.quote !== undefined) update.quote = input.quote
  if (input.name !== undefined) update.name = input.name
  if (input.city !== undefined) update.city = input.city
  if (input.eventType !== undefined) update.event_type = input.eventType
  if ('imageUrl' in input) update.image_url = input.imageUrl
  if (input.sortOrder !== undefined) update.sort_order = input.sortOrder
  if (input.isActive !== undefined) update.is_active = input.isActive
  await supabaseAdmin.from('testimonials').update(update).eq('id', id)
}

export async function deleteTestimonial(id: string): Promise<void> {
  await supabaseAdmin.from('testimonials').delete().eq('id', id)
}

function rowToTestimonial(row: Record<string, unknown>): Testimonial {
  return {
    id: row.id as string,
    quote: row.quote as string,
    name: row.name as string,
    city: row.city as string,
    eventType: row.event_type as string,
    imageUrl: row.image_url as string | null,
    sortOrder: row.sort_order as number,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

// ─── Support Tickets ──────────────────────────────────────────────────────────

export type TicketStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

export interface Ticket {
  id: string
  organiserId: string
  organiserEmail: string
  organiserName: string
  subject: string
  status: TicketStatus
  hasUnreadAdmin: boolean    // unread by admin (new message from organiser)
  hasUnreadUser: boolean     // unread by organiser (new message from admin)
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  senderRole: 'user' | 'admin'
  senderName: string
  body: string
  createdAt: string
}

export async function getAllTickets(): Promise<Ticket[]> {
  const { data, error } = await supabaseAdmin
    .from('support_tickets')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error || !data) return []
  return data.map(rowToTicket)
}

export async function getTicketsByOrganiser(organiserId: string): Promise<Ticket[]> {
  const { data, error } = await supabaseAdmin
    .from('support_tickets')
    .select('*')
    .eq('organiser_id', organiserId)
    .order('updated_at', { ascending: false })
  if (error || !data) return []
  return data.map(rowToTicket)
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const { data, error } = await supabaseAdmin
    .from('support_tickets')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return rowToTicket(data)
}

export async function createTicket(input: {
  organiserId: string
  organiserEmail: string
  organiserName: string
  subject: string
  firstMessage: string
}): Promise<Ticket> {
  const { data: ticket, error: tErr } = await supabaseAdmin
    .from('support_tickets')
    .insert({
      organiser_id: input.organiserId,
      organiser_email: input.organiserEmail,
      organiser_name: input.organiserName,
      subject: input.subject,
      status: 'open',
      has_unread_admin: true,
      has_unread_user: false,
    })
    .select()
    .single()
  if (tErr || !ticket) throw new Error(tErr?.message ?? 'Failed to create ticket')

  await supabaseAdmin.from('ticket_messages').insert({
    ticket_id: ticket.id,
    sender_role: 'user',
    sender_name: input.organiserName,
    body: input.firstMessage,
  })

  return rowToTicket(ticket)
}

export async function addTicketMessage(input: {
  ticketId: string
  senderRole: 'user' | 'admin'
  senderName: string
  body: string
}): Promise<TicketMessage> {
  // Insert message
  const { data: msg, error: mErr } = await supabaseAdmin
    .from('ticket_messages')
    .insert({
      ticket_id: input.ticketId,
      sender_role: input.senderRole,
      sender_name: input.senderName,
      body: input.body,
    })
    .select()
    .single()
  if (mErr || !msg) throw new Error(mErr?.message ?? 'Failed to add message')

  // Update ticket: mark unread for the OTHER party, bump updated_at
  const unreadUpdate =
    input.senderRole === 'user'
      ? { has_unread_admin: true, updated_at: new Date().toISOString() }
      : { has_unread_user: true, updated_at: new Date().toISOString() }

  await supabaseAdmin.from('support_tickets').update(unreadUpdate).eq('id', input.ticketId)

  return rowToMessage(msg)
}

export async function getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  const { data, error } = await supabaseAdmin
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return data.map(rowToMessage)
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<void> {
  await supabaseAdmin
    .from('support_tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
}

export async function markTicketReadByAdmin(id: string): Promise<void> {
  await supabaseAdmin
    .from('support_tickets')
    .update({ has_unread_admin: false })
    .eq('id', id)
}

export async function markTicketReadByUser(id: string): Promise<void> {
  await supabaseAdmin
    .from('support_tickets')
    .update({ has_unread_user: false })
    .eq('id', id)
}

export async function countUnreadForAdmin(): Promise<number> {
  const { count } = await supabaseAdmin
    .from('support_tickets')
    .select('id', { count: 'exact', head: true })
    .eq('has_unread_admin', true)
  return count ?? 0
}

function rowToTicket(row: Record<string, unknown>): Ticket {
  return {
    id: row.id as string,
    organiserId: row.organiser_id as string,
    organiserEmail: row.organiser_email as string,
    organiserName: row.organiser_name as string,
    subject: row.subject as string,
    status: row.status as TicketStatus,
    hasUnreadAdmin: row.has_unread_admin as boolean,
    hasUnreadUser: row.has_unread_user as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function rowToMessage(row: Record<string, unknown>): TicketMessage {
  return {
    id: row.id as string,
    ticketId: row.ticket_id as string,
    senderRole: row.sender_role as 'user' | 'admin',
    senderName: row.sender_name as string,
    body: row.body as string,
    createdAt: row.created_at as string,
  }
}
