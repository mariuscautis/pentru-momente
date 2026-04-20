import Link from 'next/link'
import { Nav } from '@/components/Nav'
import {
  Flame, Gem, Baby, HeartPulse, Sparkles,
  BadgePercent, ShieldCheck, UserCheck, Landmark,
  Check, Star, Lock, ArrowRight,
} from 'lucide-react'
import { supabaseAdmin } from '@/lib/db/supabase'

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
    description: 'Alegi tipul evenimentului, adaugi o descriere și o listă de articole sau un fond general. Durează 3 minute.',
  },
  {
    step: '02',
    title: 'Distribui link-ul',
    description: 'Trimiți link-ul pe WhatsApp, Facebook sau îl afișezi pe un card QR la eveniment.',
  },
  {
    step: '03',
    title: 'Donatorii contribuie',
    description: 'Oricine poate dona cu cardul, fără cont. Aleg suma, lasă un mesaj și plătesc în 30 de secunde.',
  },
  {
    step: '04',
    title: 'Primești banii',
    description: 'Fondurile ajung direct în contul tău bancar românesc, fără intermediari.',
  },
]

const EVENT_TYPES = [
  { slug: 'inmormantare', label: 'Înmormântare', description: 'Coroane digitale, lumânări și contribuții pentru familia îndoliată.', Icon: Flame, iconColor: '#6B7280' },
  { slug: 'nunta',        label: 'Nuntă',        description: 'Fond lună de miere, registru de cadouri și experiențe pentru miri.',  Icon: Gem,       iconColor: '#D4A020' },
  { slug: 'bebe',         label: 'Bebe nou',     description: 'Listă de dorințe și fond general pentru familia cu un nou-născut.',    Icon: Baby,      iconColor: '#3B82F6' },
  { slug: 'sanatate',     label: 'Sănătate',     description: 'Strânge fonduri pentru tratamente medicale, operații sau recuperare.', Icon: HeartPulse, iconColor: '#10B981' },
  { slug: 'altele',       label: 'Altele',       description: 'Orice altă cauză sau eveniment pentru care vrei să strângi fonduri.',  Icon: Sparkles,  iconColor: '#8B5CF6' },
]

const TESTIMONIALS = [
  {
    name: 'Andreea M.',
    location: 'Cluj-Napoca',
    eventType: 'Înmormântare',
    quote: 'Am creat pagina în câteva minute, chiar în ziua în care am aflat vestea. Familia a primit sprijinul comunității fără să fie nevoie să cerem nimic personal. A fost o ușurare imensă.',
    stars: 5,
  },
  {
    name: 'Bogdan & Ioana T.',
    location: 'București',
    eventType: 'Nuntă',
    quote: 'În loc de plicuri, am distribuit link-ul pe grupul de WhatsApp. Toată lumea a donat comod, inclusiv rudele din diaspora. Banii au ajuns direct în contul nostru, fără bătăi de cap.',
    stars: 5,
  },
  {
    name: 'Mihai C.',
    location: 'Timișoara',
    eventType: 'Sănătate',
    quote: 'Tatăl meu avea nevoie de o operație urgentă. Am strâns fondurile necesare în 3 zile. Transparența platformei a convins oamenii să doneze — știau exact unde merg banii.',
    stars: 5,
  },
]

const TRUST_POINTS = [
  { Icon: BadgePercent, title: 'Zero comision din donații', description: 'Toți banii donați ajung la organizator. Platforma se susține exclusiv din bacșișul opțional lăsat de donatori.' },
  { Icon: ShieldCheck,  title: 'Plăți securizate Stripe',  description: 'Toate plățile sunt procesate prin Stripe — standard global, cu criptare completă și autentificare 3D Secure.' },
  { Icon: UserCheck,    title: 'Fără cont pentru donatori',description: 'Oricine poate dona în 30 de secunde, fără înregistrare. Fricție zero pentru cei care vor să ajute.' },
  { Icon: Landmark,     title: 'Direct în IBAN românesc',  description: 'Fondurile ajung în contul tău bancar prin Stripe Connect — KYC gestionat de Stripe, nu de noi.' },
]

