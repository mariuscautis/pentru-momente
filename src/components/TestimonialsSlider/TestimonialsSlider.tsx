'use client'

import { useState, useEffect, useRef } from 'react'
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
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={13} fill="var(--color-amber)" color="var(--color-amber)" />
        ))}
      </div>

      <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-ink)' }}>
        &ldquo;{t.quote}&rdquo;
      </p>

      <div
        className="flex items-center gap-3 pt-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
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
  const sliding = useRef(false)

  const go = (next: number) => {
    if (sliding.current) return
    sliding.current = true
    setCurrent(next)
    setTimeout(() => { sliding.current = false }, 380)
  }

  const prev = () => go((current - 1 + testimonials.length) % testimonials.length)
  const next = () => go((current + 1) % testimonials.length)

  useEffect(() => {
    if (testimonials.length <= 1) return
    const id = setInterval(() => {
      setCurrent(c => (c + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(id)
  }, [testimonials.length])

  if (testimonials.length === 0) return null

  const desktopVisible = Math.min(testimonials.length, 3)
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

      {/* ── Mobile: single card, sliding strip ── */}
      <div className="block md:hidden">
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex"
            style={{
              transform: `translateX(-${current * 100}%)`,
              transition: 'transform 360ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
            }}
          >
            {testimonials.map((t) => (
              <div key={t.id} className="w-full shrink-0 px-px">
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        </div>
        <Controls show={showMobileControls} />
      </div>

      {/* ── Desktop: multi-column sliding strip ── */}
      <div className="hidden md:block">
        <div className="overflow-hidden">
          {/*
            The strip holds ALL testimonials side-by-side, each card occupying
            1/desktopVisible of the viewport width. We slide by one card-width
            (= 100% / desktopVisible) per step.
          */}
          <div
            className="flex items-stretch"
            style={{
              transform: `translateX(-${current * (100 / desktopVisible)}%)`,
              transition: 'transform 360ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
            }}
          >
            {/* Render enough cards so the visible window never shows a gap.
                We duplicate the list once to handle wrap-around gracefully. */}
            {[...testimonials, ...testimonials].map((t, idx) => (
              <div
                key={`${t.id}-${idx}`}
                className="shrink-0 px-2"
                style={{ width: `${100 / desktopVisible}%` }}
              >
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        </div>
        <Controls show={showDesktopControls} />
      </div>

    </div>
  )
}
