import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAllTickets, countUnreadForAdmin } from '@/lib/db/admin'
import { ApiError } from '@/types'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const [tickets, unreadCount] = await Promise.all([
    getAllTickets(),
    countUnreadForAdmin(),
  ])

  return NextResponse.json({ tickets, unreadCount })
}
