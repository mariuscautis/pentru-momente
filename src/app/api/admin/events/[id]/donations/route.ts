import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/db/supabase'
import { ApiError } from '@/types'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const { id: eventId } = await params

  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('id, amount, tip_amount, display_name, message, is_anonymous, show_amount, status, created_at, item_id')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json<ApiError>({ error: 'DB error' }, { status: 500 })

  const donations = (data ?? []).map((d) => ({
    id: d.id,
    amount: d.amount,
    tipAmount: d.tip_amount ?? 0,
    displayName: d.display_name ?? null,
    message: d.message ?? null,
    isAnonymous: d.is_anonymous ?? false,
    showAmount: d.show_amount ?? true,
    status: d.status,
    createdAt: d.created_at,
    itemId: d.item_id ?? null,
  }))

  return NextResponse.json({ donations })
}
