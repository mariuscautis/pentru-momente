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

      // Verify this user is actually an admin via server-side API
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
      style={{ backgroundColor: '#0F0A06' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#6B5A4A' }}>
            Panou administrare
          </p>
          <span className="text-xl font-bold tracking-tight" style={{ color: '#FDFAF7' }}>
            pentru<span style={{ color: '#C4956A' }}>momente</span>
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ backgroundColor: '#1A120A', border: '1px solid #2E1F10' }}
        >
          <h1 className="text-lg font-semibold mb-6" style={{ color: '#FDFAF7' }}>
            Super Admin
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9A7B60' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: '#0F0A06',
                  border: '1px solid #3A2A18',
                  color: '#FDFAF7',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
                onBlur={(e) => (e.target.style.borderColor = '#3A2A18')}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9A7B60' }}>
                Parolă
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: '#0F0A06',
                  border: '1px solid #3A2A18',
                  color: '#FDFAF7',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
                onBlur={(e) => (e.target.style.borderColor = '#3A2A18')}
              />
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#2D1010', color: '#F87171' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity"
              style={{ backgroundColor: '#C4956A', color: '#FDFAF7', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Se verifică...' : 'Intră în panou'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#3A2A18' }}>
          Acces restricționat · pentrumomente.ro
        </p>
      </div>
    </div>
  )
}
