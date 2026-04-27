'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/db/supabase'
import { Suspense } from 'react'

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = getSupabase()
    const code = searchParams.get('code')

    async function handleCallback() {
      if (code) {
        // PKCE flow — exchange the code for a session and persist it
        const { data: exchangeData, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          router.replace('/login?error=auth')
          return
        }
        // Password recovery flow — send user to set new password
        if (exchangeData.session?.user?.aud === 'authenticated' && searchParams.get('next') === '/login?mode=reset') {
          router.replace('/login?mode=reset')
          return
        }
      }

      // After exchange (or if session already in hash), verify we have a session
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        const next = searchParams.get('next')
        const hasDraft = !!localStorage.getItem('create_draft')
        router.replace(next ?? (hasDraft ? '/create' : '/dashboard'))
      } else {
        router.replace('/login?error=auth')
      }
    }

    handleCallback()
  }, [router, searchParams])

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

// useSearchParams requires Suspense in Next.js 16
export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackInner />
    </Suspense>
  )
}
