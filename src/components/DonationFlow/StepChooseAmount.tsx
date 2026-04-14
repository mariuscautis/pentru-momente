'use client'

import { Dispatch, SetStateAction } from 'react'
import { EventItem, EventTypeConfig } from '@/types'
import { DonationState } from './DonationFlow'

const PRESET_AMOUNTS = [25, 50, 100, 200, 500]

interface StepChooseAmountProps {
  state: DonationState
  setState: Dispatch<SetStateAction<DonationState>>
  items: EventItem[]
  config: EventTypeConfig
  onBack?: () => void
  onNext: () => void
}

export function StepChooseAmount({ state, setState, config, onBack, onNext }: StepChooseAmountProps) {
  const isPreset = PRESET_AMOUNTS.includes(state.amount)

  function setAmount(amount: number) {
    setState((prev) => ({ ...prev, amount, selectedItems: [] }))
  }

  function setCustomAmount(value: string) {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) {
      setState((prev) => ({ ...prev, amount: num, selectedItems: [] }))
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="font-semibold" style={{ color: '#2D2016' }}>{config.copy.donationVerb}</h2>

      <div>
        <p className="text-xs font-medium mb-2" style={{ color: '#7A6652' }}>Alege suma (RON)</p>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className="rounded-xl py-2 text-sm font-medium transition-colors"
              style={
                state.amount === preset
                  ? { backgroundColor: '#C4956A', color: '#fff' }
                  : { backgroundColor: '#F5EDE3', color: '#7A6652' }
              }
            >
              {preset}
            </button>
          ))}
        </div>
        <div className="relative mt-2">
          <input
            type="number"
            min={1}
            placeholder="Altă sumă"
            value={isPreset ? '' : state.amount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-12"
            style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FDFAF7' }}
            onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
            onBlur={(e) => (e.target.style.borderColor = '#E0D0C0')}
            aria-label="Suma personalizată în RON"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9A7B60' }}>RON</span>
        </div>
      </div>

      <div className={onBack ? 'flex gap-3' : ''}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors"
            style={{ border: '1px solid #EDE0D0', color: '#7A6652', backgroundColor: '#FFFFFF' }}
          >
            Înapoi
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={state.amount < 1}
          className="rounded-xl py-3 text-base font-semibold text-white transition-opacity"
          style={{
            backgroundColor: config.palette.primary,
            opacity: state.amount < 1 ? 0.5 : 1,
            flex: onBack ? 2 : undefined,
            width: onBack ? undefined : '100%',
          }}
        >
          Continuă
        </button>
      </div>
    </div>
  )
}
