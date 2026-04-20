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

              {/* Artsy illustration: hands passing a heart */}
              <div
                className="rounded-2xl overflow-hidden relative flex items-center justify-center"
                style={{ backgroundColor: '#0B1520', minHeight: '260px', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Ambient glow */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 40%, rgba(232,160,32,0.18) 0%, transparent 70%)' }} />
                <svg viewBox="0 0 340 240" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ maxHeight: '260px', display: 'block' }}>
                  {/* Left hand — reaching right */}
                  <g transform="translate(20, 80)">
                    <rect x="0" y="50" width="70" height="22" rx="11" fill="#C4956A" opacity="0.9"/>
                    {/* fingers */}
                    <rect x="10" y="28" width="12" height="30" rx="6" fill="#D4A57A"/>
                    <rect x="26" y="20" width="12" height="38" rx="6" fill="#D4A57A"/>
                    <rect x="42" y="22" width="12" height="36" rx="6" fill="#D4A57A"/>
                    <rect x="57" y="28" width="11" height="30" rx="6" fill="#D4A57A"/>
                    {/* thumb */}
                    <ellipse cx="6" cy="52" rx="8" ry="10" fill="#D4A57A"/>
                    {/* arm */}
                    <rect x="0" y="62" width="40" height="18" rx="0" fill="#C4956A" opacity="0.6"/>
                  </g>
                  {/* Right hand — reaching left (mirrored) */}
                  <g transform="translate(250, 80) scale(-1,1)">
                    <rect x="0" y="50" width="70" height="22" rx="11" fill="#C4956A" opacity="0.9"/>
                    <rect x="10" y="28" width="12" height="30" rx="6" fill="#D4A57A"/>
                    <rect x="26" y="20" width="12" height="38" rx="6" fill="#D4A57A"/>
                    <rect x="42" y="22" width="12" height="36" rx="6" fill="#D4A57A"/>
                    <rect x="57" y="28" width="11" height="30" rx="6" fill="#D4A57A"/>
                    <ellipse cx="6" cy="52" rx="8" ry="10" fill="#D4A57A"/>
                    <rect x="0" y="62" width="40" height="18" rx="0" fill="#C4956A" opacity="0.6"/>
                  </g>
                  {/* Heart in the middle */}
                  <g transform="translate(170, 95)">
                    <path d="M0,-18 C0,-28 -18,-28 -18,-10 C-18,4 0,20 0,20 C0,20 18,4 18,-10 C18,-28 0,-28 0,-18 Z" fill="#E8A020" opacity="0.95"/>
                    <path d="M0,-14 C0,-21 -10,-21 -10,-8 C-10,2 0,14 0,14" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                  </g>
                  {/* Decorative dots */}
                  <circle cx="80" cy="50" r="3" fill="#E8A020" opacity="0.4"/>
                  <circle cx="95" cy="38" r="2" fill="#E8A020" opacity="0.25"/>
                  <circle cx="260" cy="50" r="3" fill="#E8A020" opacity="0.4"/>
                  <circle cx="245" cy="38" r="2" fill="#E8A020" opacity="0.25"/>
                  <circle cx="170" cy="170" r="2.5" fill="#E8A020" opacity="0.3"/>
                  {/* Label */}
                  <text x="170" y="196" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="system-ui, sans-serif">Creat în România</text>
                  <text x="170" y="212" textAnchor="middle" fontSize="9.5" fill="#4A5568" fontFamily="system-ui, sans-serif">pentru familiile românești</text>
                </svg>
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
              {/* Artsy illustration: figures under a shared umbrella */}
              <div
                className="rounded-2xl overflow-hidden relative flex items-center justify-center order-2 md:order-1"
                style={{ backgroundColor: '#F6F8FA', minHeight: '260px', border: '1px solid var(--color-border)' }}
              >
                {/* Soft amber radial backdrop */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 20%, rgba(232,160,32,0.12) 0%, transparent 65%)' }} />
                <svg viewBox="0 0 340 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ maxHeight: '260px', display: 'block' }}>
                  {/* Umbrella canopy */}
                  <path d="M90,110 Q170,40 250,110" fill="#E8A020" opacity="0.9"/>
                  <path d="M90,110 Q170,55 250,110" fill="none" stroke="#C4820A" strokeWidth="1.5" opacity="0.4"/>
                  {/* Umbrella ribs */}
                  {[90, 120, 150, 170, 190, 220, 250].map((x, i) => (
                    <line key={i} x1={x} y1={110} x2="170" y2="65" stroke="#C4820A" strokeWidth="1" opacity="0.3"/>
                  ))}
                  {/* Umbrella handle */}
                  <path d="M170,110 L170,185 Q170,195 160,195 Q150,195 150,185" fill="none" stroke="#C4820A" strokeWidth="3" strokeLinecap="round"/>

                  {/* Left adult figure */}
                  <circle cx="130" cy="140" r="14" fill="#4A5568"/>
                  <path d="M116,160 Q116,190 130,190 Q144,190 144,160" fill="#4A5568" opacity="0.85"/>

                  {/* Right adult figure */}
                  <circle cx="210" cy="140" r="14" fill="#0F1923"/>
                  <path d="M196,160 Q196,190 210,190 Q224,190 224,160" fill="#0F1923" opacity="0.85"/>

                  {/* Child figure (centre, smaller) */}
                  <circle cx="170" cy="152" r="10" fill="#E8A020"/>
                  <path d="M160,168 Q160,190 170,190 Q180,190 180,168" fill="#E8A020" opacity="0.85"/>

                  {/* Arms — adults reaching toward child */}
                  <line x1="144" y1="172" x2="160" y2="178" stroke="#4A5568" strokeWidth="5" strokeLinecap="round"/>
                  <line x1="196" y1="172" x2="180" y2="178" stroke="#0F1923" strokeWidth="5" strokeLinecap="round"/>

                  {/* Floating hearts */}
                  <path d="M100,85 C100,79 92,79 92,85 C92,91 100,97 100,97 C100,97 108,91 108,85 C108,79 100,79 100,85 Z" fill="#E8A020" opacity="0.5"/>
                  <path d="M232,78 C232,73 225,73 225,78 C225,84 232,89 232,89 C232,89 239,84 239,78 C239,73 232,73 232,78 Z" fill="#E8A020" opacity="0.35"/>

                  {/* Ground shadow */}
                  <ellipse cx="170" cy="198" rx="70" ry="6" fill="#DDE3EC" opacity="0.5"/>

                  {/* Label */}
                  <text x="170" y="218" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F1923" fontFamily="system-ui, sans-serif">Familia pe primul loc</text>
                  <text x="170" y="233" textAnchor="middle" fontSize="9.5" fill="#8895A7" fontFamily="system-ui, sans-serif">sprijinită de comunitate</text>
                </svg>
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
