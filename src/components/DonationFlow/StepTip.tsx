'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import { EventTypeConfig } from '@/types'
import { DonationState, totalDonationAmount } from './DonationFlow'

const FIXED_PRESETS = [0, 10, 20, 30, 50]
const PCT_QUICK = [0, 1, 2, 5]

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
  const [activeFixedPreset, setActiveFixedPreset] = useState<number>(() => {
    if (FIXED_PRESETS.includes(state.tipAmount)) return state.tipAmount
    return 0
  })
  const [customValue, setCustomValue] = useState<string>(() => {
    if (state.tipAmount > 0 && !FIXED_PRESETS.includes(state.tipAmount)) {
      return String(state.tipAmount)
    }
    return ''
  })

  function selectFixedPreset(amount: number) {
    setActiveFixedPreset(amount)
    setCustomValue('')
    setState((prev) => ({ ...prev, tipAmount: amount }))
  }

  function handleCustomFixed(value: string) {
    const sanitised = value.replace(/-/g, '')
    setCustomValue(sanitised)
    setActiveFixedPreset(-1)
    const num = parseFloat(sanitised)
    if (!isNaN(num) && num >= 0) {
      setState((prev) => ({ ...prev, tipAmount: num }))
    }
  }

  // ── Percentage mode (> 2000 RON) ────────────────────────────────────────────
  function ronFromPct(pct: number) {
    if (pct === 0) return 0
    return Math.max(1, Math.round(donationTotal * pct / 100))
  }

  const [pct, setPct] = useState<number>(() => {
    if (isLarge && state.tipAmount > 0) {
      const derived = Math.round((state.tipAmount / donationTotal) * 100 * 10) / 10
      if (derived >= 1) return derived
    }
    return 0
  })

  function handleSlider(val: number) {
    const rounded = Math.round(val * 10) / 10
    setPct(rounded)
    setState((prev) => ({ ...prev, tipAmount: ronFromPct(rounded) }))
  }

  function handleQuickPct(p: number) {
    setPct(p)
    setState((prev) => ({ ...prev, tipAmount: ronFromPct(p) }))
  }

  // ── Shared ──────────────────────────────────────────────────────────────────
  function handleNext() {
    if (isLarge) {
      setState((prev) => ({ ...prev, tipAmount: ronFromPct(pct) }))
    } else {
      const tip = customValue
        ? (parseFloat(customValue) || 0)
        : activeFixedPreset >= 0 ? activeFixedPreset : 0
      setState((prev) => ({ ...prev, tipAmount: tip }))
    }
    onNext()
  }

  const tipRon = isLarge ? ronFromPct(pct) : (
    customValue ? (parseFloat(customValue) || 0) : (activeFixedPreset >= 0 ? activeFixedPreset : 0)
  )
  const donorTotal = donationTotal + tipRon

  return (
    <div className="space-y-5">

      {/* Optional tip section */}
      <div>
        <h2 className="font-semibold text-base" style={{ color: '#2D2016' }}>
          Susține și platforma (opțional)
        </h2>
        <p className="text-sm mt-0.5" style={{ color: '#9A7B60' }}>
          Dacă dorești, poți adăuga o contribuție suplimentară pentru platformă.
        </p>
      </div>

      {isLarge ? (
        <>
          <div
            className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: '#F5EDE3', border: '1px solid #E8D5C0' }}
          >
            <p className="text-3xl font-bold" style={{ color: '#2D2016' }}>
              {tipRon === 0 ? 'Fără contribuție' : `${tipRon} Lei`}
            </p>
            <p className="text-sm mt-1" style={{ color: '#9A7B60' }}>
              {pct > 0 ? `${pct}% din donația ta` : 'contribuție opțională'}
            </p>
          </div>
          <div>
            <input
              type="range"
              min={0} max={10} step={0.5}
              value={pct}
              onChange={(e) => handleSlider(parseFloat(e.target.value))}
              className="w-full"
              style={{ accentColor: '#C4956A' }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: '#B09070' }}>
              <span>0%</span><span>5%</span><span>10%</span>
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
                {p === 0 ? '0%' : `${p}% · ${ronFromPct(p)} Lei`}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-2">
            {FIXED_PRESETS.map((p) => {
              const isSelected = activeFixedPreset === p && !customValue
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => selectFixedPreset(p)}
                  className="flex-1 rounded-xl py-2 text-xs font-semibold transition-all"
                  style={
                    isSelected
                      ? { backgroundColor: '#C4956A', color: '#fff', border: '1.5px solid #C4956A' }
                      : { backgroundColor: '#FDFAF7', color: '#7A6652', border: '1.5px solid #EDE0D0' }
                  }
                >
                  {p === 0 ? '0' : `${p}`} Lei
                </button>
              )
            })}
          </div>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Altă sumă"
              value={customValue}
              onChange={(e) => handleCustomFixed(e.target.value)}
              onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
              onFocus={() => setActiveFixedPreset(-1)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-12"
              style={{
                border: `1px solid ${activeFixedPreset === -1 && customValue ? '#C4956A' : '#E0D0C0'}`,
                color: '#2D2016',
                backgroundColor: '#FDFAF7',
              }}
              aria-label="Contribuție opțională în Lei"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9A7B60' }}>Lei</span>
          </div>
        </>
      )}

      {/* Total donor pays */}
      <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
          <span>Donație</span>
          <span className="font-medium">{donationTotal} Lei</span>
        </div>
        {tipRon > 0 && (
          <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
            <span>Contribuție platformă{isLarge && pct > 0 ? ` (${pct}%)` : ''}</span>
            <span className="font-medium">{tipRon} Lei</span>
          </div>
        )}
        <div
          className="flex justify-between text-sm font-bold pt-2"
          style={{ borderTop: '1px solid #EDE0D0', color: '#2D2016' }}
        >
          <span>Total de plătit</span>
          <span>{donorTotal} Lei</span>
        </div>
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
          style={{ backgroundColor: config.palette.primary }}
        >
          Spre plată
        </button>
      </div>
    </div>
  )
}
