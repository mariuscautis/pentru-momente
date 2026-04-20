import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { updateTicketStatus } from '@/lib/db/admin'
import { ApiError } from '@/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json() as { status?: string }

  if (body.status) {
    const valid = ['open', 'in_progress', 'completed', 'cancelled']
    if (!valid.includes(body.status)) {
      return NextResponse.json<ApiError>({ error: 'Invalid status' }, { status: 400 })
    }
    await updateTicketStatus(id, body.status as 'open' | 'in_progress' | 'completed' | 'cancelled')
  }

  return NextResponse.json({ ok: true })
}
