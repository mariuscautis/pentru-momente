import Link from 'next/link'
import { Nav } from '@/components/Nav'
import {
  Flame, Gem, Baby, HeartPulse, Sparkles,
  BadgePercent, ShieldCheck, UserCheck, Landmark,
  Check, Star, Lock,
} from 'lucide-react'

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Creezi pagina',
    description: 'Alegi tipul evenimentului, adaugi o descriere și o listă de articole sau un fond general. Durează 3 minute.',
  },
  {
    step: '2',
    title: 'Distribui link-ul',
    description: 'Trimiți link-ul pe WhatsApp, Facebook sau îl afișezi pe un card QR la eveniment.',
  },
  {
    step: '3',
    title: 'Donatorii contribuie',
    description: 'Oricine poate dona cu cardul, fără cont. Aleg suma, lasă un mesaj și plătesc în 30 de secunde.',
  },
  {
    step: '4',
    title: 'Primești banii',
    description: 'Retragi fondurile direct în contul tău bancar românesc, oricând dorești.',
  },
]

const EVENT_TYPES = [
  { slug: 'inmormantare', label: 'Înmormântare', description: 'Coroane digitale, lumânări și contribuții pentru familia îndoliată.', bg: '#F5F0EB', Icon: Flame },
  { slug: 'nunta',        label: 'Nuntă',        description: 'Fond lună de miere, registru de cadouri și experiențe pentru miri.',  bg: '#FBF5EE', Icon: Gem },
  { slug: 'bebe',         label: 'Bebe nou',     description: 'Listă de dorințe și fond general pentru familia cu un nou-născut.',    bg: '#EEF5FB', Icon: Baby },
  { slug: 'sanatate',     label: 'Sănătate',     description: 'Strânge fonduri pentru tratamente medicale, operații sau recuperare.', bg: '#EEF8F2', Icon: HeartPulse },
  { slug: 'altele',       label: 'Altele',       description: 'Orice altă cauză sau eveniment pentru care vrei să strângi fonduri.',  bg: '#F5F0FB', Icon: Sparkles },
]

const TESTIMONIALS = [
  {
    name: 'Andreea M.',
    location: 'Cluj-Napoca',
    eventType: 'Înmormântare',
    eventColor: '#F5F0EB',
    eventTextColor: '#7A5A3A',
    quote: 'Am creat pagina în câteva minute, chiar în ziua în care am aflat vestea. Familia a primit sprijinul comunității fără să fie nevoie să cerem nimic personal. A fost o ușurare imensă.',
    stars: 5,
  },
  {
    name: 'Bogdan & Ioana T.',
    location: 'București',
    eventType: 'Nuntă',
    eventColor: '#FBF5EE',
    eventTextColor: '#8A6A3A',
    quote: 'În loc de plicuri, am distribuit link-ul pe grupul de WhatsApp. Toată lumea a donat comod, inclusiv rudele din diaspora. Banii au ajuns direct în contul nostru, fără bătăi de cap.',
    stars: 5,
  },
  {
    name: 'Mihai C.',
    location: 'Timișoara',
    eventType: 'Sănătate',
    eventColor: '#EEF8F2',
    eventTextColor: '#3A7A5A',
    quote: 'Tatăl meu avea nevoie de o operație urgentă. Am strâns fondurile necesare în 3 zile. Transparența platformei a convins oamenii să doneze — știau exact unde merg banii.',
    stars: 5,
  },
]

