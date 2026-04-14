'use client'

import { Dispatch, SetStateAction } from 'react'
import { EventItem, EventTypeConfig } from '@/types'
import { Button } from '@/components/ui/Button'
import { DonationState } from './DonationFlow'

const PRESET_AMOUNTS = [25, 50, 100, 200, 500]
const TIP_OPTIONS = [0, 5, 10, 20]

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

      {/* Tip */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Contribuție voluntară platformă (RON)
        </label>
        <p className="text-xs text-gray-500 mb-1.5">
          100% din donație ajunge la familie. Poți susține și platforma dacă dorești.
        </p>
        <div className="flex gap-2">
          {TIP_OPTIONS.map((tip) => (
            <button
              key={tip}
              onClick={() => setState((prev) => ({ ...prev, tipAmount: tip }))}
              className={[
                'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                state.tipAmount === tip
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-300 text-gray-600 hover:border-gray-500',
              ].join(' ')}
            >
              {tip === 0 ? 'Nu' : `${tip} RON`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-gray-50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Donație</span>
          <span className="font-medium">{state.amount} RON</span>
        </div>
        {state.tipAmount > 0 && (
          <div className="flex justify-between mt-1">
            <span className="text-gray-600">Platformă</span>
            <span className="font-medium">{state.tipAmount} RON</span>
          </div>
        )}
        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 font-semibold">
          <span>Total</span>
          <span>{state.amount + state.tipAmount} RON</span>
        </div>
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
