import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/supabase'
import { createTicket, getTicketsByOrganiser } from '@/lib/db/admin'
import { ApiError } from '@/types'

async function getUser(req: NextRequest) {
  const token = req.headers.get('Authorization')?.slice(7)
  if (!token) return null
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user
}

// GET /api/tickets — list tickets for the authenticated organiser
export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getUser(req)
  if (!user) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const tickets = await getTicketsByOrganiser(user.id)
  return NextResponse.json({ tickets })
}

// POST /api/tickets — create a new ticket
export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await getUser(req)
  if (!user) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { subject: string; message: string; organiserName?: string }

  if (!body.subject?.trim() || !body.message?.trim()) {
    return NextResponse.json<ApiError>({ error: 'subject and message are required' }, { status: 400 })
  }

  const ticket = await createTicket({
    organiserId: user.id,
    organiserEmail: user.email ?? '',
    organiserName: body.organiserName || (user.email?.split('@')[0] ?? 'Utilizator'),
    subject: body.subject.trim(),
    firstMessage: body.message.trim(),
  })

  return NextResponse.json({ ticket }, { status: 201 })
}
