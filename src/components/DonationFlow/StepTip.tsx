'use client'

import { Dispatch, SetStateAction, useEffect } from 'react'
import { EventTypeConfig } from '@/types'
import { DonationState, totalDonationAmount } from './DonationFlow'

interface StepTipProps {
  state: DonationState
  setState: Dispatch<SetStateAction<DonationState>>
  config: EventTypeConfig
  onBack: () => void
  onNext: () => void
}

function calcCommission(donationRon: number): number {
  const raw = donationRon * 0.025 + 1.25
  return Math.round(raw * 100) / 100
}

export function StepTip({ state, setState, config, onBack, onNext }: StepTipProps) {
  const donationTotal = totalDonationAmount(state)
  const commission = calcCommission(donationTotal)
  const grandTotal = donationTotal + commission

  // Keep state in sync so StepPayment has the correct commissionAmount
  useEffect(() => {
    setState((prev) => ({ ...prev, tipAmount: commission }))
  }, [commission]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="font-semibold text-lg" style={{ color: '#2D2016' }}>
          Comision platformă
        </h2>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: '#9A7B60' }}>
          Platforma percepe un comision de <strong style={{ color: '#2D2016' }}>2,5% + 1,25 Lei</strong> per tranzacție. Acesta acoperă costurile de procesare a plății și operarea platformei.
        </p>
      </div>

      {/* Breakdown */}
      <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
          <span>Sumă donată</span>
          <span className="font-medium">{donationTotal} Lei</span>
        </div>
        <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
          <span>Comision (2,5% + 1,25 Lei)</span>
          <span className="font-medium">{commission.toFixed(2)} Lei</span>
        </div>
        <div
          className="flex justify-between text-sm font-bold pt-2"
          style={{ borderTop: '1px solid #EDE0D0', color: '#2D2016' }}
        >
          <span>Total de plătit</span>
          <span>{grandTotal.toFixed(2)} Lei</span>
        </div>
      </div>

      {/* Info note */}
      <p className="text-xs leading-relaxed" style={{ color: '#B09070' }}>
        Destinatarul primește exact <strong style={{ color: '#7A6652' }}>{donationTotal} Lei</strong>. Comisionul nu se deduce din donație.{' '}
        <a href="/tarife" target="_blank" rel="noopener noreferrer" style={{ color: config.palette.primary, textDecoration: 'underline' }}>
          Detalii tarife
        </a>
      </p>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl py-3 text-sm font-semibold"
          style={{ border: '1px solid #EDE0D0', color: '#7A6652', backgroundColor: '#FFFFFF' }}
        >
          Înapoi
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-grow rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: config.palette.primary }}
        >
          Spre plată
        </button>
      </div>
    </div>
  )
}
