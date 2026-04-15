'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/db/supabase'

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = getSupabase()
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError || !data.user || !data.session) {
        setError('Email sau parolă incorectă.')
        return
      }

      const res = await fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      })

      if (!res.ok) {
        await supabase.auth.signOut()
        setError('Acest cont nu are acces la panoul de administrare.')
        return
      }

      router.push('/superadmin')
    } catch {
      setError('A apărut o eroare. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#F8F9FC' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ backgroundColor: '#EEF1FD' }}
          >
            <span className="text-2xl">⚙️</span>
          </div>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#8B92A8' }}>
            Panou administrare
          </p>
          <span className="text-xl font-bold tracking-tight" style={{ color: '#1A1D2E' }}>
            pentru<span style={{ color: '#4F6EF5' }}>momente</span>
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-sm"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E6EF' }}
        >
          <h1 className="text-lg font-semibold mb-6" style={{ color: '#1A1D2E' }}>
            Autentificare Super Admin
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#4A5068' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#FAFBFF',
                  border: '1px solid #E2E6EF',
                  color: '#1A1D2E',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4F6EF5'
                  e.target.style.boxShadow = '0 0 0 3px rgba(79,110,245,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E6EF'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#4A5068' }}>
                Parolă
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#FAFBFF',
                  border: '1px solid #E2E6EF',
                  color: '#1A1D2E',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4F6EF5'
                  e.target.style.boxShadow = '0 0 0 3px rgba(79,110,245,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E6EF'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {error && (
              <div
                className="text-sm rounded-lg px-3 py-2.5"
                style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #DC262620' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity mt-2"
              style={{ backgroundColor: '#4F6EF5', color: '#FFFFFF', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Se verifică...' : 'Intră în panou'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#C8CFDE' }}>
          Acces restricționat · pentrumomente.ro
        </p>
      </div>
    </div>
  )
}
