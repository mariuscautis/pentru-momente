import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAllBlogPosts, createBlogPost } from '@/lib/db/admin'
import { ApiError } from '@/types'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const posts = await getAllBlogPosts()
  return NextResponse.json({ posts })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    slug: string
    title: string
    summary?: string
    content: string
    coverImageUrl?: string
    published: boolean
  }

  if (!body.slug?.trim() || !body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json<ApiError>({ error: 'slug, title and content are required' }, { status: 400 })
  }

  const post = await createBlogPost(body)
  return NextResponse.json({ post }, { status: 201 })
}
