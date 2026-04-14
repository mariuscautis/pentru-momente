'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/db/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeoOverride {
  id: string
  pageKey: string
  seoTitle: string | null
  metaDescription: string | null
  updatedAt: string
}

interface BlogPost {
  id: string
  slug: string
  title: string
  summary: string | null
  content: string
  published: boolean
  publishedAt: string | null
  createdAt: string
}

interface AdminEvent {
  id: string
  slug: string
  eventType: string
  name: string
  isActive: boolean
  isBlocked: boolean
  createdAt: string
  blockInfo: { reason: string | null; blockedBy: string; blockedAt: string } | null
}

type Tab = 'seo' | 'blog' | 'events'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function apiFetch(path: string, options?: RequestInit) {
  const token = await getToken()
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  })
  return res
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SuperAdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<Tab>('seo')

  // Verify admin session on mount
  useEffect(() => {
    async function check() {
      const supabase = getSupabase()
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/superadmin-login-portal')
        return
      }
      // Quick admin check via API
      const res = await apiFetch('/api/admin/seo')
      if (res.status === 401) {
        router.replace('/superadmin-login-portal')
        return
      }
      setChecking(false)
    }
    check()
  }, [router])

  async function handleLogout() {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    router.push('/superadmin-login-portal')
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F0A06' }}>
        <p style={{ color: '#6B5A4A' }}>Se verifică sesiunea...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F0A06' }}>
      {/* Top bar */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid #2E1F10', backgroundColor: '#1A120A' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-bold" style={{ color: '#FDFAF7' }}>
            pentru<span style={{ color: '#C4956A' }}>momente</span>
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: '#2E1F10', color: '#C4956A' }}
          >
            Super Admin
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs transition-colors"
          style={{ color: '#6B5A4A' }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#C4956A')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#6B5A4A')}
        >
          Deconectare
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-57px)]">
        {/* Sidebar */}
        <aside
          className="w-52 shrink-0 px-3 py-6 space-y-1"
          style={{ borderRight: '1px solid #2E1F10', backgroundColor: '#120C06' }}
        >
          {([
            { id: 'seo', label: 'SEO', icon: '🔍' },
            { id: 'blog', label: 'Blog', icon: '✍️' },
            { id: 'events', label: 'Pagini', icon: '🛡️' },
          ] as { id: Tab; label: string; icon: string }[]).map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors"
              style={
                tab === item.id
                  ? { backgroundColor: '#2E1F10', color: '#C4956A' }
                  : { color: '#7A6652' }
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 px-8 py-8 overflow-auto">
          {tab === 'seo' && <SeoTab />}
          {tab === 'blog' && <BlogTab />}
          {tab === 'events' && <EventsTab />}
        </main>
      </div>
    </div>
  )
}

// ─── SEO Tab ──────────────────────────────────────────────────────────────────

