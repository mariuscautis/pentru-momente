import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/db/supabase'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — send back to login
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
