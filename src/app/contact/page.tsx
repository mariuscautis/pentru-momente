'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/Nav'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')

    // Build a mailto link — opens the user's email client pre-filled
    // For a real send, this would POST to an API that calls Brevo
    try {
      const body = `Nume: ${name}\nEmail: ${name}\n\n${message}`
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
      <main className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

        {/* Hero */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1A2E1E 0%, #2D5A35 50%, #4A8A55 100%)' }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #6EE7B7 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
            <p className="text-xs uppercase tracking-widest mb-4 font-medium" style={{ color: '#6EE7B7' }}>Suntem aici</p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 text-white">Contactează-ne</h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#A7F3D0' }}>
              Ai o întrebare, o sugestie sau ai nevoie de ajutor? Îți răspundem în cel mult 24 de ore.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid md:grid-cols-5 gap-10">

            {/* Contact info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#2D1A0E' }}>Informații de contact</h2>
                <div className="space-y-4">
                  {[
                    {
                      icon: '✉️',
                      label: 'Email',
                      value: 'info@pentrumomente.ro',
                      href: 'mailto:info@pentrumomente.ro',
                    },
                    {
                      icon: '🕐',
                      label: 'Program răspuns',
                      value: 'Luni – Vineri, 9:00 – 18:00',
                      href: null,
                    },
                    {
                      icon: '📍',
                      label: 'Țara',
                      value: 'România',
                      href: null,
                    },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{item.icon}</span>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: '#9A7B60' }}>{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-sm font-medium transition-colors hover:underline" style={{ color: '#C4956A' }}>
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium" style={{ color: '#2D1A0E' }}>{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ links */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: '#F5EDE3', border: '1px solid #EAD8C8' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#2D1A0E' }}>Întrebări frecvente</h3>
                {[
                  'Cum creez o pagină?',
                  'Cât durează să primesc banii?',
                  'Ce comision percepe platforma?',
                  'Poate dona oricine?',
                ].map(q => (
                  <div key={q} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: '#EAD8C8' }}>
                    <span style={{ color: '#C4956A' }}>›</span>
                    <p className="text-sm" style={{ color: '#5A4030' }}>{q}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-3">
              <div className="rounded-2xl p-6 md:p-8 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EBE3' }}>
                {sent ? (
                  <div className="py-12 text-center">
                    <div className="text-5xl mb-4">📬</div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#2D1A0E' }}>Clientul tău de email s-a deschis!</h3>
                    <p className="text-sm mb-6" style={{ color: '#7A6652' }}>
                      Dacă nu s-a deschis automat, scrie direct la{' '}
                      <a href="mailto:info@pentrumomente.ro" className="font-medium" style={{ color: '#C4956A' }}>
                        info@pentrumomente.ro
                      </a>
                    </p>
                    <button
                      onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage('') }}
                      className="text-sm font-medium px-4 py-2 rounded-lg"
                      style={{ color: '#C4956A', border: '1px solid #C4956A' }}
                    >
                      Trimite alt mesaj
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="text-xl font-bold mb-1" style={{ color: '#2D1A0E' }}>Trimite un mesaj</h2>
                    <p className="text-sm mb-4" style={{ color: '#7A6652' }}>
                      Completează formularul și îți vom răspunde în cel mai scurt timp posibil.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Numele tău" required>
                        <input
                          type="text" value={name} onChange={e => setName(e.target.value)}
                          placeholder="Ion Popescu" required
                          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                          style={{ backgroundColor: '#FDFAF7', border: '1px solid #E8DDD4', color: '#2D1A0E' }}
                          onFocus={e => { e.currentTarget.style.borderColor = '#C4956A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,149,106,0.12)' }}
                          onBlur={e => { e.currentTarget.style.borderColor = '#E8DDD4'; e.currentTarget.style.boxShadow = 'none' }}
                        />
                      </FormField>
                      <FormField label="Adresa de email" required>
                        <input
                          type="email" value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="ion@exemplu.ro" required
                          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                          style={{ backgroundColor: '#FDFAF7', border: '1px solid #E8DDD4', color: '#2D1A0E' }}
                          onFocus={e => { e.currentTarget.style.borderColor = '#C4956A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,149,106,0.12)' }}
                          onBlur={e => { e.currentTarget.style.borderColor = '#E8DDD4'; e.currentTarget.style.boxShadow = 'none' }}
                        />
                      </FormField>
                    </div>

                    <FormField label="Subiect">
                      <input
                        type="text" value={subject} onChange={e => setSubject(e.target.value)}
                        placeholder="ex: Întrebare despre plăți"
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                        style={{ backgroundColor: '#FDFAF7', border: '1px solid #E8DDD4', color: '#2D1A0E' }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#C4956A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,149,106,0.12)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#E8DDD4'; e.currentTarget.style.boxShadow = 'none' }}
                      />
                    </FormField>

                    <FormField label="Mesajul tău" required>
                      <textarea
                        value={message} onChange={e => setMessage(e.target.value)}
                        placeholder="Descrie pe scurt ce dorești să ne transmiți..."
                        rows={5} required
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                        style={{ backgroundColor: '#FDFAF7', border: '1px solid #E8DDD4', color: '#2D1A0E' }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#C4956A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,149,106,0.12)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#E8DDD4'; e.currentTarget.style.boxShadow = 'none' }}
                      />
                    </FormField>

                    {error && (
                      <p className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>{error}</p>
                    )}

                    <button
                      type="submit" disabled={sending}
                      className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity"
                      style={{ backgroundColor: '#C4956A', color: '#FDFAF7', opacity: sending ? 0.6 : 1 }}
                    >
                      {sending ? 'Se deschide email...' : 'Trimite mesajul'}
                    </button>

                    <p className="text-xs text-center" style={{ color: '#9A7B60' }}>
                      Sau scrie direct la{' '}
                      <a href="mailto:info@pentrumomente.ro" style={{ color: '#C4956A' }}>info@pentrumomente.ro</a>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom strip */}
        <section style={{ backgroundColor: '#F5EDE3', borderTop: '1px solid #EAD8C8' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm" style={{ color: '#7A6652' }}>
              pentrumomente.ro · Platformă românească de strângere de fonduri
            </p>
            <div className="flex items-center gap-4">
              <Link href="/despre-noi" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>Despre noi</Link>
              <Link href="/termeni-si-conditii" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>Termeni</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#7A6652' }}>
        {label}{required && <span style={{ color: '#C4956A' }}> *</span>}
      </label>
      {children}
    </div>
  )
}
