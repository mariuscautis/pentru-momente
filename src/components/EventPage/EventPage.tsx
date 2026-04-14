'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Event, EventItem, Donation, EventTypeConfig } from '@/types'
import { ItemTracker } from '@/components/ItemTracker/ItemTracker'
import { DonorWall } from '@/components/DonorWall/DonorWall'
import { DonationFlow } from '@/components/DonationFlow/DonationFlow'

interface EventPageProps {
  event: Event
  items: EventItem[]
  donations: Donation[]
  config: EventTypeConfig
  totalRaised: number
}

export function EventPage({ event, items, donations, config, totalRaised }: EventPageProps) {
  const [donateOpen, setDonateOpen] = useState(false)
  const [preselectedItemId, setPreselectedItemId] = useState<string | undefined>()

  const goalPercent = event.goalAmount
    ? Math.min(100, Math.round((totalRaised / event.goalAmount) * 100))
    : null

  function openDonate(itemId?: string) {
    setPreselectedItemId(itemId)
    setDonateOpen(true)
  }

  const pageTitle = config.copy.pageTitle
    .replace('{name}', event.name)
    .replace('{name1}', event.name.split(' & ')[0] ?? event.name)
    .replace('{name2}', event.name.split(' & ')[1] ?? '')

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: config.palette.background }}
    >
      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Cover image */}
        {event.coverImageUrl && (
          <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl">
            <Image
              src={event.coverImageUrl}
              alt={event.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          {event.description && (
            <p className="mt-2 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          )}
        </header>

        {/* Goal progress */}
        {event.goalAmount !== undefined && goalPercent !== null && (
          <section
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            aria-label="Progres strângere de fonduri"
          >
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-900">{totalRaised} RON strânși</span>
              <span className="text-gray-500">din {event.goalAmount} RON</span>
            </div>
            <div
              className="h-3 rounded-full bg-gray-100 overflow-hidden"
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
            <p className="mt-1 text-xs text-right text-gray-400">{goalPercent}%</p>
          </section>
        )}

        {/* Donate CTA */}
        {!donateOpen && (
          <button
            onClick={() => openDonate()}
            className="w-full rounded-xl py-4 text-lg font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: config.palette.primary }}
          >
            {config.copy.donationVerb}
          </button>
        )}

        {/* Donation flow */}
        {donateOpen && (
          <DonationFlow
            event={event}
            items={items}
            config={config}
            preselectedItemId={preselectedItemId}
          />
        )}

        {/* Items */}
        {items.length > 0 && (
          <section aria-label="Articole">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Articole</h2>
            <ItemTracker
              items={items}
              config={config}
              onSelectItem={(id) => openDonate(id)}
            />
          </section>
        )}

        {/* Donor wall */}
        {config.showDonorWall && donations.length > 0 && (
          <DonorWall donations={donations} config={config} />
        )}
      </main>
    </div>
  )
}
