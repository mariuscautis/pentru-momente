import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Politica GDPR · pentrumomente.ro',
  description: 'Politica de confidențialitate și protecția datelor cu caracter personal conform Regulamentului GDPR pe platforma pentrumomente.ro.',
  openGraph: {
    title: 'Politica GDPR · pentrumomente.ro',
    siteName: 'pentrumomente.ro',
    locale: 'ro_RO',
    type: 'website',
  },
}

const sections = [
  {
    title: '1. Operatorul de date',
    content: `Operatorul de date cu caracter personal este pentrumomente.ro, platformă online de strângere de fonduri pentru evenimente de viață, cu sediul în România. Ne puteți contacta la adresa info@pentrumomente.ro pentru orice solicitare legată de prelucrarea datelor dumneavoastră.`,
  },
  {
    title: '2. Ce date colectăm?',
    subsections: [
      {
        subtitle: '2.1 Date furnizate de organizatori',
        text: `La crearea unui cont de organizator, colectăm: adresa de e-mail, numele și prenumele, codul IBAN al contului bancar destinat încasărilor. Aceste date sunt necesare pentru furnizarea serviciului și efectuarea plăților.`,
      },
      {
        subtitle: '2.2 Date furnizate de donatori',
        text: `Donatorii pot dona fără a-și crea un cont. La efectuarea unei donații, colectăm: numele afișat (opțional, dacă donatorul alege să fie vizibil), mesajul personal (opțional), suma donată, datele de plată procesate de Stripe (pentrumomente.ro nu stochează date de card — acestea sunt gestionate exclusiv de Stripe, certificat PCI DSS Level 1).`,
      },
      {
        subtitle: '2.3 Date tehnice',
        text: `Ca orice platformă web, colectăm în mod automat date tehnice anonimizate: adresa IP (anonimizată), tipul browserului și sistemul de operare, paginile vizitate și durata sesiunii. Aceste date sunt folosite exclusiv pentru securitate și analiză agregată.`,
      },
    ],
  },
  {
    title: '3. Scopul și temeiul prelucrării',
    subsections: [
      {
        subtitle: '3.1 Executarea contractului',
        text: `Prelucrăm datele organizatorilor pentru a furniza serviciul de creare și gestionare a paginilor de strângere de fonduri, inclusiv pentru efectuarea transferurilor bancare prin Wise Business. Temeiul legal este executarea contractului (Art. 6(1)(b) GDPR).`,
      },
      {
        subtitle: '3.2 Obligații legale',
        text: `Păstrăm datele tranzacționale (donații, transferuri) pentru o perioadă de 5 ani, conform obligațiilor fiscale și contabile prevăzute de legislația română. Temeiul legal este respectarea unei obligații legale (Art. 6(1)(c) GDPR).`,
      },
      {
        subtitle: '3.3 Interesul legitim',
        text: `Prelucrăm date tehnice anonimizate în scopul securizării platformei și prevenirii fraudelor. Temeiul legal este interesul legitim (Art. 6(1)(f) GDPR).`,
      },
      {
        subtitle: '3.4 Consimțământul',
        text: `Trimiterea de comunicări de marketing (dacă este cazul) se face exclusiv pe baza consimțământului explicit al utilizatorului, care poate fi retras oricând. Temeiul legal este consimțământul (Art. 6(1)(a) GDPR).`,
      },
    ],
  },
  {
    title: '4. Cine are acces la datele dumneavoastră?',
    content: `Datele dumneavoastră nu sunt vândute sau închiriate unor terți. Le partajăm doar cu furnizorii de servicii strict necesari operării platformei:\n\n• Stripe Inc. — procesarea plăților cu cardul (certificat PCI DSS Level 1, sediu în UE/EEA)\n• Wise Europe SA — transferuri bancare internaționale și naționale (instituție de plată autorizată de Banca Centrală a Belgiei)\n• Brevo (Sendinblue) — trimiterea e-mailurilor tranzacționale (date stocate în UE)\n• Supabase Inc. — stocarea datelor (servere în UE)\n• Vercel Inc. — găzduirea aplicației (servere în UE)\n\nToți furnizorii sunt legați prin acorduri de prelucrare a datelor (DPA) conforme GDPR.`,
  },
  {
    title: '5. Transferuri internaționale de date',
    content: `Datele sunt stocate și prelucrate în principal pe servere situate în Uniunea Europeană. Acolo unde este necesar un transfer în afara UE/EEA (de exemplu, anumite servicii cloud), ne asigurăm că sunt implementate garanții adecvate conform GDPR, inclusiv Clauzele Contractuale Standard (SCC) aprobate de Comisia Europeană.`,
  },
  {
    title: '6. Cât timp păstrăm datele?',
    content: `• Datele contului de organizator: pe durata activității contului + 30 de zile după ștergere\n• Datele tranzacționale (donații, transferuri): 5 ani, conform obligațiilor fiscale\n• Datele tehnice anonimizate: maximum 12 luni\n• Datele donatorilor care nu au cont: păstrate în legătură cu donația timp de 5 ani\n\nDupă expirarea perioadelor de retenție, datele sunt șterse sau anonimizate definitiv.`,
  },
  {
    title: '7. Drepturile dumneavoastră',
    content: `Conform GDPR, beneficiați de următoarele drepturi:\n\n• Dreptul de acces — puteți solicita o copie a datelor pe care le deținem despre dumneavoastră\n• Dreptul la rectificare — puteți solicita corectarea datelor inexacte\n• Dreptul la ștergere (dreptul de a fi uitat) — puteți solicita ștergerea datelor, în limitele obligațiilor legale\n• Dreptul la restricționarea prelucrării — puteți solicita suspendarea prelucrării datelor în anumite circumstanțe\n• Dreptul la portabilitatea datelor — puteți primi datele furnizate de dumneavoastră în format structurat, lizibil automat\n• Dreptul la opoziție — puteți obiecta față de prelucrarea bazată pe interes legitim\n• Dreptul de a retrage consimțământul — oricând, fără a afecta legalitatea prelucrării anterioare\n\nPentru exercitarea oricăruia dintre aceste drepturi, ne contactați la info@pentrumomente.ro. Vom răspunde în termen de 30 de zile calendaristice.`,
  },
  {
    title: '8. Dreptul de a depune o plângere',
    content: `Dacă considerați că prelucrarea datelor dumneavoastră încalcă GDPR, aveți dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), cu sediul în București, str. Olari nr. 32, sector 2. www.dataprotection.ro`,
  },
  {
    title: '9. Securitatea datelor',
    content: `Implementăm măsuri tehnice și organizatorice adecvate pentru protejarea datelor dumneavoastră împotriva accesului neautorizat, pierderii sau distrugerii: conexiuni criptate HTTPS (TLS 1.2+), acces bazat pe roluri cu autentificare cu doi factori pentru administratori, jurnale de audit pentru accesul la date sensibile, izolarea datelor de plată prin delegarea exclusivă către Stripe.`,
  },
  {
    title: '10. Modificări ale politicii',
    content: `Ne rezervăm dreptul de a actualiza această politică pentru a reflecta modificări legislative sau schimbări ale practicilor noastre. Vă vom notifica prin e-mail în cazul unor modificări semnificative. Continuarea utilizării platformei după notificare constituie acceptarea noii politici.`,
  },
  {
    title: '11. Contact',
    content: `Pentru orice întrebări sau solicitări privind prelucrarea datelor cu caracter personal:\n\ne-mail: info@pentrumomente.ro\nRăspuns garantat în maximum 30 de zile calendaristice.`,
  },
]

