import { NextRequest } from 'next/server'
import { supabase } from '@/lib/db/supabase'
import { isAdminEmail } from '@/lib/db/admin'

/**
 * Verifies the request carries a valid Supabase session token
 * AND that the authenticated user's email is in admin_users.
 * Returns the admin email on success, null on failure.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user?.email) return null

  const admin = await isAdminEmail(user.email)
  if (!admin) return null

  return user.email
}
