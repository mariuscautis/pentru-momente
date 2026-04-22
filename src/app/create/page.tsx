'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getAllEventTypes } from '@/config/event-types'
import { EventTypeConfig } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { getSupabase } from '@/lib/db/supabase'
import { IconPicker } from '@/components/ui/IconPicker'
import {
  Flame,
  Gem,
  Baby,
  HeartPulse,
  Sparkles,
  User,
  Building2,
  ShieldCheck,
  Landmark,
  Zap,
  ArrowLeft,
  ImagePlus,
  Check,
  ChevronRight,
} from 'lucide-react'

type CreateStep = 'type' | 'details' | 'items' | 'payout'

interface ItemInput {
  name: string
  targetAmount: string
  iconId: string
  isCustomAmount: boolean
}

const STEP_ORDER: CreateStep[] = ['type', 'details', 'items', 'payout']
const STEP_LABELS: Record<CreateStep, string> = {
  type: 'Tip',
  details: 'Detalii',
  items: 'Articole',
  payout: 'Plată',
}

const EVENT_TYPE_META: Record<string, {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties; className?: string }>
  description: string
  namePlaceholder: string
  accentColor: string
}> = {
  inmormantare: {
    Icon: Flame,
    description: 'Coroane, lumânări și contribuții pentru familia îndoliată',
    namePlaceholder: 'ex: Ion Popescu',
    accentColor: '#8B9EB5',
  },
  nunta: {
    Icon: Gem,
    description: 'Fond lună de miere, cadouri și experiențe pentru miri',
    namePlaceholder: 'ex: Ana & Mihai',
    accentColor: '#C4956A',
  },
  bebe: {
    Icon: Baby,
    description: 'Listă de dorințe și fond general pentru familia cu nou-născut',
    namePlaceholder: 'ex: Andrei / Andreea',
    accentColor: '#7EB5A0',
  },
  sanatate: {
    Icon: HeartPulse,
    description: 'Tratamente, operații sau recuperare pentru o persoană sau animal',
    namePlaceholder: 'ex: Maria Ionescu',
    accentColor: '#B57E7E',
  },
  altele: {
    Icon: Sparkles,
    description: 'Orice altă cauză sau eveniment important pentru tine',
    namePlaceholder: 'ex: Asociația Speranța',
    accentColor: '#D4882A',
  },
}

// ── Live preview ──────────────────────────────────────────────────────────────

interface PreviewProps {
  config: EventTypeConfig | null
  name: string
  description: string
  goalAmount: string
  items: ItemInput[]
  coverPreviewUrl: string | null
}

