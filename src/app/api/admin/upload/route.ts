import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { supabaseAdmin } from '@/lib/db/supabase'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { ApiError } from '@/types'

// Handles image uploads for blog hero images and site page images.
// Stores in the 'admin-images' Supabase Storage bucket (create if needed).
// Returns { url: string }

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminEmail = await verifyAdminRequest(req)
  if (!adminEmail) return NextResponse.json<ApiError>({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string | null) ?? 'misc'

  if (!file) {
    return NextResponse.json<ApiError>({ error: 'No file provided' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json<ApiError>({ error: 'Only image files are allowed' }, { status: 400 })
  }
  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json<ApiError>({ error: 'File too large — maximum 20MB' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()

  // Resize to max 1920px wide, convert to WebP
  const processed = await sharp(Buffer.from(bytes))
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()

  const ts = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]+$/, '')
  const path = `${folder}/${safeName}-${ts}.webp`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('admin-images')
    .upload(path, processed, { contentType: 'image/webp', upsert: false })

  if (uploadError) {
    return NextResponse.json<ApiError>({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('admin-images')
    .getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
