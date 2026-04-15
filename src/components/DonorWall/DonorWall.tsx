'use client'

import { useState } from 'react'
import { Donation, EventTypeConfig } from '@/types'

interface DonorWallProps {
  donations: Donation[]
  config: EventTypeConfig
}

// Subtle pastel tints for the sticky notes
const NOTE_COLORS = [
  '#FFFBE6', // warm yellow
  '#FFF0E6', // peach
  '#F0F7FF', // soft blue
  '#F0FFF4', // mint
  '#FDF0FF', // lavender
  '#FFF5F5', // blush
]

function noteColor(index: number): string {
  return NOTE_COLORS[index % NOTE_COLORS.length]
}

export function DonorWall({ donations, config }: DonorWallProps) {
  const [selected, setSelected] = useState<Donation | null>(null)

  const visible = donations.filter((d) => !d.isAnonymous || d.displayName)

  if (visible.length === 0) return null

  return (
    <>
      <section aria-label={config.donorWallLabel}>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: '#9A7B60' }}>
          {config.donorWallLabel}
        </h2>

        {/* Masonry-style grid using CSS columns */}
        <div style={{ columnCount: 2, columnGap: '10px' }}>
          {visible.map((donation, i) => (
            <NoteCard
              key={donation.id}
              donation={donation}
              bg={noteColor(i)}
              onClick={() => setSelected(donation)}
            />
          ))}
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <DonorModal
          donation={selected}
          config={config}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

interface NoteCardProps {
  donation: Donation
  bg: string
  onClick: () => void
}

function NoteCard({ donation, bg, onClick }: NoteCardProps) {
  const name = donation.isAnonymous ? 'Anonim' : (donation.displayName ?? 'Anonim')
  const initials = name === 'Anonim' ? '?' : name.charAt(0).toUpperCase()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="cursor-pointer transition-transform hover:-translate-y-0.5 active:scale-95"
      style={{
        breakInside: 'avoid',
        marginBottom: 10,
        backgroundColor: bg,
        borderRadius: 14,
        padding: '14px 14px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
      aria-label={`Donație de la ${name}`}
    >
      {/* Name row */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: '#C4956A' }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <p className="text-xs font-semibold truncate" style={{ color: '#2D2016' }}>{name}</p>
        {donation.showAmount && (
          <span className="ml-auto shrink-0 text-xs font-medium" style={{ color: '#9A7B60' }}>
            {donation.amount} RON
          </span>
        )}
      </div>

      {/* Message preview */}
      {donation.message && (
        <p
          className="text-xs leading-relaxed line-clamp-3"
          style={{ color: '#5A4030', fontStyle: 'italic' }}
        >
          &ldquo;{donation.message}&rdquo;
        </p>
      )}

      {/* Date */}
      <p className="text-xs mt-2" style={{ color: '#B09070' }}>
        {new Date(donation.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}
      </p>
    </div>
  )
}

interface DonorModalProps {
  donation: Donation
  config: EventTypeConfig
  onClose: () => void
}

function DonorModal({ donation, config, onClose }: DonorModalProps) {
  const name = donation.isAnonymous ? 'Anonim' : (donation.displayName ?? 'Anonim')
  const initials = name === 'Anonim' ? '?' : name.charAt(0).toUpperCase()
  const date = new Date(donation.createdAt).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(45, 32, 22, 0.45)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Mesaj de la ${name}`}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{
          backgroundColor: '#FFFDFB',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          border: '1px solid #EDE0D0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none transition-colors hover:bg-gray-100"
          style={{ color: '#9A7B60' }}
          aria-label="Închide"
        >
          ×
        </button>

        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: config.palette.primary }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#2D2016' }}>{name}</p>
            <p className="text-xs" style={{ color: '#B09070' }}>{date}</p>
          </div>
          {donation.showAmount && (
            <span
              className="ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: '#F5EDE3', color: '#9A6B45' }}
            >
              {donation.amount} RON
            </span>
          )}
        </div>

        {/* Message */}
        {donation.message ? (
          <p
            className="text-sm leading-relaxed"
            style={{ color: '#5A4030', fontStyle: 'italic', borderLeft: '3px solid #E8D5C0', paddingLeft: 12 }}
          >
            &ldquo;{donation.message}&rdquo;
          </p>
        ) : (
          <p className="text-sm" style={{ color: '#B09070' }}>Niciun mesaj.</p>
        )}
      </div>
    </div>
  )
}
