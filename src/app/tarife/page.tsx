import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Check, ArrowRight, Shield, Heart, Zap, Lock } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('tarife', {
    title: 'Tarife & comisioane · pentrumomente.ro',
    description: 'Transparență completă despre comisioanele aplicate pe platformă. Simplu, corect, fără surprize.',
    openGraph: { siteName: 'pentrumomente.ro', locale: 'ro_RO', type: 'website' },
  })
}

export default function TarifePage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* ── Page hero ── */}
        <section style={{ backgroundColor: 'var(--color-forest)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: '#F0B860' }}>
              Transparență totală
            </p>
            <h1
              className="font-extrabold tracking-tight text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Tarife & comisioane
            </h1>
            <p className="text-base leading-relaxed max-w-xl" style={{ color: '#7A9A88' }}>
              Fără taxe ascunse. Fără surprize. Știi exact cât ajunge la familie înainte să apeși pe „Donează".
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20 space-y-16">

          {/* ── Commission highlight ── */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div
              className="rounded-3xl p-8 sm:p-10 text-center"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--color-amber-dark)' }}>
                🇪🇺 Card european
              </p>
              <p
                className="font-extrabold tracking-tight leading-none tabular-nums"
                style={{ color: 'var(--color-ink)', fontSize: 'clamp(2rem, 6vw, 3rem)' }}
              >
                2,5%{' '}
                <span style={{ fontSize: '55%', fontWeight: 700, color: 'var(--color-ink-faint)' }}>+</span>{' '}
                1,25 Lei
              </p>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                Carduri emise în UE sau SEE (Austria, Germania, România etc.).
              </p>
            </div>
            <div
              className="rounded-3xl p-8 sm:p-10 text-center"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--color-amber-dark)' }}>
                🌍 Card non-european
              </p>
              <p
                className="font-extrabold tracking-tight leading-none tabular-nums"
                style={{ color: 'var(--color-ink)', fontSize: 'clamp(2rem, 6vw, 3rem)' }}
              >
                4,25%{' '}
                <span style={{ fontSize: '55%', fontWeight: 700, color: 'var(--color-ink-faint)' }}>+</span>{' '}
                1,25 Lei
              </p>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                Carduri emise în afara UE/SEE (Marea Britanie, SUA, Canada etc.).
              </p>
            </div>
          </div>
          <p className="text-sm text-center" style={{ color: 'var(--color-ink-muted)' }}>
            Comisionul se deduce automat din suma donată — familia primește restul. Nicio taxă în plus, niciun abonament.
          </p>

          {/* ── What is it ── */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
              Ce este comisionul de tranzacție?
            </h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
              Siguranța plăților este prioritatea noastră. De aceea, procesăm toate donațiile prin{' '}
              <strong style={{ color: 'var(--color-ink)' }}>Stripe</strong> — unul dintre cele mai sigure și mai
              folosite sisteme de plăți din lume, prezent în peste 40 de țări și folosit de milioane de platforme.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
              Comisionul de 2,5% + 1,25 Lei acoperă costul procesării cardului, securitatea tranzacției și livrarea
              banilor în contul organizatorului. Aceasta este singura sumă reținută din donație — nimic altceva nu
              se mai deduce.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
              Acceptăm plăți cu card de credit, card de debit, Apple Pay și Google Pay — tot ce îți oferă confort
              și siguranță.
            </p>
          </div>

          {/* ── Example table ── */}
          <div className="space-y-5">
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
              Câți bani ajung la familie?
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
              Câteva exemple concrete, ca să nu rămână nicio urmă de dubiu:
            </p>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-forest)' }}>
                    <th className="px-4 py-3.5 text-left font-semibold text-white">Donație</th>
                    <th className="px-4 py-3.5 text-right font-semibold" style={{ color: '#7A9A88' }}>Comision 🇪🇺</th>
                    <th className="px-4 py-3.5 text-right font-semibold text-white">Familie primește</th>
                    <th className="px-4 py-3.5 text-right font-semibold" style={{ color: '#7A9A88' }}>Comision 🌍</th>
                    <th className="px-4 py-3.5 text-right font-semibold text-white">Familie primește</th>
                  </tr>
                </thead>
                <tbody>
                  {[50, 100, 200, 500, 1000].map((amount, i) => {
                    const commissionEu = Math.round((amount * 0.025 + 1.25) * 100) / 100
                    const organiserEu = Math.round((amount - commissionEu) * 100) / 100
                    const commissionNonEu = Math.round((amount * 0.0425 + 1.25) * 100) / 100
                    const organiserNonEu = Math.round((amount - commissionNonEu) * 100) / 100
                    return (
                      <tr
                        key={amount}
                        style={{
                          backgroundColor: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)',
                          borderTop: '1px solid var(--color-border)',
                        }}
                      >
                        <td className="px-4 py-3.5 font-semibold" style={{ color: 'var(--color-ink)' }}>{amount} Lei</td>
                        <td className="px-4 py-3.5 text-right font-mono text-sm tabular-nums" style={{ color: 'var(--color-ink-muted)' }}>
                          {commissionEu.toFixed(2)} Lei
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold font-mono text-sm tabular-nums" style={{ color: 'var(--color-ink)' }}>
                          {organiserEu.toFixed(2)} Lei
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-sm tabular-nums" style={{ color: 'var(--color-ink-muted)' }}>
                          {commissionNonEu.toFixed(2)} Lei
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold font-mono text-sm tabular-nums" style={{ color: 'var(--color-ink)' }}>
                          {organiserNonEu.toFixed(2)} Lei
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
              🇪🇺 Card european = UE, SEE &nbsp;·&nbsp; 🌍 Card non-european = Marea Britanie, SUA, Canada, și altele.
              Suma plătită de donator nu se modifică — comisionul mai mare pentru carduri non-UE acoperă exclusiv
              costurile suplimentare de procesare și menținerea platformei.
            </p>
          </div>

          {/* ── Optional tip + why ── */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Heart size={18} strokeWidth={1.75} style={{ color: 'var(--color-amber-dark)' }} />,
                title: 'Contribuțiile donatorilor sunt opționale',
                body: 'La finalizarea donației, donatorii pot alege să adauge o contribuție voluntară pentru platformă. Aceasta nu este obligatorie și nu afectează suma care ajunge la familie.',
              },
              {
                icon: <Shield size={18} strokeWidth={1.75} style={{ color: 'var(--color-amber-dark)' }} />,
                title: 'De ce există această contribuție?',
                body: 'Contribuțiile voluntare ne ajută să menținem platforma funcțională, să oferim suport rapid și să îmbunătățim experiența pentru toți utilizatorii.',
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl p-6 space-y-3"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-amber-light)' }}
                >
                  {icon}
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-ink)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{body}</p>
              </div>
            ))}
          </div>

          {/* ── Included from day one ── */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--color-ink)' }}>
                Tot ce ai nevoie, inclus de la început
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                Crearea unei pagini pe pentrumomente.ro este gratuită. Nu există costuri de activare,
                abonamente lunare sau taxe ascunse.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: <Zap size={16} strokeWidth={2} />,
                  title: 'Pagină în 3 minute',
                  desc: 'De la zero la pagina publică, gata de distribuit pe WhatsApp și Facebook.',
                },
                {
                  icon: <Lock size={16} strokeWidth={2} />,
                  title: 'Plăți securizate',
                  desc: 'Stripe procesează toate tranzacțiile conform standardelor bancare europene.',
                },
                {
                  icon: <Heart size={16} strokeWidth={2} />,
                  title: 'Bani direct la familie',
                  desc: 'Fondurile ajung automat în contul organizatorului, fără rețineri suplimentare.',
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl p-5 space-y-2"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-amber-light)', color: 'var(--color-amber-dark)' }}
                  >
                    {icon}
                  </div>
                  <p className="font-bold text-sm" style={{ color: 'var(--color-ink)' }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Promise ── */}
          <div
            className="rounded-2xl p-7 sm:p-9"
            style={{ backgroundColor: 'var(--color-amber-light)', border: '1px solid rgba(212,136,42,0.25)' }}
          >
            <h2 className="text-lg font-extrabold mb-5" style={{ color: 'var(--color-ink)' }}>Promisiunea noastră</h2>
            <ul className="space-y-3">
              {[
                'Comisionul se deduce din suma donată — donatorul nu plătește nimic în plus față de suma aleasă.',
                'Suma pe care o vede familia pe pagina de donație este suma pe care o va primi efectiv, minus comisionul afișat.',
                'Nu există abonamente, taxe de creare a paginii sau costuri ascunse de niciun fel.',
                'Contribuția voluntară pentru platformă este mereu opțională și separată de donație.',
                'Cardurile non-europene (SUA, Canada etc.) au un comision mai mare (4,25% + 1,25 Lei) pentru a acoperi costul suplimentar de procesare Stripe. Suma plătită de donator nu se modifică — diferența se deduce din suma transferată familiei. Comisionul aplicat este afișat transparent în fereastra de plată înainte de confirmare.',
                'Plățile sunt procesate securizat prin Stripe, conform standardelor PCI-DSS.',
              ].map(item => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>
                  <Check size={14} strokeWidth={2.5} className="shrink-0 mt-0.5" style={{ color: 'var(--color-amber-dark)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* ── CTA ── */}
          <div
            className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-forest)' }}
          >
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
              aria-hidden="true"
              style={{ background: 'radial-gradient(circle, rgba(212,136,42,0.15) 0%, transparent 70%)' }}
            />
            <p className="text-lg font-extrabold text-white mb-2">Ai întrebări? Suntem aici.</p>
            <p className="text-sm mb-6" style={{ color: '#7A9A88' }}>
              Dacă ceva nu este clar sau ai nevoie de ajutor, echipa noastră îți răspunde rapid.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="btn-press btn-fill inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white"
                style={{ backgroundColor: 'var(--color-amber)', boxShadow: 'var(--shadow-warm)' }}
              >
                Contactează-ne
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
              <Link
                href="/create"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.70)' }}
              >
                Creează o pagină
              </Link>
            </div>
          </div>

        </section>

        {/* ── Footer strip ── */}
        <footer style={{ backgroundColor: 'var(--color-forest-mid)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-extrabold tracking-tight text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
              pentru<span style={{ color: 'var(--color-amber)' }}>momente</span>
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
              © 2026 pentrumomente.ro · Plăți prin Stripe
            </p>
          </div>
        </footer>

      </main>
    </>
  )
}
