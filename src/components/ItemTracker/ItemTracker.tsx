'use client'

import { useState } from 'react'
import { Check, Minus, Plus, X } from 'lucide-react'
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
      <div
        className="rounded-2xl px-6 py-10 text-center"
        style={{ backgroundColor: '#FFFDFB', border: '1px dashed #DDD0C0' }}
      >
        <p className="text-sm" style={{ color: '#9A7B60' }}>{config.copy.emptyState}</p>
      </div>
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
    <ul className="space-y-2.5" aria-label="Lista articole">
      {items.map((item) => (
        <ItemCard
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

interface ItemCardProps {
  item: EventItem
  config: EventTypeConfig
  cartItem: SelectedItem | undefined
  expanded: boolean
  onExpand: () => void
  onAddToCart: (amount: number) => void
  onRemoveFromCart: () => void
}

function ItemCard({ item, config, cartItem, expanded, onExpand, onAddToCart, onRemoveFromCart }: ItemCardProps) {
  const hasTarget = item.targetAmount > 0
  const remaining = hasTarget ? Math.max(0, item.targetAmount - item.raisedAmount) : Infinity
  const fillPercent = hasTarget ? Math.min(100, Math.round((item.raisedAmount / item.targetAmount) * 100)) : 0

  const defaultInput = hasTarget ? String(remaining) : ''
  const [inputAmount, setInputAmount] = useState(defaultInput)
  const inCart = !!cartItem

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
      if (hasTarget && num > remaining) return
      onAddToCart(num)
    }
  }

  const inputNum = parseFloat(inputAmount)
  const isOverTarget = hasTarget && !isNaN(inputNum) && inputNum > remaining
  const isConfirmDisabled = !inputAmount || isNaN(inputNum) || inputNum < 1 || isOverTarget

  const isFullyFunded = item.isFullyFunded && !item.isCustomAmount

  return (
    <li
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        border: `1.5px solid ${inCart ? config.palette.primary : isFullyFunded ? '#C8E6C8' : '#EDE0D0'}`,
        backgroundColor: inCart ? '#FFFBF5' : isFullyFunded ? '#F6FBF6' : '#FFFDFB',
      }}
    >
      {/* ── Main row ── */}
      <div className="flex items-center gap-3 px-4 py-3.5">

        {/* Icon bubble */}
        {item.emoji ? (
          <span
            className="shrink-0 flex items-center justify-center rounded-xl"
            style={{
              width: 40,
              height: 40,
              backgroundColor: isFullyFunded ? '#D4EDDA' : '#F5EDE3',
              color: isFullyFunded ? '#2D7A3A' : config.palette.primary,
            }}
          >
            <IconDisplay iconId={item.emoji} size={20} />
          </span>
        ) : (
          <span
            className="shrink-0 flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, backgroundColor: '#F5EDE3' }}
          >
            <span className="text-sm font-bold" style={{ color: config.palette.primary }}>
              {item.name.charAt(0)}
            </span>
          </span>
        )}

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: '#1C1209' }}>{item.name}</p>

          {hasTarget && !item.isCustomAmount ? (
            <div className="mt-1.5 space-y-1">
              {/* Progress bar */}
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: '#F0E8DC' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${fillPercent}%`,
                    backgroundColor: isFullyFunded ? '#3DAB50' : config.palette.primary,
                  }}
                />
              </div>
              <p className="text-xs tabular-nums" style={{ color: '#9A7B60' }}>
                {isFullyFunded
                  ? 'Finanțat integral'
                  : `${item.raisedAmount.toLocaleString('ro-RO')} din ${item.targetAmount.toLocaleString('ro-RO')} Lei`}
              </p>
            </div>
          ) : (
            <p className="text-xs mt-0.5" style={{ color: '#9A7B60' }}>
              {item.isCustomAmount ? 'Alege suma' : 'Donație liberă'}
            </p>
          )}
        </div>

        {/* Right action */}
        {isFullyFunded ? (
          <span
            className="shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: '#D4EDDA', color: '#1E6B2B' }}
          >
            <Check size={11} strokeWidth={2.5} />
            Complet
          </span>
        ) : inCart ? (
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-sm font-bold tabular-nums rounded-full px-3 py-1"
              style={{ backgroundColor: hexToRgba(config.palette.primary, 0.12), color: config.palette.primary }}
            >
              {cartItem!.amount.toLocaleString('ro-RO')} Lei
            </span>
            <button
              onClick={onRemoveFromCart}
              className="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-150 hover:bg-red-50 hover:scale-110 active:scale-95"
              style={{ border: '1.5px solid #EDE0D0', color: '#9A7B60' }}
              aria-label="Elimină din coș"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={onExpand}
            className="btn-fill shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-all duration-150 active:scale-[0.97]"
            style={{
              backgroundColor: config.palette.primary,
              boxShadow: `0 2px 12px ${hexToRgba(config.palette.primary, 0.25)}`,
            }}
          >
            {expanded ? (
              <>
                <Minus size={12} strokeWidth={2.5} />
                Închide
              </>
            ) : (
              <>
                <Plus size={12} strokeWidth={2.5} />
                {config.copy.donationVerb}
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Expanded amount picker ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: expanded && !isFullyFunded ? '1fr' : '0fr',
          transition: 'grid-template-rows 260ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div
            className="px-4 pb-4 pt-3 space-y-3"
            style={{ borderTop: '1px solid #F0E8DC' }}
          >
            {/* Context line */}
            <p className="text-xs" style={{ color: '#7A6652' }}>
              {hasTarget && !item.isCustomAmount
                ? <>Mai sunt necesari <strong className="font-semibold">{remaining.toLocaleString('ro-RO')} Lei</strong> — poți contribui orice sumă.</>
                : 'Cât vrei să contribui?'}
            </p>

            {/* Preset chips */}
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => {
                const active = inputAmount === String(p)
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePreset(p)}
                    className="rounded-xl px-4 py-1.5 text-sm font-semibold transition-all duration-150 hover:brightness-95 active:scale-[0.97]"
                    style={
                      active
                        ? { backgroundColor: config.palette.primary, color: '#fff' }
                        : { backgroundColor: '#F5EDE3', color: '#7A6652' }
                    }
                  >
                    {p.toLocaleString('ro-RO')} Lei
                  </button>
                )
              })}
            </div>

            {/* Custom amount input */}
            <div className="relative">
              <input
                type="number"
                min={1}
                max={hasTarget && !item.isCustomAmount ? remaining : undefined}
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
                placeholder="Altă sumă"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none pr-14 transition-colors"
                style={{
                  border: `1.5px solid ${isOverTarget ? '#DC2626' : '#E0D0C0'}`,
                  color: '#2D2016',
                  backgroundColor: '#FDFAF7',
                }}
                onFocus={(e) => (e.target.style.borderColor = isOverTarget ? '#DC2626' : config.palette.primary)}
                onBlur={(e) => (e.target.style.borderColor = isOverTarget ? '#DC2626' : '#E0D0C0')}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: '#9A7B60' }}>
                Lei
              </span>
            </div>
            {isOverTarget && (
              <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
                Suma maximă disponibilă este {remaining.toLocaleString('ro-RO')} Lei.
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirmDisabled}
                className="btn-fill flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
                style={{
                  backgroundColor: config.palette.primary,
                  opacity: isConfirmDisabled ? 0.45 : 1,
                  boxShadow: isConfirmDisabled ? 'none' : `0 3px 14px ${hexToRgba(config.palette.primary, 0.3)}`,
                }}
              >
                Adaugă în coș
              </button>
              <button
                type="button"
                onClick={onExpand}
                className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 hover:brightness-95 active:scale-[0.97]"
                style={{ border: '1.5px solid #EDE0D0', color: '#7A6652' }}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
