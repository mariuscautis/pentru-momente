import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/db/supabase'
import { ApiError } from '@/types'

// GET — public (no auth) so homepage can read it server-side
export async function GET(): Promise<NextResponse> {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', 'coming_soon_enabled')
    .single()

  return NextResponse.json({ enabled: data?.value === 'true' })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { enabled: boolean }
  await supabaseAdmin
    .from('site_settings')
    .upsert(
      { key: 'coming_soon_enabled', value: body.enabled ? 'true' : 'false', updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )

  return NextResponse.json({ ok: true })
}
