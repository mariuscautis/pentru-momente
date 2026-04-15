import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/db/supabase'
import { ApiError } from '@/types'

// Stores Cookies Policy content as a single row (id=1) in cookies_content table.

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('cookies_content')
    .select('content')
    .eq('id', 1)
    .single()

  return NextResponse.json({ content: data?.content ?? '' })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { content: string }
  await supabaseAdmin
    .from('cookies_content')
    .upsert({ id: 1, content: body.content ?? '', updated_at: new Date().toISOString() }, { onConflict: 'id' })

  return NextResponse.json({ ok: true })
}
