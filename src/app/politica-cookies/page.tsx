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

export default async function PoliticaCookiesPage() {
  const content = await getCookiesContent()

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
          <div className="rounded-2xl p-6 md:p-10 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EBE3' }}>
            <p className="text-xs mb-8 pb-4" style={{ color: '#9A7B60', borderBottom: '1px solid #F0EBE3' }}>
              Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <div
              className="legal-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />

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
        </div>
      </main>
    </>
  )
}

const DEFAULT_COOKIES = `
<div class="legal-summary-box">
  <strong>Pe scurt:</strong> Folosim cookie-uri strict necesare pentru funcționarea platformei (nu necesită consimțământ) și cookie-uri opționale pentru analiză și marketing (necesită consimțământul dvs. explicit, acordat prin bannerul de cookies afișat la prima vizită).
</div>

<h2>1. Ce sunt cookie-urile?</h2>
<p>Cookie-urile sunt fișiere text de dimensiuni mici, stocate pe dispozitivul dvs. (computer, telefon, tabletă) atunci când vizitați un site web. Acestea permit site-ului să vă recunoască la vizite ulterioare, să rețină preferințele dvs. și să funcționeze corect.</p>
<p>Pe lângă cookie-urile clasice, utilizăm și tehnologii similare precum:</p>
<ul>
  <li><strong>Local Storage / Session Storage:</strong> spații de stocare din browser, similare cookie-urilor, utilizate pentru menținerea sesiunii;</li>
  <li><strong>Pixel / Web Beacon:</strong> imagini de 1×1 pixel invizibile, utilizate pentru măsurarea comportamentului pe pagini;</li>
  <li><strong>Fingerprinting:</strong> <em>Nu utilizăm</em> tehnici de identificare a browserului sau dispozitivului în scopuri de tracking.</li>
</ul>

<h2>2. Cadrul legal aplicabil</h2>
<p>Utilizarea cookie-urilor este reglementată de:</p>
<ul>
  <li><strong>Directiva ePrivacy 2002/58/CE</strong>, transpusă în România prin <strong>Legea nr. 506/2004</strong> privind prelucrarea datelor cu caracter personal și protecția vieții private în sectorul comunicațiilor electronice, cu modificările ulterioare;</li>
  <li><strong>Regulamentul (UE) 2016/679 (GDPR)</strong> — aplicabil datelor cu caracter personal colectate prin cookie-uri;</li>
  <li>Ghidul privind cookie-urile emis de <strong>ANSPDCP</strong> și <strong>EDPB</strong> (Comitetul European pentru Protecția Datelor).</li>
</ul>
<p>Cookie-urile strict necesare nu necesită consimțământ. Toate celelalte categorii necesită acordul dvs. prealabil, liber exprimat, specific, informat și neechivoc.</p>

<h2>3. Ce cookie-uri folosim</h2>

<h3>Cookie-uri strict necesare — nu necesită consimțământ</h3>
<p>Esențiale pentru funcționarea de bază a Platformei. Fără acestea, serviciile nu pot fi furnizate. Nu pot fi dezactivate.</p>
<table>
  <thead><tr><th>Nume cookie</th><th>Furnizor</th><th>Scop</th><th>Durată</th></tr></thead>
  <tbody>
    <tr><td><code>session_id</code></td><td>pentrumomente.ro</td><td>Menținerea sesiunii de autentificare</td><td>Sesiune</td></tr>
    <tr><td><code>csrf_token</code></td><td>pentrumomente.ro</td><td>Protecție împotriva atacurilor CSRF</td><td>Sesiune</td></tr>
    <tr><td><code>cookie_consent</code></td><td>pentrumomente.ro</td><td>Reținerea preferințelor privind cookie-urile</td><td>12 luni</td></tr>
    <tr><td><code>lang_pref</code></td><td>pentrumomente.ro</td><td>Reținerea preferinței de limbă</td><td>12 luni</td></tr>
    <tr><td><code>__stripe_sid</code>, <code>__stripe_mid</code></td><td>Stripe</td><td>Procesarea securizată a plăților</td><td>30 min / 1 an</td></tr>
  </tbody>
</table>

<h3>Cookie-uri funcționale — necesită consimțământ</h3>
<p>Îmbunătățesc experiența de utilizare prin reținerea preferințelor și personalizarea interfeței. Dezactivarea lor nu afectează funcționalitatea de bază.</p>
<table>
  <thead><tr><th>Nume cookie</th><th>Furnizor</th><th>Scop</th><th>Durată</th></tr></thead>
  <tbody>
    <tr><td><code>ui_theme</code></td><td>pentrumomente.ro</td><td>Preferință temă (light/dark)</td><td>6 luni</td></tr>
    <tr><td><code>recently_viewed</code></td><td>pentrumomente.ro</td><td>Campanii vizitate recent</td><td>30 zile</td></tr>
  </tbody>
</table>

<h3>Cookie-uri de analiză — necesită consimțământ</h3>
<p>Ne ajută să înțelegem cum este utilizată Platforma, ce pagini sunt populare și unde apar erori. Datele sunt agregate și, pe cât posibil, anonimizate.</p>
<table>
  <thead><tr><th>Nume cookie</th><th>Furnizor</th><th>Scop</th><th>Durată</th></tr></thead>
  <tbody>
    <tr><td><code>_ga</code></td><td>Google Analytics</td><td>Identificare utilizator unic (anonimizat)</td><td>2 ani</td></tr>
    <tr><td><code>_ga_XXXXXXX</code></td><td>Google Analytics</td><td>Menținerea stării sesiunii GA</td><td>2 ani</td></tr>
    <tr><td><code>_gid</code></td><td>Google Analytics</td><td>Distincție utilizatori în 24h</td><td>24 ore</td></tr>
    <tr><td><code>_gat</code></td><td>Google Analytics</td><td>Limitarea ratei de solicitări</td><td>1 minut</td></tr>
  </tbody>
</table>
<p>Utilizăm Google Analytics cu anonimizarea adresei IP activată (<code>anonymizeIp: true</code>).</p>

<h3>Cookie-uri de marketing — necesită consimțământ</h3>
<p>Utilizate pentru afișarea de reclame relevante și măsurarea eficacității campaniilor de marketing. Sunt active numai dacă ați acordat consimțământul explicit.</p>
<table>
  <thead><tr><th>Nume cookie</th><th>Furnizor</th><th>Scop</th><th>Durată</th></tr></thead>
  <tbody>
    <tr><td><code>_fbp</code></td><td>Meta (Facebook)</td><td>Identificare vizitatori pentru Facebook Pixel</td><td>90 zile</td></tr>
    <tr><td><code>_fbc</code></td><td>Meta (Facebook)</td><td>Urmărire conversii din reclame Facebook</td><td>90 zile</td></tr>
  </tbody>
</table>

<h2>4. Cookie-uri terțe</h2>
<p>Unele cookie-uri sunt plasate de servicii terțe pe care le integrăm. Aceste servicii au propriile politici de confidențialitate:</p>
<ul>
  <li><strong>Google Analytics:</strong> policies.google.com/privacy</li>
  <li><strong>Meta (Facebook Pixel):</strong> facebook.com/privacy/policy</li>
  <li><strong>Stripe (procesare plăți):</strong> stripe.com/en-ro/privacy</li>
</ul>
<p>Nu avem control asupra cookie-urilor plasate de acești terți și vă recomandăm să consultați politicile lor de confidențialitate.</p>

<h2>5. Consimțământ și preferințe</h2>
<p>La prima vizită pe Platforma noastră, vi se afișează un banner de cookies care vă permite să acceptați toate categoriile sau să alegeți individual. Preferințele dvs. sunt salvate și aplicate imediat. Le puteți modifica oricând din butonul „Preferințe cookies" din subsolul site-ului.</p>
<p><strong>Consimțământ valid:</strong> Ne asigurăm că:</p>
<ul>
  <li>opțiunea „Refuz" sau „Numai necesare" este la fel de accesibilă ca opțiunea „Acceptă toate";</li>
  <li>nu folosim design manipulativ (dark patterns) în bannerul de cookies;</li>
  <li>înregistrăm data, ora și versiunea politicii pentru care v-ați exprimat consimțământul;</li>
  <li>consimțământul este reînnoit la modificări semnificative ale politicii sau la expirarea perioadei de 12 luni.</li>
</ul>
<p><strong>Retragerea consimțământului:</strong> Puteți retrage oricând consimțământul acordat, fără nicio consecință, prin accesarea panoului de preferințe cookies din subsolul site-ului sau trimițând o solicitare la <strong>cookies@pentrumomente.ro</strong>.</p>

<h2>6. Cum dezactivați cookie-urile din browser</h2>
<p>Pe lângă panoul nostru de preferințe, puteți gestiona sau șterge cookie-urile direct din browser-ul dvs.:</p>
<ul>
  <li><strong>Google Chrome:</strong> Setări → Confidențialitate și securitate → Cookie-uri</li>
  <li><strong>Mozilla Firefox:</strong> Preferințe → Confidențialitate și securitate</li>
  <li><strong>Safari:</strong> Preferințe → Confidențialitate → Gestionare date site</li>
  <li><strong>Microsoft Edge:</strong> Setări → Confidențialitate, căutare și servicii</li>
</ul>
<p>Pentru dispozitive mobile, consultați setările browserului instalat pe dispozitivul dvs.</p>

<h2>7. Impactul dezactivării cookie-urilor</h2>
<p>Dezactivarea cookie-urilor strict necesare poate face Platforma inutilizabilă (nu vă puteți autentifica, nu puteți efectua donații). Dezactivarea cookie-urilor opționale nu afectează funcționalitățile de bază, dar poate reduce calitatea experienței de utilizare.</p>

<h2>8. Modificarea politicii de cookies</h2>
<p>Putem actualiza prezenta Politică de Cookies ori de câte ori este necesar. Data ultimei actualizări este indicată în antetul documentului. Modificările semnificative vor fi comunicate printr-un nou banner de consimțământ.</p>

<h2>9. Contact</h2>
<p>Pentru întrebări sau nelămuriri privind utilizarea cookie-urilor pe Platforma noastră:</p>
<ul>
  <li><strong>E-mail:</strong> cookies@pentrumomente.ro</li>
  <li><strong>E-mail GDPR general:</strong> gdpr@pentrumomente.ro</li>
</ul>
`
