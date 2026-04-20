import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAllTestimonials, createTestimonial } from '@/lib/db/admin'
import { ApiError } from '@/types'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const testimonials = await getAllTestimonials()
  return NextResponse.json({ testimonials })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    quote: string
    name: string
    city: string
    eventType: string
    imageUrl?: string
    sortOrder?: number
    isActive?: boolean
  }

  if (!body.quote?.trim() || !body.name?.trim() || !body.city?.trim() || !body.eventType?.trim()) {
    return NextResponse.json<ApiError>({ error: 'quote, name, city and eventType are required' }, { status: 400 })
  }

  const testimonial = await createTestimonial(body)
  return NextResponse.json({ testimonial }, { status: 201 })
}
