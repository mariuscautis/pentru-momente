'use client'

import { useState } from 'react'
import { EventItem, EventTypeConfig } from '@/types'
import { SelectedItem } from '@/components/DonationFlow/DonationFlow'
import { IconDisplay } from '@/components/ui/IconPicker'

interface ItemTrackerProps {
  items: EventItem[]
  config: EventTypeConfig
  cart: SelectedItem[]
  onCartChange: (cart: SelectedItem[]) => void
}

export function ItemTracker({ items, config, cart, onCartChange }: ItemTrackerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: '#9A7B60' }}>
        {config.copy.emptyState}
      </p>
    )
  }

  function getCartItem(itemId: string): SelectedItem | undefined {
    return cart.find((c) => c.itemId === itemId)
  }

  function addToCart(itemId: string, amount: number) {
    const existing = cart.find((c) => c.itemId === itemId)
    if (existing) {
      onCartChange(cart.map((c) => c.itemId === itemId ? { ...c, amount } : c))
    } else {
      onCartChange([...cart, { itemId, amount }])
    }
    setExpandedId(null)
  }

  function removeFromCart(itemId: string) {
    onCartChange(cart.filter((c) => c.itemId !== itemId))
  }

  return (
    <ul className="space-y-3" aria-label="Lista articole">
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          config={config}
          cartItem={getCartItem(item.id)}
          expanded={expandedId === item.id}
          onExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
          onAddToCart={(amount) => addToCart(item.id, amount)}
          onRemoveFromCart={() => removeFromCart(item.id)}
        />
      ))}
    </ul>
  )
}

interface ItemRowProps {
  item: EventItem
  config: EventTypeConfig
  cartItem: SelectedItem | undefined
  expanded: boolean
  onExpand: () => void
  onAddToCart: (amount: number) => void
  onRemoveFromCart: () => void
}

function ItemRow({ item, config, cartItem, expanded, onExpand, onAddToCart, onRemoveFromCart }: ItemRowProps) {
  const hasTarget = item.targetAmount > 0
  const remaining = hasTarget ? Math.max(0, item.targetAmount - item.raisedAmount) : Infinity

  // Default input: for targeted items pre-fill remaining; for free-choice items start blank
  const defaultInput = hasTarget ? String(remaining) : ''
  const [inputAmount, setInputAmount] = useState(defaultInput)
  const inCart = !!cartItem

  // Presets: targeted items use remaining-based presets; free-choice items use sensible defaults
  const presets = item.isCustomAmount || !hasTarget
    ? [50, 100, 200]
    : remaining <= 50
    ? [remaining]
    : remaining <= 200
    ? [Math.round(remaining / 2), remaining]
    : [50, 100, remaining]

  function handlePreset(amount: number) {
    setInputAmount(String(amount))
  }

  function handleConfirm() {
    const num = parseFloat(inputAmount)
    if (!isNaN(num) && num >= 1) {
      // For targeted items, cap at remaining; for free-choice allow any positive
      if (hasTarget && num > remaining) return
      onAddToCart(num)
    }
  }

  const inputNum = parseFloat(inputAmount)
  const isOverTarget = hasTarget && !isNaN(inputNum) && inputNum > remaining
  const isConfirmDisabled = !inputAmount || isNaN(inputNum) || inputNum < 1 || isOverTarget

  return (
    <li
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        border: `1.5px solid ${inCart ? '#C4956A' : '#EDE0D0'}`,
        backgroundColor: inCart ? '#FFFBF5' : '#FFFDFB',
      }}
    >
      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon */}
            {item.emoji && (
              <span
                className="shrink-0 flex items-center justify-center rounded-xl mt-0.5"
                style={{
                  width: 36, height: 36,
                  backgroundColor: '#F5EDE3',
                  color: config.palette.primary,
                }}
              >
                <IconDisplay iconId={item.emoji} size={18} />
              </span>
            )}

            <div className="min-w-0">
              <p className="font-semibold truncate" style={{ color: '#2D2016' }}>{item.name}</p>
              <p className="text-xs mt-0.5" style={{ color: '#9A7B60' }}>
                {item.isFullyFunded
                  ? 'Finanțat integral ✓'
                  : hasTarget
                  ? `${item.raisedAmount} Lei din ${item.targetAmount} Lei`
                  : item.isCustomAmount
                  ? 'Alege suma'
                  : 'Donație liberă'}
              </p>
            </div>
          </div>

          {item.isFullyFunded ? (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: '#F0FFF4', color: '#166534' }}
            >
              Complet
            </span>
          ) : inCart ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-semibold" style={{ color: '#C4956A' }}>
                {cartItem!.amount} Lei ✓
              </span>
              <button
                onClick={onRemoveFromCart}
                className="text-xs px-2 py-1 rounded-lg transition-colors"
                style={{ color: '#9A7B60', border: '1px solid #EDE0D0' }}
              >
                Elimină
              </button>
            </div>
          ) : (
            <button
              onClick={onExpand}
              className="shrink-0 rounded-xl px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: config.palette.primary }}
            >
              {expanded ? 'Închide' : config.copy.donationVerb}
            </button>
          )}
        </div>

      </div>

      {/* Expanded amount picker */}
      {expanded && !item.isFullyFunded && (
        <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: '1px solid #F0E8DC' }}>
          <p className="text-xs font-medium" style={{ color: '#7A6652' }}>
            Cât vrei să contribui?
          </p>

          {/* Preset buttons */}
          <div className="flex gap-2 flex-wrap">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePreset(p)}
                className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                style={
                  inputAmount === String(p)
                    ? { backgroundColor: '#C4956A', color: '#fff' }
                    : { backgroundColor: '#F5EDE3', color: '#7A6652' }
                }
              >
                {hasTarget && p === remaining ? `${p} Lei (tot)` : `${p} Lei`}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="relative">
            <input
              type="number"
              min={1}
              max={hasTarget ? remaining : undefined}
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
              placeholder="Altă sumă"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-14"
              style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FDFAF7' }}
              onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
              onBlur={(e) => (e.target.style.borderColor = '#E0D0C0')}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9A7B60' }}>
              Lei
            </span>
          </div>

          {isOverTarget && (
            <p className="text-xs" style={{ color: '#B91C1C' }}>
              Suma maximă este {remaining} Lei.
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity"
              style={{ backgroundColor: '#C4956A', opacity: isConfirmDisabled ? 0.5 : 1 }}
            >
              Adaugă în coș
            </button>
            <button
              type="button"
              onClick={onExpand}
              className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ border: '1px solid #EDE0D0', color: '#7A6652' }}
            >
              Anulează
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
