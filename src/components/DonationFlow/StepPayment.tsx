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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
            message: state.message || undefined,
            isAnonymous: state.isAnonymous,
            showAmount: state.showAmount,
          }),
        })

        const data = (await res.json()) as { clientSecret?: string; error?: string }
        if (!res.ok || !data.clientSecret) {
          setError(data.error ?? 'Eroare la inițializarea plății.')
          return
        }

        setState((prev) => ({ ...prev, clientSecret: data.clientSecret }))
      } catch {
        setError('Eroare de rețea. Încearcă din nou.')
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
          <Button variant="secondary" onClick={onBack} className="flex-1">
            Înapoi
          </Button>
          <Button onClick={() => window.location.reload()} className="flex-1">
            Încearcă din nou
          </Button>
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
        amount={totalDonationAmount(state)}
        tipAmount={state.tipAmount}
        onBack={onBack}
        onSuccess={onSuccess}
      />
    </Elements>
  )
}

interface CheckoutFormProps {
  config: EventTypeConfig
  amount: number
  tipAmount: number
  onBack: () => void
  onSuccess: () => void
}

function CheckoutForm({ config, amount, tipAmount, onBack, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Donație</span>
          <span className="font-medium">{amount} RON</span>
        </div>
        {tipAmount > 0 && (
          <div className="flex justify-between mt-1">
            <span className="text-gray-600">Platformă</span>
            <span className="font-medium">{tipAmount} RON</span>
          </div>
        )}
        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 font-semibold">
          <span>Total</span>
          <span>{amount + tipAmount} RON</span>
        </div>
      </div>

      <PaymentElement />

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
          Plătește {amount + tipAmount} RON
        </Button>
      </div>
    </form>
  )
}
