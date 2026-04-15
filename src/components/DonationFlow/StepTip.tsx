'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import { EventTypeConfig } from '@/types'
import { DonationState, totalDonationAmount } from './DonationFlow'

const PRESETS = [1, 2, 3, 4, 5] // percentages

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
  const minPercent = isLarge ? 1 : 0

  function percentToRon(pct: number) {
    return Math.round(donationTotal * pct / 100)
  }

  // Derive initial percent from existing tipAmount if set
  function initialPercent(): number | 'custom' {
    if (state.tipAmount === 0) return isLarge ? 1 : 2
    const pct = Math.round((state.tipAmount / donationTotal) * 100)
    if (PRESETS.includes(pct)) return pct as 1 | 2 | 3 | 4 | 5
    return 'custom'
  }

  const [selectedPct, setSelectedPct] = useState<number | 'custom'>(initialPercent)
  const [customPct, setCustomPct] = useState<string>(
    selectedPct === 'custom' ? String(Math.round((state.tipAmount / donationTotal) * 100)) : ''
  )
  const [error, setError] = useState('')

  function selectPreset(pct: number) {
    setSelectedPct(pct)
    setError('')
    setState((prev) => ({ ...prev, tipAmount: percentToRon(pct) }))
  }

  function handleCustomChange(val: string) {
    setCustomPct(val)
    setError('')
    const num = parseFloat(val)
    if (!isNaN(num) && num > 0) {
      setState((prev) => ({ ...prev, tipAmount: percentToRon(num) }))
    }
  }

  function handleNext() {
    const pct = selectedPct === 'custom' ? parseFloat(customPct) : selectedPct
    if (isNaN(pct) || pct < minPercent) {
      setError(isLarge
        ? `Contribuția minimă este 1% (${percentToRon(1)} Lei) pentru donații peste 2000 Lei.`
        : 'Te rugăm să introduci o contribuție validă.'
      )
      return
    }
    setState((prev) => ({ ...prev, tipAmount: percentToRon(pct) }))
    onNext()
  }

  const currentPct = selectedPct === 'custom' ? (parseFloat(customPct) || 0) : selectedPct
  const currentTip = percentToRon(currentPct)
  const total = donationTotal + currentTip

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg" style={{ color: '#2D2016' }}>
          Contribuție pentru platformă
        </h2>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: '#9A7B60' }}>
          100% din donația ta ajunge la familie. Platforma este susținută printr-o contribuție separată — îți mulțumim.
        </p>
        {isLarge && (
          <p className="text-xs mt-2 px-3 py-2 rounded-lg" style={{ backgroundColor: '#FFF8EE', color: '#9A6B45', border: '1px solid #EDD9B8' }}>
            Pentru donații peste 2.000 Lei, contribuția minimă este 1%.
          </p>
        )}
      </div>

      {/* Percent presets */}
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => selectPreset(pct)}
            className="rounded-xl py-3 px-2 text-sm font-semibold transition-all flex flex-col items-center gap-0.5"
            style={
              selectedPct === pct
                ? { backgroundColor: '#C4956A', color: '#FFFFFF', border: '2px solid #C4956A' }
                : { backgroundColor: '#FDFAF7', color: '#2D2016', border: '2px solid #EDE0D0' }
            }
          >
            <span>{pct}%</span>
            <span className="text-xs font-normal opacity-75">{percentToRon(pct)} Lei</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setSelectedPct('custom')
            setError('')
            if (!customPct) {
              const defaultPct = String(isLarge ? 1 : 2)
              setCustomPct(defaultPct)
              setState((prev) => ({ ...prev, tipAmount: percentToRon(parseFloat(defaultPct)) }))
            }
          }}
          className="rounded-xl py-3 px-2 text-sm font-semibold transition-all"
          style={
            selectedPct === 'custom'
              ? { backgroundColor: '#C4956A', color: '#FFFFFF', border: '2px solid #C4956A' }
              : { backgroundColor: '#FDFAF7', color: '#2D2016', border: '2px solid #EDE0D0' }
          }
        >
          Alt %
        </button>
      </div>

      {/* Custom percent input */}
      {selectedPct === 'custom' && (
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A6652' }}>
            Procent contribuție{isLarge ? ` (minim ${minPercent}%)` : ''}
          </label>
          <div className="relative">
            <input
              type="number"
              min={minPercent}
              max={100}
              step={0.5}
              value={customPct}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder={`ex: ${isLarge ? '1.5' : '2'}`}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none pr-10"
              style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FDFAF7' }}
              onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
              onBlur={(e) => (e.target.style.borderColor = '#E0D0C0')}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#9A7B60' }}>
              %
            </span>
          </div>
          {customPct && !isNaN(parseFloat(customPct)) && (
            <p className="mt-1 text-xs" style={{ color: '#9A7B60' }}>
              = {percentToRon(parseFloat(customPct))} Lei
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </p>
      )}

      {/* Order summary */}
      <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
          <span>Donație</span>
          <span className="font-medium">{donationTotal} Lei</span>
        </div>
        <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
          <span>Contribuție platformă{currentPct > 0 ? ` (${currentPct}%)` : ''}</span>
          <span className="font-medium">{currentTip > 0 ? `${currentTip} Lei` : '—'}</span>
        </div>
        <div
          className="flex justify-between text-sm font-bold pt-2"
          style={{ borderTop: '1px solid #EDE0D0', color: '#2D2016' }}
        >
          <span>Total de plătit</span>
          <span>{currentTip > 0 ? `${total} Lei` : `${donationTotal} Lei`}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors"
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
