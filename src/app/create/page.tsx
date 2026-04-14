'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllEventTypes } from '@/config/event-types'
import { EventTypeConfig } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { supabase } from '@/lib/db/supabase'

type CreateStep = 'type' | 'details' | 'items' | 'payout'

interface ItemInput {
  name: string
  targetAmount: string
  emoji: string
}

const STEP_ORDER: CreateStep[] = ['type', 'details', 'items', 'payout']
const STEP_LABELS: Record<CreateStep, string> = {
  type: 'Tip',
  details: 'Detalii',
  items: 'Articole',
  payout: 'Plată',
}

const EVENT_TYPE_META: Record<string, { emoji: string; description: string; namePlaceholder: string }> = {
  inmormantare: {
    emoji: '🕯️',
    description: 'Coroane, lumânări și contribuții pentru familia îndoliată',
    namePlaceholder: 'ex: Ion Popescu',
  },
  nunta: {
    emoji: '💍',
    description: 'Fond lună de miere, cadouri și experiențe pentru miri',
    namePlaceholder: 'ex: Ana & Mihai',
  },
  bebe: {
    emoji: '👶',
    description: 'Listă de dorințe și fond general pentru familia cu nou-născut',
    namePlaceholder: 'ex: Micuțul Andrei',
  },
  sanatate: {
    emoji: '🌿',
    description: 'Tratamente, operații sau recuperare pentru o persoană sau animal',
    namePlaceholder: 'ex: Maria Ionescu',
  },
  altele: {
    emoji: '🌟',
    description: 'Orice altă cauză sau eveniment',
    namePlaceholder: 'ex: Asociația Speranța',
  },
}

// ── Live preview ─────────────────────────────────────────────────────────────

interface PreviewProps {
  config: EventTypeConfig | null
  name: string
  description: string
  goalAmount: string
  items: ItemInput[]
}

function LivePreview({ config, name, description, goalAmount, items }: PreviewProps) {
  if (!config) return null

  const displayName = name || 'Numele persoanei'
  const title = config.copy.pageTitle
    .replace('{name}', displayName)
    .replace('{name1}', displayName.split(' & ')[0] ?? displayName)
    .replace('{name2}', displayName.split(' & ')[1] ?? '')

  const visibleItems = items.filter((i) => i.name.trim())

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #E8DDD0' }}>
      {/* Mock browser bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ backgroundColor: '#F0E8DF', borderColor: '#E8DDD0' }}
      >
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-300" />
          <div className="h-2 w-2 rounded-full bg-amber-300" />
          <div className="h-2 w-2 rounded-full bg-green-300" />
        </div>
        <div
          className="flex-1 rounded px-2 py-0.5 text-xs truncate"
          style={{ backgroundColor: '#FFFDFB', color: '#B09070' }}
        >
          pentrumomente.ro/{config.slug}/…
        </div>
      </div>

      {/* Page content */}
      <div className="p-5 space-y-3" style={{ backgroundColor: config.palette.background }}>
        <h3 className="font-bold text-sm leading-snug" style={{ color: '#2D2016' }}>{title}</h3>

        {description && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#7A6652' }}>
            {description}
          </p>
        )}

        {goalAmount && (
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: '#9A7B60' }}>
              <span>0 RON strânși</span>
              <span>din {goalAmount} RON</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: '#E0D4C8' }}>
              <div className="h-1.5 w-0 rounded-full" style={{ backgroundColor: config.palette.primary }} />
            </div>
          </div>
        )}

        {visibleItems.length > 0 && (
          <div className="space-y-1.5">
            {visibleItems.slice(0, 3).map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
                style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
              >
                <span className="text-xs font-medium" style={{ color: '#2D2016' }}>
                  {item.emoji} {item.name}
                </span>
                <span className="text-xs" style={{ color: '#9A7B60' }}>
                  {item.targetAmount} RON
                </span>
              </div>
            ))}
            {visibleItems.length > 3 && (
              <p className="text-center text-xs" style={{ color: '#B09070' }}>
                + {visibleItems.length - 3} articole
              </p>
            )}
          </div>
        )}

        <button
          className="w-full rounded-lg py-2 text-xs font-semibold text-white mt-1"
          style={{ backgroundColor: config.palette.primary }}
          tabIndex={-1}
          aria-hidden="true"
        >
          {config.copy.donationVerb}
        </button>
      </div>
    </div>
  )
}

// ── Step progress ─────────────────────────────────────────────────────────────