function SeoTab() {
  const [overrides, setOverrides] = useState<SeoOverride[]>([])
  const [editing, setEditing] = useState<SeoOverride | null>(null)
  const [newKey, setNewKey] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    const res = await apiFetch('/api/admin/seo')
    if (res.ok) {
      const json = await res.json() as { overrides: SeoOverride[] }
      setOverrides(json.overrides)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function startEdit(o: SeoOverride) {
    setEditing(o)
    setNewKey(o.pageKey)
    setNewTitle(o.seoTitle ?? '')
    setNewDesc(o.metaDescription ?? '')
  }

  function startNew() {
    setEditing(null)
    setNewKey('')
    setNewTitle('')
    setNewDesc('')
  }

  async function save() {
    setSaving(true)
    setMsg('')
    const res = await apiFetch('/api/admin/seo', {
      method: 'POST',
      body: JSON.stringify({ pageKey: newKey, seoTitle: newTitle, metaDescription: newDesc }),
    })
    if (res.ok) {
      setMsg('Salvat cu succes.')
      setEditing(null)
      setNewKey('')
      setNewTitle('')
      setNewDesc('')
      load()
    } else {
      setMsg('Eroare la salvare.')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-bold mb-1" style={{ color: '#FDFAF7' }}>SEO</h1>
        <p className="text-sm" style={{ color: '#6B5A4A' }}>
          Setează titlul și meta description pentru orice pagină. Folosește ca <code style={{ color: '#C4956A' }}>page_key</code> un identificator unic (ex: <code style={{ color: '#C4956A' }}>home</code>, <code style={{ color: '#C4956A' }}>create</code>, <code style={{ color: '#C4956A' }}>inmormantare/ana-si-mihai</code>).
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#1A120A', border: '1px solid #2E1F10' }}>
        <h2 className="text-sm font-semibold" style={{ color: '#C4956A' }}>
          {editing ? `Editează: ${editing.pageKey}` : 'Adaugă / actualizează pagină'}
        </h2>
        <Field label="Page key" value={newKey} onChange={setNewKey} placeholder="ex: home" disabled={!!editing} />
        <Field label="SEO Title" value={newTitle} onChange={setNewTitle} placeholder="Titlul paginii — max 60 caractere" />
        <Field label="Meta Description" value={newDesc} onChange={setNewDesc} placeholder="Descriere scurtă — max 160 caractere" />
        {msg && <p className="text-sm" style={{ color: msg.startsWith('Eroare') ? '#F87171' : '#6EE7B7' }}>{msg}</p>}
        <div className="flex gap-2">
          <AdminButton onClick={save} loading={saving}>Salvează</AdminButton>
          {editing && (
            <AdminButton onClick={startNew} variant="ghost">Anulează</AdminButton>
          )}
        </div>
      </div>

      {/* List */}
      {overrides.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B5A4A' }}>
            Pagini configurate
          </h2>
          {overrides.map((o) => (
            <div
              key={o.id}
              className="flex items-start justify-between rounded-xl px-4 py-3"
              style={{ backgroundColor: '#1A120A', border: '1px solid #2E1F10' }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: '#FDFAF7' }}>{o.pageKey}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#6B5A4A' }}>{o.seoTitle || '—'}</p>
              </div>
              <button
                onClick={() => startEdit(o)}
                className="text-xs shrink-0 ml-4"
                style={{ color: '#C4956A' }}
              >
                Editează
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Blog Tab ─────────────────────────────────────────────────────────────────

function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [view, setView] = useState<'list' | 'new' | 'edit'>('list')
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)

  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    const res = await apiFetch('/api/admin/blog')
    if (res.ok) {
      const json = await res.json() as { posts: BlogPost[] }
      setPosts(json.posts)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() {
    setEditingPost(null)
    setSlug('')
    setTitle('')
    setSummary('')
    setContent('')
    setPublished(false)
    setMsg('')
    setView('new')
  }

  function openEdit(post: BlogPost) {
    setEditingPost(post)
    setSlug(post.slug)
    setTitle(post.title)
    setSummary(post.summary ?? '')
    setContent(post.content)
    setPublished(post.published)
    setMsg('')
    setView('edit')
  }

  async function savePost() {
    setSaving(true)
    setMsg('')

    if (view === 'new') {
      const res = await apiFetch('/api/admin/blog', {
        method: 'POST',
        body: JSON.stringify({ slug, title, summary, content, published }),
      })
      if (res.ok) { setMsg('Articol creat.'); load(); setView('list') }
      else { const j = await res.json() as { error: string }; setMsg(j.error ?? 'Eroare.') }
    } else if (editingPost) {
      const res = await apiFetch(`/api/admin/blog/${editingPost.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ slug, title, summary, content, published }),
      })
      if (res.ok) { setMsg('Salvat.'); load(); setView('list') }
      else { setMsg('Eroare la salvare.') }
    }
    setSaving(false)
  }

  async function deletePost(id: string) {
    if (!confirm('Ștergi acest articol?')) return
    await apiFetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    load()
  }

  if (view === 'list') {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#FDFAF7' }}>Blog</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6B5A4A' }}>{posts.length} articole</p>
          </div>
          <AdminButton onClick={openNew}>+ Articol nou</AdminButton>
        </div>

        {posts.length === 0 ? (
          <p className="text-sm" style={{ color: '#3A2A18' }}>Niciun articol încă.</p>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ backgroundColor: '#1A120A', border: '1px solid #2E1F10' }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: '#FDFAF7' }}>{post.title}</p>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={
                        post.published
                          ? { backgroundColor: '#0A2E14', color: '#6EE7B7' }
                          : { backgroundColor: '#2E1F10', color: '#9A7B60' }
                      }
                    >
                      {post.published ? 'Publicat' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#6B5A4A' }}>/{post.slug}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(post)} className="text-xs" style={{ color: '#C4956A' }}>Editează</button>
                  <button onClick={() => deletePost(post.id)} className="text-xs" style={{ color: '#6B5A4A' }}>Șterge</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setView('list')} className="text-sm" style={{ color: '#6B5A4A' }}>
          ← Înapoi
        </button>
        <h1 className="text-xl font-bold" style={{ color: '#FDFAF7' }}>
          {view === 'new' ? 'Articol nou' : 'Editează articol'}
        </h1>
      </div>

      <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#1A120A', border: '1px solid #2E1F10' }}>
        <Field label="Slug (URL)" value={slug} onChange={setSlug} placeholder="ex: cum-functioneaza-platforma" />
        <Field label="Titlu" value={title} onChange={setTitle} placeholder="Titlul articolului" />
        <Field label="Rezumat" value={summary} onChange={setSummary} placeholder="Scurtă descriere (opțional)" />
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#9A7B60' }}>Conținut (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-y font-mono"
            style={{ backgroundColor: '#0F0A06', border: '1px solid #3A2A18', color: '#FDFAF7' }}
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm" style={{ color: '#9A7B60' }}>Publică articolul</span>
        </label>
        {msg && <p className="text-sm" style={{ color: msg.startsWith('Eroare') ? '#F87171' : '#6EE7B7' }}>{msg}</p>}
        <AdminButton onClick={savePost} loading={saving}>Salvează</AdminButton>
      </div>
    </div>
  )
}

// ─── Events Tab ───────────────────────────────────────────────────────────────

function EventsTab() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [search, setSearch] = useState('')
  const [blockingId, setBlockingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await apiFetch('/api/admin/events')
    if (res.ok) {
      const json = await res.json() as { events: AdminEvent[] }
      setEvents(json.events)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleBlock(event: AdminEvent) {
    if (event.isBlocked) {
      // Unblock immediately
      setSaving(true)
      await apiFetch('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify({ eventId: event.id, action: 'unblock' }),
      })
      setSaving(false)
      load()
    } else {
      setBlockingId(event.id)
      setReason('')
    }
  }

  async function confirmBlock() {
    if (!blockingId) return
    setSaving(true)
    await apiFetch('/api/admin/events', {
      method: 'POST',
      body: JSON.stringify({ eventId: blockingId, action: 'block', reason }),
    })
    setSaving(false)
    setBlockingId(null)
    setReason('')
    load()
  }

  const filtered = events.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#FDFAF7' }}>Pagini de donații</h1>
        <p className="text-sm mt-0.5" style={{ color: '#6B5A4A' }}>
          Blochează sau deblochează paginile care primesc donații.
        </p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Caută după nume sau slug..."
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
        style={{ backgroundColor: '#1A120A', border: '1px solid #2E1F10', color: '#FDFAF7' }}
      />

      {/* Block reason modal */}
      {blockingId && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        >
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#1A120A', border: '1px solid #2E1F10' }}>
            <h2 className="font-semibold" style={{ color: '#FDFAF7' }}>Motivul blocării</h2>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Descrie motivul (opțional)..."
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
              style={{ backgroundColor: '#0F0A06', border: '1px solid #3A2A18', color: '#FDFAF7' }}
            />
            <div className="flex gap-2">
              <AdminButton onClick={confirmBlock} loading={saving} variant="danger">
                Blochează pagina
              </AdminButton>
              <AdminButton onClick={() => setBlockingId(null)} variant="ghost">
                Anulează
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm" style={{ color: '#3A2A18' }}>Nicio pagină găsită.</p>
        ) : (
          filtered.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                backgroundColor: '#1A120A',
                border: `1px solid ${event.isBlocked ? '#5C1A1A' : '#2E1F10'}`,
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium" style={{ color: '#FDFAF7' }}>{event.name}</p>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={
                      event.isBlocked
                        ? { backgroundColor: '#5C1A1A', color: '#F87171' }
                        : { backgroundColor: '#0A2E14', color: '#6EE7B7' }
                    }
                  >
                    {event.isBlocked ? 'Blocat' : 'Activ'}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#6B5A4A' }}>
                  {event.eventType}/{event.slug}
                  {event.blockInfo?.reason ? ` · ${event.blockInfo.reason}` : ''}
                </p>
              </div>
              <button
                onClick={() => toggleBlock(event)}
                className="text-xs shrink-0 ml-4 font-medium"
                style={{ color: event.isBlocked ? '#6EE7B7' : '#F87171' }}
              >
                {event.isBlocked ? 'Deblochează' : 'Blochează'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9A7B60' }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none disabled:opacity-40"
        style={{ backgroundColor: '#0F0A06', border: '1px solid #3A2A18', color: '#FDFAF7' }}
      />
    </div>
  )
}

function AdminButton({
  onClick, children, loading, variant = 'primary',
}: {
  onClick: () => void
  children: React.ReactNode
  loading?: boolean
  variant?: 'primary' | 'ghost' | 'danger'
}) {
  const styles = {
    primary: { backgroundColor: '#C4956A', color: '#FDFAF7' },
    ghost: { backgroundColor: 'transparent', color: '#9A7B60', border: '1px solid #2E1F10' },
    danger: { backgroundColor: '#7C1D1D', color: '#F87171' },
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity"
      style={{ ...styles[variant], opacity: loading ? 0.6 : 1 }}
    >
      {loading ? 'Se salvează...' : children}
    </button>
  )
}
