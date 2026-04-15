import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAllSitePages, createSitePage } from '@/lib/db/admin'
import { ApiError } from '@/types'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const pages = await getAllSitePages()
  return NextResponse.json({ pages })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    title: string
    slug: string
    content: string
    metaDescription?: string
    menuPosition: number
    parentId?: string | null
    isPublished: boolean
  }

  if (!body.title?.trim() || !body.slug?.trim()) {
    return NextResponse.json<ApiError>({ error: 'title and slug are required' }, { status: 400 })
  }

  const page = await createSitePage(body)
  return NextResponse.json({ page }, { status: 201 })
}
