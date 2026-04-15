'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import { EventTypeConfig } from '@/types'
import { DonationState, totalDonationAmount } from './DonationFlow'

// Mirror of the server-side formula in src/lib/payments/stripe.ts
function estimateStripeFee(donationRon: number, tipRon: number): number {
  const base = donationRon + tipRon
  const raw = base * 0.015 + 1.25
  return Math.ceil(raw * 2) / 2
}

const QUICK_PCTS = [1, 2, 3, 5]

interface StepTipProps {
  state: DonationState
  setState: Dispatch<SetStateAction<DonationState>>
  config: EventTypeConfig
  onBack: () => void
  onNext: () => void
}

export function StepTip({ state, setState, config, onBack, onNext }: StepTipProps) {
  const donationTotal = totalDonationAmount(state)
  const isLarge = donationTotal > 2000
  const minPct = isLarge ? 1 : 0

  function ronFromPct(pct: number) {
    return Math.max(1, Math.round(donationTotal * pct / 100))
  }

  const defaultPct = isLarge ? 2 : 2
  const [pct, setPct] = useState<number>(() => {
    if (state.tipAmount > 0) {
      return Math.round((state.tipAmount / donationTotal) * 100 * 10) / 10
    }
    return defaultPct
  })
  const [error, setError] = useState('')

  function handleSlider(val: number) {
    const rounded = Math.round(val * 10) / 10
    setPct(rounded)
    setError('')
    setState((prev) => ({ ...prev, tipAmount: ronFromPct(rounded) }))
  }

  function handleQuick(p: number) {
    setPct(p)
    setError('')
    setState((prev) => ({ ...prev, tipAmount: ronFromPct(p) }))
  }

  function handleNext() {
    if (isLarge && pct < minPct) {
      setError(`Contribuția minimă pentru donații peste 2.000 Lei este 1% (${ronFromPct(1)} Lei).`)
      return
    }
    setState((prev) => ({ ...prev, tipAmount: ronFromPct(pct) }))
    onNext()
  }

  const tipRon = ronFromPct(pct)
  const stripeFeeEstimate = estimateStripeFee(donationTotal, tipRon)
  const total = donationTotal + tipRon + stripeFeeEstimate

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="font-semibold text-lg" style={{ color: '#2D2016' }}>
          Susține platforma
        </h2>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: '#9A7B60' }}>
          Familia primește tot. Platforma se susține printr-o mică contribuție adăugată de tine.
        </p>
      </div>

      {/* Big tip display */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{ backgroundColor: '#F5EDE3', border: '1px solid #E8D5C0' }}
      >
        <p className="text-4xl font-bold" style={{ color: '#2D2016' }}>{tipRon} Lei</p>
        <p className="text-sm mt-1" style={{ color: '#9A7B60' }}>
          {pct}% din donația ta de {donationTotal} Lei
        </p>
      </div>

      {/* Slider */}
      <div>
        <input
          type="range"
          min={minPct}
          max={10}
          step={0.5}
          value={pct}
          onChange={(e) => handleSlider(parseFloat(e.target.value))}
          className="w-full"
          style={{ accentColor: '#C4956A' }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: '#B09070' }}>
          <span>{minPct}%</span>
          <span>5%</span>
          <span>10%</span>
        </div>
      </div>

      {/* Quick-pick anchors */}
      <div className="flex gap-2">
        {QUICK_PCTS.filter(p => p >= minPct).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handleQuick(p)}
            className="flex-1 rounded-xl py-2 text-xs font-semibold transition-all"
            style={
              pct === p
                ? { backgroundColor: '#C4956A', color: '#fff', border: '1.5px solid #C4956A' }
                : { backgroundColor: '#FDFAF7', color: '#7A6652', border: '1.5px solid #EDE0D0' }
            }
          >
            {p}% · {ronFromPct(p)} Lei
          </button>
        ))}
      </div>

      {isLarge && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#FFF8EE', color: '#9A6B45', border: '1px solid #EDD9B8' }}>
          Pentru donații peste 2.000 Lei, contribuția minimă este 1%.
        </p>
      )}

      {error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </p>
      )}

      {/* Summary */}
      <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
          <span>Donație</span>
          <span className="font-medium">{donationTotal} Lei</span>
        </div>
        <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
          <span>Contribuție platformă ({pct}%)</span>
          <span className="font-medium">{tipRon} Lei</span>
        </div>
        <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
          <span>Comision procesare card</span>
          <span className="font-medium">~{stripeFeeEstimate} Lei</span>
        </div>
        <div
          className="flex justify-between text-sm font-bold pt-2"
          style={{ borderTop: '1px solid #EDE0D0', color: '#2D2016' }}
        >
          <span>Total de plătit</span>
          <span>~{total} Lei</span>
        </div>
        <p className="text-xs pt-1" style={{ color: '#B09070' }}>
          Familia primește {donationTotal} Lei, minus taxa de transfer Wise (~1–2 Lei).
        </p>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl py-3 text-sm font-semibold"
          style={{ border: '1px solid #EDE0D0', color: '#7A6652', backgroundColor: '#FFFFFF' }}
        >
          Înapoi
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-grow rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#C4956A' }}
        >
          Spre plată
        </button>
      </div>
    </div>
  )
}
