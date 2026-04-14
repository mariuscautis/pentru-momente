import Link from 'next/link'

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
  { slug: 'inmormantare', label: 'Înmormântare', description: 'Coroane digitale, lumânări și contribuții pentru familia îndoliată.', bg: '#F5F0EB', icon: 'candle' },
  { slug: 'nunta',        label: 'Nuntă',        description: 'Fond lună de miere, registru de cadouri și experiențe pentru miri.',  bg: '#FBF5EE', icon: 'rings'  },
  { slug: 'bebe',         label: 'Bebe nou',     description: 'Listă de dorințe și fond general pentru familia cu un nou-născut.',    bg: '#EEF5FB', icon: 'baby'   },
  { slug: 'sanatate',     label: 'Sănătate',     description: 'Strânge fonduri pentru tratamente medicale, operații sau recuperare.', bg: '#EEF8F2', icon: 'heart'  },
  { slug: 'altele',       label: 'Altele',       description: 'Orice altă cauză sau eveniment pentru care vrei să strângi fonduri.',  bg: '#F5F0FB', icon: 'star'   },
]

const TRUST_POINTS = [
  { icon: 'percent',  title: '100% ajunge la familie',    description: 'Nu reținem niciun procent din donații. Monetizarea platformei este printr-un bacșiș opțional al donatorului.' },
  { icon: 'lock',     title: 'Plăți securizate',          description: 'Toate plățile sunt procesate prin Stripe — același sistem folosit de milioane de companii din lume.' },
  { icon: 'user',     title: 'Fără cont pentru donatori', description: 'Oricine poate dona în 30 de secunde, fără înregistrare. Zero fricțiune pentru cei dragi.' },
  { icon: 'bank',     title: 'Retragere directă în cont', description: 'Fondurile ajung direct în IBAN-ul tău românesc prin transfer bancar securizat.' },
]

// ── SVG icon set ────────────────────────────────────────────────────────────

