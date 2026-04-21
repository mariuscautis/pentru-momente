'use client'

import { Dispatch, SetStateAction, useState, useEffect, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Event, EventTypeConfig } from '@/types'
import { Button } from '@/components/ui/Button'
import { DonationState, totalDonationAmount } from './DonationFlow'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// EU/EEA country codes — must match the set in lib/payments/stripe.ts
const EU_COUNTRIES = new Set([
  'AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI','FR','GR','HR','HU',
  'IE','IT','LT','LU','LV','MT','NL','PL','PT','RO','SE','SI','SK',
  'IS','LI','NO','GB',
])

interface StepPaymentProps {
  state: DonationState
  setState: Dispatch<SetStateAction<DonationState>>
  event: Event
  config: EventTypeConfig
  onBack: () => void
  onSuccess: () => void
}

export function StepPayment({ state, setState, event, config, onBack, onSuccess }: StepPaymentProps) {
  const [loading, setLoading] = useState(!state.clientSecret)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (state.clientSecret) return

    async function fetchIntent() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: event.eventType,
            eventSlug: event.slug,
            selectedItems: state.selectedItems,
            amount: totalDonationAmount(state),
            tipAmount: state.tipAmount,
            displayName: state.displayName || undefined,
            donorEmail: state.donorEmail || undefined,
            message: state.message || undefined,
            isAnonymous: state.isAnonymous,
            showAmount: state.showAmount,
          }),
        })

        let data: { clientSecret?: string; paymentIntentId?: string; error?: string; commissionAmount?: number; tipAmount?: number }
        try {
          data = (await res.json()) as typeof data
        } catch {
          setError(`Eroare server (${res.status}). Încearcă din nou.`)
          return
        }

        if (!res.ok || !data.clientSecret) {
          setError(data.error ?? 'Eroare la inițializarea plății.')
          return
        }

        setState((prev) => ({
          ...prev,
          clientSecret: data.clientSecret,
          paymentIntentId: data.paymentIntentId,
          stripeFee: data.commissionAmount ?? 0,
          tipAmount: data.tipAmount ?? prev.tipAmount,
        }))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare de rețea. Încearcă din nou.')
      } finally {
        setLoading(false)
      }
    }

    fetchIntent()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
        <p className="text-sm text-gray-500">Se pregătește plata...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 py-4">
        <p className="text-sm text-red-600">{error}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack} className="flex-1">Înapoi</Button>
          <Button onClick={() => window.location.reload()} className="flex-1">Încearcă din nou</Button>
        </div>
      </div>
    )
  }

  if (!state.clientSecret) return null

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: state.clientSecret,
        appearance: { theme: 'stripe', variables: { colorPrimary: config.palette.primary } },
      }}
    >
      <CheckoutForm
        config={config}
        state={state}
        setState={setState}
        onBack={onBack}
        onSuccess={onSuccess}
      />
    </Elements>
  )
}

interface CheckoutFormProps {
  config: EventTypeConfig
  state: DonationState
  setState: Dispatch<SetStateAction<DonationState>>
  onBack: () => void
  onSuccess: () => void
}

function getFlagEmoji(countryCode: string): string {
  // Convert ISO country code to flag emoji via regional indicator symbols
  return countryCode
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join('')
}

function CheckoutForm({ config, state, setState, onBack, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardCountry, setCardCountry] = useState<string | null>(null)
  const [commission, setCommission] = useState(state.stripeFee)
  const [updatingFee, setUpdatingFee] = useState(false)
  const lastCountryRef = useRef<string | null>(null)

  const donationAmount = totalDonationAmount(state)
  const isEu = cardCountry ? EU_COUNTRIES.has(cardCountry.toUpperCase()) : true
  const grandTotal = donationAmount + state.tipAmount

  // When Payment Element reports a card country, update the fee server-side
  async function handleCardCountryDetected(country: string) {
    if (country === lastCountryRef.current) return
    lastCountryRef.current = country
    setCardCountry(country)

    if (!state.paymentIntentId) return

    setUpdatingFee(true)
    try {
      const res = await fetch('/api/donations/update-fee', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: state.paymentIntentId,
          cardCountry: country,
          donationAmount,
          tipAmount: state.tipAmount,
        }),
      })
      if (res.ok) {
        const data = (await res.json()) as { commissionAmount?: number }
        if (data.commissionAmount !== undefined) {
          setCommission(data.commissionAmount)
          setState((prev) => ({ ...prev, stripeFee: data.commissionAmount! }))
        }
      }
    } catch {
      // Non-critical — fee stays at default if update fails
    } finally {
      setUpdatingFee(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Plata a eșuat. Încearcă din nou.')
      setSubmitting(false)
      return
    }

    onSuccess()
  }

  const organiserReceives = Math.round((donationAmount - commission) * 100) / 100

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Breakdown */}
      <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
          <span>Donație</span>
          <span className="font-medium">{donationAmount} RON</span>
        </div>
        {state.tipAmount > 0 && (
          <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
            <span>Contribuție platformă</span>
            <span className="font-medium">{state.tipAmount} RON</span>
          </div>
        )}

        {/* Commission row — shows flag once card country is known */}
        <div className="flex justify-between text-sm" style={{ color: '#7A6652' }}>
          <span className="flex items-center gap-1.5">
            {cardCountry && (
              <span title={isEu ? 'Card european' : 'Card non-european'}>
                {getFlagEmoji(cardCountry)}
              </span>
            )}
            <span>
              Comision procesare
              {cardCountry && !isEu && (
                <span className="ml-1 text-xs font-medium" style={{ color: '#B45309' }}>
                  (card non-UE)
                </span>
              )}
            </span>
            {updatingFee && (
              <span className="inline-block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            )}
          </span>
          <span className="font-medium">−{commission.toFixed(2)} RON</span>
        </div>

        <div
          className="flex justify-between text-sm font-bold pt-2"
          style={{ borderTop: '1px solid #EDE0D0', color: '#2D2016' }}
        >
          <span>Total de plătit</span>
          <span>{grandTotal} RON</span>
        </div>

        {/* Organiser receives — shown once country is known */}
        {cardCountry && (
          <div className="flex justify-between text-xs pt-1" style={{ color: '#9A7B60' }}>
            <span>Familia primește</span>
            <span className="font-semibold" style={{ color: '#166534' }}>{organiserReceives.toFixed(2)} RON</span>
          </div>
        )}

        <p className="text-xs pt-1" style={{ color: '#B09070' }}>
          Gestul tău contează mai mult decât orice sumă. Mulțumim că ești alături de ei.
        </p>
      </div>

      <PaymentElement
        onChange={(e) => {
          // @ts-expect-error — Stripe types don't expose value.paymentMethod.card.country yet
          const country = e.value?.paymentMethod?.card?.country as string | undefined
          if (country) handleCardCountryDetected(country)
        }}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onBack} disabled={submitting} className="flex-1">
          Înapoi
        </Button>
        <Button
          type="submit"
          loading={submitting}
          disabled={!stripe || !elements || updatingFee}
          className="flex-grow"
          style={{ backgroundColor: config.palette.primary }}
        >
          Plătește {grandTotal} Lei
        </Button>
      </div>
    </form>
  )
}
