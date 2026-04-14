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
  {
    slug: 'inmormantare',
    label: 'Înmormântare',
    description: 'Coroane digitale, lumânări și contribuții pentru familia îndoliată.',
    emoji: '🕯️',
    bg: '#FAF5F0',
  },
  {
    slug: 'nunta',
    label: 'Nuntă',
    description: 'Fond lună de miere, registru de cadouri și experiențe pentru miri.',
    emoji: '💍',
    bg: '#FFF8F0',
  },
  {
    slug: 'bebe',
    label: 'Bebe nou',
    description: 'Listă de dorințe și fond general pentru familia cu un nou-născut.',
    emoji: '👶',
    bg: '#F0F8FF',
  },
  {
    slug: 'sanatate',
    label: 'Sănătate',
    description: 'Strânge fonduri pentru tratamente medicale, operații sau recuperare.',
    emoji: '🌿',
    bg: '#F0FFF4',
  },
  {
    slug: 'altele',
    label: 'Altele',
    description: 'Orice altă cauză sau eveniment pentru care vrei să strângi fonduri.',
    emoji: '🌟',
    bg: '#FFF9F0',
  },
]

const TRUST_POINTS = [
  {
    icon: '💯',
    title: '100% ajunge la familie',
    description: 'Nu reținem niciun procent din donații. Monetizarea platformei este printr-un bacșiș opțional al donatorului.',
  },
  {
    icon: '🔒',
    title: 'Plăți securizate',
    description: 'Toate plățile sunt procesate prin Stripe — același sistem folosit de milioane de companii din lume.',
  },
  {
    icon: '👤',
    title: 'Donatorii nu au nevoie de cont',
    description: 'Oricine poate dona în 30 de secunde, fără înregistrare. Zero fricțiune pentru cei dragi.',
  },
  {
    icon: '🏦',
    title: 'Retragere directă în cont',
    description: 'Fondurile ajung direct în IBAN-ul tău românesc prin transfer bancar securizat.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

      {/* Nav */}
      <nav className="px-4 py-4" style={{ borderBottom: '1px solid #F0EBE3' }}>
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight" style={{ color: '#2D2016' }}>
            pentru<span style={{ color: '#C4956A' }}>momente</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium transition-colors"
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
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div
            className="inline-flex items-center rounded-full px-4 py-1.5 text-sm"
            style={{ backgroundColor: '#F5EDE3', color: '#9A6B45', border: '1px solid #E8D5C0' }}
          >
            100% din donații ajunge la familie
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight" style={{ color: '#2D2016' }}>
            Strânge fonduri pentru<br />
            <span style={{ color: '#C4956A' }}>momentele care contează</span>
          </h1>
          <p className="text-lg leading-relaxed max-w-xl mx-auto" style={{ color: '#7A6652' }}>
            Creează o pagină de donații pentru un eveniment de viață în 3 minute.
            Distribuie link-ul. Primești banii direct în contul tău.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/create"
              className="rounded-xl px-8 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#C4956A' }}
            >
              Creează o pagină gratuită
            </Link>
            <a
              href="#cum-functioneaza"
              className="rounded-xl border px-8 py-4 text-base font-semibold transition-colors hover:bg-white"
              style={{ borderColor: '#E0D0C0', color: '#7A6652' }}
            >
              Cum funcționează
            </a>
          </div>
        </div>
      </section>

      {/* Event types */}
      <section className="px-4 py-16" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#2D2016' }}>
            Pentru orice moment important
          </h2>
          <p className="text-center mb-10" style={{ color: '#9A7B60' }}>
            Fiecare tip de eveniment vine cu articole sugerate, mesaje și design potrivit contextului.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EVENT_TYPES.map((type) => (
              <div
                key={type.slug}
                className="rounded-2xl p-5"
                style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
              >
                <div
                  className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: type.bg }}
                >
                  {type.emoji}
                </div>
                <h3 className="font-semibold" style={{ color: '#2D2016' }}>{type.label}</h3>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: '#9A7B60' }}>{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="cum-functioneaza" className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#2D2016' }}>
            Cum funcționează
          </h2>
          <p className="text-center mb-12" style={{ color: '#9A7B60' }}>
            De la creare la banii în cont — tot procesul durează câteva minute.
          </p>
          <div className="space-y-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex gap-5 items-start">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: '#C4956A' }}
                >
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold" style={{ color: '#2D2016' }}>{item.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed" style={{ color: '#9A7B60' }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-4 py-16" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: '#2D2016' }}>
            De ce pentrumomente?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TRUST_POINTS.map((point) => (
              <div
                key={point.title}
                className="flex gap-4 items-start rounded-2xl p-5"
                style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
              >
                <span className="text-2xl shrink-0" aria-hidden="true">{point.icon}</span>
                <div>
                  <h3 className="font-semibold" style={{ color: '#2D2016' }}>{point.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed" style={{ color: '#9A7B60' }}>{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two audiences */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organiser */}
          <div
            className="rounded-2xl p-8 space-y-4"
            style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#C4956A' }}>
              Organizator
            </p>
            <h3 className="text-xl font-bold" style={{ color: '#2D2016' }}>
              Creezi pagina, distribui link-ul
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: '#7A6652' }}>
              {[
                'Pagina creată în 3 minute',
                'Link unic de partajat pe WhatsApp',
                'Urmărești donațiile în timp real',
                'Retragi banii oricând, direct în IBAN',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span style={{ color: '#C4956A' }} className="font-bold">✓</span> {item}
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
            className="rounded-2xl p-8 space-y-4"
            style={{ backgroundColor: '#F5EDE3', border: '1px solid #E0D0C0' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#C4956A' }}>
              Donator
            </p>
            <h3 className="text-xl font-bold" style={{ color: '#2D2016' }}>
              Primești link-ul, donezi în 30 de secunde
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: '#7A6652' }}>
              {[
                'Fără cont, fără înregistrare',
                'Card, Apple Pay sau Google Pay',
                'Alegi dacă numele și suma sunt vizibile',
                'Poți dona anonim',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span style={{ color: '#C4956A' }} className="font-bold">✓</span> {item}
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
      <section
        className="px-4 py-20 text-center"
        style={{ backgroundColor: '#2D2016' }}
      >
        <div className="mx-auto max-w-xl space-y-5">
          <h2 className="text-3xl font-bold text-white">
            Gata să începi?
          </h2>
          <p style={{ color: '#C4956A' }}>
            Creează prima pagină gratuit. Fără abonament, fără comision din donații.
          </p>
          <Link
            href="/create"
            className="inline-block rounded-xl px-8 py-4 text-base font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#C4956A', color: '#FFFDFB' }}
          >
            Creează o pagină gratuită
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-4 py-8 text-center text-sm"
        style={{ borderTop: '1px solid #EDE0D0', color: '#B09070', backgroundColor: '#FDFAF7' }}
      >
        <p>© 2026 pentrumomente.ro · Plăți procesate de Stripe · Transferuri bancare prin Wise</p>
      </footer>
    </div>
  )
}
