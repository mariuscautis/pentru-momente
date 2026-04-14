'use client'

import { Dispatch, SetStateAction } from 'react'
import { EventItem, EventTypeConfig } from '@/types'
import { DonationState, totalDonationAmount } from './DonationFlow'

const PRESET_AMOUNTS = [25, 50, 100, 200, 500]

interface StepChooseAmountProps {
  state: DonationState
  setState: Dispatch<SetStateAction<DonationState>>
  items: EventItem[]
  config: EventTypeConfig
  onNext: () => void
}

export function StepChooseAmount({ state, setState, items, config, onNext }: StepChooseAmountProps) {
  const availableItems = items.filter((i) => !i.isFullyFunded)
  const isGeneralFund = state.selectedItems.length === 0
  const isPreset = PRESET_AMOUNTS.includes(state.amount)
  const total = totalDonationAmount(state)

  function toggleItem(item: EventItem) {
    setState((prev) => {
      const exists = prev.selectedItems.find((s) => s.itemId === item.id)
      if (exists) {
        // Deselect
        return { ...prev, selectedItems: prev.selectedItems.filter((s) => s.itemId !== item.id) }
      } else {
        // Select with remaining amount as default
        const remaining = Math.max(1, item.targetAmount - item.raisedAmount)
        return { ...prev, selectedItems: [...prev.selectedItems, { itemId: item.id, amount: remaining }] }
      }
    })
  }

  function setItemAmount(itemId: string, value: string) {
    const num = parseFloat(value)
    if (isNaN(num) || num < 1) return
    setState((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.map((s) => s.itemId === itemId ? { ...s, amount: num } : s),
    }))
  }

  function setGeneralAmount(amount: number) {
    setState((prev) => ({ ...prev, amount }))
  }

  function setCustomGeneralAmount(value: string) {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) setState((prev) => ({ ...prev, amount: num }))
  }

  return (
    <div className="space-y-5">
      <h2 className="font-semibold" style={{ color: '#2D2016' }}>{config.copy.donationVerb}</h2>

      {/* Item selector — multi-select */}
      {availableItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: '#7A6652' }}>
            Alege pentru ce donezi (poți selecta mai multe):
          </p>

          {/* General fund option */}
          <label
            className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-colors"
            style={{
              border: `1.5px solid ${isGeneralFund ? '#C4956A' : '#EDE0D0'}`,
              backgroundColor: isGeneralFund ? '#FFF8F0' : '#FDFAF7',
            }}
          >
            <input
              type="checkbox"
              checked={isGeneralFund}
              onChange={() => setState((prev) => ({ ...prev, selectedItems: [] }))}
              className="h-4 w-4 rounded accent-[#C4956A]"
            />
            <span className="text-sm font-medium flex-1" style={{ color: '#2D2016' }}>Fond general</span>
          </label>

          {/* Individual items */}
          {availableItems.map((item) => {
            const selected = state.selectedItems.find((s) => s.itemId === item.id)
            const remaining = Math.max(0, item.targetAmount - item.raisedAmount)
            const pct = Math.round((item.raisedAmount / item.targetAmount) * 100)

            return (
              <div key={item.id}>
                <label
                  className="flex items-start gap-3 rounded-xl px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    border: `1.5px solid ${selected ? '#C4956A' : '#EDE0D0'}`,
                    backgroundColor: selected ? '#FFF8F0' : '#FDFAF7',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => toggleItem(item)}
                    className="h-4 w-4 mt-0.5 rounded accent-[#C4956A]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium" style={{ color: '#2D2016' }}>{item.name}</span>
                      <span className="text-xs shrink-0" style={{ color: '#9A7B60' }}>
                        {remaining} RON rămași
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE0D0' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: '#C4956A' }}
                      />
                    </div>
                  </div>
                </label>

                {/* Amount input shown when item is selected */}
                {selected && (
                  <div className="mx-4 mt-1 mb-2">
                    <div className="flex items-center gap-2">
                      {[25, 50, 100].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setItemAmount(item.id, String(p))}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                          style={
                            selected.amount === p
                              ? { backgroundColor: '#C4956A', color: '#fff' }
                              : { backgroundColor: '#F5EDE3', color: '#7A6652' }
                          }
                        >
                          {p}
                        </button>
                      ))}
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min={1}
                          value={[25, 50, 100].includes(selected.amount) ? '' : selected.amount}
                          onChange={(e) => setItemAmount(item.id, e.target.value)}
                          placeholder="Altă sumă"
                          className="w-full rounded-lg px-3 py-1.5 text-xs outline-none pr-10"
                          style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FDFAF7' }}
                          onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
                          onBlur={(e) => (e.target.style.borderColor = '#E0D0C0')}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#9A7B60' }}>
                          RON
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* General fund amount — shown when no items selected or no items exist */}
      {isGeneralFund && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: '#7A6652' }}>Suma (RON)</p>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setGeneralAmount(preset)}
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
              onChange={(e) => setCustomGeneralAmount(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-12"
              style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FDFAF7' }}
              onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
              onBlur={(e) => (e.target.style.borderColor = '#E0D0C0')}
              aria-label="Suma personalizată în RON"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9A7B60' }}>RON</span>
          </div>
        </div>
      )}

      {/* Total summary when multiple items selected */}
      {state.selectedItems.length > 1 && (
        <div className="rounded-xl p-3 space-y-1.5" style={{ backgroundColor: '#F5EDE3' }}>
          {state.selectedItems.map((s) => {
            const item = items.find((i) => i.id === s.itemId)
            return (
              <div key={s.itemId} className="flex justify-between text-xs" style={{ color: '#7A6652' }}>
                <span className="truncate">{item?.name}</span>
                <span className="font-medium shrink-0 ml-2">{s.amount} RON</span>
              </div>
            )
          })}
          <div
            className="flex justify-between text-sm font-bold pt-1.5"
            style={{ borderTop: '1px solid #EDE0D0', color: '#2D2016' }}
          >
            <span>Total</span>
            <span>{total} RON</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={total < 1}
        className="w-full rounded-xl py-3 text-base font-semibold text-white transition-opacity"
        style={{ backgroundColor: config.palette.primary, opacity: total < 1 ? 0.5 : 1 }}
      >
        Continuă
      </button>
    </div>
  )
}
