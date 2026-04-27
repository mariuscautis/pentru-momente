'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/db/supabase'

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') ?? '/dashboard'
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (mode === 'register' && password !== confirmPassword) {
      setError('Parolele nu coincid.')
      return
    }
    if (mode === 'register' && password.length < 8) {
      setError('Parola trebuie să aibă cel puțin 8 caractere.')
      return
    }

    setLoading(true)
    const supabase = getSupabase()

    if (mode === 'login') {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError('Email sau parolă incorectă.')
      } else {
        router.push(nextUrl)
      }
    } else {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })
      if (authError) {
        setError(authError.message)
      } else {
        setSuccess('Contul a fost creat! Verifică emailul și apasă pe linkul de confirmare pentru a te autentifica.')
      }
    }

    setLoading(false)
  }

  async function handleOAuth(provider: 'google' | 'facebook') {
    setOauthLoading(provider)
    const supabase = getSupabase()
    const callbackUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`)
    if (nextUrl && nextUrl !== '/dashboard') callbackUrl.searchParams.set('next', nextUrl)
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString(),
      },
    })
    setOauthLoading(null)
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Left panel — forest brand column (desktop only) */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10 relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-forest)' }}
      >
        {/* Ambient glow */}
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
          aria-hidden="true"
          style={{ background: 'radial-gradient(circle, rgba(212,136,42,0.18) 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <a href="/" className="font-extrabold tracking-tight text-xl" style={{ color: 'white' }}>
          pentru<span style={{ color: 'var(--color-amber)' }}>momente</span>
        </a>

        <div className="space-y-6">
          <p
            className="font-extrabold tracking-tight text-white leading-tight"
            style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}
          >
            Strânge fonduri pentru momentele care contează
          </p>
          <ul className="space-y-3">
            {[
              'Pagina creată în 3 minute',
              'Donatori fără cont necesar',
              'Banii direct în IBAN-ul tău',
              '0% comision din donații',
            ].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#7A9A88' }}>
                <span
                  className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(212,136,42,0.20)', border: '1px solid rgba(212,136,42,0.30)' }}
                >
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#D4882A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs" style={{ color: '#3A5A48' }}>
          © 2026 pentrumomente.ro
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <a href="/" className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
              pentru<span style={{ color: 'var(--color-amber)' }}>momente</span>
            </a>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl p-8 space-y-6"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}
          >
            <div>
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
                {mode === 'login' ? 'Bine ai revenit' : 'Creează un cont'}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>
                {mode === 'login'
                  ? 'Intră în contul tău pentru a gestiona paginile.'
                  : 'Înregistrează-te pentru a crea o pagină de donații.'}
              </p>
            </div>

            {/* OAuth */}
            <div className="space-y-2">
              <OAuthButton onClick={() => handleOAuth('google')} loading={oauthLoading === 'google'} icon={<GoogleIcon />}>
                Continuă cu Google
              </OAuthButton>
              <OAuthButton onClick={() => handleOAuth('facebook')} loading={oauthLoading === 'facebook'} icon={<FacebookIcon />}>
                Continuă cu Facebook
              </OAuthButton>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--color-ink-faint)' }}>sau cu email</span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="adresa@email.ro" />
              <Field
                label="Parolă" type="password" value={password} onChange={setPassword}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'register' ? 'Minim 8 caractere' : ''}
              />
              {mode === 'register' && (
                <Field label="Confirmă parola" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" placeholder="Repetă parola" />
              )}

              {error && (
                <p className="text-sm rounded-xl px-4 py-3" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm rounded-xl px-4 py-3 leading-relaxed" style={{ backgroundColor: '#F0FFF4', color: '#166534', border: '1px solid #BBF7D0' }}>
                  {success}
                </p>
              )}

              {!success && (
                <button
                  type="submit" disabled={loading}
                  className="btn-press btn-fill w-full rounded-xl py-3.5 text-sm font-bold text-white"
                  style={{ backgroundColor: 'var(--color-amber)', boxShadow: 'var(--shadow-warm)', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Se procesează...' : mode === 'login' ? 'Intră în cont' : 'Creează cont'}
                </button>
              )}
            </form>

            <p className="text-center text-sm" style={{ color: 'var(--color-ink-muted)' }}>
              {mode === 'login' ? 'Nu ai cont?' : 'Ai deja cont?'}{' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setSuccess(null); setConfirmPassword('') }}
                className="font-bold"
                style={{ color: 'var(--color-amber)' }}
              >
                {mode === 'login' ? 'Înregistrează-te' : 'Intră'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}

function Field({ label, type, value, onChange, autoComplete, placeholder }: {
  label: string; type: string; value: string; onChange: (v: string) => void; autoComplete?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: 'var(--color-ink-muted)' }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        required autoComplete={autoComplete} placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
        style={{ border: '1px solid var(--color-border)', color: 'var(--color-ink)', backgroundColor: 'var(--color-bg)' }}
        onFocus={e => { e.target.style.borderColor = 'var(--color-amber)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,136,42,0.12)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function OAuthButton({ onClick, loading, icon, children }: {
  onClick: () => void; loading: boolean; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <button
      type="button" onClick={onClick} disabled={loading}
      className="w-full flex items-center justify-center gap-3 rounded-xl py-2.5 text-sm font-semibold transition-colors"
      style={{ border: '1px solid var(--color-border)', color: 'var(--color-ink)', backgroundColor: loading ? 'var(--color-bg)' : 'var(--color-surface)' }}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : icon}
      {children}
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M18 9a9 9 0 10-10.406 8.892v-6.29H5.309V9h2.285V7.017c0-2.256 1.343-3.502 3.4-3.502.985 0 2.015.176 2.015.176V5.92h-1.135c-1.119 0-1.468.695-1.468 1.407V9h2.496l-.399 2.602H10.406v6.29A9.002 9.002 0 0018 9z" fill="#1877F2"/>
    </svg>
  )
}
