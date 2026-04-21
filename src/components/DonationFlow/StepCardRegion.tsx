'use client'

import { Dispatch, SetStateAction } from 'react'
import { DonationState, totalDonationAmount } from './DonationFlow'
import { calculateCommission } from '@/lib/payments/stripe'

interface StepCardRegionProps {
  state: DonationState
  setState: Dispatch<SetStateAction<DonationState>>
  onBack: () => void
  onNext: () => void
}

export function StepCardRegion({ state, setState, onBack, onNext }: StepCardRegionProps) {
  const donationAmount = totalDonationAmount(state)
  const commissionEu = calculateCommission(donationAmount, 'RO')
  const commissionNonEu = calculateCommission(donationAmount, 'US')

  function select(region: 'eu' | 'non-eu') {
    setState((prev) => ({ ...prev, cardRegion: region }))
  }

  function handleNext() {
    if (!state.cardRegion) return
    onNext()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-semibold text-base" style={{ color: '#2D2016' }}>
          De unde este cardul tău?
        </h2>
        <p className="text-sm mt-0.5" style={{ color: '#9A7B60' }}>
          Comisionul de procesare variază în funcție de țara emitentă a cardului.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* EU option */}
        <button
          type="button"
          onClick={() => select('eu')}
          className="w-full rounded-2xl p-5 text-left transition-all"
          style={
            state.cardRegion === 'eu'
              ? { border: '2px solid #C4956A', backgroundColor: '#FFF8F2' }
              : { border: '2px solid #EDE0D0', backgroundColor: '#FFFDFB' }
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🇪🇺</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#2D2016' }}>
                  Europa
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#9A7B60' }}>
                  UE, SEE, Marea Britanie
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold tabular-nums" style={{ color: '#2D2016' }}>
                −{commissionEu.toFixed(2)} Lei
              </p>
              <p className="text-xs" style={{ color: '#9A7B60' }}>comision</p>
            </div>
          </div>
          {state.cardRegion === 'eu' && (
            <div className="mt-3 pt-3 flex justify-between text-xs" style={{ borderTop: '1px solid #EDE0D0', color: '#6B7280' }}>
              <span>Familia primește</span>
              <span className="font-semibold" style={{ color: '#166534' }}>
                {(donationAmount - commissionEu).toFixed(2)} Lei
              </span>
            </div>
          )}
        </button>

        {/* Non-EU option */}
        <button
          type="button"
          onClick={() => select('non-eu')}
          className="w-full rounded-2xl p-5 text-left transition-all"
          style={
            state.cardRegion === 'non-eu'
              ? { border: '2px solid #C4956A', backgroundColor: '#FFF8F2' }
              : { border: '2px solid #EDE0D0', backgroundColor: '#FFFDFB' }
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#2D2016' }}>
                  În afara Europei
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#9A7B60' }}>
                  SUA, Canada, Asia, și altele
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold tabular-nums" style={{ color: '#2D2016' }}>
                −{commissionNonEu.toFixed(2)} Lei
              </p>
              <p className="text-xs" style={{ color: '#9A7B60' }}>comision</p>
            </div>
          </div>
          {state.cardRegion === 'non-eu' && (
            <div className="mt-3 pt-3 flex justify-between text-xs" style={{ borderTop: '1px solid #EDE0D0', color: '#6B7280' }}>
              <span>Familia primește</span>
              <span className="font-semibold" style={{ color: '#166534' }}>
                {(donationAmount - commissionNonEu).toFixed(2)} Lei
              </span>
            </div>
          )}
        </button>
      </div>

      <p className="text-xs" style={{ color: '#B09070' }}>
        Suma pe care o plătești nu se modifică. Comisionul mai mare pentru carduri non-europene
        acoperă costul suplimentar de procesare Stripe.{' '}
        <a href="/tarife" target="_blank" style={{ color: '#C4956A', textDecoration: 'underline' }}>
          Detalii tarife →
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
          onClick={handleNext}
          disabled={!state.cardRegion}
          className="flex-grow rounded-xl py-3 text-sm font-semibold text-white transition-opacity"
          style={{
            backgroundColor: '#C4956A',
            opacity: state.cardRegion ? 1 : 0.4,
            cursor: state.cardRegion ? 'pointer' : 'not-allowed',
          }}
        >
          Spre plată
        </button>
      </div>
    </div>
  )
}
