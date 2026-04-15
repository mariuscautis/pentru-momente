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

const FIXED_PRESETS = [15, 20, 25, 50]
const PCT_QUICK = [1, 2, 3, 5]

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

  // ── Fixed-amount mode (≤ 2000 RON) ─────────────────────────────────────────
  const [fixedAmount, setFixedAmount] = useState<number>(() => {
    if (!isLarge && FIXED_PRESETS.includes(state.tipAmount)) return state.tipAmount
    return 20 // default preset
  })
  const [customValue, setCustomValue] = useState<string>(() => {
    if (!isLarge && state.tipAmount > 0 && !FIXED_PRESETS.includes(state.tipAmount)) {
      return String(state.tipAmount)
    }
    return ''
  })
  const [activeFixedPreset, setActiveFixedPreset] = useState<number | null>(() => {
    if (!isLarge && FIXED_PRESETS.includes(state.tipAmount)) return state.tipAmount
    return isLarge ? null : 20 // default to 20 Lei preset
  })

  function selectFixedPreset(amount: number) {
    setActiveFixedPreset(amount)
    setCustomValue('')
    setFixedAmount(amount)
    setState((prev) => ({ ...prev, tipAmount: amount }))
  }

  function handleCustomFixed(value: string) {
    setCustomValue(value)
    setActiveFixedPreset(null)
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) {
      setFixedAmount(num)
      setState((prev) => ({ ...prev, tipAmount: num }))
    }
  }

  // ── Percentage mode (> 2000 RON) ────────────────────────────────────────────
  function ronFromPct(pct: number) {
    return Math.max(1, Math.round(donationTotal * pct / 100))
  }

  const [pct, setPct] = useState<number>(() => {
    if (isLarge && state.tipAmount > 0) {
      const derived = Math.round((state.tipAmount / donationTotal) * 100 * 10) / 10
      // Only restore if it was actually set as a percentage (≥ 1%), not a leftover fixed amount
      if (derived >= 1) return derived
    }
    return 2 // default to 2% for large donations
  })
  const [pctError, setPctError] = useState('')

  function handleSlider(val: number) {
    const rounded = Math.round(val * 10) / 10
    setPct(rounded)
    setPctError('')
    setState((prev) => ({ ...prev, tipAmount: ronFromPct(rounded) }))
  }

  function handleQuickPct(p: number) {
    setPct(p)
    setPctError('')
    setState((prev) => ({ ...prev, tipAmount: ronFromPct(p) }))
  }

  // ── Shared ──────────────────────────────────────────────────────────────────
  function handleNext() {
    if (isLarge && pct < 1) {
      setPctError(`Contribuția minimă pentru donații peste 2.000 Lei este 1% (${ronFromPct(1)} Lei).`)
      return
    }
    if (isLarge) {
      setState((prev) => ({ ...prev, tipAmount: ronFromPct(pct) }))
    } else {
      setState((prev) => ({ ...prev, tipAmount: fixedAmount }))
    }
    onNext()
  }

  const tipRon = isLarge ? ronFromPct(pct) : fixedAmount
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
          {isLarge ? `${pct}% din donația ta de ${donationTotal} Lei` : `contribuție fixă la platforma`}
        </p>
      </div>

      {isLarge ? (
        /* ── Percentage controls ── */
        <>
          <div>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={pct}
              onChange={(e) => handleSlider(parseFloat(e.target.value))}
              className="w-full"
              style={{ accentColor: '#C4956A' }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: '#B09070' }}>
              <span>1%</span>
              <span>5%</span>
              <span>10%</span>
            </div>
          </div>

          <div className="flex gap-2">
            {PCT_QUICK.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleQuickPct(p)}
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

          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#FFF8EE', color: '#9A6B45', border: '1px solid #EDD9B8' }}>
            Pentru donații peste 2.000 Lei, contribuția minimă este 1%.
          </p>

          {pctError && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
              {pctError}
            </p>
          )}
        </>
      ) : (
        /* ── Fixed-amount controls ── */
        <>
          <div className="flex gap-2">
            {FIXED_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => selectFixedPreset(p)}
                className="flex-1 rounded-xl py-2 text-xs font-semibold transition-all"
                style={
                  activeFixedPreset === p
                    ? { backgroundColor: '#C4956A', color: '#fff', border: '1.5px solid #C4956A' }
                    : { backgroundColor: '#FDFAF7', color: '#7A6652', border: '1.5px solid #EDE0D0' }
                }
              >
                {p} Lei
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="number"
              min={1}
              placeholder="Altă sumă"
              value={customValue}
              onChange={(e) => handleCustomFixed(e.target.value)}
              onFocus={() => setActiveFixedPreset(null)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-12"
              style={{
                border: `1px solid ${activeFixedPreset === null && customValue ? '#C4956A' : '#E0D0C0'}`,
                color: '#2D2016',
                backgroundColor: '#FDFAF7',
              }}
              aria-label="Contribuție personalizată în Lei"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9A7B60' }}>Lei</span>
          </div>
        </>
      )}

      {/* Summary */}
      <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
          <span>Donație</span>
          <span className="font-medium">{donationTotal} Lei</span>
        </div>
        <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
          <span>Contribuție platformă{isLarge ? ` (${pct}%)` : ''}</span>
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