/** Shared inner content for both mobile and desktop previews */
function PreviewContent({
  config,
  title,
  description,
  goalAmount,
  visibleItems,
  coverPreviewUrl,
  scale,
}: {
  config: EventTypeConfig
  title: string
  description: string
  goalAmount: string
  visibleItems: ItemInput[]
  coverPreviewUrl: string | null
  scale: number
}) {
  const primary = config.palette.primary
  const accent = config.palette.accent
  const bg = config.palette.background
  const heroH = Math.round(100 * scale)
  const px = Math.round(16 * scale)
  const itemIconSize = Math.round(28 * scale)
  const fontSize = (base: number) => Math.round(base * scale)

  return (
    <div style={{ backgroundColor: bg, fontSize: fontSize(11), lineHeight: 1.4 }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: heroH }}>
        {coverPreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPreviewUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <svg viewBox="0 0 400 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect width="400" height="100" fill={primary} />
            <ellipse cx="320" cy="15" rx="120" ry="85" fill={accent} fillOpacity="0.30" />
            <ellipse cx="60" cy="85" rx="100" ry="70" fill={accent} fillOpacity="0.18" />
            <ellipse cx="200" cy="50" rx="70" ry="45" fill="rgba(255,255,255,0.06)" />
          </svg>
        )}
        {/* Logo */}
        <div
          className="absolute font-extrabold tracking-tight"
          style={{ top: Math.round(6 * scale), left: px, fontSize: fontSize(8), color: 'rgba(255,255,255,0.88)', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
        >
          pentru<span style={{ color: '#F5C07A' }}>momente</span>
        </div>
        {/* Bottom fade into page bg */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '40%', background: `linear-gradient(to bottom, transparent, ${bg})` }} />
      </div>

      {/* Content */}
      <div style={{ padding: `${Math.round(8 * scale)}px ${px}px ${Math.round(12 * scale)}px` }}>
        {/* Title */}
        <h3
          className="font-bold leading-snug"
          style={{ color: '#1C1209', fontSize: fontSize(12), marginBottom: Math.round(5 * scale) }}
        >
          {title}
        </h3>

        {/* Stat chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: Math.round(4 * scale), marginBottom: Math.round(6 * scale) }}>
          {[
            '♥ 0 RON strânși',
            ...(goalAmount ? ['↗ 0% din obiectiv'] : []),
          ].map((t) => (
            <span
              key={t}
              style={{
                display: 'inline-flex', alignItems: 'center',
                background: `${primary}18`, color: primary,
                borderRadius: 999, padding: `${Math.round(2 * scale)}px ${Math.round(6 * scale)}px`,
                fontSize: fontSize(9), fontWeight: 600,
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Goal progress */}
        {goalAmount && (
          <div style={{ marginBottom: Math.round(6 * scale) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fontSize(8), color: '#9A7B60', marginBottom: Math.round(3 * scale) }}>
              <span>0 RON strânși</span>
              <span>din {goalAmount} RON</span>
            </div>
            <div style={{ height: Math.round(4 * scale), borderRadius: 999, backgroundColor: '#EDE0D0', overflow: 'hidden' }}>
              <div style={{ width: '0%', height: '100%', backgroundColor: primary }} />
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <p style={{ fontSize: fontSize(9), color: '#7A6652', lineHeight: 1.5, marginBottom: Math.round(6 * scale), display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {description}
          </p>
        )}

        {/* Donate CTA */}
        <div
          style={{
            width: '100%', borderRadius: Math.round(10 * scale), backgroundColor: primary,
            color: '#fff', fontWeight: 700, textAlign: 'center',
            padding: `${Math.round(7 * scale)}px 0`,
            fontSize: fontSize(10), marginBottom: Math.round(8 * scale),
          }}
        >
          {config.copy.donationVerb}
        </div>

        {/* Trust strip */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: Math.round(10 * scale), marginBottom: Math.round(8 * scale) }}>
          {[
            { icon: '🔒', label: 'Plată securizată SSL' },
            { icon: '✓', label: 'Protejat prin Stripe' },
          ].map(({ icon, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: Math.round(3 * scale), fontSize: fontSize(8), color: '#9A7B60' }}>
              <span>{icon}</span>{label}
            </span>
          ))}
        </div>

        {/* Items */}
        {visibleItems.length > 0 && (
          <div>
            <p style={{ fontSize: fontSize(8), fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A7B60', marginBottom: Math.round(5 * scale) }}>
              Articole
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: Math.round(4 * scale) }}>
              {visibleItems.slice(0, 3).map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: Math.round(6 * scale),
                    backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0',
                    borderRadius: Math.round(10 * scale), padding: `${Math.round(5 * scale)}px ${Math.round(8 * scale)}px`,
                  }}
                >
                  {/* Icon bubble */}
                  <div style={{
                    width: itemIconSize, height: itemIconSize, borderRadius: Math.round(6 * scale),
                    backgroundColor: '#F5EDE3', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: fontSize(11), color: primary, fontWeight: 700,
                  }}>
                    {item.iconId
                      ? <span style={{ fontSize: Math.round(13 * scale) }}>{item.iconId}</span>
                      : <span style={{ fontSize: fontSize(9), color: primary }}>{item.name.charAt(0)}</span>
                    }
                  </div>
                  {/* Name + bar */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: fontSize(9), fontWeight: 600, color: '#1C1209', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </div>
                    {!item.isCustomAmount && (
                      <div style={{ marginTop: Math.round(2 * scale), height: Math.round(3 * scale), borderRadius: 999, backgroundColor: '#F0E8DC', overflow: 'hidden' }}>
                        <div style={{ width: '0%', height: '100%', backgroundColor: primary }} />
                      </div>
                    )}
                    <div style={{ fontSize: fontSize(8), color: '#9A7B60', marginTop: Math.round(1 * scale) }}>
                      {item.isCustomAmount ? 'Alege suma' : `0 din ${item.targetAmount} Lei`}
                    </div>
                  </div>
                  {/* Button */}
                  <div style={{
                    backgroundColor: primary, color: '#fff',
                    borderRadius: Math.round(7 * scale), padding: `${Math.round(3 * scale)}px ${Math.round(7 * scale)}px`,
                    fontSize: fontSize(8), fontWeight: 700, flexShrink: 0,
                  }}>
                    {config.copy.donationVerb}
                  </div>
                </div>
              ))}
              {visibleItems.length > 3 && (
                <p style={{ textAlign: 'center', fontSize: fontSize(8), color: '#B09070' }}>
                  + {visibleItems.length - 3} mai multe
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LivePreview({ config, name, description, goalAmount, items, coverPreviewUrl }: PreviewProps) {
  if (!config) return null

  const displayName = name || 'Numele persoanei'
  const title = config.copy.pageTitle
    .replace('{name}', displayName)
    .replace('{name1}', displayName.split(' & ')[0] ?? displayName)
    .replace('{name2}', displayName.split(' & ')[1] ?? '')

  const visibleItems = items.filter((i) => i.name.trim())
  const primary = config.palette.primary
  const bg = config.palette.background

  const browserBar = (url: string) => (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
        backgroundColor: '#1E2A20', borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div style={{ display: 'flex', gap: 4 }}>
        {['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0.18)'].map((c, i) => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: c }} />
        ))}
      </div>
      <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '2px 8px', fontSize: 9, color: 'rgba(255,255,255,0.38)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {url}
      </div>
    </div>
  )

  const sharedProps = { config, title, description, goalAmount, visibleItems, coverPreviewUrl }

  return (
    <div className="space-y-5">

      {/* ── Desktop mockup ── */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-ink-faint)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
          Desktop
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          {browserBar(`pentrumomente.ro/${config.slug}/…`)}
          {/* Two-column layout mimicking the real desktop grid */}
          <div style={{ display: 'flex', backgroundColor: bg, gap: 0 }}>
            {/* Left: main content */}
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <PreviewContent {...sharedProps} scale={0.52} />
            </div>
            {/* Right: donor wall sidebar */}
            <div style={{ width: 90, flexShrink: 0, borderLeft: '1px solid #EDE0D0', backgroundColor: '#FFFDFB', padding: '10px 8px' }}>
              <p style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A7B60', marginBottom: 8 }}>
                Donatori
              </p>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: `${primary}20`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: primary, opacity: 0.6 }} />
                  </div>
                  <div>
                    <div style={{ width: 36 + i * 6, height: 5, backgroundColor: '#EDE0D0', borderRadius: 3, marginBottom: 3 }} />
                    <div style={{ width: 24, height: 4, backgroundColor: '#F5EDE3', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile mockup ── */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-ink-faint)' }}>
          <svg width="10" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>
          Mobil
        </p>
        {/* Phone shell */}
        <div className="mx-auto" style={{ width: 210 }}>
          <div
            style={{
              border: '3px solid #1A1A1A', borderRadius: 28, overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.06) inset',
              backgroundColor: '#1A1A1A',
            }}
          >
            {/* Notch / status bar */}
            <div style={{ backgroundColor: '#1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 12px 4px' }}>
              <span style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>9:41</span>
              {/* Notch pill */}
              <div style={{ width: 40, height: 10, backgroundColor: '#0A0A0A', borderRadius: 6 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <svg width="9" height="7" viewBox="0 0 12 9" fill="rgba(255,255,255,0.65)"><path d="M0 9h2V5H0v4zm3 0h2V3H3v6zm3 0h2V1H6v8zm3 0h2V0H9v9z"/></svg>
                <svg width="9" height="7" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
                <svg width="12" height="7" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/><rect x="21" y="3.5" width="2.5" height="5" rx="1" fill="rgba(255,255,255,0.65)"/><rect x="2" y="2" width="15" height="8" rx="2" fill="rgba(255,255,255,0.65)"/></svg>
              </div>
            </div>
            {/* Page content — scrollable */}
            <div style={{ maxHeight: 480, overflowY: 'auto', overflowX: 'hidden' }}>
              <PreviewContent {...sharedProps} scale={0.48} />
            </div>
            {/* Home indicator */}
            <div style={{ backgroundColor: config.palette.background, display: 'flex', justifyContent: 'center', padding: '6px 0 4px' }}>
              <div style={{ width: 44, height: 3.5, backgroundColor: '#C0B4A8', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

// ── Step progress ─────────────────────────────────────────────────────────────

function StepProgress({ current }: { current: CreateStep }) {
  const currentIndex = STEP_ORDER.indexOf(current)
  return (
    <div className="flex items-center gap-1.5" role="list" aria-label="Pași">
      {STEP_ORDER.map((s, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <div key={s} className="flex items-center gap-1.5">
            <div className="flex items-center gap-2" role="listitem" aria-current={active ? 'step' : undefined}>
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all duration-200"
                style={{
                  backgroundColor: done ? 'var(--color-forest)' : active ? 'var(--color-amber)' : 'var(--color-border)',
                  color: done || active ? '#fff' : 'var(--color-ink-faint)',
                }}
              >
                {done ? <Check size={11} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className="text-xs font-medium hidden sm:inline"
                style={{ color: active ? 'var(--color-ink)' : 'var(--color-ink-faint)' }}
              >
                {STEP_LABELS[s]}
              </span>
            </div>
            {i < STEP_ORDER.length - 1 && (
              <div
                className="h-px w-5 sm:w-8 transition-colors duration-200"
                style={{ backgroundColor: done ? 'var(--color-forest)' : 'var(--color-border)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-1.5">
      <span className="block text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-ink-muted)' }}>
        {label}
      </span>
      {hint && <span className="block text-xs mt-0.5" style={{ color: 'var(--color-ink-faint)' }}>{hint}</span>}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

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
  const [items, setItems] = useState<ItemInput[]>([])
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState('')
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Restore draft from sessionStorage on mount (after login redirect)
  useEffect(() => {
    const saved = sessionStorage.getItem('create_draft')
    if (!saved) return
    try {
      const draft = JSON.parse(saved) as {
        step: CreateStep
        selectedConfigSlug: string
        name: string
        name2: string
        slug: string
        slugManuallyEdited: boolean
        description: string
        goalAmount: string
        expiresAt: string
        accountType: 'individual' | 'company'
        items: ItemInput[]
      }
      const config = getAllEventTypes().find(c => c.slug === draft.selectedConfigSlug)
      if (config) {
        setSelectedConfig(config)
        setStep(draft.step)
        setName(draft.name)
        setName2(draft.name2)
        setSlug(draft.slug)
        setSlugManuallyEdited(draft.slugManuallyEdited)
        setDescription(draft.description)
        setGoalAmount(draft.goalAmount)
        setExpiresAt(draft.expiresAt)
        setAccountType(draft.accountType)
        setItems(draft.items)
      }
    } catch {
      // ignore malformed draft
    }
    sessionStorage.removeItem('create_draft')
  }, [])

  function saveDraftAndRedirect(path: string) {
    if (selectedConfig) {
      sessionStorage.setItem('create_draft', JSON.stringify({
        step,
        selectedConfigSlug: selectedConfig.slug,
        name,
        name2,
        slug,
        slugManuallyEdited,
        description,
        goalAmount,
        expiresAt,
        accountType,
        items,
      }))
    }
    router.push(path)
  }

  function selectType(config: EventTypeConfig) {
    setSelectedConfig(config)
    setItems(config.suggestedItems.map((s) => ({
      name: s.name,
      targetAmount: String(s.defaultAmount),
      iconId: s.emoji ?? '',
      isCustomAmount: false,
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

    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      saveDraftAndRedirect('/login?next=/create')
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
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        items: items.map((i) => ({
          name: i.name,
          targetAmount: i.isCustomAmount ? 0 : (parseFloat(i.targetAmount) || 0),
          emoji: i.iconId || undefined,
          isCustomAmount: i.isCustomAmount,
        })),
      }),
    })

    const data = (await res.json()) as { event?: { id: string; eventType: string; slug: string }; error?: string }
    if (!res.ok) {
      setError(data.error ?? 'A apărut o eroare.')
      setLoading(false)
      return
    }

    if (coverImageFile && data.event?.id) {
      const formData = new FormData()
      formData.append('file', coverImageFile)
      await fetch(`/api/events/${data.event.id}/cover`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      })
    }

    const connectRes = await fetch('/api/connect/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        eventId: data.event!.id,
        eventSlug: data.event!.slug,
        accountType,
      }),
    })

    const connectData = (await connectRes.json()) as { onboardingUrl?: string; error?: string }
    if (!connectRes.ok || !connectData.onboardingUrl) {
      setError(connectData.error ?? 'Eroare la configurarea plăților.')
      setLoading(false)
      return
    }

    window.location.href = connectData.onboardingUrl
  }

  const isDualName = selectedConfig
    ? selectedConfig.copy.pageTitle.includes('{name1}')
    : false

  const combinedName = isDualName && name2.trim()
    ? `${name} & ${name2}`
    : name

  const showPreview = step !== 'type'

  const inputBase: React.CSSProperties = {
    border: '1px solid var(--color-border)',
    color: 'var(--color-ink)',
    backgroundColor: 'var(--color-bg)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  function onFocusAmber(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = 'var(--color-amber)'
    e.target.style.boxShadow = '0 0 0 3px rgba(212,136,42,0.10)'
  }
  function onBlurAmber(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = 'var(--color-border)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Nav */}
      <header
        className="px-6 py-4 sticky top-0"
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          zIndex: 40,
        }}
      >
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <a href="/" className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
            pentru<span style={{ color: 'var(--color-amber)' }}>momente</span>
          </a>
          {step !== 'type' && <StepProgress current={step} />}
        </div>
      </header>

      {/* ── STEP 1: type picker ── */}
      {step === 'type' && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-20">

          {/* Header — left aligned */}
          <div className="mb-12 max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--color-amber)' }}>
              Pas 1 din 4
            </p>
            <h1
              className="font-extrabold tracking-tight leading-tight mb-3"
              style={{ color: 'var(--color-ink)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
            >
              Cu ce ocazie strângi fonduri?
            </h1>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
              Alegerea personalizează pagina, articolele sugerate și mesajele pentru donatori.
            </p>
          </div>

          {/* Type cards — asymmetric 2+3 layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr] gap-3">
            {eventTypes.map((config, idx) => {
              const meta = EVENT_TYPE_META[config.slug]
              if (!meta) return null
              const EventIcon = meta.Icon
              const isWide = idx === 0

              return (
                <button
                  key={config.slug}
                  onClick={() => selectType(config)}
                  className={`group flex items-start gap-4 rounded-2xl p-5 text-left transition-all duration-200 card-lift${isWide ? ' sm:col-span-2 lg:col-span-1' : ''}`}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-amber)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                  }}
                >
                  {/* Icon block */}
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${meta.accentColor}18`, border: `1px solid ${meta.accentColor}30` }}
                  >
                    <EventIcon size={18} strokeWidth={1.75} style={{ color: meta.accentColor }} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-ink)' }}>
                      {config.label}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                      {meta.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 mt-0.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    style={{ color: 'var(--color-ink-faint)' }}
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── STEPS 2–4: two-column form + preview ── */}
      {showPreview && selectedConfig && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

            {/* Left — form panel */}
            <div
              className="rounded-3xl p-7 sm:p-8"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >

              {/* ── Step 2: Details ── */}
              {step === 'details' && (
                <div className="space-y-6">
                  <div>
                    <button
                      onClick={() => setStep('type')}
                      className="flex items-center gap-1.5 text-xs font-medium mb-5 transition-opacity hover:opacity-70"
                      style={{ color: 'var(--color-ink-muted)' }}
                    >
                      <ArrowLeft size={13} strokeWidth={2.5} /> Înapoi la tipuri
                    </button>
                    <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
                      Despre eveniment
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>
                      Aceste informații apar pe pagina publică.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {isDualName ? (
                      <div className="space-y-3">
                        <FieldLabel label="Numele mirilor" />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="Mirele"
                            placeholder="ex: Marius"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value)
                              if (!slugManuallyEdited) {
                                const combined = e.target.value && name2 ? `${e.target.value}-si-${name2}` : e.target.value
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
                                const combined = name && e.target.value ? `${name}-si-${e.target.value}` : name
                                setSlug(autoSlug(combined))
                              }
                            }}
                          />
                        </div>
                        {name && name2 && (
                          <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                            Va apărea ca: <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>Nunta {name} și {name2}</span>
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
                      hint="Lasă gol dacă nu ai o sumă fixă."
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

                    {/* Cover image */}
                    <div>
                      <FieldLabel label="Imagine copertă (opțional)" hint="Apare ca fundal pe pagina de donații." />
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setCoverImageFile(file)
                          setCoverPreviewUrl(URL.createObjectURL(file))
                        }}
                      />
                      {coverPreviewUrl ? (
                        <div className="relative rounded-2xl overflow-hidden" style={{ height: 160 }}>
                          <Image src={coverPreviewUrl} alt="Copertă" fill className="object-cover" unoptimized />
                          <button
                            type="button"
                            onClick={() => {
                              setCoverImageFile(null)
                              setCoverPreviewUrl(null)
                              if (coverInputRef.current) coverInputRef.current.value = ''
                            }}
                            className="absolute top-2 right-2 rounded-full px-3 py-1 text-xs font-semibold"
                            style={{ backgroundColor: 'rgba(30,58,47,0.75)', color: '#fff' }}
                          >
                            Elimină
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          className="w-full rounded-2xl py-7 text-sm transition-all flex flex-col items-center gap-2.5"
                          style={{ border: '1.5px dashed var(--color-border)', color: 'var(--color-ink-faint)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-amber)'
                            e.currentTarget.style.color = 'var(--color-amber)'
                            e.currentTarget.style.backgroundColor = 'rgba(212,136,42,0.04)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border)'
                            e.currentTarget.style.color = 'var(--color-ink-faint)'
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <ImagePlus size={20} strokeWidth={1.5} />
                          <span className="font-medium" style={{ color: 'var(--color-ink-muted)' }}>Adaugă o fotografie</span>
                        </button>
                      )}
                    </div>

                    {/* Expiry date */}
                    <div>
                      <FieldLabel label="Data de expirare (opțional)" hint="Pagina devine inactivă automat după această dată." />
                      <input
                        type="date"
                        value={expiresAt}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        style={{ ...inputBase, color: expiresAt ? 'var(--color-ink)' : 'var(--color-ink-faint)' }}
                        onFocus={onFocusAmber}
                        onBlur={onBlurAmber}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setStep('type')} className="flex-1">
                      Înapoi
                    </Button>
                    <Button
                      onClick={() => setStep('items')}
                      disabled={!name.trim() || (isDualName && !name2.trim())}
                      className="flex-[2]"
                      style={{ backgroundColor: 'var(--color-amber)', border: 'none' }}
                    >
                      Continuă
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
                      className="flex items-center gap-1.5 text-xs font-medium mb-5 transition-opacity hover:opacity-70"
                      style={{ color: 'var(--color-ink-muted)' }}
                    >
                      <ArrowLeft size={13} strokeWidth={2.5} /> Înapoi
                    </button>
                    <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
                      Articole & sume
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>
                      Am pregătit sugestii. Editează suma, schimbă iconița sau șterge ce nu vrei.
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {items.map((item, i) => (
                      <li
                        key={i}
                        className="rounded-2xl px-4 py-3 space-y-2.5"
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                      >
                        <div className="flex gap-3 items-center">
                          <IconPicker
                            value={item.iconId}
                            onChange={(id) => {
                              const next = [...items]
                              next[i] = { ...next[i], iconId: id }
                              setItems(next)
                            }}
                            primaryColor={selectedConfig?.palette.primary ?? 'var(--color-amber)'}
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
                            style={{ color: 'var(--color-ink)' }}
                            aria-label="Numele articolului"
                          />
                          <button
                            onClick={() => setItems(items.filter((_, j) => j !== i))}
                            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors shrink-0"
                            style={{ color: 'var(--color-ink-faint)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#FEE8E8'
                              e.currentTarget.style.color = '#C04040'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                              e.currentTarget.style.color = 'var(--color-ink-faint)'
                            }}
                            aria-label="Șterge articol"
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center gap-3 pl-11">
                          {!item.isCustomAmount && (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="number"
                                min={1}
                                value={item.targetAmount}
                                onChange={(e) => {
                                  const next = [...items]
                                  next[i] = { ...next[i], targetAmount: e.target.value }
                                  setItems(next)
                                }}
                                onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
                                className="w-24 rounded-xl px-2 py-1.5 text-sm text-right focus:outline-none"
                                style={{ border: '1px solid var(--color-border)', color: 'var(--color-ink)', backgroundColor: 'var(--color-surface)' }}
                                aria-label="Suma țintă"
                              />
                              <span className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>Lei</span>
                            </div>
                          )}
                          <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={item.isCustomAmount}
                              onChange={(e) => {
                                const next = [...items]
                                next[i] = { ...next[i], isCustomAmount: e.target.checked }
                                setItems(next)
                              }}
                              className="h-3.5 w-3.5 rounded"
                            />
                            <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>Sumă liberă</span>
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setItems([...items, { name: '', targetAmount: '100', iconId: '', isCustomAmount: false }])}
                    className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm w-full transition-all"
                    style={{ border: '1.5px dashed var(--color-border)', color: 'var(--color-ink-faint)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-amber)'
                      e.currentTarget.style.color = 'var(--color-amber)'
                      e.currentTarget.style.backgroundColor = 'rgba(212,136,42,0.04)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                      e.currentTarget.style.color = 'var(--color-ink-faint)'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                    </svg>
                    Adaugă un articol
                  </button>

                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setStep('details')} className="flex-1">
                      Înapoi
                    </Button>
                    <Button
                      onClick={() => setStep('payout')}
                      className="flex-[2]"
                      style={{ backgroundColor: 'var(--color-amber)', border: 'none' }}
                    >
                      Continuă
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
                      className="flex items-center gap-1.5 text-xs font-medium mb-5 transition-opacity hover:opacity-70"
                      style={{ color: 'var(--color-ink-muted)' }}
                    >
                      <ArrowLeft size={13} strokeWidth={2.5} /> Înapoi
                    </button>
                    <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
                      Configurează plățile
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>
                      Donațiile ajung direct în contul tău bancar prin Stripe.
                    </p>
                  </div>

                  {/* Account type selector */}
                  <div>
                    <FieldLabel label="Cine primește donațiile?" />
                    <div className="grid grid-cols-2 gap-3 mt-1.5">
                      {([
                        {
                          value: 'individual' as const,
                          title: 'Persoană fizică',
                          desc: 'Buletin sau pașaport personal.',
                          Icon: User,
                        },
                        {
                          value: 'company' as const,
                          title: 'Persoană juridică',
                          desc: 'Firmă sau ONG cu CUI.',
                          Icon: Building2,
                        },
                      ] as const).map((opt) => {
                        const selected = accountType === opt.value
                        const OptionIcon = opt.Icon
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setAccountType(opt.value)}
                            className="flex flex-col items-start gap-3 rounded-2xl p-4 text-left transition-all duration-150"
                            style={{
                              border: selected ? '2px solid var(--color-amber)' : '1px solid var(--color-border)',
                              backgroundColor: selected ? 'rgba(212,136,42,0.05)' : 'var(--color-bg)',
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{
                                backgroundColor: selected ? 'rgba(212,136,42,0.12)' : 'var(--color-surface)',
                                border: `1px solid ${selected ? 'rgba(212,136,42,0.25)' : 'var(--color-border)'}`,
                              }}
                            >
                              <OptionIcon size={15} strokeWidth={1.75} style={{ color: selected ? 'var(--color-amber)' : 'var(--color-ink-muted)' }} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{opt.title}</p>
                              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{opt.desc}</p>
                            </div>
                            {selected && (
                              <span className="text-[11px] font-bold" style={{ color: 'var(--color-amber)' }}>
                                Selectat
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* How it works */}
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ border: '1px solid var(--color-border)' }}
                  >
                    {([
                      {
                        Icon: ShieldCheck,
                        title: 'Verificare de identitate',
                        body: accountType === 'individual'
                          ? 'Stripe verifică identitatea ta prin buletin sau pașaport românesc.'
                          : 'Stripe verifică firma sau ONG-ul prin CUI și documentele de înregistrare.',
                      },
                      {
                        Icon: Landmark,
                        title: 'IBAN personal',
                        body: 'Adaugi IBAN-ul românesc direct în interfața Stripe — platforma nu îl vede niciodată.',
                      },
                      {
                        Icon: Zap,
                        title: 'Plăți automate',
                        body: 'Donațiile ajung automat în contul tău. Nicio retragere manuală necesară.',
                      },
                    ] as const).map(({ Icon: ItemIcon, title, body }, idx) => (
                      <div key={title} className="flex gap-3.5 items-start p-4"
                        style={{ backgroundColor: 'var(--color-bg)', borderTop: idx > 0 ? '1px solid var(--color-border)' : undefined }}>
                        <div
                          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                          style={{ backgroundColor: 'rgba(212,136,42,0.08)', border: '1px solid rgba(212,136,42,0.15)' }}
                        >
                          <ItemIcon size={14} strokeWidth={1.75} style={{ color: 'var(--color-amber)' }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{title}</p>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{body}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div
                    className="rounded-2xl p-5 space-y-2.5"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--color-ink-muted)' }}>
                      Rezumat pagină
                    </p>
                    {(
                      [
                        ['Tip', selectedConfig.label],
                        ['Nume', combinedName],
                        ...(goalAmount ? [['Obiectiv', `${goalAmount} RON`]] : []),
                        ['Articole', `${items.filter((i) => i.name).length}`],
                        ['URL', `/${selectedConfig.slug}/${slug || autoSlug(combinedName)}`],
                        ['Cont Stripe', accountType === 'individual' ? 'Persoană fizică' : 'Persoană juridică'],
                      ] as [string, string][]
                    ).map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 text-sm">
                        <span style={{ color: 'var(--color-ink-muted)' }}>{label}</span>
                        <span className="font-medium text-right truncate max-w-[60%]" style={{ color: 'var(--color-ink)' }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <p className="rounded-xl px-4 py-3 text-sm"
                      style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}>
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
                      className="flex-[2]"
                      style={{ backgroundColor: 'var(--color-amber)', border: 'none' }}
                    >
                      {loading ? 'Se creează...' : 'Continuă la Stripe'}
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* Right — sticky live preview */}
            <div className="hidden lg:block sticky top-20">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.14em] px-1 mb-4"
                style={{ color: 'var(--color-ink-faint)' }}
              >
                Previzualizare live
              </p>
              <LivePreview
                config={selectedConfig}
                name={combinedName}
                description={description}
                goalAmount={goalAmount}
                items={items}
                coverPreviewUrl={coverPreviewUrl}
              />
              <p className="text-[10px] text-center mt-3" style={{ color: 'var(--color-ink-faint)' }}>
                Se actualizează pe măsură ce completezi
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
