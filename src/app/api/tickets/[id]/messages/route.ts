import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/supabase'
import { getTicketById, getTicketMessages, addTicketMessage, markTicketReadByUser } from '@/lib/db/admin'
import { ApiError } from '@/types'

async function getUser(req: NextRequest) {
  const token = req.headers.get('Authorization')?.slice(7)
  if (!token) return null
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user
}

// GET /api/tickets/[id]/messages — get all messages (marks user-unread as read)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const user = await getUser(req)
  if (!user) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ticket = await getTicketById(id)
  if (!ticket || ticket.organiserId !== user.id) {
    return NextResponse.json<ApiError>({ error: 'Not found' }, { status: 404 })
  }

  const messages = await getTicketMessages(id)

  // Mark as read by user when they open the conversation
  if (ticket.hasUnreadUser) await markTicketReadByUser(id)

  return NextResponse.json({ messages })
}

// POST /api/tickets/[id]/messages — user sends a reply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const user = await getUser(req)
  if (!user) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ticket = await getTicketById(id)
  if (!ticket || ticket.organiserId !== user.id) {
    return NextResponse.json<ApiError>({ error: 'Not found' }, { status: 404 })
  }

  if (ticket.status === 'completed' || ticket.status === 'cancelled') {
    return NextResponse.json<ApiError>({ error: 'Ticket is closed' }, { status: 400 })
  }

  const body = await req.json() as { message: string }
  if (!body.message?.trim()) {
    return NextResponse.json<ApiError>({ error: 'message is required' }, { status: 400 })
  }

  const senderName = user.email?.split('@')[0] ?? 'Utilizator'
  const message = await addTicketMessage({
    ticketId: id,
    senderRole: 'user',
    senderName,
    body: body.message.trim(),
  })

  return NextResponse.json({ message }, { status: 201 })
}
