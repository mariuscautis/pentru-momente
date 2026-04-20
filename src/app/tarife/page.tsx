import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Check, ArrowRight } from 'lucide-react'

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
              Fără taxe ascunse. Fără surprize. Știi exact cât se reține înainte să confirmi donația.
            </p>
          </div>
        </section>

        {/* Main content */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-16 space-y-10">

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
              Comisionul se deduce din suma donată — donatorul plătește exact suma aleasă, iar destinatarul primește suma minus comisionul.
            </p>
          </div>

          {/* How it works */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>Cum funcționează</h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
              Atunci când faci o donație pe pentrumomente.ro, plătești exact suma aleasă. Din aceasta, un comision de 2,5% + 1,25 Lei este reținut pentru a acoperi costurile de procesare a plăților și operarea platformei. Diferența ajunge direct la persoana sau familia beneficiară.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
              Înainte de a confirma plata, vei vedea mereu un rezumat clar cu suma donată și comisionul aplicat, astfel încât să știi exact cât este debitat de pe cardul tău.
            </p>
          </div>

          {/* Example table */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>Exemple</h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-navy)' }}>
                    <th className="px-5 py-3.5 text-left font-semibold text-white">Donație</th>
                    <th className="px-5 py-3.5 text-right font-semibold" style={{ color: '#8895A7' }}>Comision reținut</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-white">Destinatarul primește</th>
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

          {/* Promise */}
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{ backgroundColor: 'var(--color-amber-light)', border: '1px solid rgba(232,160,32,0.25)' }}
          >
            <h2 className="text-lg font-extrabold mb-4" style={{ color: 'var(--color-ink)' }}>Promisiunea noastră</h2>
            <ul className="space-y-3">
              {[
                'Tu plătești exact suma pe care o alegi — comisionul se reține din aceasta, fără costuri adăugate pe deasupra.',
                'Comisionul este afișat clar, înainte de confirmare — nicio surpriză după plată.',
                'Nu există abonamente sau taxe de creare a paginii.',
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
            <p className="text-base text-white font-bold">Ai întrebări despre tarife sau funcționarea platformei?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="btn-press inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all"
                style={{ backgroundColor: 'var(--color-amber)', boxShadow: '0 4px 14px rgba(232,160,32,0.35)' }}
              >
                Contactează-ne
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#C8D0DB' }}
              >
                Înapoi acasă
              </Link>
            </div>
          </div>

        </section>
      </main>
    </>
  )
}
