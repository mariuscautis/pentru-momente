'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function OnboardingCompleteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = searchParams.get('slug')
  const [status, setStatus] = useState<'checking' | 'active' | 'pending'>('checking')

  useEffect(() => {
    if (!slug) { router.push('/dashboard'); return }

    // Poll for is_active — the account.updated webhook may take a few seconds
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/events/by-slug?slug=${slug}`)
        if (res.ok) {
          const data = await res.json() as { isActive?: boolean }
          if (data.isActive) {
            setStatus('active')
            clearInterval(interval)
            return
          }
        }
      } catch { /* ignore */ }

      if (attempts >= 10) {
        clearInterval(interval)
        setStatus('pending')
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [slug, router])

  return (
    <div className="max-w-md w-full rounded-3xl p-10 text-center space-y-6"
      style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}>

      {status === 'checking' && (
        <>
          <div className="text-5xl">⏳</div>
          <h1 className="text-xl font-bold" style={{ color: '#2D2016' }}>
            Se activează pagina...
          </h1>
          <p className="text-sm" style={{ color: '#9A7B60' }}>
            Așteptăm confirmarea de la Stripe. Durează câteva secunde.
          </p>
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: '#E0D0C0', borderTopColor: '#C4956A' }} />
          </div>
        </>
      )}

      {status === 'active' && (
        <>
          <div className="text-5xl">🎉</div>
          <h1 className="text-xl font-bold" style={{ color: '#2D2016' }}>
            Pagina ta este activă!
          </h1>
          <p className="text-sm" style={{ color: '#9A7B60' }}>
            Configurarea Stripe este completă. Donațiile ajung direct în contul tău bancar.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: '#C4956A' }}
          >
            Mergi la dashboard →
          </Link>
        </>
      )}

      {status === 'pending' && (
        <>
          <div className="text-5xl">✅</div>
          <h1 className="text-xl font-bold" style={{ color: '#2D2016' }}>
            Onboarding finalizat!
          </h1>
          <p className="text-sm" style={{ color: '#9A7B60' }}>
            Stripe a primit datele tale. Pagina va deveni activă în câteva minute după ce Stripe confirmă contul.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: '#C4956A' }}
          >
            Mergi la dashboard →
          </Link>
        </>
      )}
    </div>
  )
}

export default function OnboardingCompletePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FDFAF7' }}>
      <Suspense fallback={
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: '#E0D0C0', borderTopColor: '#C4956A' }} />
      }>
        <OnboardingCompleteContent />
      </Suspense>
    </div>
  )
}
