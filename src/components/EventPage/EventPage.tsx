'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Event, EventItem, Donation, EventTypeConfig } from '@/types'
import { ItemTracker } from '@/components/ItemTracker/ItemTracker'
import { DonorWall } from '@/components/DonorWall/DonorWall'
import { DonationFlow, SelectedItem } from '@/components/DonationFlow/DonationFlow'

interface EventPageProps {
  event: Event
  items: EventItem[]
  donations: Donation[]
  config: EventTypeConfig
  totalRaised: number
}

export function EventPage({ event, items, donations, config, totalRaised }: EventPageProps) {
  const [cart, setCart] = useState<SelectedItem[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const goalPercent = event.goalAmount
    ? Math.min(100, Math.round((totalRaised / event.goalAmount) * 100))
    : null

  const cartTotal = cart.reduce((sum, i) => sum + i.amount, 0)

  const pageTitle = config.copy.pageTitle
    .replace('{name}', event.name)
    .replace('{name1}', event.name.split(' & ')[0] ?? event.name)
    .replace('{name2}', event.name.split(' & ')[1] ?? '')

  function openCheckout() {
    setCheckoutOpen(true)
    setTimeout(() => {
      document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function handleDonationComplete() {
    setCheckoutOpen(false)
    setCart([])
    setTimeout(() => {
      document.getElementById('donors')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: config.palette.background }}>

      {/* ── Hero ── */}
      {event.coverImageUrl ? (
        <div className="relative w-full" style={{ height: 'clamp(320px, 55vh, 620px)' }}>
          <Image
            src={event.coverImageUrl}
            alt={event.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={90}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                to bottom,
                transparent 0%,
                transparent 40%,
                ${hexToRgba(config.palette.background, 0.6)} 65%,
                ${config.palette.background} 100%
              )`,
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-16">
            <div className="mx-auto max-w-2xl">
              <h1
                className="text-3xl font-bold leading-tight drop-shadow-sm"
                style={{ color: '#2D2016', textShadow: '0 1px 8px rgba(253,250,247,0.6)' }}
              >
                {pageTitle}
              </h1>
            </div>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-2xl px-4 space-y-6" style={{ paddingTop: event.coverImageUrl ? 24 : 40, paddingBottom: cart.length > 0 ? 100 : 48 }}>

        {!event.coverImageUrl && (
          <header>
            <h1 className="text-3xl font-bold leading-tight" style={{ color: '#2D2016' }}>{pageTitle}</h1>
          </header>
        )}

        {/* Goal progress */}
        {event.goalAmount !== undefined && goalPercent !== null && (
          <section
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
            aria-label="Progres strângere de fonduri"
          >
            <div className="flex justify-between text-sm mb-3">
              <span className="font-bold text-lg" style={{ color: '#2D2016' }}>{totalRaised} RON</span>
              <span className="text-sm" style={{ color: '#9A7B60' }}>din {event.goalAmount} RON</span>
            </div>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: '#F0E8DC' }}
              role="progressbar"
              aria-valuenow={goalPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${goalPercent}%`, backgroundColor: config.palette.primary }}
              />
            </div>
            <p className="mt-1.5 text-xs text-right" style={{ color: '#B09070' }}>{goalPercent}% din obiectiv</p>
          </section>
        )}

        {/* Description */}
        {event.description && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#7A6652' }}>
            {event.description}
          </p>
        )}

        {/* General donate CTA — only when no items or checkout not open */}
        {!checkoutOpen && (
          <button
            onClick={() => { setCart([]); openCheckout() }}
            className="w-full rounded-2xl py-4 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: config.palette.primary }}
          >
            {config.copy.donationVerb}
          </button>
        )}

        {/* Checkout / donation flow */}
        {checkoutOpen && (
          <div id="checkout-section">
            <DonationFlow
              event={event}
              items={items}
              config={config}
              initialCart={cart}
              onClose={() => { setCheckoutOpen(false); setCart([]) }}
              onDonationComplete={handleDonationComplete}
            />
          </div>
        )}

        {/* Items list */}
        {items.length > 0 && !checkoutOpen && (
          <section aria-label="Articole">
            <h2 className="text-base font-semibold mb-3" style={{ color: '#2D2016' }}>Articole</h2>
            <ItemTracker
              items={items}
              config={config}
              cart={cart}
              onCartChange={setCart}
            />
          </section>
        )}

        {/* Donor wall */}
        {config.showDonorWall && donations.length > 0 && (
          <div id="donors">
            <DonorWall donations={donations} config={config} />
          </div>
        )}
      </main>

      {/* ── Sticky cart bar ── */}
      {cart.length > 0 && !checkoutOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4"
          style={{ background: `linear-gradient(to top, ${config.palette.background} 60%, transparent)` }}
        >
          <div
            className="mx-auto max-w-2xl rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
            style={{ backgroundColor: '#2D2016', boxShadow: '0 8px 32px rgba(45,32,22,0.25)' }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: '#C4956A' }}>
                {cart.length} {cart.length === 1 ? 'articol' : 'articole'} în coș
              </p>
              <p className="text-lg font-bold" style={{ color: '#FDFAF7' }}>
                {cartTotal} RON
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCart([])}
                className="rounded-xl px-3 py-2 text-xs font-medium transition-colors"
                style={{ color: '#9A7B60', border: '1px solid #3A2A18' }}
              >
                Golește
              </button>
              <button
                onClick={openCheckout}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#C4956A' }}
              >
                Spre plată →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
