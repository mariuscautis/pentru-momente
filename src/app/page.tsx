import Link from 'next/link'
import {
  Flame, Gem, Baby, HeartPulse, Sparkles,
  BadgePercent, ShieldCheck, UserCheck, Landmark,
  Check,
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

const TRUST_POINTS = [
  { Icon: BadgePercent, title: '100% ajunge la familie',    description: 'Nu reținem niciun procent din donații. Monetizarea platformei este printr-un bacșiș opțional al donatorului.' },
  { Icon: ShieldCheck,  title: 'Plăți securizate',          description: 'Toate plățile sunt procesate prin Stripe — același sistem folosit de milioane de companii din lume.' },
  { Icon: UserCheck,    title: 'Fără cont pentru donatori', description: 'Oricine poate dona în 30 de secunde, fără înregistrare. Zero fricțiune pentru cei dragi.' },
  { Icon: Landmark,     title: 'Retragere directă în cont', description: 'Fondurile ajung direct în IBAN-ul tău românesc prin transfer bancar securizat.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

      {/* Nav */}
      <nav className="px-4 py-3" style={{ borderBottom: '1px solid #F0EBE3' }}>
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <span className="shrink-0 text-lg font-bold tracking-tight" style={{ color: '#2D2016' }}>
            pentru<span style={{ color: '#C4956A' }}>momente</span>
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:bg-white whitespace-nowrap"
              style={{ color: '#7A6652' }}
            >
              Intră în cont
            </Link>
            <Link
              href="/create"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: '#C4956A' }}
            >
              Creează pagina
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 py-14 sm:py-24 text-center">
        <div className="mx-auto max-w-2xl space-y-5">
          <div
            className="inline-flex items-center rounded-full px-4 py-1.5 text-xs sm:text-sm"
            style={{ backgroundColor: '#F5EDE3', color: '#9A6B45', border: '1px solid #E8D5C0' }}
          >
            100% din donații ajunge la familie
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
