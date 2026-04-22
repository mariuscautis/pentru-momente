'use client'

import { Dispatch, SetStateAction, useState, useRef, useEffect } from 'react'
import { DonationState } from './DonationFlow'

interface StepCardRegionProps {
  state: DonationState
  setState: Dispatch<SetStateAction<DonationState>>
  onBack: () => void
  onNext: () => void
}

// ── Country data ────────────────────────────────────────────────────────────────

const EU_COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgia', flag: '🇧🇪' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'CY', name: 'Cipru', flag: '🇨🇾' },
  { code: 'CZ', name: 'Cehia', flag: '🇨🇿' },
  { code: 'DE', name: 'Germania', flag: '🇩🇪' },
  { code: 'DK', name: 'Danemarca', flag: '🇩🇰' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'ES', name: 'Spania', flag: '🇪🇸' },
  { code: 'FI', name: 'Finlanda', flag: '🇫🇮' },
  { code: 'FR', name: 'Franța', flag: '🇫🇷' },
  { code: 'GR', name: 'Grecia', flag: '🇬🇷' },
  { code: 'HR', name: 'Croația', flag: '🇭🇷' },
  { code: 'HU', name: 'Ungaria', flag: '🇭🇺' },
  { code: 'IE', name: 'Irlanda', flag: '🇮🇪' },
  { code: 'IS', name: 'Islanda', flag: '🇮🇸' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'LT', name: 'Lituania', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxemburg', flag: '🇱🇺' },
  { code: 'LV', name: 'Letonia', flag: '🇱🇻' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'NL', name: 'Olanda', flag: '🇳🇱' },
  { code: 'NO', name: 'Norvegia', flag: '🇳🇴' },
  { code: 'PL', name: 'Polonia', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugalia', flag: '🇵🇹' },
  { code: 'RO', name: 'România', flag: '🇷🇴' },
  { code: 'SE', name: 'Suedia', flag: '🇸🇪' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'SK', name: 'Slovacia', flag: '🇸🇰' },
]

const NON_EU_COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: 'GB', name: 'Marea Britanie', flag: '🇬🇧' },
  { code: 'US', name: 'SUA', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'Noua Zeelandă', flag: '🇳🇿' },
  { code: 'CH', name: 'Elveția', flag: '🇨🇭' },
  { code: 'JP', name: 'Japonia', flag: '🇯🇵' },
  { code: 'KR', name: 'Coreea de Sud', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AE', name: 'Emiratele Arabe Unite', flag: '🇦🇪' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'SA', name: 'Arabia Saudită', flag: '🇸🇦' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'MX', name: 'Mexic', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazilia', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'ZA', name: 'Africa de Sud', flag: '🇿🇦' },
  { code: 'TR', name: 'Turcia', flag: '🇹🇷' },
  { code: 'UA', name: 'Ucraina', flag: '🇺🇦' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'OTHER', name: 'Altă țară', flag: '🌍' },
]

// ── Country search dropdown ─────────────────────────────────────────────────────

