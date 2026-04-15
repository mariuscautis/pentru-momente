import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { supabaseAdmin } from '@/lib/db/supabase'

export const dynamic = 'force-dynamic'

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

async function getGdprContent(): Promise<string> {
  try {
    const { data } = await supabaseAdmin
      .from('gdpr_content')
      .select('content')
      .eq('id', 1)
      .single()
    return data?.content ?? DEFAULT_GDPR
  } catch {
    return DEFAULT_GDPR
  }
}

function parseSections(md: string): Array<{ h2?: string; h3?: string; body?: string }> {
  const lines = md.split('\n')
  const sections: Array<{ h2?: string; h3?: string; body?: string }> = []
  let cur: { h2?: string; h3?: string; bodyLines: string[] } = { bodyLines: [] }
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (cur.bodyLines.length || cur.h2 || cur.h3)
        sections.push({ h2: cur.h2, h3: cur.h3, body: cur.bodyLines.join('\n') })
      cur = { h2: line.replace('## ', ''), bodyLines: [] }
    } else if (line.startsWith('### ')) {
      if (cur.bodyLines.length) {
        sections.push({ h2: cur.h2, h3: cur.h3, body: cur.bodyLines.join('\n') })
        cur = { h2: cur.h2, bodyLines: [] }
      }
      cur.h3 = line.replace('### ', '')
    } else if (!line.startsWith('#')) {
      cur.bodyLines.push(line)
    }
  }
  if (cur.bodyLines.length || cur.h2 || cur.h3)
    sections.push({ h2: cur.h2, h3: cur.h3, body: cur.bodyLines.join('\n') })
  return sections
}

export default async function PoliticaGDPRPage() {
  const content = await getGdprContent()
  const sections = parseSections(content)
  const h2Sections = sections.filter(s => s.h2)

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

            {h2Sections.length > 0 && (
              <aside className="hidden md:block md:col-span-1">
                <div className="sticky top-6 rounded-2xl p-5" style={{ backgroundColor: '#F5EDE3', border: '1px solid #EAD8C8' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9A7B60' }}>Cuprins</h3>
                  <nav className="space-y-1">
                    {h2Sections.map((s, i) => (
                      <a key={i} href={`#section-${i}`} className="block text-sm py-1 transition-colors hover:underline" style={{ color: '#5A4030' }}>
                        {s.h2}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

            <article className={h2Sections.length > 0 ? 'md:col-span-3' : 'md:col-span-4'}>
              <div className="rounded-2xl p-6 md:p-10 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EBE3' }}>
                <p className="text-xs mb-8 pb-4" style={{ color: '#9A7B60', borderBottom: '1px solid #F0EBE3' }}>
                  Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>

                <div className="space-y-8">
                  {sections.map((s, i) => (
                    <section key={i} id={s.h2 ? `section-${h2Sections.indexOf(s)}` : undefined}>
                      {s.h2 && (
                        <h2 className="text-xl font-bold mb-4 pb-2" style={{ color: '#2D1A0E', borderBottom: '2px solid #F5EDE3' }}>
                          {s.h2}
                        </h2>
                      )}
                      {s.h3 && <h3 className="text-base font-semibold mb-3 mt-5" style={{ color: '#2D1A0E' }}>{s.h3}</h3>}
                      {s.body && (
                        <div className="space-y-3">
                          {s.body.split('\n').filter(line => line.trim()).map((line, j) => (
                            <p key={j} className="text-sm leading-relaxed" style={{ color: '#5A4030' }}>{line}</p>
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

const DEFAULT_GDPR = `## 1. Operatorul de date

Operatorul de date cu caracter personal este pentrumomente.ro, platformă online de strângere de fonduri pentru evenimente de viață, cu sediul în România. Ne puteți contacta la info@pentrumomente.ro.

## 2. Ce date colectăm?

### 2.1 Date furnizate de organizatori

La crearea unui cont, colectăm: adresa de e-mail, numele și prenumele, codul IBAN al contului bancar destinat încasărilor.

### 2.2 Date furnizate de donatori

Donatorii pot dona fără a-și crea un cont. Colectăm: numele afișat (opțional), mesajul personal (opțional), suma donată. Datele de card sunt gestionate exclusiv de Stripe (certificat PCI DSS Level 1) — pentrumomente.ro nu stochează date de card.

### 2.3 Date tehnice

Colectăm date tehnice anonimizate: adresa IP (anonimizată), tipul browserului, paginile vizitate și durata sesiunii. Acestea sunt folosite exclusiv pentru securitate și analiză agregată.

## 3. Scopul și temeiul prelucrării

### 3.1 Executarea contractului

Prelucrăm datele organizatorilor pentru furnizarea serviciului, inclusiv transferurile bancare prin Wise Business. Temei legal: Art. 6(1)(b) GDPR.

### 3.2 Obligații legale

Păstrăm datele tranzacționale 5 ani, conform obligațiilor fiscale. Temei legal: Art. 6(1)(c) GDPR.

### 3.3 Interesul legitim

Prelucrăm date tehnice anonimizate pentru securizarea platformei și prevenirea fraudelor. Temei legal: Art. 6(1)(f) GDPR.

## 4. Cine are acces la datele dumneavoastră?

Datele nu sunt vândute sau închiriate. Le partajăm doar cu furnizorii strict necesari: Stripe Inc. (procesarea plăților), Wise Europe SA (transferuri bancare), Brevo (e-mailuri tranzacționale), Supabase Inc. (stocarea datelor), Vercel Inc. (găzduire). Toți furnizorii sunt legați prin acorduri DPA conforme GDPR.

## 5. Transferuri internaționale de date

Datele sunt stocate în principal în UE. Acolo unde este necesar un transfer în afara UE/EEA, implementăm Clauzele Contractuale Standard (SCC) aprobate de Comisia Europeană.

## 6. Cât timp păstrăm datele?

Datele contului de organizator: pe durata activității + 30 de zile după ștergere. Datele tranzacționale: 5 ani. Datele tehnice anonimizate: maximum 12 luni.

## 7. Drepturile dumneavoastră

Conform GDPR, beneficiați de: dreptul de acces, dreptul la rectificare, dreptul la ștergere, dreptul la restricționarea prelucrării, dreptul la portabilitatea datelor, dreptul la opoziție și dreptul de a retrage consimțământul. Pentru exercitarea acestor drepturi, contactați-ne la info@pentrumomente.ro. Vom răspunde în termen de 30 de zile.

## 8. Dreptul de a depune o plângere

Puteți depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), str. Olari nr. 32, sector 2, București. www.dataprotection.ro

## 9. Securitatea datelor

Implementăm: conexiuni criptate HTTPS (TLS 1.2+), acces bazat pe roluri cu autentificare în doi factori pentru administratori, jurnale de audit și izolarea datelor de plată prin delegarea exclusivă către Stripe.

## 10. Modificări ale politicii

Ne rezervăm dreptul de a actualiza această politică. Veți fi notificați prin e-mail în cazul unor modificări semnificative.

## 11. Contact

e-mail: info@pentrumomente.ro. Răspuns garantat în maximum 30 de zile calendaristice.
`
