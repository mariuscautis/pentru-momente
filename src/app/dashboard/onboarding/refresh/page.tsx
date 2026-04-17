'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function OnboardingRefreshContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = searchParams.get('slug')

  useEffect(() => {
    if (!slug) { router.push('/dashboard'); return }

    fetch('/api/connect/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventSlug: slug }),
    })
      .then((r) => r.json())
      .then((data: { onboardingUrl?: string }) => {
        if (data.onboardingUrl) {
          window.location.href = data.onboardingUrl
        } else {
          router.push('/dashboard')
        }
      })
      .catch(() => router.push('/dashboard'))
  }, [slug, router])

  return (
    <div className="text-center space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent mx-auto"
        style={{ borderColor: '#E0D0C0', borderTopColor: '#C4956A' }} />
      <p className="text-sm" style={{ color: '#9A7B60' }}>Se regenerează linkul de onboarding...</p>
    </div>
  )
}

export default function OnboardingRefreshPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFAF7' }}>
      <Suspense fallback={
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: '#E0D0C0', borderTopColor: '#C4956A' }} />
      }>
        <OnboardingRefreshContent />
      </Suspense>
    </div>
  )
}