function CountryDropdown({
  countries,
  selected,
  placeholder,
  onSelect,
}: {
  countries: { code: string; name: string; flag: string }[]
  selected: string | null
  placeholder: string
  onSelect: (code: string) => void
}) {
  const [query, setQuery] = useState('')
  const selectedCountry = countries.find((c) => c.code === selected)
  const filtered = query.trim()
    ? countries.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : countries

  return (
    <div className="space-y-2">
      {/* Search input — always visible once panel is open */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : placeholder}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{
            border: '1px solid #E0D0C0',
            backgroundColor: '#FDFAF7',
            color: '#2D2016',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
          onBlur={(e) => (e.target.style.borderColor = '#E0D0C0')}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: '#9A7B60' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Inline scrollable list */}
      <div
        className="rounded-xl overflow-y-auto"
        style={{ maxHeight: 200, border: '1px solid #EDE0D0', backgroundColor: '#FFFDFB' }}
      >
        {filtered.length === 0 ? (
          <p className="px-3 py-3 text-xs text-center" style={{ color: '#9A7B60' }}>Nicio țară găsită.</p>
        ) : (
          filtered.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onSelect(c.code); setQuery('') }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left"
              style={{
                backgroundColor: selected === c.code ? '#FFF8F2' : 'transparent',
                color: '#2D2016',
                borderBottom: '1px solid #F5EDE3',
              }}
            >
              <span>{c.flag}</span>
              <span className="flex-1">{c.name}</span>
              {selected === c.code && (
                <span className="text-xs font-semibold" style={{ color: '#C4956A' }}>✓</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// ── Main step ───────────────────────────────────────────────────────────────────

export function StepCardRegion({ state, setState, onBack, onNext }: StepCardRegionProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  function selectRegion(region: 'eu' | 'non-eu', countryCode: string) {
    setSelectedCountry(countryCode)
    setState((prev) => ({ ...prev, cardRegion: region }))
  }

  function handleNext() {
    if (!state.cardRegion || !selectedCountry) return
    onNext()
  }

  const canProceed = !!state.cardRegion && !!selectedCountry

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-semibold text-base" style={{ color: '#2D2016' }}>
          Din ce țară este cardul tău?
        </h2>
        <p className="text-sm mt-0.5" style={{ color: '#9A7B60' }}>
          Selectează țara pentru a continua spre plată.
        </p>
      </div>

      {/* EU tab */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: `2px solid ${state.cardRegion === 'eu' ? '#C4956A' : '#EDE0D0'}` }}
      >
        <button
          type="button"
          onClick={() => {
            setState((prev) => ({ ...prev, cardRegion: 'eu' }))
            setSelectedCountry(null)
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
          style={{ backgroundColor: state.cardRegion === 'eu' ? '#FFF8F2' : '#FFFDFB' }}
        >
          <span className="text-2xl">🇪🇺</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#2D2016' }}>Uniunea Europeană / SEE</p>
            <p className="text-xs mt-0.5" style={{ color: '#9A7B60' }}>Austria, Franța, Germania, România și altele</p>
          </div>
          <div
            className="ml-auto shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: state.cardRegion === 'eu' ? '#C4956A' : '#D0C0B0',
              backgroundColor: state.cardRegion === 'eu' ? '#C4956A' : 'transparent',
            }}
          >
            {state.cardRegion === 'eu' && <span className="block h-1.5 w-1.5 rounded-full bg-white" />}
          </div>
        </button>

        {state.cardRegion === 'eu' && (
          <div className="px-4 pb-4" style={{ borderTop: '1px solid #F0E8DC' }}>
            <div className="pt-3">
              <CountryDropdown
                countries={EU_COUNTRIES}
                selected={selectedCountry}
                placeholder="Selectează țara..."
                onSelect={(code) => selectRegion('eu', code)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Non-EU tab */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: `2px solid ${state.cardRegion === 'non-eu' ? '#C4956A' : '#EDE0D0'}` }}
      >
        <button
          type="button"
          onClick={() => {
            setState((prev) => ({ ...prev, cardRegion: 'non-eu' }))
            setSelectedCountry(null)
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
          style={{ backgroundColor: state.cardRegion === 'non-eu' ? '#FFF8F2' : '#FFFDFB' }}
        >
          <span className="text-2xl">🌍</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#2D2016' }}>Altă țară</p>
            <p className="text-xs mt-0.5" style={{ color: '#9A7B60' }}>Marea Britanie, SUA, Canada și altele</p>
          </div>
          <div
            className="ml-auto shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: state.cardRegion === 'non-eu' ? '#C4956A' : '#D0C0B0',
              backgroundColor: state.cardRegion === 'non-eu' ? '#C4956A' : 'transparent',
            }}
          >
            {state.cardRegion === 'non-eu' && <span className="block h-1.5 w-1.5 rounded-full bg-white" />}
          </div>
        </button>

        {state.cardRegion === 'non-eu' && (
          <div className="px-4 pb-4" style={{ borderTop: '1px solid #F0E8DC' }}>
            <div className="pt-3">
              <CountryDropdown
                countries={NON_EU_COUNTRIES}
                selected={selectedCountry}
                placeholder="Selectează țara..."
                onSelect={(code) => selectRegion('non-eu', code)}
              />
            </div>
          </div>
        )}
      </div>

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
          disabled={!canProceed}
          className="flex-grow rounded-xl py-3 text-sm font-semibold text-white transition-opacity"
          style={{
            backgroundColor: '#C4956A',
            opacity: canProceed ? 1 : 0.4,
            cursor: canProceed ? 'pointer' : 'not-allowed',
          }}
        >
          Spre plată
        </button>
      </div>
    </div>
  )
}
