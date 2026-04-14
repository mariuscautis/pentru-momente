import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json({ isAdmin: false }, { status: 401 })
  return NextResponse.json({ isAdmin: true, email: adminEmail })
}
