import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { supabaseAdmin } from '@/lib/db/supabase'

export const dynamic = 'force-dynamic'

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

async function getCookiesContent(): Promise<string> {
  try {
    const { data } = await supabaseAdmin
      .from('cookies_content')
      .select('content')
      .eq('id', 1)
      .single()
    return data?.content ?? DEFAULT_COOKIES
  } catch {
    return DEFAULT_COOKIES
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

export default async function PoliticaCookiesPage() {
  const content = await getCookiesContent()
  const sections = parseSections(content)
  const h2Sections = sections.filter(s => s.h2)

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

const DEFAULT_COOKIES = `## 1. Ce sunt cookie-urile?

Cookie-urile sunt fișiere text de mici dimensiuni stocate pe dispozitivul dumneavoastră atunci când vizitați un site web. Ele permit site-ului să vă recunoască dispozitivul la vizitele ulterioare și să rețină anumite preferințe sau acțiuni efectuate anterior.

## 2. Ce tipuri de cookie-uri folosim?

### 2.1 Cookie-uri strict necesare

Aceste cookie-uri sunt esențiale pentru funcționarea platformei. Fără ele, serviciile solicitate nu pot fi furnizate. Includ cookie-uri de sesiune pentru autentificarea organizatorilor și cookie-uri de securitate pentru protejarea formularelor de plată. Nu pot fi dezactivate.

### 2.2 Cookie-uri funcționale

Permit platformei să rețină alegerile dumneavoastră și să ofere funcții îmbunătățite. Datele colectate nu vă pot urmări activitatea pe alte site-uri.

### 2.3 Cookie-uri analitice

Utilizăm servicii de analiză anonimă pentru a îmbunătăți experiența utilizatorilor. Datele sunt agregate și anonimizate — nu permit identificarea personală.

### 2.4 Cookie-uri de la terți

Stripe (procesatorul de plăți) poate plasa cookie-uri tehnice în cadrul fluxului de plată, necesare pentru securitatea tranzacțiilor. Acestea sunt guvernate de politica de confidențialitate a Stripe.

## 3. Durata de stocare

Cookie-urile de sesiune sunt șterse automat la închiderea browserului. Cookie-urile persistente rămân pe dispozitiv pentru o perioadă determinată (30 de zile – 12 luni), după care expiră automat sau pot fi șterse manual.

## 4. Cum puteți gestiona cookie-urile?

Puteți controla și/sau șterge cookie-urile după preferință din setările browserului dumneavoastră. Rețineți că dezactivarea unor cookie-uri poate afecta funcționalitatea platformei.

## 5. Consimțământul dumneavoastră

Prin continuarea utilizării platformei pentrumomente.ro, vă exprimați acordul cu privire la utilizarea cookie-urilor strict necesare și funcționale. Cookie-urile analitice sunt activate doar cu consimțământul explicit.

## 6. Actualizări ale politicii

Ne rezervăm dreptul de a actualiza această politică periodic. Vă recomandăm să consultați această pagină în mod regulat.

## 7. Contact

Pentru orice întrebări legate de utilizarea cookie-urilor, ne puteți contacta la info@pentrumomente.ro.
`
