import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { updateSitePage, deleteSitePage } from '@/lib/db/admin'
import { ApiError } from '@/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json() as Partial<{
    title: string
    slug: string
    content: string
    metaDescription: string
    menuPosition: number
    parentId: string | null
    isPublished: boolean
  }>

  await updateSitePage(id, body)
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await deleteSitePage(id)
  return NextResponse.json({ ok: true })
}
