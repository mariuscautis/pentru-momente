import Link from 'next/link'
import { Nav } from '@/components/Nav'
import {
  Flame, Gem, Baby, HeartPulse, Sparkles,
  ShieldCheck, UserCheck, Landmark,
  ArrowRight, Check, Lock, BadgePercent,
} from 'lucide-react'
import { supabaseAdmin } from '@/lib/db/supabase'
import { getAllTestimonials } from '@/lib/db/admin'
import { TestimonialsSlider } from '@/components/TestimonialsSlider/TestimonialsSlider'

export const dynamic = 'force-dynamic'

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
    step: '01',
    title: 'Creezi pagina',
    description: 'Alegi tipul evenimentului, adaugi o descriere și articole. Durează 3 minute.',
  },
  {
    step: '02',
    title: 'Distribui link-ul',
    description: 'Pe WhatsApp, Facebook sau card QR la eveniment.',
  },
  {
    step: '03',
    title: 'Donatorii contribuie',
    description: 'Oricine donează cu cardul în 30 de secunde, fără cont.',
  },
  {
    step: '04',
    title: 'Primești banii',
    description: 'Fondurile ajung direct în contul tău bancar românesc.',
  },
]

const EVENT_TYPES = [
  { slug: 'inmormantare', label: 'Înmormântare', description: 'Coroane digitale, lumânări și contribuții pentru familia îndoliată.', Icon: Flame, iconColor: '#6B7280', bgColor: '#F3F4F6' },
  { slug: 'nunta', label: 'Nuntă', description: 'Fond lună de miere, registru de cadouri și experiențe pentru miri.', Icon: Gem, iconColor: '#B8860B', bgColor: '#FFFBEB' },
  { slug: 'bebe', label: 'Bebe nou', description: 'Listă de dorințe și fond general pentru familia cu un nou-născut.', Icon: Baby, iconColor: '#2563EB', bgColor: '#EFF6FF' },
  { slug: 'sanatate', label: 'Sănătate', description: 'Strânge fonduri pentru tratamente medicale, operații sau recuperare.', Icon: HeartPulse, iconColor: '#059669', bgColor: '#ECFDF5' },
  { slug: 'altele', label: 'Altele', description: 'Orice altă cauză sau eveniment pentru care vrei să strângi fonduri.', Icon: Sparkles, iconColor: '#7C3AED', bgColor: '#F5F3FF' },
]

const TRUST_POINTS = [
  { Icon: BadgePercent, title: 'Transparent de la primul leu', description: 'Comisioanele sunt afișate clar înainte de orice plată. Nicio taxă ascunsă, nicio surpriză.' },
  { Icon: ShieldCheck, title: 'Plăți securizate Stripe', description: 'Standard global, criptare completă și autentificare 3D Secure pentru fiecare tranzacție.' },
  { Icon: UserCheck, title: 'Fără cont pentru donatori', description: 'Oricine poate dona în 30 de secunde, fără înregistrare. Fricție zero.' },
  { Icon: Landmark, title: 'Direct în contul tău bancar', description: 'Fondurile ajung în IBAN-ul tău românesc prin Stripe Connect — rapid și fără birocrație.' },
]

