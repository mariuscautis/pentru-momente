import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Check, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Despre noi · pentrumomente.ro',
  description: 'Suntem o platformă românească dedicată momentelor de viață care contează. Aflați povestea noastră și misiunea care ne ghidează.',
  openGraph: {
    title: 'Despre noi · pentrumomente.ro',
    description: 'O platformă construită pentru momentele care contează cu adevărat.',
    siteName: 'pentrumomente.ro',
    locale: 'ro_RO',
    type: 'website',
  },
}

export default function DespreNoiPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* Hero */}
        <section style={{ backgroundColor: 'var(--color-navy)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-amber)' }}>
              Povestea noastră
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              Construim punți<br className="hidden sm:block" /> în momentele care contează
            </h1>
            <p className="text-base leading-relaxed max-w-xl" style={{ color: '#8895A7' }}>
              pentrumomente.ro s-a născut dintr-o întrebare simplă: cum putem face mai ușor să arăți că îți pasă, atunci când contează cel mai mult?
            </p>
          </div>
        </section>

        {/* Mission pillars */}
        <section style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 grid sm:grid-cols-3 gap-8">
            {[
              {
                label: 'Transparent de la primul pas',
                desc: 'Fiecare cost este afișat clar, înainte de confirmare. Nu există taxe ascunse sau surprize după plată.',
              },
              {
                label: '3 minute să creezi o pagină',
                desc: 'De la idee la pagina publică, gata de distribuit pe WhatsApp și Facebook — inclusiv cu cod QR pentru invitații tipărite.',
              },
              {
                label: 'Direct în cont românesc',
                desc: 'Fondurile ajung prin transfer bancar direct în IBAN-ul familiei, rapid și securizat prin Stripe Connect.',
              },
            ].map(item => (
              <div key={item.label} className="space-y-2">
                <div
                  className="w-8 h-1 rounded-full mb-4"
                  style={{ backgroundColor: 'var(--color-amber)' }}
                />
                <h3 className="font-bold text-base" style={{ color: 'var(--color-ink)' }}>{item.label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="space-y-12">

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-4" style={{ color: 'var(--color-ink)' }}>De unde am plecat</h2>
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-ink-muted)' }}>
                  Fiecare familie trece prin momente în care sprijinul comunității face diferența — fie că este vorba de un deces, o nuntă, nașterea unui copil sau o situație medicală dificilă.
                </p>
                <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                  Colectele de bani au existat mereu în cultura românească. Am vrut să le facem mai simple, mai transparente și mai demne — potrivite cu realitatea secolului XXI.
                </p>
              </div>

              <div
                className="rounded-2xl flex items-center justify-center p-10 text-center"
                style={{ backgroundColor: 'var(--color-navy)', minHeight: '220px' }}
              >
                <div>
                  <p className="text-5xl mb-3">🇷🇴</p>
                  <p className="text-sm font-bold mb-1 text-white">Creat în România</p>
                  <p className="text-xs" style={{ color: '#4A5568' }}>pentru familiile românești</p>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-8 sm:p-10"
              style={{ backgroundColor: 'var(--color-navy)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h2 className="text-2xl font-extrabold tracking-tight mb-4 text-white">Misiunea noastră</h2>
              <p className="text-base leading-relaxed mb-4" style={{ color: '#8895A7' }}>
                Vrem ca oricine să poată crea o pagină de strângere de fonduri în câteva minute, fără să fie nevoie de cunoștințe tehnice, cu transparență deplină și fără ca familia să fie nevoită să creeze un cont.
              </p>
              <p className="text-base leading-relaxed" style={{ color: '#8895A7' }}>
                Donatorii nu trebuie să se înregistreze. Banii ajung direct. Transparența este implicită.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div
                className="rounded-2xl flex items-center justify-center p-10 text-center order-2 md:order-1"
                style={{ backgroundColor: 'var(--color-bg-alt)', minHeight: '220px', border: '1px solid var(--color-border)' }}
              >
                <div>
                  <div className="flex justify-center gap-2 text-5xl mb-3">
                    <span>👨‍👩‍👧</span>
                    <span>❤️</span>
                  </div>
                  <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-ink)' }}>Familia pe primul loc</p>
                  <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>sprijinită de comunitate</p>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <h2 className="text-2xl font-extrabold tracking-tight mb-4" style={{ color: 'var(--color-ink)' }}>Valorile care ne ghidează</h2>
                <ul className="space-y-3">
                  {[
                    'Transparență totală — toate costurile afișate clar înainte de confirmare',
                    'Demnitate — interfața este respectuoasă față de toate tipurile de evenimente',
                    'Simplitate — orice persoană poate folosi platforma, indiferent de vârstă',
                    'Încredere — securitate la nivelul standardelor bancare europene',
                  ].map(v => (
                    <li key={v} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                      <Check size={14} strokeWidth={2.5} className="shrink-0 mt-0.5" style={{ color: 'var(--color-amber)' }} />
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ backgroundColor: 'var(--color-navy)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Vrei să afli mai mult?</h2>
            <p className="text-base" style={{ color: '#8895A7' }}>
              Scrie-ne sau creează prima ta pagină chiar acum — durează 3 minute.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
              <Link href="/contact"
                className="btn-press inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all"
                style={{ backgroundColor: 'var(--color-amber)', boxShadow: '0 4px 14px rgba(232,160,32,0.40)' }}
              >
                Contactează-ne
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
              <Link href="/create"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#C8D0DB', backgroundColor: 'transparent' }}
              >
                Creează o pagină
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
