import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Check, ArrowRight } from 'lucide-react'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('despre-noi', {
    title: 'Despre noi · pentrumomente.ro',
    description: 'Suntem o platformă românească dedicată momentelor de viață care contează. Aflați povestea noastră și misiunea care ne ghidează.',
    openGraph: { siteName: 'pentrumomente.ro', locale: 'ro_RO', type: 'website' },
  })
}

export default function DespreNoiPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* ── Hero ── */}
        <section style={{ backgroundColor: 'var(--color-forest)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-28">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: '#F0B860' }}>
                Povestea noastră
              </p>
              <h1
                className="font-extrabold tracking-tight text-white leading-tight mb-5"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}
              >
                Construim punți în<br />momentele care contează
              </h1>
              <p className="text-base leading-relaxed" style={{ color: '#7A9A88', maxWidth: '50ch' }}>
                pentrumomente.ro s-a născut dintr-o întrebare simplă: cum putem face mai ușor să arăți că îți pasă,
                atunci când contează cel mai mult?
              </p>
            </div>
          </div>
        </section>

        {/* ── Mission pillars ── */}
        <section style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
            <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: 'var(--color-border)' }}>
              {[
                {
                  label: 'Transparent de la primul pas',
                  desc: 'Fiecare cost este afișat clar, înainte de confirmare. Nu există taxe ascunse sau surprize după plată.',
                },
                {
                  label: '3 minute să creezi o pagină',
                  desc: 'De la idee la pagina publică, gata de distribuit pe WhatsApp și Facebook — inclusiv cu cod QR.',
                },
                {
                  label: 'Direct în cont românesc',
                  desc: 'Fondurile ajung prin transfer bancar direct în IBAN-ul familiei, rapid și securizat prin Stripe Connect.',
                },
              ].map((item, i) => (
                <div key={item.label} className={`space-y-2 py-8 ${i === 0 ? 'sm:pr-8' : i === 1 ? 'sm:px-8' : 'sm:pl-8'}`}>
                  <div
                    className="w-8 h-1 rounded-full mb-4"
                    style={{ backgroundColor: 'var(--color-amber)' }}
                  />
                  <h3 className="font-bold text-sm" style={{ color: 'var(--color-ink)' }}>{item.label}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Story ── */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24 space-y-16">

          {/* De unde am plecat */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--color-amber-dark)' }}>
                Origine
              </p>
              <h2
                className="font-extrabold tracking-tight mb-4"
                style={{ color: 'var(--color-ink)', fontSize: '1.625rem' }}
              >
                De unde am plecat
              </h2>
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-ink-muted)' }}>
                Fiecare familie trece prin momente în care sprijinul comunității face diferența — fie că este vorba
                de un deces, o nuntă, nașterea unui copil sau o situație medicală dificilă.
              </p>
              <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                Colectele de bani au existat mereu în cultura românească. Am vrut să le facem mai simple,
                mai transparente și mai demne — potrivite cu realitatea secolului XXI.
              </p>
            </div>

            {/* Illustration */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{ backgroundColor: 'var(--color-forest)', minHeight: '280px', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <svg viewBox="0 0 340 280" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style={{ display: 'block' }}>
                <defs>
                  <radialGradient id="glow1" cx="50%" cy="35%" r="50%">
                    <stop offset="0%" stopColor="#D4882A" stopOpacity="0.18"/>
                    <stop offset="100%" stopColor="#D4882A" stopOpacity="0"/>
                  </radialGradient>
                </defs>
                <rect width="340" height="280" fill="#1E3A2F"/>
                <rect width="340" height="280" fill="url(#glow1)"/>
                {/* Stars */}
                {[[40,30,1.2,0.5],[80,18,0.8,0.4],[130,25,1,0.35],[220,15,1.2,0.5],[270,28,0.8,0.4],[310,20,1,0.35],[55,55,0.7,0.3],[290,50,0.7,0.3]].map(([cx,cy,r,o],i) => (
                  <circle key={i} cx={cx} cy={cy} r={r} fill="white" opacity={o}/>
                ))}
                {/* Hills */}
                <path d="M0,195 Q85,135 170,163 Q255,191 340,145 L340,280 L0,280 Z" fill="#16302A" opacity="0.9"/>
                <path d="M0,225 Q70,180 160,193 Q240,205 340,175 L340,280 L0,280 Z" fill="#1A3830" opacity="0.95"/>
                <path d="M0,255 Q90,220 180,233 Q265,245 340,215 L340,280 L0,280 Z" fill="#2A4D3A"/>
                {/* Pin */}
                <ellipse cx="170" cy="210" rx="18" ry="5" fill="black" opacity="0.2"/>
                <path d="M170,90 C148,90 130,108 130,130 C130,158 170,206 170,206 C170,206 210,158 210,130 C210,108 192,90 170,90 Z" fill="#D4882A"/>
                <circle cx="170" cy="128" r="16" fill="#1E3A2F"/>
                <path d="M170,122 C170,118 165,117 164,120 C163,124 170,130 170,130 C170,130 177,124 176,120 C175,117 170,118 170,122 Z" fill="#D4882A"/>
                <ellipse cx="159" cy="110" rx="6" ry="4" fill="white" opacity="0.15" transform="rotate(-20,159,110)"/>
                {/* Map dots */}
                <circle cx="100" cy="175" r="3" fill="#D4882A" opacity="0.35"/>
                <circle cx="240" cy="170" r="3" fill="#D4882A" opacity="0.35"/>
                <line x1="103" y1="175" x2="148" y2="198" stroke="#D4882A" strokeWidth="1" strokeDasharray="3,5" opacity="0.2"/>
                <line x1="237" y1="170" x2="195" y2="196" stroke="#D4882A" strokeWidth="1" strokeDasharray="3,5" opacity="0.2"/>
                <text x="170" y="238" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" opacity="0.7" fontFamily="system-ui, sans-serif">Creat de echipa romaneasca</text>
                <text x="170" y="254" textAnchor="middle" fontSize="9.5" fill="#6A9A80" fontFamily="system-ui, sans-serif">pentru familiile romanesti</text>
              </svg>
            </div>
          </div>

          {/* Mission */}
          <div
            className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-forest)' }}
          >
            <div
              className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
              aria-hidden="true"
              style={{ background: 'radial-gradient(circle, rgba(212,136,42,0.15) 0%, transparent 70%)' }}
            />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: '#F0B860' }}>
              Misiunea noastră
            </p>
            <h2
              className="font-extrabold tracking-tight text-white mb-4"
              style={{ fontSize: '1.5rem' }}
            >
              Misiunea noastră
            </h2>
            <p className="text-base leading-relaxed mb-3" style={{ color: '#7A9A88' }}>
              Vrem ca oricine să poată crea o pagină de strângere de fonduri în câteva minute, fără să fie nevoie
              de cunoștințe tehnice, cu transparență deplină și fără ca familia să fie nevoită să creeze un cont.
            </p>
            <p className="text-base leading-relaxed" style={{ color: '#7A9A88' }}>
              Donatorii nu trebuie să se înregistreze. Banii ajung direct. Transparența este implicită.
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Illustration */}
            <div
              className="rounded-3xl overflow-hidden flex items-center justify-center order-2 md:order-1"
              style={{ backgroundColor: 'var(--color-amber-light)', minHeight: '280px', border: '1px solid rgba(212,136,42,0.20)' }}
            >
              <svg viewBox="0 0 340 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ maxHeight: '280px', display: 'block' }}>
                <rect width="340" height="280" fill="#FDF4E3"/>
                <defs>
                  <radialGradient id="ambGlow" cx="50%" cy="20%" r="45%">
                    <stop offset="0%" stopColor="#D4882A" stopOpacity="0.12"/>
                    <stop offset="100%" stopColor="#D4882A" stopOpacity="0"/>
                  </radialGradient>
                </defs>
                <rect width="340" height="280" fill="url(#ambGlow)"/>
                {/* Umbrella */}
                <path d="M90,120 Q170,50 250,120" fill="#D4882A" opacity="0.85"/>
                <path d="M90,120 Q170,65 250,120" fill="none" stroke="#B36B12" strokeWidth="1.5" opacity="0.4"/>
                {[90,120,150,170,190,220,250].map((x,i) => (
                  <line key={i} x1={x} y1={120} x2="170" y2="75" stroke="#B36B12" strokeWidth="1" opacity="0.25"/>
                ))}
                <path d="M170,120 L170,195 Q170,205 160,205 Q150,205 150,195" fill="none" stroke="#B36B12" strokeWidth="3" strokeLinecap="round"/>
                {/* Figures */}
                <circle cx="130" cy="150" r="14" fill="#5C4A30"/>
                <path d="M116,170 Q116,200 130,200 Q144,200 144,170" fill="#5C4A30" opacity="0.85"/>
                <circle cx="210" cy="150" r="14" fill="#1E3A2F"/>
                <path d="M196,170 Q196,200 210,200 Q224,200 224,170" fill="#1E3A2F" opacity="0.85"/>
                <circle cx="170" cy="162" r="10" fill="#D4882A"/>
                <path d="M160,178 Q160,200 170,200 Q180,200 180,178" fill="#D4882A" opacity="0.85"/>
                <line x1="144" y1="182" x2="160" y2="188" stroke="#5C4A30" strokeWidth="5" strokeLinecap="round"/>
                <line x1="196" y1="182" x2="180" y2="188" stroke="#1E3A2F" strokeWidth="5" strokeLinecap="round"/>
                {/* Hearts */}
                <path d="M100,92 C100,86 92,86 92,92 C92,98 100,104 100,104 C100,104 108,98 108,92 C108,86 100,86 100,92 Z" fill="#D4882A" opacity="0.45"/>
                <path d="M232,85 C232,80 225,80 225,85 C225,91 232,96 232,96 C232,96 239,91 239,85 C239,80 232,80 232,85 Z" fill="#D4882A" opacity="0.30"/>
                <ellipse cx="170" cy="208" rx="70" ry="6" fill="#EDD0A0" opacity="0.5"/>
                <text x="170" y="228" textAnchor="middle" fontSize="11" fontWeight="700" fill="#5C4A30" fontFamily="system-ui, sans-serif">Familia pe primul loc</text>
                <text x="170" y="244" textAnchor="middle" fontSize="9.5" fill="#9A856A" fontFamily="system-ui, sans-serif">sprijinită de comunitate</text>
              </svg>
            </div>

            <div className="order-1 md:order-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--color-amber-dark)' }}>
                Valori
              </p>
              <h2
                className="font-extrabold tracking-tight mb-5"
                style={{ color: 'var(--color-ink)', fontSize: '1.625rem' }}
              >
                Valorile care ne ghidează
              </h2>
              <ul className="space-y-4">
                {[
                  'Transparență totală — toate costurile afișate clar înainte de confirmare',
                  'Demnitate — interfața este respectuoasă față de toate tipurile de evenimente',
                  'Simplitate — orice persoană poate folosi platforma, indiferent de vârstă',
                  'Încredere — securitate la nivelul standardelor bancare europene',
                ].map(v => (
                  <li key={v} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                    <span
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: 'var(--color-amber-light)', border: '1px solid rgba(212,136,42,0.25)' }}
                    >
                      <Check size={10} strokeWidth={3} style={{ color: 'var(--color-amber-dark)' }} />
                    </span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </section>

        {/* ── CTA ── */}
        <section style={{ backgroundColor: 'var(--color-forest)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div className="space-y-3">
                <h2
                  className="font-extrabold tracking-tight text-white"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
                >
                  Vrei să afli mai mult?
                </h2>
                <p style={{ color: '#7A9A88' }}>
                  Scrie-ne sau creează prima ta pagină chiar acum — durează 3 minute.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contact"
                  className="btn-press btn-fill inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white"
                  style={{ backgroundColor: 'var(--color-amber)', boxShadow: 'var(--shadow-warm)' }}
                >
                  Contactează-ne
                  <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-semibold"
                  style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.70)' }}
                >
                  Creează o pagină
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ backgroundColor: 'var(--color-forest-mid)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-extrabold tracking-tight text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
              pentru<span style={{ color: 'var(--color-amber)' }}>momente</span>
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
              © 2026 pentrumomente.ro
            </p>
          </div>
        </footer>

      </main>
    </>
  )
}
