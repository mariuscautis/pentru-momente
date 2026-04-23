import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { supabaseAdmin } from '@/lib/db/supabase'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('termeni-si-conditii', {
    title: 'Termeni și Condiții · pentrumomente.ro',
    description: 'Termenii și condițiile de utilizare a platformei pentrumomente.ro.',
    openGraph: { siteName: 'pentrumomente.ro', locale: 'ro_RO', type: 'website' },
  })
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

export default async function TermeniPage() {
  const content = await getTermsContent()

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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div
            className="rounded-2xl p-6 md:p-10 shadow-sm"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EBE3' }}
          >
            <p className="text-xs mb-8 pb-4" style={{ color: '#9A7B60', borderBottom: '1px solid #F0EBE3' }}>
              Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <div
              className="legal-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />

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
        </div>
      </main>
    </>
  )
}

const DEFAULT_TERMS = `
<h2>1. Introducere</h2>
<p>Bun venit pe pentrumomente.ro. Prin utilizarea acestei platforme, acceptați termenii și condițiile descrise mai jos.</p>

<h2>2. Serviciile oferite</h2>
<h3>2.1 Crearea paginilor de donații</h3>
<p>pentrumomente.ro permite utilizatorilor înregistrați să creeze pagini de strângere de fonduri pentru evenimente de viață, inclusiv funeralii, nunți, nașteri și situații medicale.</p>
<h3>2.2 Procesarea plăților</h3>
<p>Plățile sunt procesate prin Stripe, un furnizor de servicii de plată licențiat. Fondurile sunt transferate organizatorilor direct în contul lor bancar prin Stripe Connect.</p>

<h2>3. Responsabilitățile utilizatorilor</h2>
<p>Utilizatorii sunt responsabili pentru acuratețea informațiilor furnizate pe paginile lor și pentru utilizarea legală a fondurilor colectate.</p>

<h2>4. Comisioane și taxe</h2>
<p>Platforma se susține prin contribuții voluntare ale donatorilor la momentul donației. Nu se percepe comision din suma donată organizatorului.</p>

<h2>5. Confidențialitate</h2>
<p>Datele personale sunt prelucrate în conformitate cu GDPR. Nu vindem și nu partajăm datele utilizatorilor cu terți în scopuri comerciale.</p>

<h2>6. Modificarea termenilor</h2>
<p>Rezervăm dreptul de a modifica acești termeni. Veți fi notificați prin email în cazul unor modificări semnificative.</p>

<h2>7. Contact</h2>
<p>Pentru orice întrebări legate de acești termeni, contactați-ne la info@pentrumomente.ro.</p>
`
