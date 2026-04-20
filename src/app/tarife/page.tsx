import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Check, ArrowRight, Shield, Heart, Zap } from 'lucide-react'

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
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* Hero */}
        <section style={{ backgroundColor: 'var(--color-navy)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-amber)' }}>
              Transparență totală
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              Tarife & comisioane
            </h1>
            <p className="text-base max-w-xl leading-relaxed" style={{ color: '#8895A7' }}>
              Fără taxe ascunse. Fără surprize. Știi exact cât ajunge la familie înainte să apeși pe „Donează".
            </p>
          </div>
        </section>

        {/* Main content */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-16 space-y-14">

          {/* Commission highlight */}
          <div
            className="rounded-2xl p-8 sm:p-10 text-center"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-amber)' }}>
              Comision per tranzacție
            </p>
            <p className="font-extrabold tracking-tight" style={{ color: 'var(--color-ink)', fontSize: 'clamp(2.5rem, 8vw, 4rem)', lineHeight: 1 }}>
              2,5% <span style={{ fontSize: '60%', fontWeight: 700 }}>+</span> 1,25 Lei
            </p>
            <p className="mt-5 text-base leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--color-ink-muted)' }}>
              Comisionul se deduce automat din suma donată — familia beneficiară primește tot ce rămâne. Nicio taxă în plus, niciun abonament.
            </p>
          </div>

          {/* What is a transaction fee */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>Ce este comisionul de tranzacție?</h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
              Siguranța plăților este prioritatea noastră. De aceea, procesăm toate donațiile prin <strong style={{ color: 'var(--color-ink)' }}>Stripe</strong> — unul dintre cele mai sigure și mai folosite sisteme de plăți din lume, prezent în peste 40 de țări și folosit de milioane de platforme.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
              Comisionul de 2,5% + 1,25 Lei acoperă costul procesării cardului, securitatea tranzacției și livrarea banilor în contul organizatorului. Aceasta este singura sumă reținută din donație — și este afișată clar pe pagina de donație, înainte de orice confirmare.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
              Acceptăm plăți cu card de credit, card de debit, Apple Pay și Google Pay — tot ce îți oferă confort și siguranță.
            </p>
          </div>

          {/* Example table */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>Câți bani ajung la familie?</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
              Iată câteva exemple concrete, ca să nu rămână nicio urmă de dubiu:
            </p>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-navy)' }}>
                    <th className="px-5 py-3.5 text-left font-semibold text-white">Donație</th>
                    <th className="px-5 py-3.5 text-right font-semibold" style={{ color: '#8895A7' }}>Comision reținut</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-white">Familia primește</th>
                  </tr>
                </thead>
                <tbody>
                  {[50, 100, 200, 500, 1000].map((amount, i) => {
                    const commission = Math.round((amount * 0.025 + 1.25) * 100) / 100
                    const organiserGets = Math.round((amount - commission) * 100) / 100
                    return (
                      <tr
                        key={amount}
                        style={{
                          backgroundColor: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)',
                          borderTop: '1px solid var(--color-border)',
                        }}
                      >
                        <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--color-ink)' }}>{amount} Lei</td>
                        <td className="px-5 py-3.5 text-right font-mono text-sm" style={{ color: 'var(--color-ink-muted)', fontVariantNumeric: 'tabular-nums' }}>{commission.toFixed(2)} Lei</td>
                        <td className="px-5 py-3.5 text-right font-bold font-mono text-sm" style={{ color: 'var(--color-ink)', fontVariantNumeric: 'tabular-nums' }}>{organiserGets.toFixed(2)} Lei</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Optional tip section */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div
              className="rounded-2xl p-6 space-y-3"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-amber-light)' }}
              >
                <Heart size={18} strokeWidth={2} style={{ color: 'var(--color-amber-dark)' }} />
              </div>
              <h3 className="font-bold text-base" style={{ color: 'var(--color-ink)' }}>Contribuțiile donatorilor sunt întotdeauna opționale</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                La finalizarea donației, donatorii pot alege să adauge o contribuție voluntară pentru platformă. Aceasta nu este obligatorie și nu afectează în niciun fel suma care ajunge la familie. Dacă doresc, pot dona fără nicio contribuție suplimentară — întotdeauna.
              </p>
            </div>
            <div
              className="rounded-2xl p-6 space-y-3"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-amber-light)' }}
              >
                <Shield size={18} strokeWidth={2} style={{ color: 'var(--color-amber-dark)' }} />
              </div>
              <h3 className="font-bold text-base" style={{ color: 'var(--color-ink)' }}>De ce există această contribuție?</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                Contribuțiile voluntare ale donatorilor ne ajută să menținem platforma funcțională, să oferim suport rapid și să continuăm să îmbunătățim experiența pentru organizatori și donatori deopotrivă. Ne bucurăm de fiecare contribuție, dar înțelegem perfect și pe cei care aleg să nu adauge una.
              </p>
            </div>
          </div>

          {/* Everything you need */}
          <div className="space-y-5">
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>Tot ce ai nevoie, inclus de la început</h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
              Crearea unei pagini pe pentrumomente.ro este gratuită. Nu există costuri de activare, abonamente lunare sau taxe ascunse. Plătești doar comisionul de tranzacție atunci când cineva donează.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: <Zap size={16} strokeWidth={2.5} />,
                  title: 'Pagină în 3 minute',
                  desc: 'De la zero la pagina publică, gata de distribuit pe WhatsApp și Facebook.',
                },
                {
                  icon: <Shield size={16} strokeWidth={2.5} />,
                  title: 'Plăți securizate',
                  desc: 'Stripe procesează toate tranzacțiile conform standardelor bancare europene.',
                },
                {
                  icon: <Heart size={16} strokeWidth={2.5} />,
                  title: 'Bani direct la familie',
                  desc: 'Fondurile ajung automat în contul organizatorului, fără rețineri suplimentare.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl p-5 space-y-2"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-amber-light)', color: 'var(--color-amber-dark)' }}
                  >
                    {item.icon}
                  </div>
                  <p className="font-bold text-sm" style={{ color: 'var(--color-ink)' }}>{item.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Promise */}
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{ backgroundColor: 'var(--color-amber-light)', border: '1px solid rgba(232,160,32,0.25)' }}
          >
            <h2 className="text-lg font-extrabold mb-4" style={{ color: 'var(--color-ink)' }}>Promisiunea noastră</h2>
            <ul className="space-y-3">
              {[
                'Comisionul se deduce din suma donată — donatorul nu plătește nimic în plus față de suma aleasă.',
                'Suma pe care o vede familia pe pagina de donație este suma pe care o va primi efectiv, minus comisionul afișat.',
                'Nu există abonamente, taxe de creare a paginii sau costuri ascunse de niciun fel.',
                'Contribuția voluntară pentru platformă este mereu opțională și separată de donație.',
                'Plățile sunt procesate securizat prin Stripe, conform standardelor PCI-DSS.',
              ].map(item => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>
                  <Check size={14} strokeWidth={2.5} className="shrink-0 mt-0.5" style={{ color: 'var(--color-amber-dark)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div
            className="rounded-2xl p-6 sm:p-8 text-center space-y-4"
            style={{ backgroundColor: 'var(--color-navy)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-lg text-white font-extrabold">Ai întrebări? Suntem aici.</p>
            <p className="text-sm" style={{ color: '#8895A7' }}>
              Dacă ceva nu este clar sau ai nevoie de ajutor, echipa noastră îți răspunde rapid.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
              <Link
                href="/contact"
                className="btn-press inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all"
                style={{ backgroundColor: 'var(--color-amber)', boxShadow: '0 4px 14px rgba(232,160,32,0.35)' }}
              >
                Contactează-ne
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
              <Link
                href="/create"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#C8D0DB' }}
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