function Icon({ name, size = 22, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (name) {
    case 'candle': return (
      <svg {...props}><line x1="12" y1="2" x2="12" y2="4" /><rect x="9" y="4" width="6" height="14" rx="3" /><path d="M9 18c0 1.66 1.34 3 3 3s3-1.34 3-3" /></svg>
    )
    case 'rings': return (
      <svg {...props}><circle cx="8" cy="12" r="4" /><circle cx="16" cy="12" r="4" /></svg>
    )
    case 'baby': return (
      <svg {...props}><circle cx="12" cy="7" r="3" /><path d="M6 21v-2a6 6 0 0 1 12 0v2" /><path d="M15 11l1.5 2" /></svg>
    )
    case 'heart': return (
      <svg {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
    )
    case 'star': return (
      <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
    )
    case 'percent': return (
      <svg {...props}><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
    )
    case 'lock': return (
      <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
    )
    case 'user': return (
      <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    )
    case 'bank': return (
      <svg {...props}><polyline points="3 9 12 3 21 9" /><rect x="5" y="9" width="4" height="8" /><rect x="10" y="9" width="4" height="8" /><rect x="15" y="9" width="4" height="8" /><line x1="3" y1="17" x2="21" y2="17" /><line x1="2" y1="21" x2="22" y2="21" /></svg>
    )
    case 'check': return (
      <svg {...props}><polyline points="20 6 9 17 4 12" /></svg>
    )
    default: return null
  }
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

      {/* Nav */}
      <nav className="px-4 py-4" style={{ borderBottom: '1px solid #F0EBE3' }}>
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight" style={{ color: '#2D2016' }}>
            pentru<span style={{ color: '#C4956A' }}>momente</span>
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-sm font-medium transition-colors px-3 py-2"
              style={{ color: '#7A6652' }}
            >
              Intră în cont
            </Link>
            <Link
              href="/create"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#C4956A' }}
            >
              Creează pagina
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 py-16 sm:py-24 text-center">
        <div className="mx-auto max-w-2xl space-y-5 sm:space-y-6">
          <div
            className="inline-flex items-center rounded-full px-4 py-1.5 text-xs sm:text-sm"
            style={{ backgroundColor: '#F5EDE3', color: '#9A6B45', border: '1px solid #E8D5C0' }}
          >
            100% din donații ajunge la familie
          </div>
          <h1
            className="font-bold leading-tight tracking-tight"
            style={{ color: '#2D2016', fontSize: 'clamp(2rem, 6vw, 3.25rem)' }}
          >
            Strânge fonduri pentru<br />
            <span style={{ color: '#C4956A' }}>momentele care contează</span>
          </h1>
          <p
            className="leading-relaxed max-w-xl mx-auto"
            style={{ color: '#7A6652', fontSize: 'clamp(0.95rem, 2vw, 1.125rem)' }}
          >
            Creează o pagină de donații pentru un eveniment de viață în 3 minute.
            Distribuie link-ul. Primești banii direct în contul tău.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/create"
              className="rounded-xl px-8 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#C4956A' }}
            >
              Creează o pagină gratuită
            </Link>
            <a
              href="#cum-functioneaza"
              className="rounded-xl border px-8 py-3.5 text-base font-semibold transition-colors hover:bg-white"
              style={{ borderColor: '#E0D0C0', color: '#7A6652' }}
            >
              Cum funcționează
            </a>
          </div>
        </div>
      </section>

      {/* Event types */}
      <section className="px-4 py-14 sm:py-16" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-2" style={{ color: '#2D2016' }}>
            Pentru orice moment important
          </h2>
          <p className="text-sm sm:text-base text-center mb-8 sm:mb-10" style={{ color: '#9A7B60' }}>
            Fiecare tip de eveniment vine cu articole sugerate, mesaje și design potrivit contextului.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {EVENT_TYPES.map((type) => (
              <div
                key={type.slug}
                className="flex items-start gap-4 rounded-2xl p-4 sm:p-5"
                style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
              >
                <div
                  className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: type.bg, color: '#7A6652' }}
                >
                  <Icon name={type.icon} size={20} color="#7A6652" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#2D2016' }}>{type.label}</h3>
                  <p className="mt-0.5 text-xs sm:text-sm leading-relaxed" style={{ color: '#9A7B60' }}>{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="cum-functioneaza" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-2" style={{ color: '#2D2016' }}>
            Cum funcționează
          </h2>
          <p className="text-sm sm:text-base text-center mb-10 sm:mb-12" style={{ color: '#9A7B60' }}>
            De la creare la banii în cont — tot procesul durează câteva minute.
          </p>
          <div className="space-y-5 sm:space-y-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex gap-4 sm:gap-5 items-start">
                <div
                  className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: '#C4956A' }}
                >
                  {item.step}
                </div>
                <div className="pt-0.5 sm:pt-1">
                  <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#2D2016' }}>{item.title}</h3>
                  <p className="mt-0.5 text-xs sm:text-sm leading-relaxed" style={{ color: '#9A7B60' }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-4 py-14 sm:py-16" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-10" style={{ color: '#2D2016' }}>
            De ce pentrumomente?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {TRUST_POINTS.map((point) => (
              <div
                key={point.title}
                className="flex gap-4 items-start rounded-2xl p-4 sm:p-5"
                style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
              >
                <div
                  className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: '#F5EDE3', color: '#C4956A' }}
                >
                  <Icon name={point.icon} size={20} color="#C4956A" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#2D2016' }}>{point.title}</h3>
                  <p className="mt-0.5 text-xs sm:text-sm leading-relaxed" style={{ color: '#9A7B60' }}>{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two audiences */}
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Organiser */}
          <div
            className="rounded-2xl p-6 sm:p-8 space-y-4"
            style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#C4956A' }}>
              Organizator
            </p>
            <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#2D2016' }}>
              Creezi pagina, distribui link-ul
            </h3>
            <ul className="space-y-2.5">
              {[
                'Pagina creată în 3 minute',
                'Link unic de partajat pe WhatsApp',
                'Urmărești donațiile în timp real',
                'Retragi banii oricând, direct în IBAN',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#7A6652' }}>
                  <span style={{ color: '#C4956A' }}><Icon name="check" size={15} color="#C4956A" /></span>
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

          {/* Donor */}
          <div
            className="rounded-2xl p-6 sm:p-8 space-y-4"
            style={{ backgroundColor: '#F5EDE3', border: '1px solid #E0D0C0' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#C4956A' }}>
              Donator
            </p>
            <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#2D2016' }}>
              Primești link-ul, donezi în 30 de secunde
            </h3>
            <ul className="space-y-2.5">
              {[
                'Fără cont, fără înregistrare',
                'Card, Apple Pay sau Google Pay',
                'Alegi dacă numele și suma sunt vizibile',
                'Poți dona anonim',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#7A6652' }}>
                  <span style={{ color: '#C4956A' }}><Icon name="check" size={15} color="#C4956A" /></span>
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
      <section className="px-4 py-16 sm:py-20 text-center" style={{ backgroundColor: '#2D2016' }}>
        <div className="mx-auto max-w-xl space-y-4 sm:space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Gata să începi?
          </h2>
          <p style={{ color: '#C4956A' }} className="text-sm sm:text-base">
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
        className="px-4 py-6 sm:py-8 text-center text-xs sm:text-sm"
        style={{ borderTop: '1px solid #EDE0D0', color: '#B09070', backgroundColor: '#FDFAF7' }}
      >
        <p>© 2026 pentrumomente.ro · Plăți procesate de Stripe · Transferuri bancare prin Wise</p>
      </footer>

    </div>
  )
}
