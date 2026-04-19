import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Tarife & comisioane · pentrumomente.ro',
  description: 'Transparență completă despre comisioanele aplicate pe platformă. Simplu, corect, fără surprize.',
  openGraph: {
    title: 'Tarife & comisioane · pentrumomente.ro',
    description: 'Transparență completă despre comisioanele aplicate pe platformă.',
    siteName: 'pentrumomente.ro',
    locale: 'ro_RO',
    type: 'website',
  },
}

export default function TarifePage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

        {/* Hero */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #2D1A0E 0%, #5A3420 50%, #8B5A3A 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #C4956A 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: '#C4956A' }}>
              Transparență totală
            </p>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Tarife & comisioane
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed" style={{ color: '#D4A574' }}>
              Fără taxe ascunse. Fără surprize. Știi exact cât plătești înainte să confirmi donația.
            </p>
          </div>
        </section>

        {/* Main content */}
        <section className="mx-auto max-w-3xl px-6 py-16 space-y-12">

          {/* Commission box */}
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE0D0', boxShadow: '0 4px 24px rgba(196,149,106,0.08)' }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#C4956A' }}>
              Comision per tranzacție
            </p>
            <p className="text-5xl font-bold" style={{ color: '#2D2016' }}>
              2,5% <span className="text-3xl">+</span> 1,25 Lei
            </p>
            <p className="mt-4 text-base leading-relaxed" style={{ color: '#7A6652' }}>
              Acesta este comisionul total aplicat fiecărei donații. Se adaugă pe lângă suma donată — destinatarul primește <strong style={{ color: '#2D2016' }}>integral</strong> suma aleasă de tine.
            </p>
          </div>

          {/* How it works */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: '#2D2016' }}>Cum funcționează</h2>
            <p className="text-base leading-relaxed" style={{ color: '#5C4A3A' }}>
              Atunci când faci o donație pe pentrumomente.ro, suma pe care o alegi ajunge <strong>complet</strong> la persoana sau familia pentru care strângi fonduri. Comisionul este adăugat separat și acoperă costurile de funcționare ale platformei și procesarea plăților.
            </p>
            <p className="text-base leading-relaxed" style={{ color: '#5C4A3A' }}>
              Înainte de a confirma plata, vei vedea mereu un rezumat clar cu suma donată și comisionul aplicat, astfel încât să știi exact cât este debitat de pe cardul tău.
            </p>
          </div>

          {/* Example table */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: '#2D2016' }}>Exemple</h2>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid #EDE0D0' }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: '#F5EDE3' }}>
                    <th className="px-5 py-3 text-left font-semibold" style={{ color: '#7A6652' }}>Donație</th>
                    <th className="px-5 py-3 text-right font-semibold" style={{ color: '#7A6652' }}>Comision</th>
                    <th className="px-5 py-3 text-right font-semibold" style={{ color: '#2D2016' }}>Total plătit</th>
                  </tr>
                </thead>
                <tbody>
                  {[50, 100, 200, 500, 1000].map((amount, i) => {
                    const commission = Math.round((amount * 0.025 + 1.25) * 100) / 100
                    const total = amount + commission
                    return (
                      <tr
                        key={amount}
                        style={{ backgroundColor: i % 2 === 0 ? '#FDFAF7' : '#FFFFFF', borderTop: '1px solid #F0E8DC' }}
                      >
                        <td className="px-5 py-3 font-medium" style={{ color: '#2D2016' }}>{amount} Lei</td>
                        <td className="px-5 py-3 text-right" style={{ color: '#7A6652' }}>{commission.toFixed(2)} Lei</td>
                        <td className="px-5 py-3 text-right font-bold" style={{ color: '#2D2016' }}>{total.toFixed(2)} Lei</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Promise */}
          <div
            className="rounded-2xl p-8 space-y-3"
            style={{ backgroundColor: '#FFF8F2', border: '1px solid #F5DFC0' }}
          >
            <h2 className="text-xl font-bold" style={{ color: '#2D2016' }}>Promisiunea noastră</h2>
            <ul className="space-y-2 text-sm leading-relaxed" style={{ color: '#5C4A3A' }}>
              <li className="flex gap-2"><span style={{ color: '#C4956A' }}>✓</span> Donația ta ajunge integral la destinatar — niciun procent nu este reținut din ea.</li>
              <li className="flex gap-2"><span style={{ color: '#C4956A' }}>✓</span> Comisionul este afișat clar, înainte de confirmare — nicio surpriză după plată.</li>
              <li className="flex gap-2"><span style={{ color: '#C4956A' }}>✓</span> Nu există abonamente, taxe de creare a paginii sau comisioane suplimentare.</li>
              <li className="flex gap-2"><span style={{ color: '#C4956A' }}>✓</span> Plățile sunt procesate securizat prin Stripe, unul dintre cele mai sigure procesatoare din lume.</li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <p className="text-base" style={{ color: '#7A6652' }}>
              Ai întrebări despre tarife sau funcționarea platformei?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#C4956A' }}
              >
                Contactează-ne
              </Link>
              <Link
                href="/"
                className="inline-block rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
                style={{ border: '1px solid #EDE0D0', color: '#7A6652', backgroundColor: '#FFFFFF' }}
              >
                Înapoi la start
              </Link>
            </div>
          </div>

        </section>
      </main>
    </>
  )
}