export default async function HomePage() {
  const [comingSoon, allTestimonials] = await Promise.all([
    getComingSoonEnabled(),
    getAllTestimonials().catch(() => []),
  ])
  const testimonials = allTestimonials
    .filter(t => t.isActive)
    .map(t => ({ id: t.id, quote: t.quote, name: t.name, city: t.city, eventType: t.eventType, imageUrl: t.imageUrl }))

  const FeaturedEventIcon = EVENT_TYPES[0].Icon
  const featuredEvent = EVENT_TYPES[0]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

      <Nav />

      {/* ── Hero — Asymmetric split ── */}
      <section style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-0 lg:gap-16 min-h-[100dvh] lg:min-h-0 lg:py-0 items-stretch">

            {/* Left — editorial copy */}
            <div className="flex flex-col justify-center py-16 sm:py-20 lg:py-24 space-y-8">

              <div className="space-y-2">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{ backgroundColor: 'var(--color-amber-light)', color: 'var(--color-amber-dark)', border: '1px solid rgba(232,160,32,0.30)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-amber)', animation: 'pulse-dot 2s ease-in-out infinite' }}
                  />
                  Sprijin real, transparent și sigur
                </div>

                <h1
                  className="font-extrabold tracking-tight leading-[1.06]"
                  style={{ color: 'var(--color-ink)', fontSize: 'clamp(2.4rem, 5.5vw, 4rem)' }}
                >
                  Strânge fonduri pentru<br />
                  <em className="not-italic" style={{ color: 'var(--color-amber)' }}>momentele</em><br />
                  care contează
                </h1>
              </div>

              <p
                className="leading-relaxed"
                style={{ color: 'var(--color-ink-muted)', fontSize: 'clamp(1rem, 1.6vw, 1.1rem)', maxWidth: '48ch' }}
              >
                Creează o pagină de donații în 3 minute. Distribui link-ul.
                Banii ajung direct în contul tău bancar românesc, simplu și securizat.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/create"
                  className="btn-press inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-[0.9375rem] font-bold text-white transition-all"
                  style={{ backgroundColor: 'var(--color-amber)', boxShadow: '0 4px 20px rgba(232,160,32,0.38)' }}
                >
                  Creează o pagină gratuită
                  <ArrowRight size={15} strokeWidth={2.5} />
                </Link>
                <a
                  href="#cum-functioneaza"
                  className="inline-flex items-center justify-center rounded-xl border px-7 py-3.5 text-[0.9375rem] font-semibold transition-colors"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-ink-muted)', backgroundColor: 'transparent' }}
                >
                  Cum funcționează
                </a>
              </div>

              {/* Trust signals row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {[
                  { icon: <Check size={12} strokeWidth={3} />, label: 'Pagina în 3 minute' },
                  { icon: <Check size={12} strokeWidth={3} />, label: 'Card, Apple Pay, Google Pay' },
                  { icon: <Lock size={12} strokeWidth={2.5} />, label: 'GDPR & SSL' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span style={{ color: 'var(--color-amber)' }}>{icon}</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--color-ink-faint)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — dark stat panel, full height on desktop */}
            <div
              className="hidden lg:flex flex-col justify-center p-10 space-y-8 relative overflow-hidden"
              style={{ backgroundColor: 'var(--color-navy)' }}
            >
              {/* Subtle ambient glow */}
              <div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(232,160,32,0.12) 0%, transparent 70%)' }}
                aria-hidden="true"
              />

              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--color-amber)' }}>
                Platforma în cifre
              </p>

              <div className="grid grid-cols-2 gap-8">
                {[
                  { value: '3 min', label: 'pentru a crea o pagină' },
                  { value: '0%', label: 'comision din donații' },
                  { value: '30 sec', label: 'pentru a dona, fără cont' },
                  { value: '100%', label: 'direct în contul tău' },
                ].map(({ value, label }) => (
                  <div key={label} className="space-y-1.5">
                    <p
                      className="font-extrabold tracking-tighter leading-none tabular-nums"
                      style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--color-amber)' }}
                    >
                      {value}
                    </p>
                    <p className="text-xs leading-snug" style={{ color: '#6B7E94' }}>{label}</p>
                  </div>
                ))}
              </div>

              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.18)' }}
              >
                <p className="text-[0.8125rem] leading-relaxed" style={{ color: '#8B9DB0' }}>
                  Fondurile ajung{' '}
                  <strong style={{ color: '#FFFFFF' }}>direct în contul tău bancar</strong>{' '}
                  prin Stripe Connect — cu transparență deplină la fiecare pas.
                </p>
              </div>

              {/* Payment logos row */}
              <div className="flex items-center gap-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-[11px] font-semibold" style={{ color: '#4A5568' }}>Plăți prin</span>
                <span className="font-bold text-sm tracking-tight" style={{ color: '#635BFF' }}>stripe</span>
                <span style={{ color: '#2A3A4A' }}>·</span>
                <div className="flex items-center gap-1">
                  <Lock size={11} strokeWidth={2} style={{ color: '#10B981' }} />
                  <span className="text-[11px] font-medium" style={{ color: '#4A5568' }}>SSL</span>
                </div>
                <span style={{ color: '#2A3A4A' }}>·</span>
                <span className="text-[11px] font-medium" style={{ color: '#4A5568' }}>GDPR</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust bar (mobile only equivalent) ── */}
      <section
        className="lg:hidden"
        style={{ backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight" style={{ color: '#635BFF' }}>stripe</span>
          </div>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <div className="flex items-center gap-1.5">
            <Lock size={11} strokeWidth={2} style={{ color: '#10B981' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-ink-muted)' }}>SSL criptat</span>
          </div>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={11} strokeWidth={2} style={{ color: 'var(--color-amber)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-ink-muted)' }}>GDPR</span>
          </div>
        </div>
      </section>

      {/* ── Event types — Asymmetric zig-zag ── */}
      <section className="px-4 sm:px-6 py-16 sm:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="mx-auto max-w-5xl">

          <div className="mb-12 lg:mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: 'var(--color-amber)' }}>
              Tipuri de evenimente
            </p>
            <h2
              className="font-extrabold tracking-tight"
              style={{ color: 'var(--color-ink)', fontSize: 'clamp(1.6rem, 3vw, 2.25rem)' }}
            >
              Pentru orice moment important
            </h2>
            <p className="mt-3 leading-relaxed" style={{ color: 'var(--color-ink-muted)', maxWidth: '50ch', fontSize: '1rem' }}>
              Fiecare tip vine cu articole sugerate, design adaptat și mesaje potrivite contextului.
            </p>
          </div>

          {/* Two-column asymmetric grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Large feature card — spans full width on mobile, left on desktop */}
            <div
              className="md:row-span-2 rounded-2xl p-7 flex flex-col justify-between min-h-[220px] md:min-h-[280px] group transition-all duration-300"
              style={{
                backgroundColor: featuredEvent.bgColor,
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
              >
                <FeaturedEventIcon size={20} strokeWidth={1.75} color={featuredEvent.iconColor} />
              </div>
              <div>
                <h3
                  className="font-extrabold tracking-tight mb-2"
                  style={{ color: 'var(--color-ink)', fontSize: '1.25rem' }}
                >
                  {featuredEvent.label}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                  {featuredEvent.description}
                </p>
              </div>
            </div>

            {/* Remaining 4 in compact style */}
            {EVENT_TYPES.slice(1).map(({ slug, label, description, Icon, iconColor, bgColor }) => (
              <div
                key={slug}
                className="rounded-2xl p-5 flex items-start gap-4 group transition-all duration-200"
                style={{
                  backgroundColor: bgColor,
                  border: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                >
                  <Icon size={18} strokeWidth={1.75} color={iconColor} />
                </div>
                <div>
                  <h3 className="font-bold text-[0.9375rem] mb-0.5" style={{ color: 'var(--color-ink)' }}>{label}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex">
            <Link
              href="/create"
              className="btn-press inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all"
              style={{ backgroundColor: 'var(--color-amber)', boxShadow: '0 4px 14px rgba(232,160,32,0.32)' }}
            >
              Alege tipul și creează pagina
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works — Horizontal steps on dark ── */}
      <section
        id="cum-functioneaza"
        className="px-4 sm:px-6 py-16 sm:py-24"
        style={{ backgroundColor: 'var(--color-navy)' }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 lg:mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: 'var(--color-amber)' }}>Proces simplu</p>
            <h2
              className="font-extrabold tracking-tight text-white"
              style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)' }}
            >
              Cum funcționează
            </h2>
            <p className="mt-3" style={{ color: '#6B7E94', maxWidth: '46ch', fontSize: '1rem' }}>
              De la creare la banii în cont — tot procesul durează câteva minute.
            </p>
          </div>

          {/* Steps — horizontal on desktop, vertical on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 relative">

            {/* Connector line (desktop only) */}
            <div
              className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px pointer-events-none"
              style={{ background: 'linear-gradient(to right, rgba(232,160,32,0.15) 0%, rgba(232,160,32,0.35) 50%, rgba(232,160,32,0.15) 100%)' }}
              aria-hidden="true"
            />

            {HOW_IT_WORKS.map((item, idx) => (
              <div
                key={item.step}
                className="relative flex flex-col lg:items-start gap-4 p-5 lg:p-6"
              >
                {/* Step number circle */}
                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'var(--color-navy-mid)',
                    border: '1px solid rgba(232,160,32,0.25)',
                  }}
                >
                  <span
                    className="font-extrabold tabular-nums leading-none"
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-amber)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {item.step}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-white text-[0.9375rem]">{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B7E94' }}>{item.description}</p>
                </div>

                {/* Mobile connector — vertical line between steps except last */}
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div
                    className="lg:hidden absolute left-11 top-full w-px h-4"
                    style={{ backgroundColor: 'rgba(232,160,32,0.2)' }}
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust — Why us, left-aligned ── */}
      <section className="px-4 sm:px-6 py-16 sm:py-24" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="mx-auto max-w-5xl">

          {/* Section header + grid in asymmetric layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-20 items-start">

            {/* Sticky label column */}
            <div className="lg:sticky lg:top-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: 'var(--color-amber)' }}>
                De ce pentrumomente
              </p>
              <h2
                className="font-extrabold tracking-tight"
                style={{ color: 'var(--color-ink)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}
              >
                Construit pentru familii românești
              </h2>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                Securitate, transparență și simplitate — valorile care nu se negociază.
              </p>
            </div>

            {/* Trust items — vertical stack with dividers */}
            <div className="divide-y" style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
              {TRUST_POINTS.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-5 items-start py-6"
                >
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-amber-light)' }}
                  >
                    <Icon size={17} strokeWidth={1.75} style={{ color: 'var(--color-amber-dark)' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[0.9375rem] mb-1" style={{ color: 'var(--color-ink)' }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{description}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Two audiences — side by side cards ── */}
      <section className="px-4 sm:px-6 py-16 sm:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="mx-auto max-w-5xl">

          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: 'var(--color-amber)' }}>
              Două roluri, un singur flux
            </p>
            <h2
              className="font-extrabold tracking-tight"
              style={{ color: 'var(--color-ink)', fontSize: 'clamp(1.6rem, 3vw, 2.25rem)' }}
            >
              Simplu pentru toți
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Organizer — dark */}
            <div
              className="rounded-2xl p-8 flex flex-col gap-6"
              style={{ backgroundColor: 'var(--color-ink)', boxShadow: 'var(--shadow-md)' }}
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: 'var(--color-amber)' }}>
                  Organizator
                </p>
                <h3
                  className="font-extrabold tracking-tight text-white leading-tight"
                  style={{ fontSize: '1.375rem' }}
                >
                  Creezi pagina,<br />distribui link-ul
                </h3>
              </div>

              <ul className="space-y-3 flex-1">
                {[
                  'Pagina creată în 3 minute',
                  'Link unic de partajat pe WhatsApp',
                  'Urmărești donațiile în timp real',
                  'Retragi banii direct în IBAN-ul tău',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: '#9FB0C0' }}>
                    <Check size={13} strokeWidth={2.5} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/create"
                className="btn-press flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all"
                style={{ backgroundColor: 'var(--color-amber)', boxShadow: '0 4px 14px rgba(232,160,32,0.35)' }}
              >
                Creează o pagină
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Donor — light */}
            <div
              className="rounded-2xl p-8 flex flex-col gap-6"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: 'var(--color-amber)' }}>
                  Donator
                </p>
                <h3
                  className="font-extrabold tracking-tight leading-tight"
                  style={{ color: 'var(--color-ink)', fontSize: '1.375rem' }}
                >
                  Primești link-ul,<br />donezi în 30 de secunde
                </h3>
              </div>

              <ul className="space-y-3 flex-1">
                {[
                  'Fără cont, fără înregistrare',
                  'Card, Apple Pay sau Google Pay',
                  'Alegi dacă numele și suma sunt vizibile',
                  'Poți dona anonim',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                    <Check size={13} strokeWidth={2.5} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>

              <p
                className="text-xs rounded-xl px-4 py-3"
                style={{ color: 'var(--color-ink-muted)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border-faint)' }}
              >
                Ai primit un link de la cineva? Deschide-l direct — nu e nevoie de nimic altceva.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {testimonials.length > 0 && (
        <section
          className="px-4 sm:px-6 py-16 sm:py-24"
          style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 sm:mb-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: 'var(--color-amber)' }}>
                Povești reale
              </p>
              <h2
                className="font-extrabold tracking-tight"
                style={{ color: 'var(--color-ink)', fontSize: 'clamp(1.6rem, 3vw, 2.25rem)' }}
              >
                Ce spun organizatorii
              </h2>
              <p className="mt-3" style={{ color: 'var(--color-ink-muted)', maxWidth: '50ch', fontSize: '1rem' }}>
                Familii care au folosit platforma în momentele care au contat.
              </p>
            </div>
            <TestimonialsSlider testimonials={testimonials} />
          </div>
        </section>
      )}

      {/* ── Final CTA — Left-aligned, navy ── */}
      <section
        className="px-4 sm:px-6 py-16 sm:py-28"
        style={{ backgroundColor: 'var(--color-navy)' }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">

            {/* Copy — left aligned */}
            <div className="space-y-5 max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--color-amber)' }}>
                Gata să începi?
              </p>
              <h2
                className="font-extrabold tracking-tight text-white leading-tight"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
              >
                Strânge fonduri pentru<br />ce contează cu adevărat
              </h2>
              <p style={{ color: '#6B7E94', fontSize: '1rem', maxWidth: '44ch' }}>
                Creează o pagină în 3 minute. Simplu, transparent și la îndemâna oricui.
              </p>
            </div>

            {/* CTA block */}
            <div className="flex flex-col gap-3 lg:items-end">
              <Link
                href="/create"
                className="btn-press inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4 text-[0.9375rem] font-bold text-white transition-all whitespace-nowrap"
                style={{ backgroundColor: 'var(--color-amber)', boxShadow: '0 6px 24px rgba(232,160,32,0.40)' }}
              >
                Creează o pagină gratuită
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <p className="text-xs" style={{ color: '#4A5568' }}>
                Gratuit · Fără card solicitat
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-4 sm:px-6 py-6 text-center text-xs"
        style={{ backgroundColor: 'var(--color-navy-mid)', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#3A4A5A' }}
      >
        <p>© 2026 pentrumomente.ro · Plăți procesate de Stripe · Transferuri bancare prin Stripe Connect</p>
      </footer>

      {/* ── Coming soon overlay ── */}
      {comingSoon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(15,25,35,0.80)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        >
          <div
            className="rounded-3xl text-center px-8 py-10 max-w-sm w-full"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}
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
              style={{ backgroundColor: 'var(--color-amber-light)', color: 'var(--color-amber-dark)', border: '1px solid rgba(232,160,32,0.25)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-amber)' }} />
              Lucrăm la lansare
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

    </div>
  )
}
