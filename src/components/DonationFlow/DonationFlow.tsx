'use client'

import { useState } from 'react'
import { Event, EventItem, EventTypeConfig } from '@/types'
import { StepChooseAmount } from './StepChooseAmount'
import { StepDonorDetails } from './StepDonorDetails'
import { StepPayment } from './StepPayment'
import { StepSuccess } from './StepSuccess'

export type DonationStep = 'amount' | 'details' | 'payment' | 'success'

export interface DonationState {
  selectedItemId?: string
  amount: number
  tipAmount: number
  displayName: string
  message: string
  isAnonymous: boolean
  showAmount: boolean
  clientSecret?: string
}

interface DonationFlowProps {
  event: Event
  items: EventItem[]
  config: EventTypeConfig
  preselectedItemId?: string
}

export function DonationFlow({ event, items, config, preselectedItemId }: DonationFlowProps) {
  const [step, setStep] = useState<DonationStep>('amount')
  const [state, setState] = useState<DonationState>({
    selectedItemId: preselectedItemId,
    amount: config.tipDefault * 10,
    tipAmount: config.tipDefault,
    displayName: '',
    message: '',
    isAnonymous: config.donationVisibilityDefault === 'hidden',
    showAmount: config.donationVisibilityDefault === 'visible',
  })

  const selectedItem = state.selectedItemId
    ? items.find((i) => i.id === state.selectedItemId)
    : undefined

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Step indicator */}
      <StepIndicator current={step} />

      <div className="p-5">
        {step === 'amount' && (
          <StepChooseAmount
            state={state}
            setState={setState}
            items={items}
            config={config}
            selectedItem={selectedItem}
            onNext={() => setStep('details')}
          />
        )}
        {step === 'details' && (
          <StepDonorDetails
            state={state}
            setState={setState}
            config={config}
            onBack={() => setStep('amount')}
            onNext={() => setStep('payment')}
          />
        )}
        {step === 'payment' && (
          <StepPayment
            state={state}
            setState={setState}
            event={event}
            config={config}
            onBack={() => setStep('details')}
            onSuccess={() => setStep('success')}
          />
        )}
        {step === 'success' && (
          <StepSuccess config={config} event={event} amount={state.amount} />
        )}
      </div>
    </div>
  )
}

const STEPS: { key: DonationStep; label: string }[] = [
  { key: 'amount', label: 'Sumă' },
  { key: 'details', label: 'Detalii' },
  { key: 'payment', label: 'Plată' },
]

function StepIndicator({ current }: { current: DonationStep }) {
  if (current === 'success') return null

  const currentIndex = STEPS.findIndex((s) => s.key === current)

  return (
    <div className="flex border-b border-gray-100" role="list" aria-label="Pași">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex
        const isActive = i === currentIndex

        return (
          <div
            key={step.key}
            role="listitem"
            aria-current={isActive ? 'step' : undefined}
            className={[
              'flex-1 py-3 text-center text-xs font-medium transition-colors',
              isActive ? 'text-gray-900 border-b-2 border-gray-900' : '',
              isDone ? 'text-gray-400' : '',
              !isActive && !isDone ? 'text-gray-300' : '',
            ].join(' ')}
          >
            {i + 1}. {step.label}
          </div>
        )
      })}
    </div>
  )
}
