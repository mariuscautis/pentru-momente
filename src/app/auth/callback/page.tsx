'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/db/supabase'

// Handles the hash-fragment OAuth flow (access_token in URL #hash)
// The server-side route.ts handles the ?code= flow (email confirmation)
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabase()

    // getSession picks up the token from the URL hash automatically
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/dashboard')
      } else {
        router.replace('/login?error=auth')
      }
    })
  }, [router])

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#FDFAF7' }}
    >
      <div className="text-center space-y-3">
        <p className="text-lg font-semibold" style={{ color: '#2D2016' }}>
          Se autentifică...
        </p>
        <p className="text-sm" style={{ color: '#9A7B60' }}>
          Vei fi redirecționat imediat.
        </p>
      </div>
    </div>
  )
}
