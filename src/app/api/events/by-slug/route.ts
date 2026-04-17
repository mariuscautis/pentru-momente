import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/supabase'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  const { data } = await supabase
    .from('events')
    .select('is_active, connect_onboarding_complete, event_type')
    .eq('slug', slug)
    .single()

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    isActive: data.is_active,
    connectOnboardingComplete: data.connect_onboarding_complete,
    eventType: data.event_type,
  })
}
