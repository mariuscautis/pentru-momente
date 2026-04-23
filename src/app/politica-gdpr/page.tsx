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
    description: 'Politica de confidențialitate și protecția datelor cu caracter personal conform Regulamentului GDPR.',
    siteName: 'pentrumomente.ro',
    locale: 'ro_RO',
    type: 'website',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'pentrumomente.ro' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Politica GDPR · pentrumomente.ro',
    description: 'Politica de confidențialitate și protecția datelor cu caracter personal conform Regulamentului GDPR.',
    images: ['/og-image.svg'],
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

export default async function PoliticaGDPRPage() {
  const content = await getGdprContent()

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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="rounded-2xl p-6 md:p-10 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EBE3' }}>
            <p className="text-xs mb-8 pb-4" style={{ color: '#9A7B60', borderBottom: '1px solid #F0EBE3' }}>
              Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <div
              className="legal-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />

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
        </div>
      </main>
    </>
  )
}

const DEFAULT_GDPR = `
<h2>1. Operatorul de date</h2>
<p>Operatorul de date cu caracter personal este pentrumomente.ro, platformă online de strângere de fonduri pentru evenimente de viață, cu sediul în România. Ne puteți contacta la info@pentrumomente.ro.</p>

<h2>2. Ce date colectăm?</h2>
<h3>2.1 Date furnizate de organizatori</h3>
<p>La crearea unui cont, colectăm: adresa de e-mail, numele și prenumele.</p>
<h3>2.2 Date furnizate de donatori</h3>
<p>Donatorii pot dona fără a-și crea un cont. Colectăm: numele afișat (opțional), mesajul personal (opțional), suma donată. Datele de card sunt gestionate exclusiv de Stripe (certificat PCI DSS Level 1) — pentrumomente.ro nu stochează date de card.</p>
<h3>2.3 Date tehnice</h3>
<p>Colectăm date tehnice anonimizate: adresa IP (anonimizată), tipul browserului, paginile vizitate și durata sesiunii. Acestea sunt folosite exclusiv pentru securitate și analiză agregată.</p>

<h2>3. Scopul și temeiul prelucrării</h2>
<h3>3.1 Executarea contractului</h3>
<p>Prelucrăm datele organizatorilor pentru furnizarea serviciului, inclusiv transferurile bancare prin Stripe Connect. Temei legal: Art. 6(1)(b) GDPR.</p>
<h3>3.2 Obligații legale</h3>
<p>Păstrăm datele tranzacționale 5 ani, conform obligațiilor fiscale. Temei legal: Art. 6(1)(c) GDPR.</p>
<h3>3.3 Interesul legitim</h3>
<p>Prelucrăm date tehnice anonimizate pentru securizarea platformei și prevenirea fraudelor. Temei legal: Art. 6(1)(f) GDPR.</p>

<h2>4. Cine are acces la datele dumneavoastră?</h2>
<p>Datele nu sunt vândute sau închiriate. Le partajăm doar cu furnizorii strict necesari: Stripe Inc. (procesarea plăților și transferuri bancare), Brevo (e-mailuri tranzacționale), Supabase Inc. (stocarea datelor), Vercel Inc. (găzduire). Toți furnizorii sunt legați prin acorduri DPA conforme GDPR.</p>

<h2>5. Transferuri internaționale de date</h2>
<p>Datele sunt stocate în principal în UE. Acolo unde este necesar un transfer în afara UE/EEA, implementăm Clauzele Contractuale Standard (SCC) aprobate de Comisia Europeană.</p>

<h2>6. Cât timp păstrăm datele?</h2>
<p>Datele contului de organizator: pe durata activității + 30 de zile după ștergere. Datele tranzacționale: 5 ani. Datele tehnice anonimizate: maximum 12 luni.</p>

<h2>7. Drepturile dumneavoastră</h2>
<p>Conform GDPR, beneficiați de: dreptul de acces, dreptul la rectificare, dreptul la ștergere, dreptul la restricționarea prelucrării, dreptul la portabilitatea datelor, dreptul la opoziție și dreptul de a retrage consimțământul. Pentru exercitarea acestor drepturi, contactați-ne la info@pentrumomente.ro. Vom răspunde în termen de 30 de zile.</p>

<h2>8. Dreptul de a depune o plângere</h2>
<p>Puteți depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), str. Olari nr. 32, sector 2, București. www.dataprotection.ro</p>

<h2>9. Securitatea datelor</h2>
<p>Implementăm: conexiuni criptate HTTPS (TLS 1.2+), acces bazat pe roluri cu autentificare în doi factori pentru administratori, jurnale de audit și izolarea datelor de plată prin delegarea exclusivă către Stripe.</p>

<h2>10. Modificări ale politicii</h2>
<p>Ne rezervăm dreptul de a actualiza această politică. Veți fi notificați prin e-mail în cazul unor modificări semnificative.</p>

<h2>11. Contact</h2>
<p>e-mail: info@pentrumomente.ro. Răspuns garantat în maximum 30 de zile calendaristice.</p>
`
