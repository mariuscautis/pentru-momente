'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loadConnectAndInitialize } from '@stripe/connect-js'
import { ConnectAccountOnboarding, ConnectComponentsProvider } from '@stripe/react-connect-js'
import { getSupabase } from '@/lib/db/supabase'
import Link from 'next/link'

function OnboardingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const eventId = searchParams.get('eventId')
  const eventName = searchParams.get('name') ?? ''

  const [stripeConnectInstance, setStripeConnectInstance] = useState<ReturnType<typeof loadConnectAndInitialize> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  // Fetch session token on mount
  useEffect(() => {
    if (!eventId) { router.push('/dashboard'); return }

    async function init() {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login?next=/dashboard'); return }

      setAccessToken(session.access_token)

      const instance = loadConnectAndInitialize({
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        locale: 'ro-RO',
        fetchClientSecret: async () => {
          const res = await fetch('/api/connect/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ eventId }),
          })
          if (!res.ok) {
            const d = await res.json() as { error: string }
            throw new Error(d.error)
          }
          const d = await res.json() as { clientSecret: string }
          return d.clientSecret
        },
        appearance: {
          overlays: 'dialog',
          variables: {
            colorPrimary: '#C4956A',
            colorBackground: '#FFFDFB',
            colorText: '#2D2016',
            colorDanger: '#DC2626',
            borderRadius: '12px',
            fontFamily: 'inherit',
            spacingUnit: '4px',
          },
        },
      })

      setStripeConnectInstance(instance)
    }

    init().catch((err) => setError(err instanceof Error ? err.message : 'Eroare neașteptată'))
  }, [eventId, router])

  const handleExit = useCallback(async () => {
    if (!eventId || !accessToken) { router.push('/dashboard'); return }

    // Poll activate endpoint to check if onboarding completed
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/dashboard'); return }

    // Try to activate a few times — Stripe may not have processed yet
    for (let i = 0; i < 5; i++) {
      try {
        const res = await fetch('/api/connect/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ eventId }),
        })
        if (res.ok) {
          const d = await res.json() as { isActive?: boolean }
          if (d.isActive) { setDone(true); return }
        }
      } catch { /* ignore */ }
      await new Promise((r) => setTimeout(r, 1500))
    }

    setDone(true)
  }, [eventId, accessToken, router])

  if (error) {
    return (
      <div className="max-w-md w-full rounded-3xl p-10 text-center space-y-4"
        style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}>
        <div className="text-4xl">⚠️</div>
        <p className="text-sm font-medium" style={{ color: '#991B1B' }}>{error}</p>
        <Link href="/dashboard" className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: '#C4956A' }}>
          Înapoi la dashboard
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-md w-full rounded-3xl p-10 text-center space-y-6"
        style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}>
        <div className="text-5xl">🎉</div>
        <h1 className="text-xl font-bold" style={{ color: '#2D2016' }}>Configurare finalizată!</h1>
        <p className="text-sm leading-relaxed" style={{ color: '#9A7B60' }}>
          Stripe a primit datele tale. Pagina va deveni activă în câteva minute după confirmare.
        </p>
        <Link href="/dashboard" className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: '#C4956A' }}>
          Mergi la dashboard →
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <a href="/" className="inline-flex items-center gap-1 font-extrabold tracking-tight text-lg mb-6"
          style={{ color: '#2D2016' }}>
          pentru<span style={{ color: '#C4956A' }}>momente</span>
        </a>
        <h1 className="text-2xl font-bold mt-4" style={{ color: '#2D2016' }}>
          Configurare plăți
        </h1>
        {eventName && (
          <p className="text-sm mt-2" style={{ color: '#9A7B60' }}>
            pentru <span className="font-semibold" style={{ color: '#6B4E37' }}>{eventName}</span>
          </p>
        )}
        <p className="text-sm mt-3 max-w-sm mx-auto leading-relaxed" style={{ color: '#9A7B60' }}>
          Completează datele de mai jos pentru a activa donațiile. Stripe va gestiona verificarea identității și plățile în siguranță.
        </p>
      </div>

      {/* Embedded Stripe component */}
      {stripeConnectInstance ? (
        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: '1px solid #EDE0D0', boxShadow: '0 4px 32px rgba(45,32,22,0.07)' }}
        >
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            <ConnectAccountOnboarding
              onExit={handleExit}
            />
          </ConnectComponentsProvider>
        </div>
      ) : (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: '#EDE0D0', borderTopColor: '#C4956A' }} />
        </div>
      )}

      {/* Trust footer */}
      <p className="text-center text-xs mt-6" style={{ color: '#B09070' }}>
        🔒 Datele tale sunt procesate securizat prin Stripe. pentrumomente.ro nu stochează informații bancare.
      </p>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#FDFAF7' }}>
      <Suspense fallback={
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: '#EDE0D0', borderTopColor: '#C4956A' }} />
      }>
        <OnboardingContent />
      </Suspense>
    </div>
  )
}
