'use client'

import { Donation, EventTypeConfig } from '@/types'

interface DonorWallProps {
  donations: Donation[]
  config: EventTypeConfig
}

export function DonorWall({ donations, config }: DonorWallProps) {
  const visible = donations.filter((d) => !d.isAnonymous || d.displayName)

  if (visible.length === 0) return null

  return (
    <section aria-label={config.donorWallLabel}>
      <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#9A7B60' }}>
        {config.donorWallLabel}
      </h2>
      <ul className="space-y-2">
        {visible.map((donation) => (
          <DonorCard key={donation.id} donation={donation} config={config} />
        ))}
      </ul>
    </section>
  )
}

interface DonorCardProps {
  donation: Donation
  config: EventTypeConfig
}

function DonorCard({ donation, config }: DonorCardProps) {
  const name = donation.isAnonymous ? 'Anonim' : (donation.displayName ?? 'Anonim')
  const initials = name === 'Anonim' ? '?' : name.charAt(0).toUpperCase()
  const date = new Date(donation.createdAt).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
  })

  return (
    <li
      className="flex items-start gap-3 rounded-2xl p-3"
      style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: config.palette.primary }}
        aria-hidden="true"
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-semibold text-sm truncate" style={{ color: '#2D2016' }}>{name}</p>
          {donation.showAmount && (
            <span className="shrink-0 text-xs font-medium" style={{ color: '#9A7B60' }}>
              {donation.amount} RON
            </span>
          )}
        </div>
        {donation.message && (
          <p className="mt-0.5 text-sm line-clamp-2" style={{ color: '#7A6652' }}>{donation.message}</p>
        )}
        <p className="mt-0.5 text-xs" style={{ color: '#B09070' }}>{date}</p>
      </div>
    </li>
  )
}
