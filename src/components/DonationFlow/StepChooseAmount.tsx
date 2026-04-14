'use client'

import { Dispatch, SetStateAction } from 'react'
import { EventItem, EventTypeConfig } from '@/types'
import { Button } from '@/components/ui/Button'
import { DonationState } from './DonationFlow'

const PRESET_AMOUNTS = [25, 50, 100, 200, 500]

interface StepChooseAmountProps {
  state: DonationState
  setState: Dispatch<SetStateAction<DonationState>>
  items: EventItem[]
  config: EventTypeConfig
  selectedItem: EventItem | undefined
  onNext: () => void
}

export function StepChooseAmount({
  state,
  setState,
  items,
  config,
  selectedItem,
  onNext,
}: StepChooseAmountProps) {
  const availableItems = items.filter((i) => !i.isFullyFunded)

  function setAmount(amount: number) {
    setState((prev) => ({ ...prev, amount }))
  }

  function setCustomAmount(value: string) {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) setState((prev) => ({ ...prev, amount: num }))
  }

  function selectItem(itemId: string | undefined) {
    const item = itemId ? items.find((i) => i.id === itemId) : undefined
    setState((prev) => ({
      ...prev,
      selectedItemId: itemId,
      amount: item ? Math.max(1, item.targetAmount - item.raisedAmount) : prev.amount,
    }))
  }

  const isPreset = PRESET_AMOUNTS.includes(state.amount)

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-gray-900">{config.copy.donationVerb}</h2>

      {/* Item selector */}
      {availableItems.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Pentru ce donezi? (opțional)
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => selectItem(undefined)}
              className={[
                'rounded-full px-3 py-1.5 text-sm border transition-colors',
                !state.selectedItemId
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400',
              ].join(' ')}
            >
              Fond general
            </button>
            {availableItems.map((item) => (
              <button
                key={item.id}
                onClick={() => selectItem(item.id)}
                className={[
                  'rounded-full px-3 py-1.5 text-sm border transition-colors',
                  state.selectedItemId === item.id
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400',
                ].join(' ')}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Amount presets */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Suma (RON)</label>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset)}
              className={[
                'rounded-lg border py-2 text-sm font-medium transition-colors',
                state.amount === preset
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-300 text-gray-700 hover:border-gray-500',
              ].join(' ')}
            >
              {preset}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          placeholder="Altă sumă"
          value={isPreset ? '' : state.amount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Suma personalizată în RON"
        />
      </div>


      <Button
        onClick={onNext}
        disabled={!state.amount || state.amount < 1}
        size="lg"
        className="w-full"
        style={{ backgroundColor: config.palette.primary }}
      >
        Continuă
      </Button>
    </div>
  )
}
