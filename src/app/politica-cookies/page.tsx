import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Politica de Cookies · pentrumomente.ro',
  description: 'Informații despre modul în care pentrumomente.ro utilizează cookie-urile și tehnologiile similare.',
  openGraph: {
    title: 'Politica de Cookies · pentrumomente.ro',
    siteName: 'pentrumomente.ro',
    locale: 'ro_RO',
    type: 'website',
  },
}

const sections = [
  {
    title: '1. Ce sunt cookie-urile?',
    content: `Cookie-urile sunt fișiere text de mici dimensiuni stocate pe dispozitivul dumneavoastră (calculator, telefon sau tabletă) atunci când vizitați un site web. Ele permit site-ului să vă recunoască dispozitivul la vizitele ulterioare și să rețină anumite preferințe sau acțiuni efectuate anterior.`,
  },
  {
    title: '2. Ce tipuri de cookie-uri folosim?',
    subsections: [
      {
        subtitle: '2.1 Cookie-uri strict necesare',
        text: `Aceste cookie-uri sunt esențiale pentru funcționarea platformei. Fără ele, serviciile pe care le-ați solicitat nu pot fi furnizate. Ele includ cookie-uri de sesiune pentru autentificarea organizatorilor și cookie-uri de securitate pentru protejarea formularelor de plată. Nu pot fi dezactivate.`,
      },
      {
        subtitle: '2.2 Cookie-uri funcționale',
        text: `Aceste cookie-uri permit platformei să rețină alegerile pe care le faceți (de exemplu, preferința de limbă sau starea sesiunii) și să ofere funcții îmbunătățite și mai personalizate. Datele colectate de aceste cookie-uri nu vă pot urmări activitatea pe alte site-uri web.`,
      },
      {
        subtitle: '2.3 Cookie-uri analitice',
        text: `Utilizăm servicii de analiză anonimă pentru a înțelege cum este folosită platforma și pentru a îmbunătăți experiența utilizatorilor. Datele colectate sunt agregate și anonimizate — nu permit identificarea dumneavoastră personală.`,
      },
      {
        subtitle: '2.4 Cookie-uri de la terți',
        text: `Stripe (procesatorul nostru de plăți) poate plasa cookie-uri tehnice în cadrul fluxului de plată, necesare pentru securitatea tranzacțiilor. Aceste cookie-uri sunt guvernate de politica de confidențialitate a Stripe.`,
      },
    ],
  },
  {
    title: '3. Durata de stocare',
    content: `Cookie-urile de sesiune sunt șterse automat la închiderea browserului. Cookie-urile persistente rămân pe dispozitivul dumneavoastră pentru o perioadă determinată (de regulă între 30 de zile și 12 luni), după care expiră automat sau pot fi șterse manual.`,
  },
  {
    title: '4. Cum puteți gestiona cookie-urile?',
    content: `Puteți controla și/sau șterge cookie-urile după preferință. Puteți șterge toate cookie-urile deja stocate pe computerul dumneavoastră și puteți seta majoritatea browserelor să blocheze plasarea lor. Dacă faceți acest lucru, este posibil să fie necesar să ajustați manual unele preferințe la fiecare vizită pe site, iar unele servicii și funcționalități ar putea să nu funcționeze corespunzător.\n\nPentru informații despre gestionarea cookie-urilor în browserul dumneavoastră, accesați secțiunea de ajutor a acestuia sau consultați resurse precum www.allaboutcookies.org.`,
  },
  {
    title: '5. Consimțământul dumneavoastră',
    content: `Prin continuarea utilizării platformei pentrumomente.ro după afișarea notificării privind cookie-urile, vă exprimați acordul cu privire la utilizarea cookie-urilor strict necesare și funcționale. Cookie-urile analitice sunt activate doar dacă acordați consimțământul explicit prin bannerul de cookie-uri.`,
  },
  {
    title: '6. Actualizări ale politicii',
    content: `Ne rezervăm dreptul de a actualiza această politică periodic pentru a reflecta modificările aduse practicilor noastre sau cerințelor legale. Vă recomandăm să consultați această pagină în mod regulat. Data ultimei actualizări este indicată mai jos.`,
  },
  {
    title: '7. Contact',
    content: `Pentru orice întrebări legate de utilizarea cookie-urilor pe platforma noastră, ne puteți contacta la adresa info@pentrumomente.ro.`,
  },
]

export default function PoliticaCookiesPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

        {/* Hero */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1A2E20 0%, #2D5A38 50%, #3D7A4E 100%)' }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #6EE7B7 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-24 text-center">
            <p className="text-xs uppercase tracking-widest mb-4 font-medium" style={{ color: '#6EE7B7' }}>Legal</p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 text-white">Politica de Cookies</h1>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#A7F3D0' }}>
              Cum utilizăm cookie-urile pentru a asigura funcționarea platformei și protejarea dumneavoastră.
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">

          {/* Table of contents — sticky on desktop */}
          <div className="grid md:grid-cols-4 gap-8">
            <aside className="hidden md:block md:col-span-1">
              <div className="sticky top-6 rounded-2xl p-5" style={{ backgroundColor: '#F5EDE3', border: '1px solid #EAD8C8' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9A7B60' }}>Cuprins</h3>
                <nav className="space-y-1">
                  {sections.map((s, i) => (
                    <a
                      key={i}
                      href={`#section-${i}`}
                      className="block text-sm py-1 transition-colors hover:underline"
                      style={{ color: '#5A4030' }}
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <article className="md:col-span-3">
              <div
                className="rounded-2xl p-6 md:p-10 shadow-sm"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EBE3' }}
              >
                <p className="text-xs mb-8 pb-4" style={{ color: '#9A7B60', borderBottom: '1px solid #F0EBE3' }}>
                  Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>

                <div className="space-y-8">
                  {sections.map((s, i) => (
                    <section key={i} id={`section-${i}`}>
                      <h2
                        className="text-xl font-bold mb-4 pb-2"
                        style={{ color: '#2D1A0E', borderBottom: '2px solid #F5EDE3' }}
                      >
                        {s.title}
                      </h2>

                      {'subsections' in s && s.subsections ? (
                        <div className="space-y-5">
                          {s.subsections.map((sub, j) => (
                            <div key={j}>
                              <h3 className="text-base font-semibold mb-2" style={{ color: '#2D1A0E' }}>{sub.subtitle}</h3>
                              <p className="text-sm leading-relaxed" style={{ color: '#5A4030' }}>{sub.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(s.content ?? '').split('\n\n').map((para, j) => (
                            <p key={j} className="text-sm leading-relaxed" style={{ color: '#5A4030' }}>{para}</p>
                          ))}
                        </div>
                      )}
                    </section>
                  ))}
                </div>

                <div className="mt-10 pt-6 rounded-xl p-5" style={{ backgroundColor: '#F5EDE3', borderTop: '2px solid #EAD8C8' }}>
                  <p className="text-sm font-medium mb-1" style={{ color: '#2D1A0E' }}>Întrebări despre cookie-uri?</p>
                  <p className="text-sm" style={{ color: '#7A6652' }}>
                    Contactează-ne la{' '}
                    <a href="mailto:info@pentrumomente.ro" className="font-medium hover:underline" style={{ color: '#C4956A' }}>
                      info@pentrumomente.ro
                    </a>
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>← Acasă</Link>
                <Link href="/termeni-si-conditii" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>Termeni și Condiții</Link>
                <Link href="/politica-gdpr" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>GDPR</Link>
                <Link href="/contact" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>Contact</Link>
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  )
}
