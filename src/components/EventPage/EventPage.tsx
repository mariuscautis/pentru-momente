'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart, Users, TrendingUp, Copy, Check, Lock, ShieldCheck } from 'lucide-react'
import { Event, EventItem, Donation, EventTypeConfig } from '@/types'
import { ItemTracker } from '@/components/ItemTracker/ItemTracker'
import { DonorWall } from '@/components/DonorWall/DonorWall'
import { DonationFlow, SelectedItem } from '@/components/DonationFlow/DonationFlow'
import { ReportModal } from '@/components/ReportModal/ReportModal'

interface EventPageProps {
  event: Event
  items: EventItem[]
  donations: Donation[]
  config: EventTypeConfig
  totalRaised: number
}

export function EventPage({ event, items, donations, config, totalRaised }: EventPageProps) {
  const router = useRouter()
  const [cart, setCart] = useState<SelectedItem[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  const goalPercent = event.goalAmount
    ? Math.min(100, Math.round((totalRaised / event.goalAmount) * 100))
    : null

  const cartTotal = cart.reduce((sum, i) => sum + i.amount, 0)
  const donorCount = donations.filter((d) => d.status === 'confirmed').length

  const pageTitle = config.copy.pageTitle
    .replace('{name}', event.name)
    .replace('{name1}', event.name.split(' & ')[0] ?? event.name)
    .replace('{name2}', event.name.split(' & ')[1] ?? '')

  function openCheckout() {
    setCheckoutOpen(true)
    setTimeout(() => {
      document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function handleDonationComplete() {
    setCheckoutOpen(false)
    setCart([])
    router.refresh()
    setTimeout(() => {
      document.getElementById('donors')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function handleShareWhatsapp() {
    const text = encodeURIComponent(`${pageTitle} — ${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener')
  }

  function handleShareFacebook() {
    const encoded = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, '_blank', 'noopener')
  }

  const visibleDonations = donations.filter((d) => !d.isAnonymous || d.displayName)
  const hasAnyDonors = visibleDonations.length > 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: config.palette.background }}>

      {/* ── Hero: cover image if set, abstract SVG otherwise ── */}
      <div className="relative w-full" style={{ height: 'clamp(260px, 42vh, 500px)' }}>
        {/* Logo — aligned to the same max-w-6xl container as main content */}
        <div className="absolute top-4 left-0 right-0 z-10 mx-auto max-w-6xl px-4">
          <a
            href="/"
            className="inline-flex items-center gap-1 font-extrabold tracking-tight text-sm"
            style={{ color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}
            aria-label="pentrumomente.ro — pagina principală"
          >
            pentru<span style={{ color: '#F5C07A' }}>momente</span>
          </a>
        </div>
        {event.coverImageUrl ? (
          <Image
            src={event.coverImageUrl}
            alt={event.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={90}
          />
        ) : (
          <AbstractHero primary={config.palette.primary} accent={config.palette.accent} background={config.palette.background} />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              to bottom,
              rgba(0,0,0,0.08) 0%,
              transparent 35%,
              ${hexToRgba(config.palette.background, 0.6)} 72%,
              ${config.palette.background} 100%
            )`,
          }}
        />
      </div>

      {/* ── Main content — slight negative margin so gradient blends, title stays clear ── */}
      <main className="mx-auto max-w-6xl px-4 pb-24" style={{ marginTop: '1.5rem' }}>
        <div className={hasAnyDonors ? 'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start' : 'mx-auto max-w-2xl'}>

          {/* ── LEFT COLUMN ── */}
          <div className="min-w-0 space-y-6">

            {/* Title + stats */}
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold tracking-tight leading-tight"
                style={{ color: '#1C1209' }}
              >
                {pageTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
                <StatChip
                  icon={<Heart size={13} strokeWidth={2} />}
                  value={`${totalRaised.toLocaleString('ro-RO')} RON`}
                  label="strânși"
                  color={config.palette.primary}
                />
                {donorCount > 0 && (
                  <StatChip
                    icon={<Users size={13} strokeWidth={2} />}
                    value={String(donorCount)}
                    label={donorCount === 1 ? 'donator' : 'donatori'}
                    color={config.palette.primary}
                  />
                )}
                {event.goalAmount && goalPercent !== null && (
                  <StatChip
                    icon={<TrendingUp size={13} strokeWidth={2} />}
                    value={`${goalPercent}%`}
                    label="din obiectiv"
                    color={config.palette.primary}
                  />
                )}
              </div>
            </div>

            {/* Goal progress */}
            {event.goalAmount !== undefined && goalPercent !== null && (
              <GoalProgress
                totalRaised={totalRaised}
                goalAmount={event.goalAmount}
                goalPercent={goalPercent}
                primary={config.palette.primary}
              />
            )}

            {/* Description */}
            {event.description && (
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap max-w-[62ch]"
                style={{ color: '#6B5744' }}
              >
                {event.description}
              </p>
            )}

            {/* ── "Be first" nudge — only when no donations yet ── */}
            {!hasAnyDonors && !checkoutOpen && (
              <FirstDonorNudge
                name={event.name}
                donationVerb={config.copy.donationVerb}
                primary={config.palette.primary}
                onDonate={() => { setCart([]); openCheckout() }}
              />
            )}

            {/* Primary donate CTA */}
            {!checkoutOpen && hasAnyDonors && (
              <button
                onClick={() => { setCart([]); openCheckout() }}
                className="btn-fill w-full rounded-2xl py-4 text-base font-semibold text-white transition-all duration-150 active:scale-[0.98]"
                style={{
                  backgroundColor: config.palette.primary,
                  boxShadow: `0 4px 20px ${hexToRgba(config.palette.primary, 0.28)}`,
                }}
              >
                {config.copy.donationVerb}
              </button>
            )}

            {/* Trust markers */}
            {!checkoutOpen && (
              <TrustBar />
            )}

            {/* Checkout / donation flow */}
            {checkoutOpen && (
              <div id="checkout-section">
                <DonationFlow
                  event={event}
                  items={items}
                  config={config}
                  initialCart={cart}
                  onClose={() => { setCheckoutOpen(false); setCart([]) }}
                  onDonationComplete={handleDonationComplete}
                />
              </div>
            )}

            {/* Items list */}
            {items.length > 0 && !checkoutOpen && (
              <section aria-label="Articole" className="space-y-3">
                <SectionLabel>Articole</SectionLabel>
                <ItemTracker
                  items={items}
                  config={config}
                  cart={cart}
                  onCartChange={setCart}
                />
              </section>
            )}

            {/* Social share row + report */}
            {!checkoutOpen && (
              <ShareRow
                copied={copied}
                onCopy={handleCopyLink}
                onWhatsapp={handleShareWhatsapp}
                onFacebook={handleShareFacebook}
                onReport={() => setReportOpen(true)}
              />
            )}

            {/* Donor wall — mobile only */}
            {config.showDonorWall && hasAnyDonors && (
              <div id="donors" className="lg:hidden space-y-3">
                <SectionLabel>{config.donorWallLabel}</SectionLabel>
                <DonorWall donations={donations} config={config} />
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (desktop only) ── */}
          {config.showDonorWall && hasAnyDonors && (
            <aside
              className="hidden lg:block sticky top-6 self-start"
              aria-label={config.donorWallLabel}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: '1px solid #EDE0D0',
                  backgroundColor: '#FFFDFB',
                  boxShadow: '0 4px 24px rgba(45,32,22,0.06)',
                }}
              >
                <div
                  className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: '1px solid #F0E8DC' }}
                >
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9A7B60' }}>
                    {config.donorWallLabel}
                  </span>
                  <span
                    className="text-xs font-semibold rounded-full px-2.5 py-0.5"
                    style={{ backgroundColor: '#F5EDE3', color: '#9A6B45' }}
                  >
                    {visibleDonations.length}
                  </span>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: '70vh' }} id="donors">
                  <DonorWall donations={donations} config={config} variant="sidebar" />
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* ── Report modal ── */}
      {reportOpen && (
        <ReportModal event={event} config={config} onClose={() => setReportOpen(false)} />
      )}

      {/* ── Sticky cart bar ── */}
      {cart.length > 0 && !checkoutOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4"
          style={{ background: `linear-gradient(to top, ${config.palette.background} 60%, transparent)` }}
        >
          <div
            className="mx-auto max-w-lg rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
            style={{ backgroundColor: '#1C1209', boxShadow: '0 8px 32px rgba(28,18,9,0.28)' }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: '#C4956A' }}>
                {cart.length} {cart.length === 1 ? 'articol' : 'articole'} în coș
              </p>
              <p className="text-lg font-bold tabular-nums" style={{ color: '#FDFAF7' }}>
                {cartTotal.toLocaleString('ro-RO')} RON
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCart([])}
                className="rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 hover:brightness-125 active:scale-[0.97]"
                style={{ color: '#9A7B60', border: '1px solid #2E1E0E' }}
              >
                Golește
              </button>
              <button
                onClick={openCheckout}
                className="btn-fill rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
                style={{ backgroundColor: '#C4956A' }}
              >
                Spre plată →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────

/** Inviting nudge shown when zero donations exist yet */
function FirstDonorNudge({
  name,
  donationVerb,
  primary,
  onDonate,
}: {
  name: string
  donationVerb: string
  primary: string
  onDonate: () => void
}) {
  return (
    <div
      className="rounded-2xl px-6 py-6 text-center space-y-4"
      style={{
        background: `linear-gradient(135deg, ${hexToRgba(primary, 0.07)} 0%, ${hexToRgba(primary, 0.03)} 100%)`,
        border: `1.5px dashed ${hexToRgba(primary, 0.3)}`,
      }}
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(primary, 0.12) }}
      >
        <Heart size={22} strokeWidth={1.5} style={{ color: primary }} />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-base" style={{ color: '#1C1209' }}>
          Fii primul care donează pentru {name}
        </p>
        <p className="text-sm leading-relaxed max-w-[40ch] mx-auto" style={{ color: '#7A6652' }}>
          Fii primul care arată că îi pasă.
        </p>
      </div>
      <button
        onClick={onDonate}
        className="btn-fill inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
        style={{
          backgroundColor: primary,
          boxShadow: `0 4px 20px ${hexToRgba(primary, 0.32)}`,
        }}
      >
        <Heart size={14} strokeWidth={2} />
        {donationVerb}
      </button>
    </div>
  )
}

/** Trust markers strip shown below the CTA */
function TrustBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-1">
      <TrustItem icon={<Lock size={12} strokeWidth={2} />} label="Plată securizată SSL" />
      <TrustItem icon={<ShieldCheck size={12} strokeWidth={2} />} label="Protejat prin Stripe" />
    </div>
  )
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs" style={{ color: '#9A7B60' }}>
      <span style={{ color: '#B09070' }}>{icon}</span>
      {label}
    </span>
  )
}

