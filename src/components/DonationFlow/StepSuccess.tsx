'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Event, EventTypeConfig } from '@/types'

const COUNTDOWN = 10
const RADIUS = 28
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface StepSuccessProps {
  config: EventTypeConfig
  event: Event
  amount: number
}

export function StepSuccess({ config, event, amount }: StepSuccessProps) {
  const router = useRouter()
  const [seconds, setSeconds] = useState(COUNTDOWN)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const eventUrl = `/${event.eventType}/${event.slug}#donors`

  function goToPage() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    router.push(eventUrl)
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          router.push(eventUrl)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const progress = seconds / COUNTDOWN
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">

      {/* Checkmark */}
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
        style={{ backgroundColor: config.palette.background }}
        aria-hidden="true"
      >
        ✓
      </div>

      <div>
        <h2 className="text-lg font-semibold" style={{ color: '#2D2016' }}>Mulțumim!</h2>
        <p className="mt-1 text-sm max-w-xs" style={{ color: '#7A6652' }}>
          {config.copy.thankYouMessage}
        </p>
      </div>

      <div className="rounded-xl px-6 py-3 text-sm" style={{ backgroundColor: '#F5EDE3' }}>
        <span style={{ color: '#9A7B60' }}>Ai donat </span>
        <span className="font-semibold" style={{ color: '#2D2016' }}>{amount} RON</span>
        <span style={{ color: '#9A7B60' }}> pentru {event.name}</span>
      </div>

      {/* Circular countdown + redirect */}
      <div className="flex flex-col items-center gap-3 mt-1">
        <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
          <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle
              cx="36" cy="36" r={RADIUS}
              fill="none"
              stroke="#EDE0D0"
              strokeWidth="4"
            />
            {/* Progress */}
            <circle
              cx="36" cy="36" r={RADIUS}
              fill="none"
              stroke={config.palette.primary}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span
            className="absolute text-lg font-bold"
            style={{ color: '#2D2016' }}
          >
            {seconds}
          </span>
        </div>

        <p className="text-xs" style={{ color: '#9A7B60' }}>
          Vei fi redirecționat în <strong style={{ color: '#2D2016' }}>{seconds}</strong> {seconds === 1 ? 'secundă' : 'secunde'}
        </p>

        <button
          onClick={goToPage}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: config.palette.primary }}
        >
          Vezi pagina acum →
        </button>
      </div>

    </div>
  )
}
