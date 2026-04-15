'use client'

import { useState } from 'react'
import { Event, EventItem, EventTypeConfig } from '@/types'
import { StepChooseAmount } from './StepChooseAmount'
import { StepDonorDetails } from './StepDonorDetails'
import { StepTip } from './StepTip'
import { StepPayment } from './StepPayment'
import { StepSuccess } from './StepSuccess'

export type DonationStep = 'amount' | 'details' | 'tip' | 'payment' | 'success'

// Each selected item has its own amount
export interface SelectedItem {
  itemId: string
  amount: number
}

export interface DonationState {
  // Multi-item selection — empty means general fund
  selectedItems: SelectedItem[]
  // General fund amount when no items selected
  amount: number
  tipAmount: number
  stripeFee: number      // Stripe processing fee passed through to donor
  displayName: string
  message: string
  isAnonymous: boolean
  showAmount: boolean
  clientSecret?: string
}

export function totalDonationAmount(state: DonationState): number {
  if (state.selectedItems.length > 0) {
    return state.selectedItems.reduce((sum, i) => sum + i.amount, 0)
  }
  return state.amount
}

interface DonationFlowProps {
  event: Event
  items: EventItem[]
  config: EventTypeConfig
  initialCart?: SelectedItem[]
  onClose?: () => void
}

export function DonationFlow({ event, items, config, initialCart, onClose }: DonationFlowProps) {
  const hasCart = initialCart && initialCart.length > 0
  const [step, setStep] = useState<DonationStep>(hasCart ? 'details' : 'amount')
  const [state, setState] = useState<DonationState>({
    selectedItems: initialCart ?? [],
    amount: 100,
    tipAmount: 20,
    stripeFee: 0,
    displayName: '',
    message: '',
    isAnonymous: config.donationVisibilityDefault === 'hidden',
    showAmount: config.donationVisibilityDefault === 'visible',
  })

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #EDE0D0', backgroundColor: '#FFFFFF' }}>
      <div className="flex items-center justify-between" style={{ borderBottom: '1px solid #F0E8DC' }}>
        <div className="flex-1">
          <StepIndicator current={step} />
        </div>
        {onClose && step !== 'success' && (
          <button
            onClick={onClose}
            className="px-4 py-3 text-sm transition-opacity hover:opacity-70"
            style={{ color: '#9A7B60' }}
            aria-label="Închide"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-5">
        {step === 'amount' && (
          <StepChooseAmount
            state={state}
            setState={setState}
            items={items}
            config={config}
            onBack={onClose}
            onNext={() => setStep('details')}
          />
        )}
        {step === 'details' && (
          <StepDonorDetails
            state={state}
            setState={setState}
            config={config}
            onBack={() => setStep('amount')}
            onNext={() => setStep('tip')}
          />
        )}
        {step === 'tip' && (
          <StepTip
            state={state}
            setState={setState}
            config={config}
            onBack={() => setStep('details')}
            onNext={() => setStep('payment')}
          />
        )}
        {step === 'payment' && (
          <StepPayment
            state={state}
            setState={setState}
            event={event}
            config={config}
            onBack={() => setStep('tip')}
            onSuccess={() => setStep('success')}
          />
        )}
        {step === 'success' && (
          <StepSuccess config={config} event={event} amount={totalDonationAmount(state)} />
        )}
      </div>
    </div>
  )
}

const STEPS: { key: DonationStep; label: string }[] = [
  { key: 'amount', label: 'Sumă' },
  { key: 'details', label: 'Detalii' },
  { key: 'tip', label: 'Contribuție' },
  { key: 'payment', label: 'Plată' },
]

function StepIndicator({ current }: { current: DonationStep }) {
  if (current === 'success') return null
  const currentIndex = STEPS.findIndex((s) => s.key === current)
  return (
    <div className="flex" role="list" aria-label="Pași">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex
        const isActive = i === currentIndex
        return (
          <div
            key={step.key}
            role="listitem"
            aria-current={isActive ? 'step' : undefined}
            className="flex-1 py-3 text-center text-xs font-medium transition-colors"
            style={{
              color: isActive ? '#2D2016' : isDone ? '#C4956A' : '#C8B8A8',
              borderBottom: isActive ? '2px solid #C4956A' : '2px solid transparent',
            }}
          >
            {isDone ? '✓' : i + 1}. {step.label}
          </div>
        )
      })}
    </div>
  )
}
