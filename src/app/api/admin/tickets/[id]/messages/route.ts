import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getTicketById, getTicketMessages, addTicketMessage, markTicketReadByAdmin } from '@/lib/db/admin'
import { ApiError } from '@/types'

// GET /api/admin/tickets/[id]/messages — get all messages, mark admin-unread as read
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const [messages, ticket] = await Promise.all([
    getTicketMessages(id),
    getTicketById(id),
  ])

  if (!ticket) return NextResponse.json<ApiError>({ error: 'Not found' }, { status: 404 })

  if (ticket.hasUnreadAdmin) await markTicketReadByAdmin(id)

  return NextResponse.json({ messages, ticket })
}

// POST /api/admin/tickets/[id]/messages — admin sends a reply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ticket = await getTicketById(id)
  if (!ticket) return NextResponse.json<ApiError>({ error: 'Not found' }, { status: 404 })

  const body = await req.json() as { message: string }
  if (!body.message?.trim()) {
    return NextResponse.json<ApiError>({ error: 'message is required' }, { status: 400 })
  }

  const message = await addTicketMessage({
    ticketId: id,
    senderRole: 'admin',
    senderName: 'Support',
    body: body.message.trim(),
  })

  return NextResponse.json({ message }, { status: 201 })
}
