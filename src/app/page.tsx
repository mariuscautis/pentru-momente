import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import {
  Flame, Gem, Baby, HeartPulse, Sparkles,
  ArrowRight, Check, ShieldCheck, Lock,
  Heart, Users, Zap,
} from 'lucide-react'
import { supabaseAdmin } from '@/lib/db/supabase'
import { getAllTestimonials } from '@/lib/db/admin'
import { TestimonialsSlider } from '@/components/TestimonialsSlider/TestimonialsSlider'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('home', {
    title: 'Strânge fonduri pentru momentele care contează — pentrumomente.ro',
    description: 'Creează o pagină de donații pentru un eveniment de viață în 3 minute. Distribuie link-ul. Primești banii direct în contul tău românesc.',
    openGraph: {
      url: 'https://pentrumomente.ro',
      siteName: 'pentrumomente.ro',
      locale: 'ro_RO',
      type: 'website',
    },
  })
}

async function getComingSoonEnabled(): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'coming_soon_enabled')
      .single()
    return data?.value === 'true'
  } catch {
    return false
  }
}

const HOW_IT_WORKS = [
  {
    n: '1',
    title: 'Creezi pagina în 3 minute',
    description: 'Alegi tipul evenimentului, adaugi o descriere și o listă de articole sau un fond general.',
    icon: Zap,
  },
  {
    n: '2',
    title: 'Distribui link-ul',
    description: 'Pe WhatsApp, Facebook, Instagram sau afișat pe un card QR la eveniment.',
    icon: Users,
  },
  {
    n: '3',
    title: 'Banii ajung direct la tine',
    description: 'Donatorii plătesc cu cardul sau Apple Pay. Fondurile ajung direct în IBAN-ul tău.',
    icon: Heart,
  },
]

const EVENT_TYPES = [
  {
    slug: 'inmormantare',
    label: 'Înmormântare',
    sub: 'Coroane & tribut',
    description: 'Coroane digitale, lumânări și contribuții pentru familia îndoliată, cu toată demnitatea.',
    Icon: Flame,
    color: '#6B6052',
    bg: '#F0EDE8',
    border: '#DDD8D0',
  },
  {
    slug: 'nunta',
    label: 'Nuntă',
    sub: 'Fond & cadouri',
    description: 'Fond lună de miere, registru de cadouri și experiențe memorabile pentru miri.',
    Icon: Gem,
    color: '#8B6914',
    bg: '#FDF5E0',
    border: '#EDD898',
  },
  {
    slug: 'bebe',
    label: 'Nou-născut',
    sub: 'Wishlist & fond',
    description: 'Listă de dorințe și fond general pentru familia cu un nou-născut fericit.',
    Icon: Baby,
    color: '#2A5FA8',
    bg: '#EBF2FC',
    border: '#BEDAF5',
  },
  {
    slug: 'sanatate',
    label: 'Sănătate',
    sub: 'Tratamente & recuperare',
    description: 'Strânge fonduri pentru tratamente medicale, operații sau recuperare lungă.',
    Icon: HeartPulse,
    color: '#1A6B47',
    bg: '#E6F5EE',
    border: '#A8DFC2',
  },
  {
    slug: 'altele',
    label: 'Altele',
    sub: 'Orice cauză',
    description: 'Orice altă cauză sau eveniment pentru care vrei să strângi fonduri cu ușurință.',
    Icon: Sparkles,
    color: '#5C3A9A',
    bg: '#F2ECFB',
    border: '#C8B0EA',
  },
]

const TRUST_SIGNALS = [
  { label: '3 min', sub: 'creare pagină' },
  { label: '30 sec', sub: 'donație, fără cont' },
  { label: '100%', sub: 'direct în contul tău' },
  { label: 'SSL', sub: 'date protejate' },
]

const FuneralIcon = EVENT_TYPES[0].Icon
const WeddingIcon = EVENT_TYPES[1].Icon
const BabyIcon = EVENT_TYPES[2].Icon
const HealthIcon = EVENT_TYPES[3].Icon
const OtherIcon = EVENT_TYPES[4].Icon
const EventIcons = [FuneralIcon, WeddingIcon, BabyIcon, HealthIcon, OtherIcon]

