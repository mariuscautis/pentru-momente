'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

export interface TestimonialItem {
  id: string
  quote: string
  name: string
  city: string
  eventType: string
  imageUrl: string | null
}

interface Props {
  testimonials: TestimonialItem[]
}

function TestimonialCard({ t }: { t: TestimonialItem }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 h-full"
      style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
    >
      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={13} fill="var(--color-amber)" color="var(--color-amber)" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-ink)' }}>
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Footer */}
      <div
        className="flex items-center gap-3 pt-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        {/* Avatar */}
        {t.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={t.imageUrl}
            alt={t.name}
            className="w-9 h-9 rounded-full object-cover shrink-0"
            style={{ border: '1px solid var(--color-border)' }}
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ backgroundColor: 'var(--color-amber-light)', color: 'var(--color-amber-dark)' }}
          >
            {t.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--color-ink)' }}>{t.name}</p>
          <p className="text-xs truncate" style={{ color: 'var(--color-ink-faint)' }}>{t.city}</p>
        </div>

        <span
          className="text-xs font-semibold rounded-lg px-2.5 py-1 shrink-0"
          style={{ backgroundColor: 'var(--color-amber-light)', color: 'var(--color-amber-dark)' }}
        >
          {t.eventType}
        </span>
      </div>
    </div>
  )
}

export function TestimonialsSlider({ testimonials }: Props) {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const go = useCallback((next: number) => {
    if (animating || next === current) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent(next)
      setAnimating(false)
    }, 220)
  }, [animating, current])

  const prev = () => go((current - 1 + testimonials.length) % testimonials.length)
  const next = () => go((current + 1) % testimonials.length)

  // Auto-advance every 6 s
  useEffect(() => {
    if (testimonials.length <= 1) return
    const id = setInterval(() => {
      go((current + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(id)
  }, [current, go, testimonials.length])

  if (testimonials.length === 0) return null

  // Desktop: show up to 3 at a time; mobile: always 1
  const desktopVisible = Math.min(testimonials.length, 3)
  const desktopItems = Array.from({ length: desktopVisible }, (_, i) =>
    testimonials[(current + i) % testimonials.length]
  )
  const mobileItem = testimonials[current]

  // Show controls when there are more items than what's visible on that viewport
  const showMobileControls = testimonials.length > 1
  const showDesktopControls = testimonials.length > desktopVisible

  const Controls = ({ show }: { show: boolean }) => show ? (
    <div className="flex items-center justify-center gap-4 mt-7">
      <button
        onClick={prev}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-ink-muted)' }}
        aria-label="Anterior"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Dots */}
      <div className="flex gap-1.5">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="rounded-full transition-all"
            style={{
              width: i === current ? 20 : 8,
              height: 8,
              backgroundColor: i === current ? 'var(--color-amber)' : 'var(--color-border)',
            }}
            aria-label={`Testimonial ${i + 1}`}
          />
        ))}
      </div>

      <button
        onClick={next}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-ink-muted)' }}
        aria-label="Următor"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  ) : null

  return (
    <div className="relative">
      {/* Mobile: single card */}
      <div
        className="block md:hidden"
        style={{ opacity: animating ? 0 : 1, transition: 'opacity 220ms ease' }}
      >
        <TestimonialCard t={mobileItem} />
        <Controls show={showMobileControls} />
      </div>

      {/* Desktop: up to 3 columns */}
      <div className="hidden md:block">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${desktopVisible}, 1fr)`,
            opacity: animating ? 0 : 1,
            transition: 'opacity 220ms ease',
          }}
        >
          {desktopItems.map((t, idx) => (
            <TestimonialCard key={`${t.id}-${idx}`} t={t} />
          ))}
        </div>
        <Controls show={showDesktopControls} />
      </div>
    </div>
  )
}
