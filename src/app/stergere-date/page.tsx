import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Ștergere Date Utilizator · pentrumomente.ro',
  description: 'Cum poți solicita ștergerea datelor tale personale de pe platforma pentrumomente.ro, conform dreptului de a fi uitat (GDPR Art. 17).',
  openGraph: {
    title: 'Ștergere Date Utilizator · pentrumomente.ro',
    siteName: 'pentrumomente.ro',
    locale: 'ro_RO',
    type: 'website',
  },
}

const sections = [
  {
    title: 'Dreptul tău de a fi uitat',
    body: `Conform Regulamentului General privind Protecția Datelor (GDPR, Art. 17), ai dreptul să soliciți ștergerea datelor tale cu caracter personal deținute de pentrumomente.ro. Vom procesa orice solicitare validă în termen de 30 de zile calendaristice.`,
  },
  {
    title: 'Ce date sunt șterse',
    items: [
      'Contul tău de utilizator (adresă de e-mail, nume, metodă de autentificare)',
      'Paginile de strângere de fonduri create de tine',
      'Datele bancare (IBAN) asociate contului',
      'Mesajele și preferințele de notificare',
      'Orice date de sesiune sau token-uri de autentificare',
    ],
  },
  {
    title: 'Ce date nu pot fi șterse',
    body: `Anumite date sunt păstrate conform obligațiilor legale și nu pot fi șterse la cerere:`,
    items: [
      'Înregistrările tranzacțiilor financiare (donații, transferuri) — păstrate 5 ani conform legislației fiscale române',
      'Date anonimizate agregate utilizate pentru statistici (nu permit identificarea ta)',
      'Înregistrările necesare pentru prevenirea fraudelor, în limitele prevăzute de lege',
    ],
  },
  {
    title: 'Cum trimiți o solicitare de ștergere',
    steps: [
      {
        number: '01',
        title: 'Trimite un e-mail',
        desc: 'Scrie la info@pentrumomente.ro cu subiectul: „Solicitare ștergere date — [adresa ta de e-mail]".',
      },
      {
        number: '02',
        title: 'Confirmăm identitatea',
        desc: 'Te vom contacta pentru a verifica că solicitarea vine de la titularul contului. De regulă, un simplu răspuns de la adresa de e-mail asociată contului este suficient.',
      },
      {
        number: '03',
        title: 'Procesăm solicitarea',
        desc: 'Ștergem datele eligibile din toate sistemele noastre (bază de date, backup-uri, furnizori terți) în termen de 30 de zile.',
      },
      {
        number: '04',
        title: 'Confirmare finală',
        desc: 'Îți trimitem un e-mail de confirmare când procesul este complet.',
      },
    ],
  },
  {
    title: 'Alternativă: ștergere din cont',
    body: `Dacă ai un cont activ pe pentrumomente.ro, poți iniția ștergerea direct din panoul de control al contului tău (Setări → Șterge contul). Această acțiune este ireversibilă și va declanșa același proces de ștergere descris mai sus.`,
  },
  {
    title: 'Autentificare prin Facebook sau Google',
    body: `Dacă te-ai înregistrat folosind Facebook Login sau Google, ștergerea contului de pe pentrumomente.ro nu îți va șterge automat contul Facebook sau Google. Datele partajate de aceste platforme cu noi (numele și adresa de e-mail) vor fi șterse din sistemele noastre. Pentru a revoca accesul aplicației:\n\n• Facebook: Setări → Securitate și autentificare → Aplicații și site-uri web → Elimină pentrumomente.ro\n• Google: myaccount.google.com → Securitate → Aplicații terțe cu acces → Elimină accesul`,
  },
  {
    title: 'Timp de răspuns și escaladare',
    body: `Ne angajăm să răspundem oricărei solicitări de ștergere în termen de 30 de zile calendaristice. Dacă solicitarea este complexă sau volumul de cereri este ridicat, putem extinde acest termen cu încă 60 de zile, cu notificare prealabilă.\n\nDacă consideri că solicitarea ta nu a fost procesată corespunzător, poți depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP): www.dataprotection.ro`,
  },
]