const TRUST_POINTS = [
  { Icon: BadgePercent, title: 'Sprijin real, oferit în mod responsabil', description: 'Platforma nu percepe comision din donații. Taxele bancare de transfer sunt afișate transparent.' },
  { Icon: ShieldCheck,  title: 'Plăți securizate',          description: 'Toate plățile sunt procesate prin Stripe — același sistem folosit de milioane de companii din lume.' },
  { Icon: UserCheck,    title: 'Fără cont pentru donatori', description: 'Oricine poate dona în 30 de secunde, fără înregistrare. Zero fricțiune pentru cei dragi.' },
  { Icon: Landmark,     title: 'Retragere directă în cont', description: 'Fondurile ajung direct în IBAN-ul tău românesc prin transfer bancar securizat.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

      <Nav />

      {/* Hero */}
      <section className="px-4 py-14 sm:py-24 text-center">
        <div className="mx-auto max-w-2xl space-y-5">
          <div
            className="inline-flex items-center rounded-full px-4 py-1.5 text-xs sm:text-sm"
            style={{ backgroundColor: '#F5EDE3', color: '#9A6B45', border: '1px solid #E8D5C0' }}
          >
            Sprijin real, oferit în mod responsabil
          </div>
          <h1
            className="font-bold leading-tight tracking-tight"
            style={{ color: '#2D2016', fontSize: 'clamp(1.85rem, 5.5vw, 3.25rem)' }}
          >
            Strânge fonduri pentru<br />
            <span style={{ color: '#C4956A' }}>momentele care contează</span>
          </h1>
          <p
            className="leading-relaxed max-w-xl mx-auto"
            style={{ color: '#7A6652', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}
          >
            Creează o pagină de donații pentru un eveniment de viață în 3 minute.
            Distribuie link-ul. Primești banii direct în contul tău.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/create"
              className="rounded-xl px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#C4956A' }}
            >
              Creează o pagină gratuită
            </Link>
            <a
              href="#cum-functioneaza"
              className="rounded-xl border px-7 py-3.5 text-base font-semibold transition-colors hover:bg-white"
              style={{ borderColor: '#E0D0C0', color: '#7A6652' }}
            >
              Cum funcționează
            </a>
          </div>
        </div>
      </section>

      {/* Payment trust bar */}
      <section style={{ borderTop: '1px solid #EDE0D0', borderBottom: '1px solid #EDE0D0', backgroundColor: '#FFFDFB' }}>
        <div className="mx-auto max-w-5xl px-4 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="text-xs font-medium" style={{ color: '#B09070' }}>Plăți procesate prin</span>

          {/* Stripe badge */}
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ backgroundColor: '#F5EDE3', border: '1px solid #EDE0D0' }}>
            <svg width="40" height="17" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Stripe">
              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10.64 10.64 0 0 1-4.56.94c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.64zm-5.92-5.15c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.24c-1.12 0-1.84-.56-2.3-1.37l-.09 1.2h-3.84V.1l4.26-.89v5.02c.46-.25 1.26-.54 2.18-.54 3.93 0 5.98 2.9 5.98 7.64 0 5.37-2.53 8.91-6.19 8.91zm-.71-12.17c-.74 0-1.2.26-1.59.7l.02 5.53c.35.44.8.7 1.57.7 1.54 0 2.18-1.54 2.18-3.46 0-1.97-.65-3.47-2.18-3.47zM28.24 5.7V.11L32.5 0v5.28l-4.26.42zm0 14.37V6.01h4.27v14.06H28.24zm-4.34 0-3.96-7.89-1.01 7.89H14.7L11.65 6h4.22l1.5 8.51 1.1-8.51h3.78l1.22 8.56 1.52-8.56h4.17l-3.06 14.07h-4.2zm-14.32.17c-1.58 0-3.17-.4-3.98-.8V15.8c.86.54 2.1.96 3.25.96 1.12 0 1.73-.3 1.73-1 0-1.7-5.26-.95-5.26-5.02 0-2.56 2.07-4.11 5.13-4.11 1.3 0 2.58.28 3.47.67V10.5c-.87-.47-1.96-.8-3.1-.8-1 0-1.6.35-1.6 1 0 1.6 5.3.8 5.3 5.03 0 2.57-2.04 4.51-4.94 4.51z" fill="#635BFF"/>
            </svg>
          </div>

          <span className="text-xs font-medium hidden sm:block" style={{ color: '#D4C0A8' }}>·</span>
          <span className="text-xs font-medium" style={{ color: '#B09070' }}>Transferuri bancare prin</span>

          {/* Wise badge */}
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ backgroundColor: '#F5EDE3', border: '1px solid #EDE0D0' }}>
            <svg width="44" height="16" viewBox="0 0 70 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Wise">
              <path d="M0 6.5h5.5L9 17.5l4-11h4.5l4 11 3.5-11H30l-6.5 18h-5L14 13l-4.5 11.5h-5L0 6.5z" fill="#163300"/>
              <path d="M31.5 6.5h5v18h-5v-18zm2.5-6.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM39.5 19.5c1.5 1 3.5 1.8 5.5 1.8 1.8 0 2.8-.6 2.8-1.6 0-2.8-9.3-1.5-9.3-8.3 0-3.5 3-5.4 7-5.4 2.3 0 4.5.5 6 1.4v4.6c-1.5-.9-3.3-1.5-5.3-1.5-1.6 0-2.5.6-2.5 1.5 0 2.7 9.3 1.3 9.3 8.3 0 3.6-3 5.7-7.3 5.7-2.5 0-5-.7-6.7-1.8l.5-4.7zM57.5 15.5h10c-.2-2-1.5-3.5-4-3.5-2.3 0-3.8 1.3-4 3.5zm-5 1.5c0-5 3.5-11 9.5-11 5.7 0 9 4.3 9 10.5 0 .7 0 1.5-.1 2.3H57.8c.5 2.3 2.5 3.5 5 3.5 2 0 3.8-.6 5.3-1.6v4.5c-1.7 1-3.8 1.8-6.2 1.8-6 0-9.4-4.2-9.4-10z" fill="#163300"/>
            </svg>
          </div>

          <span className="text-xs font-medium hidden sm:block" style={{ color: '#D4C0A8' }}>·</span>

          {/* SSL / security badge */}
          <div className="flex items-center gap-1.5">
            <Lock size={13} strokeWidth={2} color="#22A066" />
            <span className="text-xs font-medium" style={{ color: '#5A7A5A' }}>Conexiune criptată SSL</span>
          </div>

          <span className="text-xs font-medium hidden sm:block" style={{ color: '#D4C0A8' }}>·</span>

          {/* GDPR badge */}
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} strokeWidth={2} color="#C4956A" />
            <span className="text-xs font-medium" style={{ color: '#7A6652' }}>Conformitate GDPR</span>
          </div>
        </div>
      </section>

      {/* Event types */}
      <section className="px-4 py-12 sm:py-16" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-2" style={{ color: '#2D2016' }}>
            Pentru orice moment important
          </h2>
          <p className="text-sm sm:text-base text-center mb-8 sm:mb-10" style={{ color: '#9A7B60' }}>
            Fiecare tip de eveniment vine cu articole sugerate și design potrivit contextului.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EVENT_TYPES.map(({ slug, label, description, bg, Icon }) => (
              <div
                key={slug}
                className="flex items-start gap-4 rounded-2xl p-4 sm:p-5"
                style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
              >
                <div
                  className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: bg }}
                >
                  <Icon size={18} strokeWidth={1.75} color="#7A6652" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#2D2016' }}>{label}</h3>
                  <p className="mt-0.5 text-xs sm:text-sm leading-relaxed" style={{ color: '#9A7B60' }}>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="cum-functioneaza" className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-2" style={{ color: '#2D2016' }}>
            Cum funcționează
          </h2>
          <p className="text-sm sm:text-base text-center mb-10" style={{ color: '#9A7B60' }}>
            De la creare la banii în cont — tot procesul durează câteva minute.
          </p>
          <div className="space-y-5">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: '#C4956A' }}
                >
                  {item.step}
                </div>
                <div className="pt-0.5">
                  <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#2D2016' }}>{item.title}</h3>
                  <p className="mt-0.5 text-xs sm:text-sm leading-relaxed" style={{ color: '#9A7B60' }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-4 py-12 sm:py-16" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-10" style={{ color: '#2D2016' }}>
            De ce pentrumomente?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {TRUST_POINTS.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 items-start rounded-2xl p-4 sm:p-5"
                style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
              >
                <div
                  className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: '#F5EDE3' }}
                >
                  <Icon size={18} strokeWidth={1.75} color="#C4956A" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#2D2016' }}>{title}</h3>
                  <p className="mt-0.5 text-xs sm:text-sm leading-relaxed" style={{ color: '#9A7B60' }}>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two audiences */}
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="rounded-2xl p-6 sm:p-8 space-y-4"
            style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#C4956A' }}>Organizator</p>
            <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#2D2016' }}>
              Creezi pagina, distribui link-ul
            </h3>
            <ul className="space-y-2.5">
              {['Pagina creată în 3 minute', 'Link unic de partajat pe WhatsApp', 'Urmărești donațiile în timp real', 'Retragi banii oricând, direct în IBAN'].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#7A6652' }}>
                  <Check size={14} strokeWidth={2.5} color="#C4956A" className="shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/create"
              className="block text-center rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#C4956A' }}
            >
              Creează o pagină
            </Link>
          </div>

          <div
            className="rounded-2xl p-6 sm:p-8 space-y-4"
            style={{ backgroundColor: '#F5EDE3', border: '1px solid #E0D0C0' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#C4956A' }}>Donator</p>
            <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#2D2016' }}>
              Primești link-ul, donezi în 30 de secunde
            </h3>
            <ul className="space-y-2.5">
              {['Fără cont, fără înregistrare', 'Card, Apple Pay sau Google Pay', 'Alegi dacă numele și suma sunt vizibile', 'Poți dona anonim'].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#7A6652' }}>
                  <Check size={14} strokeWidth={2.5} color="#C4956A" className="shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs" style={{ color: '#B09070' }}>
              Ai primit un link de la cineva? Deschide-l direct — nu e nevoie de nimic altceva.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-14 sm:py-20" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-center mb-2 font-semibold" style={{ color: '#C4956A' }}>Povești reale</p>
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-2" style={{ color: '#2D2016' }}>
            Ce spun organizatorii
          </h2>
          <p className="text-sm sm:text-base text-center mb-10" style={{ color: '#9A7B60' }}>
            Familii care au folosit platforma în momentele care au contat.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-5 sm:p-6 flex flex-col gap-4"
                style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={13} fill="#C4956A" color="#C4956A" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm leading-relaxed flex-1" style={{ color: '#5A4030' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center justify-between gap-2 pt-1" style={{ borderTop: '1px solid #EDE0D0' }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#2D2016' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: '#9A7B60' }}>{t.location}</p>
                  </div>
                  <span
                    className="text-xs font-medium rounded-full px-2.5 py-1 shrink-0"
                    style={{ backgroundColor: t.eventColor, color: t.eventTextColor }}
                  >
                    {t.eventType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-14 sm:py-20 text-center" style={{ backgroundColor: '#2D2016' }}>
        <div className="mx-auto max-w-xl space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Gata să începi?</h2>
          <p className="text-sm sm:text-base" style={{ color: '#C4956A' }}>
            Creează prima pagină gratuit. Fără abonament, fără comision din donații.
          </p>
          <Link
            href="/create"
            className="inline-block rounded-xl px-8 py-3.5 text-base font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#C4956A', color: '#FFFDFB' }}
          >
            Creează o pagină gratuită
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-4 py-6 text-center text-xs sm:text-sm"
        style={{ borderTop: '1px solid #EDE0D0', color: '#B09070', backgroundColor: '#FDFAF7' }}
      >
        <p>© 2026 pentrumomente.ro · Plăți procesate de Stripe · Transferuri bancare prin Wise</p>
      </footer>

    </div>
  )
}