export default async function HomePage() {
  const [comingSoon, allTestimonials] = await Promise.all([
    getComingSoonEnabled(),
    getAllTestimonials().catch(() => []),
  ])
  const testimonials = allTestimonials
    .filter(t => t.isActive)
    .map(t => ({
      id: t.id,
      quote: t.quote,
      name: t.name,
      city: t.city,
      eventType: t.eventType,
      imageUrl: t.imageUrl,
    }))

  return (
    <div style={{ backgroundColor: 'var(--color-bg)' }}>
      <Nav />

      {/* ══════════════════════════════════════════════
          HERO — Full bleed editorial, asymmetric
      ══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-forest)' }}
      >
        {/* Background texture — radial grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(ellipse 80% 60% at 70% 50%, rgba(212,136,42,0.10) 0%, transparent 70%),
              radial-gradient(ellipse 40% 80% at 10% 100%, rgba(255,255,255,0.04) 0%, transparent 60%)`,
          }}
        />

        {/* Large decorative numeral */}
        <span
          className="absolute right-0 top-1/2 -translate-y-1/2 font-extrabold leading-none select-none pointer-events-none hidden xl:block"
          aria-hidden="true"
          style={{
            fontSize: '32vw',
            color: 'rgba(255,255,255,0.02)',
            letterSpacing: '-0.06em',
            lineHeight: 1,
            transform: 'translateY(-50%) translateX(8%)',
          }}
        >
          PM
        </span>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-20 min-h-[100dvh] lg:min-h-0 items-center py-20 lg:py-28">

            {/* Left — headline copy */}
            <div className="space-y-9">

              {/* Label pill */}
              <div
                className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{
                  backgroundColor: 'rgba(212,136,42,0.15)',
                  border: '1px solid rgba(212,136,42,0.30)',
                  color: '#F0B860',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: '#F0B860', animation: 'pulse-dot 2.4s ease-in-out infinite' }}
                />
                Platforma românească pentru momentele care contează
              </div>

              {/* Headline — massive, tracking tight */}
              <div className="space-y-3">
                <h1
                  className="font-extrabold leading-[1.03] tracking-tight text-white"
                  style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5rem)' }}
                >
                  Strânge fonduri<br />
                  <span style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>pentru momentele</span><br />
                  care contează
                </h1>
                <p
                  className="leading-relaxed max-w-[46ch]"
                  style={{ color: '#C4D4CB', fontSize: 'clamp(1rem, 1.6vw, 1.125rem)' }}
                >
                  Creează o pagină de donații în 3 minute. Distribui link-ul.
                  Banii ajung direct în contul tău bancar — simplu, sigur și transparent.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/create"
                  className="btn-press btn-fill inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 font-bold text-white"
                  style={{
                    backgroundColor: 'var(--color-amber)',
                    boxShadow: 'var(--shadow-warm)',
                    fontSize: '0.9375rem',
                  }}
                >
                  <span>Creează o pagină gratuită</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <a
                  href="#cum-functioneaza"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 font-semibold transition-colors"
                  style={{
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.70)',
                    fontSize: '0.9375rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  Cum funcționează
                </a>
              </div>

              {/* Mini trust row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {[
                  { icon: <Check size={12} strokeWidth={3} />, t: 'Transparent la fiecare pas' },
                  { icon: <Lock size={12} strokeWidth={2.5} />, t: 'Stripe & SSL' },
                  { icon: <ShieldCheck size={12} strokeWidth={2} />, t: 'GDPR compliant' },
                ].map(({ icon, t }) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <span style={{ color: 'var(--color-amber)' }}>{icon}</span>
                    <span className="text-xs font-medium" style={{ color: '#A8BFB4' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating stat cards */}
            <div className="hidden lg:flex flex-col gap-4">

              {/* Big number card */}
              <div
                className="rounded-3xl p-7 relative overflow-hidden"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-5" style={{ color: '#A8BFB4' }}>
                  Platforma în cifre
                </p>
                <div className="grid grid-cols-2 gap-6">
                  {TRUST_SIGNALS.map(({ label, sub }) => (
                    <div key={sub} className="space-y-1">
                      <p
                        className="font-extrabold tracking-tight leading-none tabular-nums stat-enter"
                        style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.4rem)', color: 'var(--color-amber)' }}
                      >
                        {label}
                      </p>
                      <p className="text-xs" style={{ color: '#A8BFB4' }}>{sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security reassurance card */}
              <div
                className="rounded-2xl p-5 flex items-start gap-4"
                style={{
                  backgroundColor: 'rgba(212,136,42,0.08)',
                  border: '1px solid rgba(212,136,42,0.20)',
                }}
              >
                <div
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(212,136,42,0.15)' }}
                >
                  <ShieldCheck size={16} strokeWidth={2} style={{ color: '#F0B860' }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">Creat pentru momentele care contează</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#A8BFB4' }}>
                    Fie că e o nuntă, un botez sau un moment dificil — platforma se adaptează la povestea ta.
                  </p>
                </div>
              </div>

              {/* Event type pills */}
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map(({ label, color, bg }, i) => {
                  const Ic = EventIcons[i]
                  return (
                    <div
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{ backgroundColor: `${bg}18`, border: `1px solid ${color}28`, color: '#9DB0A0' }}
                    >
                      <Ic size={11} strokeWidth={2} style={{ color }} />
                      {label}
                    </div>
                  )
                })}
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════
          MARQUEE — scrolling trust bar
      ══════════════════════════════════════════════ */}
      <section
        className="py-4 overflow-hidden relative"
        style={{
          backgroundColor: 'var(--color-amber)',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <div className="animate-marquee inline-flex whitespace-nowrap items-center gap-0">
          {[...Array(2)].map((_, repeat) => (
            <div key={repeat} className="inline-flex items-center gap-0">
              {[
                'Plăți securizate Stripe',
                'Transparent la fiecare pas',
                'Pagina ta în 3 minute',
                'Donare în 30 de secunde',
                'Fără cont pentru donatori',
                'Direct în IBAN-ul tău',
                'GDPR compliant',
                'Apple Pay & Google Pay',
              ].map((text, i) => (
                <span key={i} className="inline-flex items-center">
                  <span
                    className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] px-6"
                    style={{ color: 'rgba(26,18,8,0.85)' }}
                  >
                    {text}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(26,18,8,0.35)' }}>◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          EVENT TYPES — Bold asymmetric bento
      ══════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 py-20 sm:py-28" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="mx-auto max-w-5xl">

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 lg:gap-16 items-start mb-14">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--color-amber-dark)' }}>
                5 tipuri de evenimente
              </p>
              <h2
                className="font-extrabold tracking-tight leading-tight"
                style={{ color: 'var(--color-ink)', fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)' }}
              >
                Pentru orice<br />moment din viață
              </h2>
            </div>
            <p
              className="leading-relaxed text-base lg:pt-12"
              style={{ color: 'var(--color-ink-muted)', maxWidth: '52ch' }}
            >
              Fiecare tip vine cu un design adaptat, articole sugerate și mesaje potrivite contextului emoțional.
              Nu există un format universal — fiecare moment are povestea lui.
            </p>
          </div>

          {/* Bento grid — 2 rows */}
          {/* Row 1: large featured (funeral) + two compact */}
          {/* Row 2: two compact side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Featured card — spans 2 rows, left column */}
            {(() => {
              const FIcon = EventIcons[0]
              const ft = EVENT_TYPES[0]
              return (
                <div
                  className="sm:row-span-2 rounded-3xl p-8 flex flex-col justify-between min-h-[260px] sm:min-h-[340px] card-lift"
                  style={{ backgroundColor: ft.bg, border: `1px solid ${ft.border}` }}
                >
                  <div>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                      style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                    >
                      <FIcon size={22} strokeWidth={1.5} color={ft.color} />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: ft.color, opacity: 0.7 }}>
                      {ft.sub}
                    </p>
                    <h3
                      className="font-extrabold tracking-tight mb-3"
                      style={{ color: 'var(--color-ink)', fontSize: '1.4rem' }}
                    >
                      {ft.label}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                      {ft.description}
                    </p>
                  </div>
                  <Link
                    href={`/create?type=${ft.slug}`}
                    className="btn-press inline-flex items-center gap-1.5 text-xs font-bold mt-6 link-underline"
                    style={{ color: ft.color }}
                  >
                    Creează pagină <ArrowRight size={12} strokeWidth={2.5} />
                  </Link>
                </div>
              )
            })()}

            {/* Remaining 4 compact cards */}
            {EVENT_TYPES.slice(1).map((et, i) => {
              const Ic = EventIcons[i + 1]
              return (
                <div
                  key={et.slug}
                  className="rounded-2xl p-6 flex flex-col gap-4 card-lift"
                  style={{ backgroundColor: et.bg, border: `1px solid ${et.border}` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                    >
                      <Ic size={18} strokeWidth={1.75} color={et.color} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-0.5" style={{ color: et.color, opacity: 0.7 }}>
                        {et.sub}
                      </p>
                      <h3 className="font-bold text-base" style={{ color: 'var(--color-ink)' }}>{et.label}</h3>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                    {et.description}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-10">
            <Link
              href="/create"
              className="btn-press btn-fill inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-bold text-white text-sm"
              style={{ backgroundColor: 'var(--color-amber)', boxShadow: 'var(--shadow-warm)' }}
            >
              Alege tipul și creează pagina
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS — 3 steps, linen bg
      ══════════════════════════════════════════════ */}
      <section
        id="cum-functioneaza"
        className="px-4 sm:px-6 py-20 sm:py-28"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div className="mx-auto max-w-5xl">

          <div className="mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--color-amber-dark)' }}>
              Proces simplu
            </p>
            <h2
              className="font-extrabold tracking-tight"
              style={{ color: 'var(--color-ink)', fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)' }}
            >
              De la idee la fonduri,<br />în câteva minute
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 gap-y-3 md:gap-y-0">
            {HOW_IT_WORKS.map(({ n, title, description, icon: StepIcon }) => (
              <div key={n} className="relative">
                <div
                  className="rounded-3xl p-7 h-full mx-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {/* Step circle with number */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--color-amber-light)', border: '1px solid rgba(212,136,42,0.20)' }}
                    >
                      <span className="font-extrabold text-lg" style={{ color: 'var(--color-amber)' }}>{n}</span>
                    </div>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-bg)' }}
                    >
                      <StepIcon size={15} strokeWidth={2} style={{ color: 'var(--color-ink-faint)' }} />
                    </div>
                  </div>
                  <h3
                    className="font-bold mb-2 leading-snug"
                    style={{ color: 'var(--color-ink)', fontSize: '1rem' }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DUAL AUDIENCE — organiser vs donor
          Forest green + linen split
      ══════════════════════════════════════════════ */}
      <section
        className="px-4 sm:px-6 py-20 sm:py-28"
        style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="mx-auto max-w-5xl">

          <div className="mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--color-amber-dark)' }}>
              Două roluri
            </p>
            <h2
              className="font-extrabold tracking-tight"
              style={{ color: 'var(--color-ink)', fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)' }}
            >
              Simplu pentru toată lumea
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Organizer — dark forest */}
            <div
              className="rounded-3xl p-8 sm:p-10 flex flex-col gap-7 relative overflow-hidden"
              style={{ backgroundColor: 'var(--color-forest)' }}
            >
              {/* Ambient glow */}
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
                aria-hidden="true"
                style={{ background: 'radial-gradient(circle, rgba(212,136,42,0.14) 0%, transparent 70%)' }}
              />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4" style={{ color: '#F0B860' }}>
                  Organizator
                </p>
                <h3
                  className="font-extrabold tracking-tight text-white leading-tight"
                  style={{ fontSize: '1.5rem' }}
                >
                  Creezi pagina,<br />distribui link-ul
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: '#7A9A88' }}>
                  Contul tău bancar primește banii direct, fără intermediari.
                </p>
              </div>
              <ul className="space-y-3.5 flex-1">
                {[
                  'Pagina creată în 3 minute',
                  'Link unic de partajat pe WhatsApp',
                  'Urmărești donațiile în timp real',
                  'Banii direct în IBAN-ul tău',
                  'Card QR pentru eveniment',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: '#9DB0A0' }}>
                    <span
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(212,136,42,0.20)', border: '1px solid rgba(212,136,42,0.30)' }}
                    >
                      <Check size={10} strokeWidth={3} style={{ color: 'var(--color-amber)' }} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/create"
                className="btn-press btn-fill inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-bold text-white transition-all"
                style={{ backgroundColor: 'var(--color-amber)', boxShadow: 'var(--shadow-warm)', fontSize: '0.9rem' }}
              >
                Creează o pagină gratuită
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Donor — linen */}
            <div
              className="rounded-3xl p-8 sm:p-10 flex flex-col gap-7"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4" style={{ color: 'var(--color-amber-dark)' }}>
                  Donator
                </p>
                <h3
                  className="font-extrabold tracking-tight leading-tight"
                  style={{ color: 'var(--color-ink)', fontSize: '1.5rem' }}
                >
                  Primești link-ul,<br />donezi în 30 de secunde
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                  Niciun cont, nicio înregistrare, nicio complicație.
                </p>
              </div>
              <ul className="space-y-3.5 flex-1">
                {[
                  'Fără cont, fără înregistrare',
                  'Card, Apple Pay sau Google Pay',
                  'Alegi dacă numele e vizibil',
                  'Poți dona complet anonim',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                    <span
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-amber-light)', border: '1px solid rgba(212,136,42,0.25)' }}
                    >
                      <Check size={10} strokeWidth={3} style={{ color: 'var(--color-amber)' }} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              {/* Reassurance note */}
              <div
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                  Ai primit un link de la cineva?{' '}
                  <strong style={{ color: 'var(--color-ink)' }}>Deschide-l direct</strong>{' '}
                  — nu e nevoie de nimic altceva.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TRUST — Why us, full-width linen
      ══════════════════════════════════════════════ */}
      <section
        className="px-4 sm:px-6 py-20 sm:py-28"
        style={{ backgroundColor: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="mx-auto max-w-5xl">

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 lg:gap-20 items-start">

            <div className="lg:sticky lg:top-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--color-amber-dark)' }}>
                De ce pentrumomente
              </p>
              <h2
                className="font-extrabold tracking-tight"
                style={{ color: 'var(--color-ink)', fontSize: 'clamp(1.6rem, 3vw, 2.25rem)' }}
              >
                Construit pentru<br />familii românești
              </h2>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)', maxWidth: '28ch' }}>
                Securitate, transparență și simplitate — valorile care nu se negociază.
              </p>
            </div>

            <div>
              {[
                {
                  icon: <ShieldCheck size={18} strokeWidth={1.75} />,
                  title: 'Plăți securizate prin Stripe',
                  body: 'Standard global, criptare completă și autentificare 3D Secure. Fiecare tranzacție este protejată la cel mai înalt nivel.',
                },
                {
                  icon: <Check size={18} strokeWidth={2.5} />,
                  title: 'Transparent de la primul leu',
                  body: 'Toate comisioanele sunt publicate pe pagina de tarife. Nicio taxă ascunsă, nicio surpriză după confirmare.',
                },
                {
                  icon: <Users size={18} strokeWidth={1.75} />,
                  title: 'Fără cont pentru donatori',
                  body: 'Oricine poate dona în 30 de secunde, fără înregistrare. Fricție zero pentru cei care vor să ajute.',
                },
                {
                  icon: <Heart size={18} strokeWidth={1.75} />,
                  title: 'Direct în contul tău bancar',
                  body: 'Fondurile ajung în IBAN-ul tău românesc prin Stripe Connect — rapid, securizat și fără birocrație suplimentară.',
                },
              ].map(({ icon, title, body }, i) => (
                <div
                  key={title}
                  className="flex gap-5 py-7"
                  style={{ borderBottom: i < 3 ? '1px solid var(--color-border)' : 'none' }}
                >
                  <div
                    className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: 'var(--color-amber-light)', color: 'var(--color-amber-dark)' }}
                  >
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-bold mb-1.5" style={{ color: 'var(--color-ink)', fontSize: '0.9375rem' }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)', maxWidth: '52ch' }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════ */}
      {testimonials.length > 0 && (
        <section
          className="px-4 sm:px-6 py-20 sm:py-28"
          style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--color-amber-dark)' }}>
                Povești reale
              </p>
              <h2
                className="font-extrabold tracking-tight"
                style={{ color: 'var(--color-ink)', fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)' }}
              >
                Ce spun organizatorii
              </h2>
              <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)', maxWidth: '50ch' }}>
                Familii care au folosit platforma în momentele care au contat cu adevărat.
              </p>
            </div>
            <TestimonialsSlider testimonials={testimonials} />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          FINAL CTA — Forest green, left-split
      ══════════════════════════════════════════════ */}
      <section
        className="px-4 sm:px-6 py-20 sm:py-32 relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-forest)' }}
      >
        {/* Ambient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(ellipse 60% 80% at 80% 50%, rgba(212,136,42,0.09) 0%, transparent 60%),
              radial-gradient(ellipse 40% 60% at 0% 100%, rgba(255,255,255,0.03) 0%, transparent 50%)`,
          }}
        />

        <div className="mx-auto max-w-5xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center">

            <div className="space-y-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: '#F0B860' }}>
                Gata să începi?
              </p>
              <h2
                className="font-extrabold tracking-tight text-white leading-tight"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
              >
                Strânge fonduri pentru<br />
                <em className="not-italic" style={{ color: 'var(--color-amber)' }}>ce contează</em> cu adevărat
              </h2>
              <p style={{ color: '#7A9A88', fontSize: '1rem', maxWidth: '46ch', lineHeight: 1.7 }}>
                Creează o pagină în 3 minute. Simplu, transparent și la îndemâna oricui din România.
              </p>

              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                {['Gratuit', 'Fără card solicitat', 'Pornești în 3 minute'].map(t => (
                  <div key={t} className="flex items-center gap-1.5">
                    <Check size={12} strokeWidth={3} style={{ color: 'var(--color-amber)' }} />
                    <span className="text-xs font-medium" style={{ color: '#A8BFB4' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <Link
                href="/create"
                className="btn-press btn-fill inline-flex items-center justify-center gap-2.5 rounded-2xl px-9 py-4.5 font-bold text-white whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--color-amber)',
                  boxShadow: 'var(--shadow-warm)',
                  fontSize: '0.9375rem',
                  paddingTop: '1.125rem',
                  paddingBottom: '1.125rem',
                }}
              >
                Creează o pagină gratuită
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <Link
                href="/login"
                className="text-xs text-center font-medium link-underline"
                style={{ color: '#4A6A58' }}
              >
                Ai deja un cont? Intră în cont →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer
        className="px-4 sm:px-6 py-7"
        style={{
          backgroundColor: 'var(--color-forest-mid)',
          borderTop: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-extrabold tracking-tight text-sm" style={{ color: 'rgba(255,255,255,0.90)' }}>
            pentru<span style={{ color: 'var(--color-amber)' }}>momente</span>
          </p>
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.55)' }}>
            © 2026 pentrumomente.ro · Plăți prin Stripe · Transferuri prin Stripe Connect
          </p>
          <div className="flex items-center gap-3">
            {/* Stripe badge */}
            <div
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <span className="font-bold text-xs tracking-tight" style={{ color: '#A89FF5' }}>stripe</span>
            </div>
            {/* SSL badge */}
            <div
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <Lock size={11} strokeWidth={2} style={{ color: '#6EE7B7' }} />
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.80)' }}>SSL</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════
          COMING SOON OVERLAY
      ══════════════════════════════════════════════ */}
      {comingSoon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{
            backgroundColor: 'rgba(26,18,8,0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="rounded-3xl text-center px-8 py-10 max-w-sm w-full"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--color-amber-light)' }}
            >
              <Sparkles size={24} strokeWidth={1.75} style={{ color: 'var(--color-amber-dark)' }} />
            </div>
            <h2 className="text-xl font-extrabold mb-2" style={{ color: 'var(--color-ink)' }}>
              Lansăm în curând
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-ink-muted)' }}>
              Platforma pentrumomente.ro este în curs de pregătire. Revino în curând.
            </p>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
              style={{ backgroundColor: 'var(--color-amber-light)', color: 'var(--color-amber-dark)', border: '1px solid rgba(212,136,42,0.25)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--color-amber)', animation: 'pulse-dot 2s ease-in-out infinite' }}
              />
              Lucrăm la lansare
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