export default async function HomePage() {
  const comingSoon = await getComingSoonEnabled()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

      <Nav />

      {/* ── Hero ── */}
      <section style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div className="space-y-7">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{ backgroundColor: 'var(--color-amber-light)', color: 'var(--color-amber-dark)', border: '1px solid rgba(232,160,32,0.25)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-amber)' }} />
                Sprijin real, fără comision
              </div>

              <h1
                className="font-extrabold leading-[1.08] tracking-tight"
                style={{ color: 'var(--color-ink)', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
              >
                Strânge fonduri pentru<br />
                <span style={{ color: 'var(--color-amber)' }}>momentele care contează</span>
              </h1>

              <p
                className="leading-relaxed max-w-lg"
                style={{ color: 'var(--color-ink-muted)', fontSize: 'clamp(1rem, 1.8vw, 1.125rem)' }}
              >
                Creează o pagină de donații în 3 minute. Distribui link-ul.
                Banii ajung direct în contul tău românesc — fără intermediari, fără comision.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link
                  href="/create"
                  className="btn-press inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold text-white transition-all"
                  style={{ backgroundColor: 'var(--color-amber)', boxShadow: '0 4px 14px rgba(232,160,32,0.40)' }}
                  onMouseOver={undefined}
                >
                  Creează o pagină gratuită
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <a
                  href="#cum-functioneaza"
                  className="inline-flex items-center justify-center rounded-xl border px-7 py-3.5 text-base font-semibold transition-colors"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-ink-muted)', backgroundColor: 'transparent' }}
                >
                  Cum funcționează
                </a>
              </div>

              {/* Quick trust signals */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                {['Gratuit pentru organizatori', 'Card, Apple Pay, Google Pay', 'GDPR compliant'].map(item => (
                  <div key={item} className="flex items-center gap-1.5">
                    <Check size={13} strokeWidth={2.5} style={{ color: 'var(--color-amber)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--color-ink-muted)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: stats card */}
            <div
              className="rounded-2xl p-8 space-y-6 hidden lg:block"
              style={{ backgroundColor: 'var(--color-navy)', boxShadow: 'var(--shadow-lg)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-amber)' }}>
                Platforma în cifre
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: '3 min', label: 'pentru a crea o pagină' },
                  { value: '0%', label: 'comision din donații' },
                  { value: '30 sec', label: 'pentru a dona, fără cont' },
                  { value: '100%', label: 'direct în contul tău' },
                ].map(({ value, label }) => (
                  <div key={label} className="space-y-1">
                    <p className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-amber)' }}>{value}</p>
                    <p className="text-sm leading-snug" style={{ color: '#8895A7' }}>{label}</p>
                  </div>
                ))}
              </div>
              <div
                className="rounded-xl p-4 mt-2"
                style={{ backgroundColor: 'rgba(232,160,32,0.10)', border: '1px solid rgba(232,160,32,0.20)' }}
              >
                <p className="text-sm font-medium leading-relaxed" style={{ color: '#C8D0DB' }}>
                  Fondurile ajung <strong style={{ color: '#FFFFFF' }}>direct la organizator</strong> prin Stripe Connect — platforma nu atinge niciun leu donat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section style={{ backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--color-ink-faint)' }}>Plăți prin</span>
            <span className="font-bold text-sm tracking-tight" style={{ color: '#635BFF', letterSpacing: '-0.02em' }}>stripe</span>
          </div>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <div className="flex items-center gap-1.5">
            <Lock size={12} strokeWidth={2} style={{ color: '#10B981' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-ink-muted)' }}>Conexiune SSL criptată</span>
          </div>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} strokeWidth={2} style={{ color: 'var(--color-amber)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-ink-muted)' }}>Conformitate GDPR</span>
          </div>
          <span className="hidden sm:block" style={{ color: 'var(--color-border)' }}>·</span>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <ShieldCheck size={12} strokeWidth={2} style={{ color: '#10B981' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-ink-muted)' }}>Transferuri bancare securizate</span>
          </div>
        </div>
      </section>

      {/* ── Event types ── */}
      <section className="px-4 sm:px-6 py-16 sm:py-20" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 sm:mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-amber)' }}>Tipuri de evenimente</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
              Pentru orice moment important
            </h2>
            <p className="mt-2 text-base" style={{ color: 'var(--color-ink-muted)', maxWidth: '52ch' }}>
              Fiecare tip vine cu articole sugerate, design adaptat și mesaje potrivite contextului.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EVENT_TYPES.map(({ slug, label, description, Icon, iconColor }) => (
              <div
                key={slug}
                className="group flex items-start gap-4 rounded-xl p-5 transition-all"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'var(--color-bg-alt)' }}
                >
                  <Icon size={18} strokeWidth={1.75} color={iconColor} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base" style={{ color: 'var(--color-ink)' }}>{label}</h3>
                  <p className="mt-0.5 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="cum-functioneaza"
        className="px-4 sm:px-6 py-16 sm:py-20"
        style={{ backgroundColor: 'var(--color-navy)' }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-amber)' }}>Proces simplu</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Cum funcționează
            </h2>
            <p className="mt-2 text-base" style={{ color: '#8895A7', maxWidth: '52ch' }}>
              De la creare la banii în cont — tot procesul durează câteva minute.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map((item, idx) => (
              <div
                key={item.step}
                className="rounded-xl p-6 space-y-3"
                style={{
                  backgroundColor: 'var(--color-navy-mid)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  animationDelay: `${idx * 80}ms`,
                }}
              >
                <p className="text-4xl font-extrabold tracking-tighter" style={{ color: 'rgba(232,160,32,0.25)', fontVariantNumeric: 'tabular-nums' }}>
                  {item.step}
                </p>
                <h3 className="font-bold text-base text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8895A7' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust / Why us ── */}
      <section className="px-4 sm:px-6 py-16 sm:py-20" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 sm:mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-amber)' }}>De ce pentrumomente</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
              Construit pentru familii românești
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TRUST_POINTS.map(({ Icon, title, description }, idx) => (
              <div
                key={title}
                className="flex gap-4 items-start rounded-xl p-5"
                style={{
                  backgroundColor: idx % 2 === 0 ? 'var(--color-bg)' : 'var(--color-bg-alt)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'var(--color-amber-light)' }}
                >
                  <Icon size={18} strokeWidth={1.75} style={{ color: 'var(--color-amber-dark)' }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base" style={{ color: 'var(--color-ink)' }}>{title}</h3>
                  <p className="mt-0.5 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two audiences ── */}
      <section className="px-4 sm:px-6 py-16 sm:py-20" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Organizer */}
          <div
            className="rounded-2xl p-7 sm:p-8 flex flex-col gap-5"
            style={{ backgroundColor: 'var(--color-ink)', boxShadow: 'var(--shadow-md)' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-amber)' }}>Organizator</p>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
                Creezi pagina,<br />distribui link-ul
              </h3>
            </div>
            <ul className="space-y-3 flex-1">
              {['Pagina creată în 3 minute', 'Link unic de partajat pe WhatsApp', 'Urmărești donațiile în timp real', 'Retragi banii direct în IBAN-ul tău'].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#C8D0DB' }}>
                  <Check size={14} strokeWidth={2.5} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/create"
              className="btn-press flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all mt-1"
              style={{ backgroundColor: 'var(--color-amber)', boxShadow: '0 4px 14px rgba(232,160,32,0.35)' }}
            >
              Creează o pagină
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Donor */}
          <div
            className="rounded-2xl p-7 sm:p-8 flex flex-col gap-5"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-amber)' }}>Donator</p>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--color-ink)' }}>
                Primești link-ul,<br />donezi în 30 de secunde
              </h3>
            </div>
            <ul className="space-y-3 flex-1">
              {['Fără cont, fără înregistrare', 'Card, Apple Pay sau Google Pay', 'Alegi dacă numele și suma sunt vizibile', 'Poți dona anonim'].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                  <Check size={14} strokeWidth={2.5} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
            <p
              className="text-xs rounded-xl px-4 py-3 mt-1"
              style={{ color: 'var(--color-ink-muted)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border-faint)' }}
            >
              Ai primit un link de la cineva? Deschide-l direct — nu e nevoie de nimic altceva.
            </p>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-4 sm:px-6 py-16 sm:py-20" style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 sm:mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-amber)' }}>Povești reale</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
              Ce spun organizatorii
            </h2>
            <p className="mt-2 text-base" style={{ color: 'var(--color-ink-muted)', maxWidth: '52ch' }}>
              Familii care au folosit platforma în momentele care au contat.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={13} fill="var(--color-amber)" color="var(--color-amber)" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-ink)' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between gap-2 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>{t.location}</p>
                  </div>
                  <span
                    className="text-xs font-semibold rounded-lg px-2.5 py-1 shrink-0"
                    style={{ backgroundColor: 'var(--color-amber-light)', color: 'var(--color-amber-dark)' }}
                  >
                    {t.eventType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="px-4 sm:px-6 py-16 sm:py-24"
        style={{ backgroundColor: 'var(--color-navy)' }}
      >
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Gata să strângi fonduri<br />pentru ce contează cu adevărat?
          </h2>
          <p className="text-base sm:text-lg" style={{ color: '#8895A7' }}>
            Creează prima pagină gratuit. Zero abonament, zero comision din donații.
          </p>
          <Link
            href="/create"
            className="btn-press inline-flex items-center gap-2.5 rounded-xl px-9 py-4 text-base font-bold text-white transition-all"
            style={{ backgroundColor: 'var(--color-amber)', boxShadow: '0 6px 20px rgba(232,160,32,0.45)' }}
          >
            Creează o pagină gratuită
            <ArrowRight size={17} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-4 sm:px-6 py-6 text-center text-xs"
        style={{ backgroundColor: 'var(--color-navy-mid)', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#4A5568' }}
      >
        <p>© 2026 pentrumomente.ro · Plăți procesate de Stripe · Transferuri bancare prin Stripe Connect</p>
      </footer>

      {/* ── Coming soon overlay ── */}
      {comingSoon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(15,25,35,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
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

    </div>
  )
}
