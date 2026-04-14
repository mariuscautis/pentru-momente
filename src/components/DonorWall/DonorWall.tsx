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
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
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
    <li className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
      {/* Avatar */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: config.palette.accent }}
        aria-hidden="true"
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-medium text-gray-900 text-sm truncate">{name}</p>
          {donation.showAmount && !donation.isAnonymous && (
            <span className="shrink-0 text-xs font-medium text-gray-500">
              {donation.amount} RON
            </span>
          )}
        </div>
        {donation.message && (
          <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">{donation.message}</p>
        )}
        <p className="mt-0.5 text-xs text-gray-400">{date}</p>
      </div>
    </li>
  )
}