/** Social share row — WhatsApp, Facebook, copy link */
function ShareRow({
  copied,
  onCopy,
  onWhatsapp,
  onFacebook,
  onReport,
}: {
  copied: boolean
  onCopy: () => void
  onWhatsapp: () => void
  onFacebook: () => void
  onReport: () => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9A7B60' }}>
        Distribuie pagina
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {/* WhatsApp */}
        <button
          onClick={onWhatsapp}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 hover:brightness-95 active:scale-[0.97]"
          style={{ backgroundColor: '#E8F5E9', color: '#1B5E20', border: '1px solid #C8E6C9' }}
          aria-label="Distribuie pe WhatsApp"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>

        {/* Facebook */}
        <button
          onClick={onFacebook}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 hover:brightness-95 active:scale-[0.97]"
          style={{ backgroundColor: '#E8EEF9', color: '#1A3A6B', border: '1px solid #C5D3EE' }}
          aria-label="Distribuie pe Facebook"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>

        {/* Copy link */}
        <button
          onClick={onCopy}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 hover:brightness-95 active:scale-[0.97]"
          style={{
            backgroundColor: copied ? '#F0FFF4' : '#F5F0EB',
            color: copied ? '#1E6B2B' : '#5A3D25',
            border: `1px solid ${copied ? '#C8E6C9' : '#E5D8CA'}`,
          }}
          aria-label="Copiază linkul"
        >
          {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
          {copied ? 'Copiat!' : 'Copiază link'}
        </button>

        {/* Spacer */}
        <span className="flex-1" />

        {/* Report */}
        <button
          onClick={onReport}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 hover:brightness-95 active:scale-[0.97]"
          style={{ color: '#C0342C', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
          aria-label="Raportează această pagină"
        >
          <span
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 22, height: 22, backgroundColor: '#FECACA' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
          </span>
          Raportează
        </button>
      </div>
    </div>
  )
}

function StatChip({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: string
  label: string
  color: string
}) {
  return (
    <span className="flex items-center gap-1.5 text-sm" style={{ color: '#6B5744' }}>
      <span style={{ color }}>{icon}</span>
      <strong className="font-semibold tabular-nums" style={{ color: '#2D2016' }}>{value}</strong>
      <span>{label}</span>
    </span>
  )
}

function GoalProgress({
  totalRaised,
  goalAmount,
  goalPercent,
  primary,
}: {
  totalRaised: number
  goalAmount: number
  goalPercent: number
  primary: string
}) {
  return (
    <div
      className="rounded-2xl px-5 py-4 space-y-3"
      style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
      aria-label="Progres strângere de fonduri"
    >
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-xl font-bold tabular-nums" style={{ color: '#1C1209' }}>
            {totalRaised.toLocaleString('ro-RO')} RON
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#9A7B60' }}>
            din obiectivul de {goalAmount.toLocaleString('ro-RO')} RON
          </p>
        </div>
        <span
          className="shrink-0 text-sm font-bold tabular-nums rounded-full px-3 py-1"
          style={{ backgroundColor: hexToRgba(primary, 0.12), color: primary }}
        >
          {goalPercent}%
        </span>
      </div>
      <div
        className="h-2.5 rounded-full overflow-hidden"
        style={{ backgroundColor: '#F0E8DC' }}
        role="progressbar"
        aria-valuenow={goalPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${goalPercent}%`, backgroundColor: primary }}
        />
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9A7B60' }}>
      {children}
    </h2>
  )
}

function AbstractHero({ primary, accent, background }: { primary: string; accent: string; background: string }) {
  const p = hexToRgba(primary, 1)
  const p2 = hexToRgba(primary, 0.5)
  const p3 = hexToRgba(primary, 0.18)
  const a = hexToRgba(accent, 0.7)
  const bg = background

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="rg1" cx="25%" cy="40%" r="60%">
          <stop offset="0%" stopColor={p} stopOpacity="0.22" />
          <stop offset="100%" stopColor={bg} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rg2" cx="80%" cy="60%" r="55%">
          <stop offset="0%" stopColor={a} stopOpacity="0.18" />
          <stop offset="100%" stopColor={bg} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rg3" cx="55%" cy="20%" r="40%">
          <stop offset="0%" stopColor={p2} stopOpacity="0.13" />
          <stop offset="100%" stopColor={bg} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base fill */}
      <rect width="1200" height="500" fill={bg} />

      {/* Soft blobs */}
      <rect width="1200" height="500" fill="url(#rg1)" />
      <rect width="1200" height="500" fill="url(#rg2)" />
      <rect width="1200" height="500" fill="url(#rg3)" />

      {/* Large arcs */}
      <ellipse cx="200" cy="520" rx="520" ry="320" fill={p3} opacity="0.5" />
      <ellipse cx="1050" cy="-40" rx="400" ry="280" fill={hexToRgba(accent, 0.1)} opacity="0.6" />

      {/* Thin arching lines */}
      <path d="M-60 380 Q300 80 700 260 T1300 180" fill="none" stroke={p} strokeWidth="1" opacity="0.14" />
      <path d="M-60 420 Q350 140 750 300 T1300 230" fill="none" stroke={p} strokeWidth="0.7" opacity="0.1" />
      <path d="M100 500 Q500 200 900 350 T1300 280" fill="none" stroke={a} strokeWidth="0.8" opacity="0.1" />

      {/* Small floating circles */}
      <circle cx="920" cy="110" r="90" fill={p3} opacity="0.45" />
      <circle cx="1100" cy="320" r="60" fill={hexToRgba(accent, 0.12)} opacity="0.5" />
      <circle cx="140" cy="160" r="70" fill={p3} opacity="0.35" />
      <circle cx="600" cy="60" r="44" fill={hexToRgba(primary, 0.08)} opacity="0.6" />

      {/* Dot cluster */}
      {[
        [760, 140], [780, 160], [800, 145], [770, 178], [820, 162],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill={p} opacity="0.18" />
      ))}
    </svg>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
