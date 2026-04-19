'use client'

import { Dispatch, SetStateAction } from 'react'
import { EventTypeConfig } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { DonationState } from './DonationFlow'

interface StepDonorDetailsProps {
  state: DonationState
  setState: Dispatch<SetStateAction<DonationState>>
  config: EventTypeConfig
  onBack: () => void
  onNext: () => void
}

export function StepDonorDetails({
  state,
  setState,
  config,
  onBack,
  onNext,
}: StepDonorDetailsProps) {
  function toggle(field: 'isAnonymous' | 'showAmount') {
    setState((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-900">Spune-ne cine ești</h2>

      {!state.isAnonymous && (
        <Input
          label="Nume"
          placeholder="Prenume Nume"
          value={state.displayName}
          onChange={(e) => setState((prev) => ({ ...prev, displayName: e.target.value }))}
          autoComplete="name"
        />
      )}

      {/* Email field — always shown */}
      <div>
        <Input
          label="Email"
          type="email"
          placeholder="adresa@email.ro"
          value={state.donorEmail}
          onChange={(e) => setState((prev) => ({ ...prev, donorEmail: e.target.value }))}
          autoComplete="email"
        />
        <p className="mt-1.5 text-xs" style={{ color: '#9A7B60' }}>
          {state.isAnonymous
            ? 'Confirmarea donației va fi trimisă pe email. Donația va rămâne anonimă față de cel care a creat pagina.'
            : 'Confirmarea donației tale va fi trimisă pe adresa de email.'}
        </p>
      </div>

      <Textarea
        label="Mesaj (opțional)"
        placeholder="Lasă un gând, o amintire sau o urare..."
        value={state.message}
        onChange={(e) => setState((prev) => ({ ...prev, message: e.target.value }))}
        maxLength={500}
      />

      {/* Visibility toggles */}
      <fieldset className="space-y-2.5">
        <legend className="text-sm font-medium text-gray-700">Vizibilitate</legend>

        {config.allowAnonymous && (
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state.isAnonymous}
              onChange={() => toggle('isAnonymous')}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
            />
            <span className="text-sm text-gray-700">
              <span className="font-medium">Donație anonimă</span>
              <span className="block text-xs text-gray-500">
                Numele tău nu va fi afișat pe pagină
              </span>
            </span>
          </label>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.showAmount}
            onChange={() => toggle('showAmount')}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">Afișează suma</span>
            <span className="block text-xs text-gray-500">
              Ceilalți vizitatori vor putea vedea cât ai donat
            </span>
          </span>
        </label>
      </fieldset>

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Înapoi
        </Button>
        <Button
          onClick={onNext}
          className="flex-2 flex-grow"
          style={{ backgroundColor: config.palette.primary }}
        >
          Spre plată
        </Button>
      </div>
    </div>
  )
}
