import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { supabaseAdmin } from '@/lib/db/supabase'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Termeni și Condiții · pentrumomente.ro',
  description: 'Termenii și condițiile de utilizare a platformei pentrumomente.ro.',
  openGraph: {
    title: 'Termeni și Condiții · pentrumomente.ro',
    siteName: 'pentrumomente.ro',
    locale: 'ro_RO',
    type: 'website',
  },
}

async function getTermsContent(): Promise<string> {
  try {
    const { data } = await supabaseAdmin
      .from('terms_content')
      .select('content')
      .eq('id', 1)
      .single()
    return data?.content ?? DEFAULT_TERMS
  } catch {
    return DEFAULT_TERMS
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

export default async function TermeniPage() {
  const content = await getTermsContent()
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
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 text-white">Termeni și Condiții</h1>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#BFDBFE' }}>
              Vă rugăm să citiți cu atenție acești termeni înainte de a utiliza platforma pentrumomente.ro.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-4 gap-8">

            {/* Table of contents — sticky on desktop */}
            {h2Sections.length > 0 && (
              <aside className="hidden md:block md:col-span-1">
                <div className="sticky top-6 rounded-2xl p-5" style={{ backgroundColor: '#F5EDE3', border: '1px solid #EAD8C8' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9A7B60' }}>Cuprins</h3>
                  <nav className="space-y-1">
                    {h2Sections.map((s, i) => (
                      <a
                        key={i}
                        href={`#section-${i}`}
                        className="block text-sm py-1 transition-colors hover:underline"
                        style={{ color: '#5A4030' }}
                      >
                        {s.h2}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

            {/* Content */}
            <article className={h2Sections.length > 0 ? 'md:col-span-3' : 'md:col-span-4'}>
              <div
                className="rounded-2xl p-6 md:p-10 shadow-sm"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EBE3' }}
              >
                {/* Last updated */}
                <p className="text-xs mb-8 pb-4" style={{ color: '#9A7B60', borderBottom: '1px solid #F0EBE3' }}>
                  Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>

                <div className="space-y-8">
                  {sections.map((s, i) => (
                    <section key={i} id={s.h2 ? `section-${h2Sections.indexOf(s)}` : undefined}>
                      {s.h2 && (
                        <h2
                          className="text-xl font-bold mb-4 pb-2"
                          style={{ color: '#2D1A0E', borderBottom: '2px solid #F5EDE3' }}
                        >
                          {s.h2}
                        </h2>
                      )}
                      {s.h3 && (
                        <h3 className="text-base font-semibold mb-3 mt-5" style={{ color: '#2D1A0E' }}>{s.h3}</h3>
                      )}
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

                {/* Contact footer */}
                <div className="mt-10 pt-6 rounded-xl p-5" style={{ backgroundColor: '#F5EDE3', borderTop: '2px solid #EAD8C8' }}>
                  <p className="text-sm font-medium mb-1" style={{ color: '#2D1A0E' }}>Întrebări despre acești termeni?</p>
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
                <Link href="/despre-noi" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>Despre noi</Link>
                <Link href="/contact" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>Contact</Link>
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  )
}

const DEFAULT_TERMS = `## 1. Introducere

Bun venit pe pentrumomente.ro. Prin utilizarea acestei platforme, acceptați termenii și condițiile descrise mai jos.

## 2. Serviciile oferite

### 2.1 Crearea paginilor de donații

pentrumomente.ro permite utilizatorilor înregistrați să creeze pagini de strângere de fonduri pentru evenimente de viață, inclusiv funeralii, nunți, nașteri și situații medicale.

### 2.2 Procesarea plăților

Plățile sunt procesate prin Stripe, un furnizor de servicii de plată licențiat. Fondurile sunt transferate organizatorilor prin intermediul Wise Business.

## 3. Responsabilitățile utilizatorilor

Utilizatorii sunt responsabili pentru acuratețea informațiilor furnizate pe paginile lor și pentru utilizarea legală a fondurilor colectate.

## 4. Comisioane și taxe

Platforma se susține prin contribuții voluntare ale donatorilor la momentul donației. Nu se percepe comision din suma donată organizatorului.

## 5. Confidențialitate

Datele personale sunt prelucrate în conformitate cu GDPR. Nu vindem și nu partajăm datele utilizatorilor cu terți în scopuri comerciale.

## 6. Modificarea termenilor

Rezervăm dreptul de a modifica acești termeni. Veți fi notificați prin email în cazul unor modificări semnificative.

## 7. Contact

Pentru orice întrebări legate de acești termeni, contactați-ne la info@pentrumomente.ro.
`