export default function StergereDataPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

        {/* Hero */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1A0A0A 0%, #3D1515 50%, #6B2424 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #F87171 1px, transparent 0)', backgroundSize: '32px 32px' }}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-24 text-center">
            <p className="text-xs uppercase tracking-widest mb-4 font-medium" style={{ color: '#FCA5A5' }}>Legal · GDPR Art. 17</p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 text-white">Ștergere Date Utilizator</h1>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#FECACA' }}>
              Ai dreptul să soliciți ștergerea datelor tale personale. Iată cum funcționează procesul.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-4 gap-8">

            {/* Sticky TOC */}
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

                {/* Quick CTA */}
                <div className="mt-5 pt-4" style={{ borderTop: '1px solid #EAD8C8' }}>
                  <p className="text-xs mb-2" style={{ color: '#9A7B60' }}>Solicitare rapidă:</p>
                  <a
                    href="mailto:info@pentrumomente.ro?subject=Solicitare%20ștergere%20date"
                    className="block text-xs font-semibold px-3 py-2 rounded-lg text-center transition-opacity hover:opacity-80"
                    style={{ backgroundColor: '#C4956A', color: '#fff' }}
                  >
                    Trimite solicitarea
                  </a>
                </div>
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

                <div className="space-y-10">
                  {sections.map((s, i) => (
                    <section key={i} id={`section-${i}`}>
                      <h2
                        className="text-xl font-bold mb-4 pb-2"
                        style={{ color: '#2D1A0E', borderBottom: '2px solid #F5EDE3' }}
                      >
                        {s.title}
                      </h2>

                      {'steps' in s && s.steps ? (
                        <div className="space-y-4 mt-2">
                          {s.steps.map((step) => (
                            <div
                              key={step.number}
                              className="flex gap-4 rounded-xl p-4"
                              style={{ backgroundColor: '#FDFAF7', border: '1px solid #F0EBE3' }}
                            >
                              <span
                                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: '#F5EDE3', color: '#C4956A' }}
                              >
                                {step.number}
                              </span>
                              <div>
                                <p className="text-sm font-semibold mb-0.5" style={{ color: '#2D1A0E' }}>{step.title}</p>
                                <p className="text-sm leading-relaxed" style={{ color: '#5A4030' }}>{step.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {'body' in s && s.body && (
                            <div className="space-y-3 mb-4">
                              {s.body.split('\n\n').map((para, j) => (
                                <p key={j} className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#5A4030' }}>{para}</p>
                              ))}
                            </div>
                          )}
                          {'items' in s && s.items && (
                            <ul className="space-y-2 mt-2">
                              {s.items.map((item, j) => (
                                <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: '#5A4030' }}>
                                  <span className="mt-1 shrink-0" style={{ color: '#C4956A' }}>✓</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      )}
                    </section>
                  ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-10 pt-6 rounded-xl p-5" style={{ backgroundColor: '#F5EDE3', borderTop: '2px solid #EAD8C8' }}>
                  <p className="text-sm font-medium mb-1" style={{ color: '#2D1A0E' }}>Gata să trimiți solicitarea?</p>
                  <p className="text-sm mb-3" style={{ color: '#7A6652' }}>
                    Scrie-ne la{' '}
                    <a
                      href="mailto:info@pentrumomente.ro?subject=Solicitare%20ștergere%20date"
                      className="font-medium hover:underline"
                      style={{ color: '#C4956A' }}
                    >
                      info@pentrumomente.ro
                    </a>{' '}
                    cu subiectul <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#EAD8C8', color: '#5A4030' }}>Solicitare ștergere date — [email-ul tău]</span>
                  </p>
                  <a
                    href="mailto:info@pentrumomente.ro?subject=Solicitare%20ștergere%20date"
                    className="inline-block text-sm font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
                    style={{ backgroundColor: '#C4956A', color: '#fff' }}
                  >
                    Trimite solicitarea acum →
                  </a>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>← Acasă</Link>
                <Link href="/politica-gdpr" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>Politica GDPR</Link>
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
