'use client'

import { Dispatch, SetStateAction, useState, useEffect } from 'react'
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
            cardRegion: state.cardRegion,
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
        onBack={onBack}
        onSuccess={onSuccess}
      />
    </Elements>
  )
}

interface CheckoutFormProps {
  config: EventTypeConfig
  state: DonationState
  onBack: () => void
  onSuccess: () => void
}

function CheckoutForm({ config, state, onBack, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const donationAmount = totalDonationAmount(state)
  const grandTotal = donationAmount + state.tipAmount

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError(null)

    // Pass the country the donor declared in the card region step so Stripe
    // accepts the suppressed billing_details.address.country field.
    const country = state.cardCountry === 'OTHER' ? 'US' : (state.cardCountry ?? 'RO')

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        payment_method_data: {
          billing_details: {
            address: { country },
          },
        },
      },
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Plata a eșuat. Încearcă din nou.')
      setSubmitting(false)
      return
    }

    onSuccess()
  }

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
        <div
          className="flex justify-between text-sm font-bold pt-2"
          style={{ borderTop: '1px solid #EDE0D0', color: '#2D2016' }}
        >
          <span>Total de plătit</span>
          <span>{grandTotal} RON</span>
        </div>
        <p className="text-xs pt-1" style={{ color: '#B09070' }}>
          Gestul tău contează mai mult decât orice sumă. Mulțumim că ești alături de ei.
        </p>
      </div>

      <PaymentElement options={{ fields: { billingDetails: { address: { country: 'never' } } } }} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onBack} disabled={submitting} className="flex-1">
          Înapoi
        </Button>
        <Button
          type="submit"
          loading={submitting}
          disabled={!stripe || !elements}
          className="flex-grow"
          style={{ backgroundColor: config.palette.primary }}
        >
          Plătește {grandTotal} Lei
        </Button>
      </div>
    </form>
  )
}
