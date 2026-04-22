'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Mail, Clock, ChevronDown, ArrowRight } from 'lucide-react'

const FAQ = [
  {
    question: 'Cum creez o pagină de strângere de fonduri?',
    answer: 'Dai click pe „Creează o pagină", îți faci un cont rapid, alegi tipul evenimentului și completezi câteva detalii. Totul durează aproximativ 3 minute. Pagina ta primește un link unic pe care îl poți distribui imediat.',
  },
  {
    question: 'Trebuie să am un cont ca să donez?',
    answer: 'Nu. Donatorii nu au nevoie de cont. Intri pe link-ul primit, alegi suma, lași un mesaj (opțional) și plătești cu cardul, Apple Pay sau Google Pay — în 30 de secunde.',
  },
  {
    question: 'Cât durează să primesc banii în cont?',
    answer: 'Fondurile sunt transferate în contul tău bancar românesc prin Stripe Connect. De regulă, transferul ajunge în 2–5 zile lucrătoare de la confirmarea plății, în funcție de banca ta.',
  },
  {
    question: 'Care sunt comisioanele platformei?',
    answer: 'Detalii complete despre comisioane găsești pe pagina Tarife. Fără costuri ascunse sau surprize după plată.',
    link: { label: 'Vezi pagina Tarife', href: '/tarife' },
  },
  {
    question: 'Pot dona anonim?',
    answer: 'Da. La fiecare donație poți alege dacă numele și suma ta sunt vizibile pe pagina publică. Poți dona complet anonim — decizia îți aparține în totalitate.',
  },
  {
    question: 'Ce metode de plată sunt acceptate?',
    answer: 'Acceptăm plăți cu card bancar (Visa, Mastercard), Apple Pay și Google Pay. Toate plățile sunt procesate securizat prin Stripe, cu autentificare 3D Secure acolo unde este necesară.',
  },
  {
    question: 'Pot crea mai multe pagini cu același cont?',
    answer: 'Da, poți crea oricâte pagini dorești din același cont. Fiecare pagină are propriul link, propria listă de articole și propria statistică de donații.',
  },
  {
    question: 'Ce se întâmplă dacă vreau să închid o pagină?',
    answer: 'Poți dezactiva pagina oricând din dashboard. Odată dezactivată, donatorii vor vedea un mesaj că strângerea de fonduri s-a încheiat.',
  },
  {
    question: 'Datele mele bancare sunt în siguranță?',
    answer: 'Platforma nu stochează niciodată datele tale bancare. Toate informațiile de card sunt procesate direct de Stripe, conform standardelor PCI-DSS — cel mai înalt nivel de securitate în industria plăților.',
  },
  {
    question: 'Pot adăuga o imagine sau o descriere pe pagina mea?',
    answer: 'Da. Poți adăuga o fotografie de copertă și o descriere personalizată. Imaginea apare și în previzualizarea link-ului pe WhatsApp și Facebook.',
  },
]

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const body = `Nume: ${name}\nEmail: ${email}\n\n${message}`
      const mailto = `mailto:info@pentrumomente.ro?subject=${encodeURIComponent(subject || 'Mesaj de contact')}&body=${encodeURIComponent(body)}`
      window.location.href = mailto
      setSent(true)
    } catch {
      setError('A apărut o eroare. Încearcă din nou sau scrie direct la info@pentrumomente.ro.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* ── Hero ── */}
        <section style={{ backgroundColor: 'var(--color-forest)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: '#F0B860' }}>Suntem aici</p>
            <h1
              className="font-extrabold tracking-tight text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Contactează-ne
            </h1>
            <p className="text-base leading-relaxed max-w-xl" style={{ color: '#7A9A88' }}>
              Ai o întrebare sau ai nevoie de ajutor? Îți răspundem în cel mult 24 de ore.
            </p>
          </div>
        </section>

        {/* ── Contact + Form ── */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid md:grid-cols-5 gap-8 sm:gap-12">

            {/* Left: contact info */}
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>Informații de contact</h2>
                <div className="space-y-3">
                  {[
                    {
                      icon: <Mail size={15} strokeWidth={2} style={{ color: 'var(--color-amber-dark)' }} />,
                      label: 'Email',
                      content: <a href="mailto:info@pentrumomente.ro" className="text-sm font-semibold hover:underline" style={{ color: 'var(--color-amber)' }}>info@pentrumomente.ro</a>,
                    },
                    {
                      icon: <Clock size={15} strokeWidth={2} style={{ color: 'var(--color-amber-dark)' }} />,
                      label: 'Program răspuns',
                      content: <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>Luni – Vineri, 9:00 – 18:00</p>,
                    },
                  ].map(({ icon, label, content }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div
                        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-amber-light)' }}
                      >
                        {icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-ink-faint)' }}>{label}</p>
                        {content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div
                className="rounded-2xl p-5 space-y-1"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-ink)' }}>Răspunsuri rapide</h3>
                {[
                  { label: 'Cum creez o pagină?', anchor: '#faq-0' },
                  { label: 'Cât durează să primesc banii?', anchor: '#faq-2' },
                  { label: 'Comisioane și tarife', anchor: '/tarife' },
                  { label: 'Poate dona oricine?', anchor: '#faq-1' },
                ].map(({ label, anchor }) => (
                  <a
                    key={label}
                    href={anchor}
                    className="flex items-center gap-2 py-1.5 text-sm transition-colors group"
                    style={{ color: 'var(--color-ink-muted)' }}
                  >
                    <ArrowRight size={12} strokeWidth={2.5} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
                    <span className="group-hover:underline">{label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <div className="md:col-span-3">
              <div
                className="rounded-3xl p-7 sm:p-9"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
              >
                {sent ? (
                  <div className="py-10 text-center space-y-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                      style={{ backgroundColor: 'var(--color-amber-light)' }}
                    >
                      <Mail size={24} strokeWidth={1.75} style={{ color: 'var(--color-amber-dark)' }} />
                    </div>
                    <h3 className="text-lg font-extrabold" style={{ color: 'var(--color-ink)' }}>Clientul tău de email s-a deschis</h3>
                    <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                      Dacă nu s-a deschis automat, scrie direct la{' '}
                      <a href="mailto:info@pentrumomente.ro" className="font-semibold" style={{ color: 'var(--color-amber)' }}>
                        info@pentrumomente.ro
                      </a>
                    </p>
                    <button
                      onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage('') }}
                      className="text-sm font-semibold px-5 py-2.5 rounded-xl"
                      style={{ color: 'var(--color-amber-dark)', border: '1px solid var(--color-amber)', backgroundColor: 'var(--color-amber-light)' }}
                    >
                      Trimite alt mesaj
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h2 className="text-lg font-extrabold" style={{ color: 'var(--color-ink)' }}>Trimite un mesaj</h2>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>
                        Completează formularul — îți răspundem în cel mai scurt timp.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Numele tău" required>
                        <ContactInput type="text" value={name} onChange={setName} placeholder="Ion Popescu" required />
                      </FormField>
                      <FormField label="Adresa de email" required>
                        <ContactInput type="email" value={email} onChange={setEmail} placeholder="ion@exemplu.ro" required />
                      </FormField>
                    </div>

                    <FormField label="Subiect">
                      <ContactInput type="text" value={subject} onChange={setSubject} placeholder="ex: Întrebare despre plăți" />
                    </FormField>

                    <FormField label="Mesajul tău" required>
                      <textarea
                        value={message} onChange={e => setMessage(e.target.value)}
                        placeholder="Descrie pe scurt ce dorești să ne transmiți..."
                        rows={5} required
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all placeholder:text-[#C4B5A5]"
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-ink)' }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,136,42,0.12)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}
                      />
                    </FormField>

                    {error && (
                      <p className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>{error}</p>
                    )}

                    <button
                      type="submit" disabled={sending}
                      className="btn-press btn-fill w-full rounded-xl py-3.5 text-sm font-bold text-white"
                      style={{ backgroundColor: 'var(--color-amber)', boxShadow: 'var(--shadow-warm)', opacity: sending ? 0.7 : 1 }}
                    >
                      {sending ? 'Se deschide email...' : 'Trimite mesajul'}
                    </button>

                    <p className="text-xs text-center" style={{ color: 'var(--color-ink-faint)' }}>
                      Sau scrie direct la{' '}
                      <a href="mailto:info@pentrumomente.ro" style={{ color: 'var(--color-amber)' }}>info@pentrumomente.ro</a>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section
          className="px-4 sm:px-6 py-14 sm:py-20"
          style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <div className="mx-auto max-w-3xl">
            <div className="mb-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--color-amber-dark)' }}>
                Întrebări frecvente
              </p>
              <h2
                className="font-extrabold tracking-tight"
                style={{ color: 'var(--color-ink)', fontSize: 'clamp(1.6rem, 3vw, 2.25rem)' }}
              >
                Tot ce vrei să știi
              </h2>
              <p className="mt-3 text-base" style={{ color: 'var(--color-ink-muted)', maxWidth: '52ch' }}>
                Nu găsești răspunsul? Scrie-ne — suntem la un email distanță.
              </p>
            </div>

            <div className="space-y-2">
              {FAQ.map((item, idx) => (
                <div
                  key={idx}
                  id={`faq-${idx}`}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    border: '1px solid var(--color-border)',
                    backgroundColor: openFaq === idx ? 'var(--color-surface)' : 'var(--color-bg)',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>{item.question}</span>
                    <ChevronDown
                      size={16}
                      strokeWidth={2.5}
                      style={{
                        color: 'var(--color-amber)',
                        flexShrink: 0,
                        transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1)',
                        transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateRows: openFaq === idx ? '1fr' : '0fr',
                      transition: 'grid-template-rows 0.35s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  >
                  <div style={{ overflow: 'hidden' }}>
                    <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid var(--color-border-faint)' }}>
                      <p className="text-sm leading-relaxed pt-3" style={{ color: 'var(--color-ink-muted)' }}>
                        {item.answer}
                      </p>
                      {item.link && (
                        <Link
                          href={item.link.href}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: 'var(--color-amber)' }}
                        >
                          {item.link.label}
                          <ArrowRight size={13} strokeWidth={2.5} />
                        </Link>
                      )}
                    </div>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ backgroundColor: 'var(--color-forest-mid)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-extrabold tracking-tight text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
              pentru<span style={{ color: 'var(--color-amber)' }}>momente</span>
            </p>
            <div className="flex items-center gap-5">
              {[['/', 'Acasă'], ['/despre-noi', 'Despre noi'], ['/tarife', 'Tarife']].map(([href, label]) => (
                <Link key={href} href={href} className="text-xs hover:underline" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</Link>
              ))}
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: 'var(--color-ink-muted)' }}>
        {label}{required && <span style={{ color: 'var(--color-amber)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

function ContactInput({ type, value, onChange, placeholder, required }: {
  type: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean
}) {
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} required={required}
      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-[#C4B5A5]"
      style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-ink)' }}
      onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,136,42,0.12)' }}
      onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}
    />
  )
}