export default function PoliticaGDPRPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

        {/* Hero */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0F1A2E 0%, #1A2D4A 50%, #2A4A6E 100%)' }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #93C5FD 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-24 text-center">
            <p className="text-xs uppercase tracking-widest mb-4 font-medium" style={{ color: '#93C5FD' }}>Legal</p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 text-white">Politica GDPR</h1>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#BFDBFE' }}>
              Protecția datelor dumneavoastră personale este o prioritate. Iată cum colectăm, utilizăm și protejăm aceste date.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-4 gap-8">

            {/* Table of contents */}
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

            {/* Content */}
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
                            <p key={j} className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#5A4030' }}>{para}</p>
                          ))}
                        </div>
                      )}
                    </section>
                  ))}
                </div>

                <div className="mt-10 pt-6 rounded-xl p-5" style={{ backgroundColor: '#F5EDE3', borderTop: '2px solid #EAD8C8' }}>
                  <p className="text-sm font-medium mb-1" style={{ color: '#2D1A0E' }}>Întrebări despre datele dumneavoastră?</p>
                  <p className="text-sm" style={{ color: '#7A6652' }}>
                    Contactați-ne la{' '}
                    <a href="mailto:info@pentrumomente.ro" className="font-medium hover:underline" style={{ color: '#C4956A' }}>
                      info@pentrumomente.ro
                    </a>
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>← Acasă</Link>
                <Link href="/termeni-si-conditii" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>Termeni și Condiții</Link>
                <Link href="/politica-cookies" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>Politica Cookies</Link>
                <Link href="/contact" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>Contact</Link>
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  )
}
