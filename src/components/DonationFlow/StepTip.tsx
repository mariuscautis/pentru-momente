'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import { EventTypeConfig } from '@/types'
import { DonationState, totalDonationAmount } from './DonationFlow'

interface StepTipProps {
  state: DonationState
  setState: Dispatch<SetStateAction<DonationState>>
  config: EventTypeConfig
  onBack: () => void
  onNext: () => void
}

const PRESETS = [20, 50]

export function StepTip({ state, setState, config, onBack, onNext }: StepTipProps) {
  const [mode, setMode] = useState<20 | 50 | 'custom'>(
    PRESETS.includes(state.tipAmount) ? (state.tipAmount as 20 | 50) : 'custom'
  )
  const [customValue, setCustomValue] = useState(
    !PRESETS.includes(state.tipAmount) ? String(state.tipAmount) : ''
  )
  const [error, setError] = useState('')

  function selectPreset(amount: 20 | 50) {
    setMode(amount)
    setError('')
    setState((prev) => ({ ...prev, tipAmount: amount }))
  }

  function handleCustomChange(val: string) {
    setCustomValue(val)
    setError('')
    const num = parseFloat(val)
    if (!isNaN(num)) {
      setState((prev) => ({ ...prev, tipAmount: num }))
    }
  }

  function handleNext() {
    const tip = mode === 'custom' ? parseFloat(customValue) : mode
    if (isNaN(tip) || tip < 20) {
      setError('Contribuția minimă este de 20 Lei.')
      return
    }
    setState((prev) => ({ ...prev, tipAmount: tip }))
    onNext()
  }

  const currentTip = mode === 'custom' ? parseFloat(customValue) || 0 : mode
  const donationTotal = totalDonationAmount(state)
  const total = donationTotal + currentTip

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg" style={{ color: '#2D2016' }}>
          Contribuție pentru platformă
        </h2>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: '#9A7B60' }}>
          100% din donația ta ajunge la familie. Platforma este susținută printr-o contribuție separată din partea ta — îți mulțumim.
        </p>
      </div>

      {/* Preset buttons */}
      <div className="grid grid-cols-3 gap-3">
        {PRESETS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => selectPreset(amount as 20 | 50)}
            className="rounded-xl py-3 text-sm font-semibold transition-all"
            style={
              mode === amount
                ? { backgroundColor: '#C4956A', color: '#FFFFFF', border: '2px solid #C4956A' }
                : { backgroundColor: '#FDFAF7', color: '#2D2016', border: '2px solid #EDE0D0' }
            }
          >
            {amount} Lei
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setMode('custom')
            setError('')
            if (!customValue) {
              setCustomValue('20')
              setState((prev) => ({ ...prev, tipAmount: 20 }))
            }
          }}
          className="rounded-xl py-3 text-sm font-semibold transition-all"
          style={
            mode === 'custom'
              ? { backgroundColor: '#C4956A', color: '#FFFFFF', border: '2px solid #C4956A' }
              : { backgroundColor: '#FDFAF7', color: '#2D2016', border: '2px solid #EDE0D0' }
          }
        >
          Altă sumă
        </button>
      </div>

      {/* Custom input */}
      {mode === 'custom' && (
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A6652' }}>
            Sumă contribuție (minim 20 Lei)
          </label>
          <div className="relative">
            <input
              type="number"
              min={20}
              value={customValue}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="ex: 30"
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none pr-14"
              style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FDFAF7' }}
              onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
              onBlur={(e) => (e.target.style.borderColor = '#E0D0C0')}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium"
              style={{ color: '#9A7B60' }}
            >
              Lei
            </span>
          </div>
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
          <span>Contribuție platformă</span>
          <span className="font-medium">{currentTip > 0 ? `${currentTip} Lei` : '—'}</span>
        </div>
        <div
          className="flex justify-between text-sm font-bold pt-2"
          style={{ borderTop: '1px solid #EDE0D0', color: '#2D2016' }}
        >
          <span>Total de plătit</span>
          <span>{total > donationTotal ? `${total} Lei` : '—'}</span>
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
