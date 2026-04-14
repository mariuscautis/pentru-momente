import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAllSeoOverrides, upsertSeoOverride } from '@/lib/db/admin'
import { ApiError } from '@/types'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const overrides = await getAllSeoOverrides()
  return NextResponse.json({ overrides })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { pageKey: string; seoTitle: string; metaDescription: string }
  if (!body.pageKey?.trim()) {
    return NextResponse.json<ApiError>({ error: 'pageKey is required' }, { status: 400 })
  }

  await upsertSeoOverride(body.pageKey.trim(), body.seoTitle ?? '', body.metaDescription ?? '')
  return NextResponse.json({ ok: true })
}
