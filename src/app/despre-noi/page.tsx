import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'

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
      <main className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

        {/* Hero */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #2D1A0E 0%, #5A3420 50%, #8B5A3A 100%)' }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C4956A 1px, transparent 0)', backgroundSize: '32px 32px' }} />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 md:py-32 text-center">
            <p className="text-xs uppercase tracking-widest mb-4 font-medium" style={{ color: '#C4956A' }}>
              Povestea noastră
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6 text-white">
              Construim punți<br className="hidden sm:block" /> în momentele care contează
            </h1>
            <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: '#D4B89A' }}>
              pentrumomente.ro s-a născut dintr-o întrebare simplă: cum putem face mai ușor să arăți că îți pasă, atunci când contează cel mai mult?
            </p>
          </div>
        </section>

        {/* Mission strip */}
        <section style={{ backgroundColor: '#F5EDE3', borderBottom: '1px solid #EAD8C8' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: '💛',
                title: '100% ajunge la familie',
                desc: 'Platforma percepe un comision fix per donație, afișat transparent donatorului. Niciun leu nu se scade din suma destinată familiei.',
              },
              {
                icon: '⚡',
                title: '3 minute să creezi o pagină',
                desc: 'De la idee la pagina publică, gata de distribuit pe WhatsApp și Facebook — inclusiv cu cod QR pentru invitații tipărite.',
              },
              {
                icon: '🏦',
                title: 'Direct în cont românesc',
                desc: 'Fondurile ajung prin transfer bancar direct în contul IBAN al familiei, mereu la cel mai avantajos comision bancar posibil.',
              },
            ].map(item => (
              <div key={item.title} className="space-y-2">
                <div className="text-3xl">{item.icon}</div>
                <h3 className="font-semibold text-base" style={{ color: '#2D1A0E' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7A6652' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="space-y-10">

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#2D1A0E' }}>De unde am plecat</h2>
                <p className="text-base leading-relaxed mb-4" style={{ color: '#5A4030' }}>
                  Fiecare familie trece prin momente în care sprijinul comunității face diferența — fie că este vorba de un deces, o nuntă, nașterea unui copil sau o situație medicală dificilă.
                </p>
                <p className="text-base leading-relaxed" style={{ color: '#5A4030' }}>
                  Colectele de bani au existat mereu în cultura românească. Am vrut să le facem mai simple, mai transparente și mai demne — potrivite cu realitatea secolului XXI.
                </p>
              </div>

              {/* Illustration: Romania outline / map pin feel */}
              <div
                className="rounded-2xl overflow-hidden flex items-center justify-center p-8 text-center"
                style={{ background: 'linear-gradient(135deg, #F5EDE3 0%, #EAD8C8 100%)', minHeight: '220px' }}
              >
                <div>
                  <div className="text-6xl mb-3">🇷🇴</div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#2D1A0E' }}>Creat în România</p>
                  <p className="text-xs" style={{ color: '#7A6652' }}>pentru familiile românești</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-8 md:p-10" style={{ backgroundColor: '#F5EDE3', border: '1px solid #EAD8C8' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#2D1A0E' }}>Misiunea noastră</h2>
              <p className="text-base leading-relaxed mb-4" style={{ color: '#5A4030' }}>
                Vrem ca oricine să poată crea o pagină de strângere de fonduri în câteva minute, fără să fie nevoie de cunoștințe tehnice, fără comisioane ascunse și fără ca familia să fie nevoită să creeze un cont.
              </p>
              <p className="text-base leading-relaxed" style={{ color: '#5A4030' }}>
                Donatorii nu trebuie să se înregistreze. Banii ajung direct. Transparența este implicită.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Illustration: handshake / people / heart */}
              <div
                className="rounded-2xl overflow-hidden flex items-center justify-center p-8 text-center order-2 md:order-1"
                style={{ background: 'linear-gradient(135deg, #EAD8C8 0%, #D4B89A 100%)', minHeight: '220px' }}
              >
                <div>
                  <div className="flex justify-center gap-2 text-5xl mb-3">
                    <span>👨‍👩‍👧</span>
                    <span>❤️</span>
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#5A3420' }}>Familia pe primul loc</p>
                  <p className="text-xs" style={{ color: '#7A5038' }}>sprijinită de comunitate</p>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#2D1A0E' }}>Valorile care ne ghidează</h2>
                <ul className="space-y-3">
                  {[
                    'Transparență totală — donatorii văd exact unde merg banii',
                    'Demnitate — interfața este respectuoasă față de toate tipurile de evenimente',
                    'Simplitate — orice persoană poate folosi platforma, indiferent de vârstă',
                    'Încredere — securitate la nivelul standardelor bancare europene',
                  ].map(v => (
                    <li key={v} className="flex items-start gap-2.5 text-sm" style={{ color: '#5A4030' }}>
                      <span className="mt-0.5 shrink-0 text-base" style={{ color: '#C4956A' }}>✓</span>
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ backgroundColor: '#F5EDE3', borderTop: '1px solid #EAD8C8' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#2D1A0E' }}>Vrei să afli mai mult?</h2>
            <p className="text-base mb-6" style={{ color: '#7A6652' }}>
              Scrie-ne sau creează prima ta pagină chiar acum — este gratuit și durează 3 minute.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact"
                className="rounded-xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#2D1A0E', color: '#FDFAF7' }}>
                Contactează-ne
              </Link>
              <Link href="/create"
                className="rounded-xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#C4956A', color: '#FDFAF7' }}>
                Creează o pagină gratuită
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
