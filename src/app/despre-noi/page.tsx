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

              {/* Artsy illustration: location pin + rolling hills */}
              <div
                className="rounded-2xl overflow-hidden relative"
                style={{ backgroundColor: '#0B1520', minHeight: '260px', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <svg viewBox="0 0 340 260" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style={{ display: 'block' }}>
                  {/* Sky gradient */}
                  <defs>
                    <radialGradient id="glow1" cx="50%" cy="35%" r="45%">
                      <stop offset="0%" stopColor="#E8A020" stopOpacity="0.22"/>
                      <stop offset="100%" stopColor="#E8A020" stopOpacity="0"/>
                    </radialGradient>
                  </defs>
                  <rect width="340" height="260" fill="#0B1520"/>
                  <rect width="340" height="260" fill="url(#glow1)"/>

                  {/* Stars */}
                  <circle cx="40"  cy="30" r="1.2" fill="white" opacity="0.5"/>
                  <circle cx="80"  cy="18" r="0.8" fill="white" opacity="0.4"/>
                  <circle cx="130" cy="25" r="1"   fill="white" opacity="0.35"/>
                  <circle cx="220" cy="15" r="1.2" fill="white" opacity="0.5"/>
                  <circle cx="270" cy="28" r="0.8" fill="white" opacity="0.4"/>
                  <circle cx="310" cy="20" r="1"   fill="white" opacity="0.35"/>
                  <circle cx="55"  cy="55" r="0.7" fill="white" opacity="0.3"/>
                  <circle cx="290" cy="50" r="0.7" fill="white" opacity="0.3"/>

                  {/* Back hill — dark teal */}
                  <path d="M0,180 Q85,120 170,148 Q255,176 340,130 L340,260 L0,260 Z" fill="#0F2A20" opacity="0.9"/>

                  {/* Mid hill — slightly lighter */}
                  <path d="M0,210 Q70,165 160,178 Q240,190 340,160 L340,260 L0,260 Z" fill="#122E25" opacity="0.95"/>

                  {/* Front hill — navy-green */}
                  <path d="M0,240 Q90,205 180,218 Q265,230 340,200 L340,260 L0,260 Z" fill="#1C2B3A"/>

                  {/* Pin shadow on ground */}
                  <ellipse cx="170" cy="196" rx="18" ry="5" fill="black" opacity="0.25"/>

                  {/* Pin body */}
                  <path d="M170,80 C148,80 130,98 130,120 C130,148 170,192 170,192 C170,192 210,148 210,120 C210,98 192,80 170,80 Z" fill="#E8A020"/>
                  {/* Pin inner circle */}
                  <circle cx="170" cy="118" r="16" fill="#0B1520"/>
                  {/* Pin inner heart */}
                  <path d="M170,112 C170,108 165,107 164,110 C163,114 170,120 170,120 C170,120 177,114 176,110 C175,107 170,108 170,112 Z" fill="#E8A020"/>

                  {/* Pin highlight */}
                  <ellipse cx="159" cy="100" rx="6" ry="4" fill="white" opacity="0.18" transform="rotate(-20,159,100)"/>

                  {/* Small dots scattered — like a map */}
                  <circle cx="100" cy="162" r="3" fill="#E8A020" opacity="0.35"/>
                  <circle cx="118" cy="155" r="2" fill="#E8A020" opacity="0.2"/>
                  <circle cx="240" cy="158" r="3" fill="#E8A020" opacity="0.35"/>
                  <circle cx="258" cy="150" r="2" fill="#E8A020" opacity="0.2"/>
                  {/* Dotted path lines */}
                  <line x1="103" y1="162" x2="148" y2="185" stroke="#E8A020" strokeWidth="1" strokeDasharray="3,5" opacity="0.2"/>
                  <line x1="237" y1="158" x2="195" y2="183" stroke="#E8A020" strokeWidth="1" strokeDasharray="3,5" opacity="0.2"/>

                  {/* Label */}
                  <text x="170" y="222" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" opacity="0.9" fontFamily="system-ui, sans-serif">Creat în România</text>
                  <text x="170" y="238" textAnchor="middle" fontSize="9.5" fill="#4A5568" fontFamily="system-ui, sans-serif">pentru familiile românești</text>
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