function StepProgress({ current }: { current: CreateStep }) {
  const currentIndex = STEP_ORDER.indexOf(current)
  return (
    <div className="flex items-center gap-2" role="list" aria-label="Pași">
      {STEP_ORDER.map((s, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5" role="listitem" aria-current={active ? 'step' : undefined}>
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all"
                style={{
                  backgroundColor: done || active ? '#C4956A' : '#EDE0D0',
                  color: done || active ? '#fff' : '#B09070',
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                className="text-xs font-medium hidden sm:inline"
                style={{ color: active ? '#2D2016' : '#B09070' }}
              >
                {STEP_LABELS[s]}
              </span>
            </div>
            {i < STEP_ORDER.length - 1 && (
              <div
                className="h-px w-6 sm:w-10 transition-colors"
                style={{ backgroundColor: done ? '#C4956A' : '#EDE0D0' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function CreateEventPage() {
  const router = useRouter()
  const eventTypes = getAllEventTypes()

  const [step, setStep] = useState<CreateStep>('type')
  const [selectedConfig, setSelectedConfig] = useState<EventTypeConfig | null>(null)
  const [name, setName] = useState('')
  const [name2, setName2] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [description, setDescription] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [organiserIban, setOrganiserIban] = useState('')
  const [items, setItems] = useState<ItemInput[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function selectType(config: EventTypeConfig) {
    setSelectedConfig(config)
    setItems(config.suggestedItems.map((s) => ({
      name: s.name,
      targetAmount: String(s.defaultAmount),
      emoji: s.emoji ?? '',
    })))
    setStep('details')
  }

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
  }

  async function handleSubmit() {
    if (!selectedConfig) return
    setLoading(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login?next=/create')
      return
    }

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        eventType: selectedConfig.slug,
        name: combinedName,
        slug: slug || autoSlug(combinedName),
        description: description || undefined,
        goalAmount: goalAmount ? parseFloat(goalAmount) : undefined,
        organiserIban,
        items: items.map((i) => ({
          name: i.name,
          targetAmount: parseFloat(i.targetAmount) || 0,
          emoji: i.emoji || undefined,
        })),
      }),
    })

    const data = (await res.json()) as { event?: { eventType: string; slug: string }; error?: string }
    if (!res.ok) {
      setError(data.error ?? 'A apărut o eroare.')
      setLoading(false)
      return
    }
    router.push(`/${data.event!.eventType}/${data.event!.slug}`)
  }

  const isDualName = selectedConfig
    ? selectedConfig.copy.pageTitle.includes('{name1}')
    : false

  // The value stored in DB and used for token replacement everywhere
  const combinedName = isDualName && name2.trim()
    ? `${name} & ${name2}`
    : name

  const showPreview = step !== 'type'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

      {/* Nav */}
      <header className="px-6 py-4" style={{ borderBottom: '1px solid #EDE0D0', backgroundColor: '#FFFDFB' }}>
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <a href="/" className="text-sm font-bold tracking-tight" style={{ color: '#2D2016' }}>
            pentru<span style={{ color: '#C4956A' }}>momente</span>
          </a>
          {step !== 'type' && <StepProgress current={step} />}
        </div>
      </header>

      {/* ── STEP 1: full-width type picker ── */}
      {step === 'type' && (
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3" style={{ color: '#2D2016' }}>
              Cu ce ocazie strângi fonduri?
            </h1>
            <p className="text-base" style={{ color: '#9A7B60' }}>
              Alegerea personalizează pagina, articolele sugerate și mesajele pentru donatori.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {eventTypes.map((config) => {
              const meta = EVENT_TYPE_META[config.slug]
              return (
                <button
                  key={config.slug}
                  onClick={() => selectType(config)}
                  className="group flex flex-col items-center gap-4 rounded-3xl p-6 text-center transition-all duration-150"
                  style={{
                    backgroundColor: '#FFFDFB',
                    border: '1.5px solid #EDE0D0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C4956A'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(196,149,106,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#EDE0D0'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
                    style={{ backgroundColor: config.palette.background }}
                  >
                    {meta?.emoji ?? '📋'}
                  </div>
                  <div>
                    <p className="font-semibold text-base" style={{ color: '#2D2016' }}>
                      {config.label}
                    </p>
                    <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#9A7B60' }}>
                      {meta?.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── STEPS 2–4: two-column form + preview ── */}
      {showPreview && selectedConfig && (
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">

            {/* Left — form panel */}
            <div
              className="rounded-3xl p-8 space-y-8"
              style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
            >

              {/* ── Step 2: Details ── */}
              {step === 'details' && (
                <div className="space-y-6">
                  <div>
                    <button
                      onClick={() => setStep('type')}
                      className="text-sm mb-4 flex items-center gap-1.5 transition-opacity hover:opacity-70"
                      style={{ color: '#9A7B60' }}
                    >
                      ← Înapoi la tipuri
                    </button>
                    <h2 className="text-xl font-bold" style={{ color: '#2D2016' }}>Despre eveniment</h2>
                    <p className="text-sm mt-1" style={{ color: '#9A7B60' }}>
                      Aceste informații apar pe pagina publică.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {isDualName ? (
                      <div className="space-y-3">
                        <p className="text-sm font-medium" style={{ color: '#5A4030' }}>
                          Numele mirilor
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="Mirele"
                            placeholder="ex: Marius"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value)
                              if (!slugManuallyEdited) {
                                const combined = e.target.value && name2
                                  ? `${e.target.value}-si-${name2}`
                                  : e.target.value
                                setSlug(autoSlug(combined))
                              }
                            }}
                          />
                          <Input
                            label="Mireasa"
                            placeholder="ex: Alina"
                            value={name2}
                            onChange={(e) => {
                              setName2(e.target.value)
                              if (!slugManuallyEdited) {
                                const combined = name && e.target.value
                                  ? `${name}-si-${e.target.value}`
                                  : name
                                setSlug(autoSlug(combined))
                              }
                            }}
                          />
                        </div>
                        {name && name2 && (
                          <p className="text-xs" style={{ color: '#9A7B60' }}>
                            Va apărea ca: <span className="font-medium" style={{ color: '#2D2016' }}>Nunta lui {name} și {name2}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <Input
                        label="Numele persoanei"
                        placeholder={EVENT_TYPE_META[selectedConfig.slug]?.namePlaceholder ?? 'Nume'}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                          if (!slugManuallyEdited) setSlug(autoSlug(e.target.value))
                        }}
                      />
                    )}

                    <Textarea
                      label="Descriere (opțional)"
                      placeholder="Câteva cuvinte despre eveniment sau persoana pentru care strângi fonduri..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />

                    <Input
                      label="Suma țintă în RON (opțional)"
                      type="number"
                      min={0}
                      placeholder="ex: 5000"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      hint="Lasă gol dacă nu ai o sumă fixă — progresul pe articole se va afișa în loc."
                    />

                    <Input
                      label="URL personalizat"
                      placeholder="ex: ion-popescu"
                      value={slug}
                      onChange={(e) => {
                        setSlug(autoSlug(e.target.value))
                        setSlugManuallyEdited(true)
                      }}
                      hint={slug ? `pentrumomente.ro/${selectedConfig.slug}/${slug}` : 'Se generează automat din numele introdus.'}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setStep('type')} className="flex-1">
                      Înapoi
                    </Button>
                    <Button
                      onClick={() => setStep('items')}
                      disabled={!name.trim() || (isDualName && !name2.trim())}
                      className="flex-[2]"
                      style={{ backgroundColor: '#C4956A', border: 'none' }}
                    >
                      Continuă →
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Items ── */}
              {step === 'items' && (
                <div className="space-y-6">
                  <div>
                    <button
                      onClick={() => setStep('details')}
                      className="text-sm mb-4 flex items-center gap-1.5 transition-opacity hover:opacity-70"
                      style={{ color: '#9A7B60' }}
                    >
                      ← Înapoi
                    </button>
                    <h2 className="text-xl font-bold" style={{ color: '#2D2016' }}>Articole & sume</h2>
                    <p className="text-sm mt-1" style={{ color: '#9A7B60' }}>
                      Am pregătit sugestii. Editează suma, schimbă emoji-ul sau șterge ce nu vrei.
                    </p>
                  </div>

                  <ul className="space-y-2.5">
                    {items.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 items-center rounded-2xl px-4 py-3"
                        style={{ backgroundColor: '#FDFAF7', border: '1px solid #EDE0D0' }}
                      >
                        <input
                          type="text"
                          value={item.emoji}
                          onChange={(e) => {
                            const next = [...items]
                            next[i] = { ...next[i], emoji: e.target.value }
                            setItems(next)
                          }}
                          placeholder="🎁"
                          className="w-9 shrink-0 bg-transparent text-center text-xl focus:outline-none"
                          aria-label="Emoji articol"
                        />
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const next = [...items]
                            next[i] = { ...next[i], name: e.target.value }
                            setItems(next)
                          }}
                          placeholder="Nume articol"
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          style={{ color: '#2D2016' }}
                          aria-label="Numele articolului"
                        />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            min={1}
                            value={item.targetAmount}
                            onChange={(e) => {
                              const next = [...items]
                              next[i] = { ...next[i], targetAmount: e.target.value }
                              setItems(next)
                            }}
                            className="w-20 rounded-xl px-2 py-1.5 text-sm text-right focus:outline-none"
                            style={{ border: '1px solid #E0D4C8', color: '#2D2016', backgroundColor: '#FFFDFB' }}
                            aria-label="Suma țintă"
                          />
                          <span className="text-xs" style={{ color: '#B09070' }}>RON</span>
                        </div>
                        <button
                          onClick={() => setItems(items.filter((_, j) => j !== i))}
                          className="ml-1 w-7 h-7 flex items-center justify-center rounded-full text-sm transition-colors shrink-0"
                          style={{ color: '#C0B0A0', backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FEE8E8'
                            e.currentTarget.style.color = '#D06060'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = '#C0B0A0'
                          }}
                          aria-label="Șterge articol"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setItems([...items, { name: '', targetAmount: '100', emoji: '' }])}
                    className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm w-full transition-all"
                    style={{ border: '1.5px dashed #D0C0B0', color: '#9A7B60' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#C4956A'
                      e.currentTarget.style.color = '#C4956A'
                      e.currentTarget.style.backgroundColor = '#FFF8F2'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#D0C0B0'
                      e.currentTarget.style.color = '#9A7B60'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    + Adaugă un articol
                  </button>

                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setStep('details')} className="flex-1">
                      Înapoi
                    </Button>
                    <Button
                      onClick={() => setStep('payout')}
                      className="flex-[2]"
                      style={{ backgroundColor: '#C4956A', border: 'none' }}
                    >
                      Continuă →
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step 4: Payout ── */}
              {step === 'payout' && (
                <div className="space-y-6">
                  <div>
                    <button
                      onClick={() => setStep('items')}
                      className="text-sm mb-4 flex items-center gap-1.5 transition-opacity hover:opacity-70"
                      style={{ color: '#9A7B60' }}
                    >
                      ← Înapoi
                    </button>
                    <h2 className="text-xl font-bold" style={{ color: '#2D2016' }}>Unde trimitem banii?</h2>
                    <p className="text-sm mt-1" style={{ color: '#9A7B60' }}>
                      Fondurile strânse vor fi transferate direct în contul tău bancar românesc.
                    </p>
                  </div>

                  <div className="rounded-2xl p-4 flex gap-3 items-start"
                    style={{ backgroundColor: '#FFF8EE', border: '1px solid #EDD9B8' }}>
                    <span className="text-xl shrink-0">🔒</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#2D2016' }}>IBAN-ul tău este în siguranță</p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#9A7B60' }}>
                        Stocăm IBAN-ul criptat și îl folosim exclusiv pentru a-ți transfera fondurile. Nu este afișat niciodată public.
                      </p>
                    </div>
                  </div>

                  <Input
                    label="IBAN românesc"
                    placeholder="RO49AAAA1B31007593840000"
                    value={organiserIban}
                    onChange={(e) => setOrganiserIban(e.target.value.replace(/\s/g, '').toUpperCase())}
                    hint="Format: RO + 22 caractere. Îl găsești în aplicația băncii tale."
                  />

                  {/* Summary */}
                  <div className="rounded-2xl p-5 space-y-2.5"
                    style={{ backgroundColor: '#F5EDE3', border: '1px solid #E0D0C0' }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: '#2D2016' }}>Rezumat pagină</p>
                    {(
                      [
                        ['Tip', selectedConfig.label],
                        ['Nume', combinedName],
                        ...(goalAmount ? [['Obiectiv', `${goalAmount} RON`]] : []),
                        ['Articole', `${items.filter((i) => i.name).length}`],
                        ['URL', `/${selectedConfig.slug}/${slug || autoSlug(combinedName)}`],
                      ] as [string, string][]
                    ).map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 text-sm">
                        <span style={{ color: '#9A7B60' }}>{label}</span>
                        <span className="font-medium text-right truncate max-w-[60%]" style={{ color: '#2D2016' }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <p className="rounded-xl px-4 py-3 text-sm"
                      style={{ backgroundColor: '#FFF0F0', border: '1px solid #F0C0C0', color: '#B04040' }}>
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setStep('items')} className="flex-1">
                      Înapoi
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      loading={loading}
                      disabled={!organiserIban.trim()}
                      className="flex-[2]"
                      style={{ backgroundColor: '#C4956A', border: 'none' }}
                    >
                      Publică pagina 🎉
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* Right — sticky live preview */}
            <div className="hidden lg:block sticky top-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: '#B09070' }}>
                Previzualizare live
              </p>
              <LivePreview
                config={selectedConfig}
                name={combinedName}
                description={description}
                goalAmount={goalAmount}
                items={items}
              />
              <p className="text-xs text-center" style={{ color: '#C0B0A0' }}>
                Se actualizează pe măsură ce completezi
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
