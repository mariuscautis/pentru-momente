'use client'

import { useState } from 'react'
import { X, Heart } from 'lucide-react'
import { Donation, EventTypeConfig } from '@/types'

interface DonorWallProps {
  donations: Donation[]
  config: EventTypeConfig
  /** 'masonry' = grid of sticky-note cards (mobile inline view)
   *  'sidebar' = compact vertical list (desktop right-column panel) */
  variant?: 'masonry' | 'sidebar'
}

// Warm pastel tints for masonry cards
const NOTE_TINTS = [
  { bg: '#FFFBE8', border: '#F0E4A0' },
  { bg: '#FFF1E8', border: '#F0D4B8' },
  { bg: '#EEF5FF', border: '#C8DAEE' },
  { bg: '#EDFAF2', border: '#B8E4C8' },
  { bg: '#F7EEFF', border: '#DDBBEE' },
  { bg: '#FFF3F3', border: '#F4CCCC' },
]

function tint(i: number) {
  return NOTE_TINTS[i % NOTE_TINTS.length]
}

function initials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function DonorWall({ donations, config, variant = 'masonry' }: DonorWallProps) {
  const [selected, setSelected] = useState<Donation | null>(null)

  const visible = donations.filter((d) => !d.isAnonymous || d.displayName)
  if (visible.length === 0) return null

  return (
    <>
      {variant === 'sidebar' ? (
        <SidebarList donations={visible} config={config} onSelect={setSelected} />
      ) : (
        <MasonryGrid donations={visible} config={config} onSelect={setSelected} />
      )}

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

// ── Sidebar list variant (desktop right column) ──────────────────

function SidebarList({
  donations,
  config,
  onSelect,
}: {
  donations: Donation[]
  config: EventTypeConfig
  onSelect: (d: Donation) => void
}) {
  return (
    <div className="divide-y" style={{ borderColor: '#F0E8DC' }}>
      {donations.map((d) => {
        const name = d.isAnonymous ? 'Anonim' : (d.displayName ?? 'Anonim')
        const ini = name === 'Anonim' ? '?' : initials(name)
        const date = new Date(d.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })

        return (
          <button
            key={d.id}
            onClick={() => onSelect(d)}
            className="w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-amber-50/60 active:bg-amber-50"
            aria-label={`Donație de la ${name}`}
          >
            {/* Avatar */}
            <span
              className="shrink-0 mt-0.5 flex items-center justify-center rounded-full text-xs font-bold text-white"
              style={{
                width: 32,
                height: 32,
                backgroundColor: name === 'Anonim' ? '#C8B8A8' : config.palette.primary,
                fontSize: 11,
              }}
              aria-hidden="true"
            >
              {ini}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold truncate" style={{ color: '#2D2016' }}>{name}</p>
                {d.showAmount && (
                  <span className="shrink-0 text-xs font-semibold tabular-nums" style={{ color: config.palette.primary }}>
                    {d.amount.toLocaleString('ro-RO')} RON
                  </span>
                )}
              </div>
              {d.message ? (
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#7A6652', fontStyle: 'italic' }}>
                  &ldquo;{d.message}&rdquo;
                </p>
              ) : (
                <p className="text-xs mt-0.5" style={{ color: '#B09070' }}>{date}</p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Masonry grid variant (mobile inline) ─────────────────────────

function MasonryGrid({
  donations,
  config,
  onSelect,
}: {
  donations: Donation[]
  config: EventTypeConfig
  onSelect: (d: Donation) => void
}) {
  return (
    <div style={{ columnCount: 2, columnGap: '10px' }}>
      {donations.map((d, i) => {
        const { bg, border } = tint(i)
        const name = d.isAnonymous ? 'Anonim' : (d.displayName ?? 'Anonim')
        const ini = name === 'Anonim' ? '?' : initials(name)
        const date = new Date(d.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })

        return (
          <div
            key={d.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(d)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(d)}
            className="cursor-pointer transition-transform hover:-translate-y-0.5 active:scale-[0.97]"
            style={{
              breakInside: 'avoid',
              marginBottom: 10,
              backgroundColor: bg,
              borderRadius: 14,
              padding: '14px 14px 12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: `1px solid ${border}`,
            }}
            aria-label={`Donație de la ${name}`}
          >
            {/* Name + amount row */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="shrink-0 flex items-center justify-center rounded-full text-white"
                style={{
                  width: 26,
                  height: 26,
                  backgroundColor: name === 'Anonim' ? '#C8B8A8' : config.palette.primary,
                  fontSize: 10,
                  fontWeight: 700,
                }}
                aria-hidden="true"
              >
                {ini}
              </span>
              <p className="text-xs font-semibold truncate flex-1" style={{ color: '#2D2016' }}>{name}</p>
              {d.showAmount && (
                <span className="shrink-0 text-xs font-semibold tabular-nums" style={{ color: '#9A6B45' }}>
                  {d.amount.toLocaleString('ro-RO')}
                </span>
              )}
            </div>

            {/* Message */}
            {d.message && (
              <p
                className="text-xs leading-relaxed line-clamp-3 mb-2"
                style={{ color: '#5A4030', fontStyle: 'italic' }}
              >
                &ldquo;{d.message}&rdquo;
              </p>
            )}

            {/* Date */}
            <p className="text-xs" style={{ color: '#B09070' }}>{date}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Donor detail modal ───────────────────────────────────────────

function DonorModal({
  donation,
  config,
  onClose,
}: {
  donation: Donation
  config: EventTypeConfig
  onClose: () => void
}) {
  const name = donation.isAnonymous ? 'Anonim' : (donation.displayName ?? 'Anonim')
  const ini = name === 'Anonim' ? '?' : initials(name)
  const date = new Date(donation.createdAt).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(28,18,9,0.42)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Mesaj de la ${name}`}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{
          backgroundColor: '#FFFDFB',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          border: '1px solid #EDE0D0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-stone-100"
          style={{ color: '#9A7B60' }}
          aria-label="Închide"
        >
          <X size={14} strokeWidth={2} />
        </button>

        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 flex items-center justify-center rounded-full text-sm font-bold text-white"
            style={{
              width: 44,
              height: 44,
              backgroundColor: name === 'Anonim' ? '#C8B8A8' : config.palette.primary,
            }}
            aria-hidden="true"
          >
            {ini}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#1C1209' }}>{name}</p>
            <p className="text-xs" style={{ color: '#B09070' }}>{date}</p>
          </div>
          {donation.showAmount && (
            <span
              className="ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-semibold tabular-nums"
              style={{ backgroundColor: '#F5EDE3', color: '#9A6B45' }}
            >
              {donation.amount.toLocaleString('ro-RO')} RON
            </span>
          )}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #F0E8DC' }} />

        {/* Message */}
        {donation.message ? (
          <div className="flex gap-2.5">
            <Heart
              size={14}
              strokeWidth={1.5}
              className="shrink-0 mt-0.5"
              style={{ color: config.palette.primary }}
            />
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#5A4030', fontStyle: 'italic' }}
            >
              &ldquo;{donation.message}&rdquo;
            </p>
          </div>
        ) : (
          <p className="text-sm" style={{ color: '#B09070' }}>Niciun mesaj atașat.</p>
        )}
      </div>
    </div>
  )
}
