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
            // Typography
            fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
            fontSizeBase: '15px',

            // Colours
            colorPrimary: '#C4956A',
            colorBackground: '#FDFAF7',
            colorText: '#2D2016',
            colorSecondaryText: '#7A6652',
            colorDanger: '#DC2626',
            colorBorder: '#DDD0BF',

            // Offset sections (alternating bg inside the form)
            offsetBackgroundColor: '#F5EDE2',

            // Form inputs
            formBackgroundColor: '#FFFFFF',
            formBorderRadius: '10px',
            formHighlightColorBorder: '#C4956A',
            formAccentColor: '#C4956A',
            formPlaceholderTextColor: '#B8A090',
            inputFieldPaddingX: '14px',
            inputFieldPaddingY: '10px',

            // Buttons
            borderRadius: '10px',
            buttonBorderRadius: '10px',
            buttonPrimaryColorBackground: '#C4956A',
            buttonPrimaryColorBorder: '#C4956A',
            buttonPrimaryColorText: '#FFFFFF',
            buttonSecondaryColorBackground: '#F5EDE2',
            buttonSecondaryColorBorder: '#DDD0BF',
            buttonSecondaryColorText: '#2D2016',
            buttonPaddingX: '20px',
            buttonPaddingY: '10px',
            buttonLabelFontWeight: '600',

            // Links
            actionPrimaryColorText: '#C4956A',

            // Badges
            badgeBorderRadius: '6px',
          },
        },
      })

      setStripeConnectInstance(instance)
    }

    init().catch((err) => setError(err instanceof Error ? err.message : 'Eroare neașteptată'))
  }, [eventId, router])

  const handleExit = useCallback(async () => {
    if (!eventId || !accessToken) { router.push('/dashboard'); return }

    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/dashboard'); return }

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
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-md w-full rounded-3xl p-10 text-center space-y-5"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
          <div className="text-4xl">⚠️</div>
          <p className="text-sm font-medium" style={{ color: '#991B1B' }}>{error}</p>
          <Link href="/dashboard"
            className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--color-amber)' }}>
            Înapoi la dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-md w-full rounded-3xl p-10 text-center space-y-6"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
          <div className="text-5xl">🎉</div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-ink)' }}>Configurare finalizată!</h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
            Stripe a primit datele tale. Pagina va deveni activă în câteva minute după confirmare.
          </p>
          <Link href="/dashboard"
            className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--color-amber)' }}>
            Mergi la dashboard →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Header — matches create page */}
      <header className="sticky top-0 z-40 px-6 py-4"
        style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <a href="/" className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
            pentru<span style={{ color: 'var(--color-amber)' }}>momente</span>
          </a>
          {eventName && (
            <span className="text-xs font-medium truncate max-w-[200px]" style={{ color: 'var(--color-ink-muted)' }}>
              {eventName}
            </span>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">

        {/* Section header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--color-amber)' }}>
            Ultimul pas
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
            Configurare plăți
          </h1>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
            Completează datele de mai jos pentru a activa donațiile. Stripe gestionează verificarea identității și plățile în siguranță.
          </p>
        </div>

        {/* Stripe embedded component */}
        {stripeConnectInstance ? (
          <div>
            <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
              <ConnectAccountOnboarding onExit={handleExit} />
            </ConnectComponentsProvider>
          </div>
        ) : (
          <div className="rounded-2xl flex items-center justify-center py-24"
            style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            <div className="flex flex-col items-center gap-3">
              <div className="h-7 w-7 animate-spin rounded-full border-2"
                style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-amber)' }} />
              <p className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>Se încarcă formularul Stripe...</p>
            </div>
          </div>
        )}

        {/* Trust footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-ink-faint)' }}>
          🔒 Datele tale sunt procesate securizat prin Stripe. pentrumomente.ro nu stochează informații bancare.
        </p>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="h-7 w-7 animate-spin rounded-full border-2"
          style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-amber)' }} />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
