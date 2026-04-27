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
  HandHeart,
  PawPrint,
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
  nameLabel: string
  namePlaceholder: string
  accentColor: string
}> = {
  inmormantare: {
    Icon: Flame,
    description: 'Coroane, lumânări și contribuții pentru familia îndoliată',
    nameLabel: 'Numele persoanei',
    namePlaceholder: 'ex: Ion Popescu',
    accentColor: '#8B9EB5',
  },
  nunta: {
    Icon: Gem,
    description: 'Fond lună de miere, cadouri și experiențe pentru miri',
    nameLabel: 'Numele mirilor',
    namePlaceholder: 'ex: Ana & Mihai',
    accentColor: '#C4956A',
  },
  bebe: {
    Icon: Baby,
    description: 'Listă de dorințe și fond general pentru familia cu nou-născut',
    nameLabel: 'Numele bebelușului',
    namePlaceholder: 'ex: Andrei / Andreea',
    accentColor: '#7EB5A0',
  },
  sanatate: {
    Icon: HeartPulse,
    description: 'Tratamente, operații sau recuperare pentru o persoană sau animal',
    nameLabel: 'Numele persoanei',
    namePlaceholder: 'ex: Maria Ionescu',
    accentColor: '#B57E7E',
  },
  caritate: {
    Icon: HandHeart,
    description: 'Susține o organizație caritabilă sau o cauză umanitară',
    nameLabel: 'Numele organizației',
    namePlaceholder: 'ex: Asociația Speranța',
    accentColor: '#3B82F6',
  },
  animale: {
    Icon: PawPrint,
    description: 'Tratamente veterinare, adăposturi și îngrijire pentru animale',
    nameLabel: 'Numele animalului',
    namePlaceholder: 'ex: Rex / Pisica Mia',
    accentColor: '#F59E0B',
  },
  altele: {
    Icon: Sparkles,
    description: 'Orice altă cauză sau eveniment important pentru tine',
    nameLabel: 'Nume / titlu',
    namePlaceholder: 'ex: Proiectul meu',
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
  heroHeight: number
  photoFiles: Array<{ previewUrl: string; caption: string }>
}

// ── Preview sub-components (top-level so React doesn't remount them) ───────────

interface PageBodyProps {
  primary: string; accent: string; bg: string; title: string
  description: string; goalAmount: string; visibleItems: ItemInput[]
  coverPreviewUrl: string | null | undefined; donationVerb: string; s: number; heroHeight: number
}

function PreviewHero({ primary, accent, bg, coverPreviewUrl, s, heroHeight }: { primary: string; accent: string; bg: string; coverPreviewUrl: string | null; s: number; heroHeight: number }) {
  // No image → fixed 25vh equivalent (~200px on a typical screen)
  const heroH = coverPreviewUrl ? Math.round(heroHeight * s) : Math.round(200 * s)
  const px = Math.round(16 * s)
  const r = (n: number) => Math.round(n * s)
  return (
    <div style={{ position: 'relative', height: heroH, overflow: 'hidden', flexShrink: 0 }}>
      {coverPreviewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverPreviewUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        /* Abstract blobs matching AbstractHero — bg-tinted, soft, no hard colour fill */
        <svg viewBox="0 0 600 160" style={{ display: 'block', width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
          <rect width="600" height="160" fill={bg} />
          <ellipse cx="480" cy="30"  rx="200" ry="140" fill={primary} fillOpacity="0.18" />
          <ellipse cx="80"  cy="140" rx="180" ry="120" fill={accent}  fillOpacity="0.12" />
          <ellipse cx="300" cy="80"  rx="140" ry="90"  fill={primary} fillOpacity="0.08" />
          <ellipse cx="520" cy="150" rx="120" ry="80"  fill={accent}  fillOpacity="0.10" />
        </svg>
      )}
      {/* Gradient fade into page bg at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: `linear-gradient(to bottom, transparent, ${bg})` }} />
      {/* Logo top-left */}
      <div style={{ position: 'absolute', top: r(6), left: px, fontSize: r(7.5), fontWeight: 800, color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 4px rgba(0,0,0,0.35)', letterSpacing: '-0.01em' }}>
        pentru<span style={{ color: '#F5C07A' }}>momente</span>
      </div>
    </div>
  )
}

function PreviewPageBody({ primary, accent, bg, title, description, goalAmount, visibleItems, coverPreviewUrl, donationVerb, s, heroHeight }: PageBodyProps) {
  const px = Math.round(16 * s)
  const r = (n: number) => Math.round(n * s)

  return (
    <div style={{ backgroundColor: bg, display: 'block', boxSizing: 'border-box', minHeight: '100%' }}>
      {/* Hero — rendered here for mobile; desktop passes coverPreviewUrl=null and renders hero separately */}
      {coverPreviewUrl !== undefined && (
        <PreviewHero primary={primary} accent={accent} bg={bg} coverPreviewUrl={coverPreviewUrl} s={s} heroHeight={heroHeight} />
      )}

      {/* Main content — negative top margin to overlap hero fade, matching real page */}
      <div style={{ padding: `${r(4)}px ${px}px ${r(16)}px`, boxSizing: 'border-box' }}>

        {/* Title — large bold, matches h1 text-3xl md:text-4xl */}
        <div style={{ fontWeight: 700, fontSize: r(14), color: '#1C1209', lineHeight: 1.25, marginBottom: r(6) }}>{title}</div>

        {/* Stat chips row — small pills with icon + text */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: r(5), marginBottom: r(8) }}>
          {[
            { icon: '♥', label: '0 RON', sub: 'strânși' },
            ...( goalAmount ? [{ icon: '↗', label: '0%', sub: 'din obiectiv' }] : []),
          ].map(({ icon, label, sub }) => (
            <span key={sub} style={{ display: 'inline-flex', alignItems: 'center', gap: r(3), background: `${primary}18`, borderRadius: 999, padding: `${r(2)}px ${r(7)}px`, fontSize: r(8), color: primary, fontWeight: 600 }}>
              <span style={{ fontSize: r(7) }}>{icon}</span>
              <strong style={{ fontWeight: 700 }}>{label}</strong>
              <span style={{ fontWeight: 400, opacity: 0.8 }}>{sub}</span>
            </span>
          ))}
        </div>

        {/* Goal progress box — matching real GoalProgress component */}
        {goalAmount && (
          <div style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0', borderRadius: r(10), padding: `${r(8)}px ${r(10)}px`, marginBottom: r(10) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: r(5) }}>
              <div>
                <span style={{ fontSize: r(12), fontWeight: 700, color: '#1C1209' }}>0 RON</span>
                <span style={{ fontSize: r(7.5), color: '#9A7B60', marginLeft: r(4) }}>din {goalAmount} RON</span>
              </div>
              <span style={{ fontSize: r(9), fontWeight: 700, color: primary }}>0%</span>
            </div>
            <div style={{ height: r(5), borderRadius: 999, backgroundColor: '#EDE0D0', overflow: 'hidden' }}>
              <div style={{ width: '0%', height: '100%', backgroundColor: primary, borderRadius: 999 }} />
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <div style={{ fontSize: r(8.5), color: '#6B5744', lineHeight: 1.6, marginBottom: r(10), display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {description}
          </div>
        )}

        {/* CTA button — full width amber */}
        <div style={{ backgroundColor: primary, color: '#fff', fontWeight: 600, textAlign: 'center', borderRadius: r(12), padding: `${r(9)}px 0`, fontSize: r(10), marginBottom: r(6), boxShadow: `0 4px 16px ${primary}44` }}>
          {donationVerb}
        </div>

        {/* Trust strip */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: r(14), marginBottom: r(12) }}>
          {[{ icon: '🔒', t: 'Plată securizată SSL' }, { icon: '✓', t: 'Protejat prin Stripe' }].map(({ icon, t }) => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: r(3), fontSize: r(7.5), color: '#9A7B60' }}>{icon} {t}</span>
          ))}
        </div>

        {/* Items — matching real ItemTracker cards */}
        {visibleItems.length > 0 && (
          <div>
            <div style={{ fontSize: r(7.5), fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A7B60', marginBottom: r(6) }}>Articole</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: r(5) }}>
              {visibleItems.slice(0, 4).map((item, i) => (
                <div key={i} style={{ backgroundColor: '#FFFDFB', border: '1.5px solid #EDE0D0', borderRadius: r(12), overflow: 'hidden' }}>
                  {/* Main row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: r(8), padding: `${r(8)}px ${r(10)}px`, boxSizing: 'border-box' }}>
                    {/* Icon bubble — warm cream bg, emoji or initial, matching real ItemCard */}
                    <div style={{ width: r(32), height: r(32), borderRadius: r(8), backgroundColor: '#F5EDE3', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: r(item.iconId ? 14 : 10), color: '#7A6652', fontWeight: 700 }}>
                      {item.iconId || item.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: r(9), fontWeight: 600, color: '#1C1209', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      {!item.isCustomAmount ? (
                        <div style={{ marginTop: r(3) }}>
                          <div style={{ height: r(3), borderRadius: 999, backgroundColor: '#F0E8DC', overflow: 'hidden', marginBottom: r(2) }}>
                            <div style={{ width: '0%', height: '100%', backgroundColor: primary }} />
                          </div>
                          <div style={{ fontSize: r(7.5), color: '#9A7B60' }}>0 din {item.targetAmount} Lei</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: r(7.5), color: '#9A7B60', marginTop: r(2) }}>Alege suma</div>
                      )}
                    </div>
                    {/* Action button */}
                    <div style={{ backgroundColor: primary, color: '#fff', borderRadius: r(8), padding: `${r(4)}px ${r(9)}px`, fontSize: r(8), fontWeight: 600, flexShrink: 0, display: 'flex', alignItems: 'center', gap: r(3) }}>
                      + {donationVerb}
                    </div>
                  </div>
                </div>
              ))}
              {visibleItems.length > 4 && (
                <div style={{ textAlign: 'center', fontSize: r(8), color: '#B09070' }}>+ {visibleItems.length - 4} mai multe</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PreviewDonorSidebar({ primary, s }: { primary: string; s: number }) {
  const r = (n: number) => Math.round(n * s)
  const donors = [
    { initials: 'MC', name: 'Marius C.', amount: '150 RON' },
    { initials: 'AC', name: 'Alina C.',  amount: '50 RON'  },
  ]
  return (
    // Matches real sidebar: rounded card, border, white bg
    <div style={{ width: r(220), flexShrink: 0, padding: `${r(10)}px ${r(8)}px` }}>
      <div style={{ border: '1px solid #EDE0D0', borderRadius: r(12), backgroundColor: '#FFFDFB', overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${r(8)}px ${r(10)}px`, borderBottom: '1px solid #F0E8DC' }}>
          <span style={{ fontSize: r(7), fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A7B60' }}>Cei care au dăruit</span>
          <span style={{ backgroundColor: '#F5EDE3', color: '#9A6B45', borderRadius: 999, padding: `${r(1)}px ${r(5)}px`, fontSize: r(7), fontWeight: 700 }}>{donors.length}</span>
        </div>
        {/* Donor rows */}
        {donors.map(({ initials, name, amount }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: r(7), padding: `${r(8)}px ${r(10)}px`, borderBottom: i < donors.length - 1 ? '1px solid #F5EDE3' : 'none' }}>
            {/* Avatar circle with initials */}
            <div style={{ width: r(22), height: r(22), borderRadius: '50%', backgroundColor: `${primary}22`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: r(7), fontWeight: 700, color: primary }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: r(8), fontWeight: 600, color: '#1C1209' }}>{name}</div>
              <div style={{ fontSize: r(7), color: '#9A7B60' }}>acum</div>
            </div>
            {/* Amount right-aligned */}
            <div style={{ fontSize: r(8), fontWeight: 700, color: '#1C1209', flexShrink: 0 }}>{amount}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Friendly slug labels for URL bar display
const SLUG_LABELS: Record<string, string> = {
  inmormantare: 'inmormantare',
  nunta: 'nunta',
  bebe: 'nou-nascut',
  sanatate: 'sanatate',
  caritate: 'caritate',
  animale: 'animale',
  altele: 'altele',
}

function LivePreview({ config, name, description, goalAmount, items, coverPreviewUrl, heroHeight, photoFiles }: PreviewProps) {
  if (!config) return null

  const displayName = name || 'Numele persoanei'
  const title = config.copy.pageTitle
    .replace('{name}', displayName)
    .replace('{name1}', displayName.split(' & ')[0] ?? displayName)
    .replace('{name2}', displayName.split(' & ')[1] ?? '')

  const visibleItems = items.filter((i) => i.name.trim())
  const primary = config.palette.primary
  const accent = config.palette.accent
  const bg = config.palette.background
  const urlSlug = SLUG_LABELS[config.slug] ?? config.slug
  const slugPart = displayName ? `/${displayName.toLowerCase().replace(/\s+/g, '-').slice(0, 18)}` : '/…'
  const previewUrl = `pentrumomente.ro/${urlSlug}${slugPart}`

  return (
    <div className="space-y-6">

      {/* ── Desktop: clean browser window ── */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2.5 flex items-center gap-1.5" style={{ color: 'var(--color-ink-faint)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
          Desktop
        </p>
        <div style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.13)', border: '1px solid rgba(0,0,0,0.08)' }}>
          {/* Browser toolbar */}
          <div style={{ backgroundColor: '#F0EFED', padding: '7px 10px 6px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #DDD9D4' }}>
            {/* Traffic lights */}
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: c }} />
              ))}
            </div>
            {/* Address bar */}
            <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 6, padding: '3px 8px', fontSize: 8.5, color: '#555', display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #E0DDD9' }}>
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span style={{ color: '#777' }}>{previewUrl}</span>
            </div>
          </div>
          {/* Page content */}
          <div style={{ backgroundColor: bg, maxHeight: 380, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Hero — full width above both columns */}
            <PreviewHero primary={primary} accent={accent} bg={bg} coverPreviewUrl={coverPreviewUrl} s={0.54} heroHeight={heroHeight} />
            {/* Two columns — no hero inside PageBody (pass undefined to skip it) */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <PreviewPageBody
                  primary={primary} accent={accent} bg={bg} title={title}
                  description={description} goalAmount={goalAmount}
                  visibleItems={visibleItems} coverPreviewUrl={undefined}
                  donationVerb={config.copy.donationVerb} s={0.54} heroHeight={heroHeight}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <PreviewDonorSidebar primary={primary} s={0.54} />
                {/* Photo strip below donor sidebar */}
                {photoFiles.length > 0 && (
                  <PreviewPhotoStrip photos={photoFiles} bg={bg} primary={primary} s={0.54} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: 20:9 phone ── */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2.5 flex items-center gap-1.5" style={{ color: 'var(--color-ink-faint)' }}>
          <svg width="10" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>
          Mobil
        </p>
        <div className="mx-auto" style={{ width: 220 }}>
          <div style={{ backgroundColor: '#1A1A1A', borderRadius: 36, padding: '4px', boxShadow: '0 16px 50px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.07)', position: 'relative' }}>
            {/* Side buttons */}
            <div style={{ position: 'absolute', left: -3, top: 64, width: 3, height: 26, backgroundColor: '#2A2A2A', borderRadius: '2px 0 0 2px' }} />
            <div style={{ position: 'absolute', left: -3, top: 98, width: 3, height: 20, backgroundColor: '#2A2A2A', borderRadius: '2px 0 0 2px' }} />
            <div style={{ position: 'absolute', right: -3, top: 84, width: 3, height: 32, backgroundColor: '#2A2A2A', borderRadius: '0 2px 2px 0' }} />
            {/* Screen */}
            <div style={{ backgroundColor: '#000', borderRadius: 32, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: Math.round(220 * 20 / 9) }}>
              {/* Status bar */}
              <div style={{ backgroundColor: '#000', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 16px 4px' }}>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>9:41</span>
                <div style={{ width: 48, height: 11, backgroundColor: '#1A1A1A', borderRadius: 8 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <svg width="9" height="7" viewBox="0 0 12 9" fill="rgba(255,255,255,0.7)"><path d="M0 9h2V5H0v4zm3 0h2V3H3v6zm3 0h2V1H6v8zm3 0h2V0H9v9z"/></svg>
                  <svg width="9" height="7" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
                  <svg width="13" height="7" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/><rect x="21" y="3.5" width="2.5" height="5" rx="1" fill="rgba(255,255,255,0.7)"/><rect x="2" y="2" width="15" height="8" rx="2" fill="rgba(255,255,255,0.7)"/></svg>
                </div>
              </div>
              {/* Page — full width, no sidebar */}
              <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}>
                  <PreviewPageBody
                    primary={primary} accent={accent} bg={bg} title={title}
                    description={description} goalAmount={goalAmount}
                    visibleItems={visibleItems} coverPreviewUrl={coverPreviewUrl}
                    donationVerb={config.copy.donationVerb} s={0.72} heroHeight={heroHeight}
                  />
                  {photoFiles.length > 0 && (
                    <PreviewPhotoStrip photos={photoFiles} bg={bg} primary={primary} s={0.72} />
                  )}
                </div>
              </div>
              {/* Home indicator */}
              <div style={{ backgroundColor: bg, flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '6px 0 5px' }}>
                <div style={{ width: 52, height: 3, backgroundColor: '#C0B4A8', borderRadius: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

// ── Preview photo strip ───────────────────────────────────────────────────────

const PREVIEW_ROTATIONS = [-2.5, 1.8, -1.4, 2.2, -0.9, 3.0]

function PreviewPhotoStrip({ photos, bg, primary, s }: {
  photos: Array<{ previewUrl: string; caption: string }>
  bg: string
  primary: string
  s: number
}) {
  const r = (n: number) => Math.round(n * s)
  const cardW = r(72)
  const imgH = r(52)
  const pad = r(4)

  return (
    <div style={{ backgroundColor: bg, padding: `${r(8)}px ${r(12)}px ${r(10)}px` }}>
      <p style={{ fontSize: r(7), fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A7B60', marginBottom: r(6) }}>
        Galerie foto
      </p>
      <div style={{ display: 'flex', gap: r(6), overflowX: 'hidden' }}>
        {photos.slice(0, 4).map((photo, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: cardW,
              backgroundColor: '#FFFEFB',
              padding: pad,
              paddingBottom: r(10),
              borderRadius: 2,
              transform: `rotate(${PREVIEW_ROTATIONS[i % PREVIEW_ROTATIONS.length]}deg)`,
              boxShadow: '0 1px 4px rgba(28,18,9,0.12)',
              border: '1px solid rgba(212,196,176,0.5)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.previewUrl} alt="" style={{ width: '100%', height: imgH, objectFit: 'cover', borderRadius: 1, display: 'block' }} />
            {photo.caption && (
              <p style={{
                marginTop: r(4),
                fontSize: r(6),
                color: primary,
                fontStyle: 'italic',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {photo.caption}
              </p>
            )}
          </div>
        ))}
        {photos.length > 4 && (
          <div style={{ flexShrink: 0, width: cardW, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: r(7), color: '#9A7B60' }}>+{photos.length - 4}</span>
          </div>
        )}
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
  const [heroHeight, setHeroHeight] = useState(320)
  const [photoFiles, setPhotoFiles] = useState<Array<{ file: File; previewUrl: string; caption: string }>>([])
  const [expiresAt, setExpiresAt] = useState('')
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual')
  const [organiserCountry, setOrganiserCountry] = useState('RO')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

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
        organiserCountry: string
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
        setOrganiserCountry(draft.organiserCountry ?? 'RO')
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
        organiserCountry,
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
        coverHeroHeight: coverPreviewUrl ? heroHeight : undefined,
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

    if (photoFiles.length > 0 && data.event?.id) {
      for (const photo of photoFiles) {
        const formData = new FormData()
        formData.append('file', photo.file)
        if (photo.caption.trim()) formData.append('caption', photo.caption.trim())
        await fetch(`/api/events/${data.event.id}/photos`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        })
      }
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
        country: organiserCountry,
      }),
    })

    const connectData = (await connectRes.json()) as { accountId?: string; eventId?: string; error?: string }
    if (!connectRes.ok || !connectData.eventId) {
      setError(connectData.error ?? 'Eroare la configurarea plăților.')
      setLoading(false)
      return
    }

    const isDual = selectedConfig?.copy.pageTitle.includes('{name1}') ?? false
    const finalName = isDual && name2.trim() ? `${name} & ${name2}` : name
    router.push(`/dashboard/onboarding?eventId=${connectData.eventId}&name=${encodeURIComponent(finalName)}`)
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
                        label={EVENT_TYPE_META[selectedConfig.slug]?.nameLabel ?? 'Nume'}
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
                        <div className="space-y-3">
                          <div className="relative rounded-2xl overflow-hidden" style={{ height: 160 }}>
                            <Image src={coverPreviewUrl} alt="Copertă" fill className="object-cover" unoptimized />
                            <button
                              type="button"
                              onClick={() => {
                                setCoverImageFile(null)
                                setCoverPreviewUrl(null)
                                setHeroHeight(320)
                                if (coverInputRef.current) coverInputRef.current.value = ''
                              }}
                              className="absolute top-2 right-2 rounded-full px-3 py-1 text-xs font-semibold"
                              style={{ backgroundColor: 'rgba(30,58,47,0.75)', color: '#fff' }}
                            >
                              Elimină
                            </button>
                          </div>
                          {/* Hero height slider */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium" style={{ color: 'var(--color-ink-muted)' }}>
                                Înălțimea imaginii — {heroHeight}px
                              </label>
                              <span className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                                {heroHeight <= 220 ? 'Compact' : heroHeight <= 360 ? 'Normal' : 'Panoramic'}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={160}
                              max={500}
                              step={20}
                              value={heroHeight}
                              onChange={(e) => setHeroHeight(Number(e.target.value))}
                              className="w-full accent-amber-500"
                              style={{ cursor: 'pointer' }}
                            />
                            <div className="flex justify-between text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                              <span>160px</span>
                              <span>500px</span>
                            </div>
                            <p className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                              Pentru rezultate optime, folosește o imagine landscape (orizontală).
                            </p>
                          </div>
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

                    {/* Gallery photos */}
                    <div>
                      <FieldLabel label="Galerie foto (opțional)" hint="Adaugă fotografii cu legendă. Apar pe pagina ta ca o galerie polaroid." />
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? [])
                          const remaining = 20 - photoFiles.length
                          files.slice(0, remaining).forEach((file) => {
                            const previewUrl = URL.createObjectURL(file)
                            setPhotoFiles((prev) => [...prev, { file, previewUrl, caption: '' }])
                          })
                          if (photoInputRef.current) photoInputRef.current.value = ''
                        }}
                      />

                      {photoFiles.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {photoFiles.map((photo, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl overflow-hidden"
                              style={{ border: '1px solid var(--color-border)', backgroundColor: '#FFFDFB' }}
                            >
                              <div className="relative w-full" style={{ height: 80 }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={photo.previewUrl} alt="" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setPhotoFiles((prev) => prev.filter((_, i) => i !== idx))}
                                  className="absolute top-1 right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                                  style={{ backgroundColor: 'rgba(30,18,9,0.65)', color: '#fff' }}
                                >×</button>
                              </div>
                              <div className="px-2 py-1.5">
                                <input
                                  type="text"
                                  value={photo.caption}
                                  onChange={(e) => setPhotoFiles((prev) => prev.map((p, i) => i === idx ? { ...p, caption: e.target.value } : p))}
                                  placeholder="Legendă (opțional)..."
                                  className="w-full text-xs outline-none bg-transparent"
                                  style={{ color: 'var(--color-ink-muted)', borderBottom: '1px solid var(--color-border)' }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {photoFiles.length < 20 && (
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="w-full rounded-2xl py-4 text-sm transition-all flex flex-col items-center gap-1.5"
                          style={{ border: '1.5px dashed var(--color-border)', color: 'var(--color-ink-faint)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-amber)'; e.currentTarget.style.color = 'var(--color-amber)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-ink-faint)' }}
                        >
                          <ImagePlus size={18} strokeWidth={1.5} />
                          <span className="font-medium" style={{ color: 'var(--color-ink-muted)' }}>
                            {photoFiles.length === 0 ? 'Adaugă fotografii' : '+ Mai adaugă'}
                          </span>
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

                  {/* Country of bank account */}
                  <div>
                    <FieldLabel label="Țara contului bancar" hint="Selectează țara IBAN-ului în care vrei să primești donațiile." />
                    <select
                      value={organiserCountry}
                      onChange={(e) => setOrganiserCountry(e.target.value)}
                      style={{
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-ink)',
                        backgroundColor: 'var(--color-bg)',
                        borderRadius: '0.75rem',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        width: '100%',
                        outline: 'none',
                      }}
                    >
                      <option value="RO">🇷🇴 România — RON</option>
                      <option value="GB">🇬🇧 United Kingdom — GBP</option>
                      <option value="DE">🇩🇪 Germania — EUR</option>
                      <option value="FR">🇫🇷 Franța — EUR</option>
                      <option value="IT">🇮🇹 Italia — EUR</option>
                      <option value="ES">🇪🇸 Spania — EUR</option>
                      <option value="AT">🇦🇹 Austria — EUR</option>
                      <option value="BE">🇧🇪 Belgia — EUR</option>
                      <option value="NL">🇳🇱 Olanda — EUR</option>
                      <option value="SE">🇸🇪 Suedia — SEK</option>
                      <option value="NO">🇳🇴 Norvegia — NOK</option>
                      <option value="DK">🇩🇰 Danemarca — DKK</option>
                      <option value="CH">🇨🇭 Elveția — CHF</option>
                      <option value="PL">🇵🇱 Polonia — PLN</option>
                      <option value="CZ">🇨🇿 Cehia — CZK</option>
                      <option value="HU">🇭🇺 Ungaria — HUF</option>
                      <option value="US">🇺🇸 SUA — USD</option>
                      <option value="CA">🇨🇦 Canada — CAD</option>
                      <option value="AU">🇦🇺 Australia — AUD</option>
                    </select>
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
                        ['Țara cont bancar', organiserCountry],
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
                heroHeight={heroHeight}
                photoFiles={photoFiles}
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
