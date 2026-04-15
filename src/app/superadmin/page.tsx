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
  socialImageUrl: string | null
  updatedAt: string
}

interface BlogPost {
  id: string
  slug: string
  title: string
  summary: string | null
  content: string
  coverImageUrl: string | null
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
  goalAmount: number | null
  expiresAt: string | null
  totalRaised: number
  totalTips: number
  blockInfo: { reason: string | null; blockedBy: string; blockedAt: string } | null
}

interface SitePage {
  id: string
  title: string
  slug: string
  content: string
  metaDescription: string | null
  menuPosition: number
  parentId: string | null
  isPublished: boolean
  createdAt: string
}

type Tab = 'seo' | 'blog' | 'events' | 'pages'

// ─── Design tokens ─────────────────────────────────────────────────────────────
// Clean slate-blue/neutral admin palette – easy on the eyes

const c = {
  bg: '#F8F9FC',
  surface: '#FFFFFF',
  surfaceHover: '#F1F3F8',
  border: '#E2E6EF',
  borderStrong: '#C8CFDE',
  sidebar: '#1E2337',
  sidebarText: '#8B92A8',
  sidebarActive: '#4F6EF5',
  sidebarActiveBg: 'rgba(79,110,245,0.12)',
  accent: '#4F6EF5',
  accentHover: '#3A57E0',
  text: '#1A1D2E',
  textMid: '#4A5068',
  textSoft: '#8B92A8',
  success: '#16A34A',
  successBg: '#F0FDF4',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  badge: '#EEF1FD',
  badgeText: '#4F6EF5',
  topbar: '#FFFFFF',
}

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function check() {
      const supabase = getSupabase()
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/superadmin-login-portal')
        return
      }
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: c.bg }}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: c.accent }} />
          <p className="text-sm" style={{ color: c.textSoft }}>Se verifică sesiunea...</p>
        </div>
      </div>
    )
  }

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: 'seo', label: 'SEO', icon: '⚙️' },
    { id: 'blog', label: 'Blog', icon: '📝' },
    { id: 'pages', label: 'Pagini Site', icon: '📄' },
    { id: 'events', label: 'Statistici Donații', icon: '📊' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
      {/* Top bar */}
      <header
        className="h-14 flex items-center justify-between px-4 md:px-6 shrink-0"
        style={{ backgroundColor: c.topbar, borderBottom: `1px solid ${c.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1 rounded"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ color: c.textMid }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight" style={{ color: c.text }}>
              pentru<span style={{ color: c.accent }}>momente</span>
            </span>
            <span
              className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: c.badge, color: c.badgeText }}
            >
              Super Admin
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: c.textMid, backgroundColor: 'transparent', border: `1px solid ${c.border}` }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = c.surfaceHover }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Deconectare
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 md:hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`w-56 shrink-0 flex flex-col py-5 px-3 z-30 fixed md:static inset-y-0 left-0 transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ backgroundColor: c.sidebar, borderRight: `1px solid rgba(255,255,255,0.06)`, top: '56px', height: 'calc(100vh - 56px)' }}
        >
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setSidebarOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors"
                style={
                  tab === item.id
                    ? { backgroundColor: c.sidebarActiveBg, color: '#7B97FF' }
                    : { color: c.sidebarText }
                }
                onMouseOver={(e) => { if (tab !== item.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
                onMouseOut={(e) => { if (tab !== item.id) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 md:px-8 py-8">
            {tab === 'seo' && <SeoTab />}
            {tab === 'blog' && <BlogTab />}
            {tab === 'pages' && <PagesTab />}
            {tab === 'events' && <EventsTab />}
          </div>
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
  const [newSocialImg, setNewSocialImg] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

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
    setNewSocialImg(o.socialImageUrl ?? '')
    setMsg(null)
  }

  function startNew() {
    setEditing(null)
    setNewKey('')
    setNewTitle('')
    setNewDesc('')
    setNewSocialImg('')
    setMsg(null)
  }

  async function save() {
    setSaving(true)
    setMsg(null)
    const res = await apiFetch('/api/admin/seo', {
      method: 'POST',
      body: JSON.stringify({ pageKey: newKey, seoTitle: newTitle, metaDescription: newDesc, socialImageUrl: newSocialImg }),
    })
    if (res.ok) {
      setMsg({ text: 'Salvat cu succes.', ok: true })
      setEditing(null)
      startNew()
      load()
    } else {
      setMsg({ text: 'Eroare la salvare.', ok: false })
    }
    setSaving(false)
  }

  const titleLen = newTitle.length
  const descLen = newDesc.length

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        title="SEO"
        description="Configurează titlul, meta description și imaginea de share social pentru orice pagină."
      />

      {/* Form card */}
      <Card>
        <h2 className="text-sm font-semibold mb-5" style={{ color: c.text }}>
          {editing ? `Editează: ${editing.pageKey}` : 'Adaugă / actualizează pagină'}
        </h2>

        <div className="space-y-4">
          <Field
            label="Page key"
            value={newKey}
            onChange={setNewKey}
            placeholder="ex: home, create, inmormantare/ana-si-mihai"
            disabled={!!editing}
            hint="Identificator unic — poate fi un path URL"
          />
          <Field
            label="SEO Title"
            value={newTitle}
            onChange={setNewTitle}
            placeholder="Titlul paginii"
            hint={`${titleLen}/60 caractere`}
            hintColor={titleLen > 60 ? c.danger : c.textSoft}
          />
          <Field
            label="Meta Description"
            value={newDesc}
            onChange={setNewDesc}
            placeholder="Descriere scurtă afișată în Google"
            hint={`${descLen}/160 caractere`}
            hintColor={descLen > 160 ? c.danger : c.textSoft}
          />
          <Field
            label="Social Share Image URL"
            value={newSocialImg}
            onChange={setNewSocialImg}
            placeholder="https://... (1200×630px recomandat)"
            hint="Imaginea afișată la share pe Facebook / WhatsApp / Twitter"
          />

          {/* Image preview */}
          {newSocialImg && (
            <div>
              <p className="text-xs mb-1.5" style={{ color: c.textSoft }}>Previzualizare imagine social</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={newSocialImg}
                alt="Social share preview"
                className="rounded-lg object-cover"
                style={{ maxHeight: '160px', border: `1px solid ${c.border}` }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          )}
        </div>

        {msg && (
          <div className="mt-4 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: msg.ok ? c.successBg : c.dangerBg, color: msg.ok ? c.success : c.danger }}>
            {msg.text}
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <Btn onClick={save} loading={saving}>Salvează</Btn>
          {editing && <Btn onClick={startNew} variant="ghost">Anulează</Btn>}
        </div>
      </Card>

      {/* List */}
      {overrides.length > 0 && (
        <div>
          <SectionLabel>Pagini configurate ({overrides.length})</SectionLabel>
          <div className="space-y-2 mt-3">
            {overrides.map((o) => (
              <div
                key={o.id}
                className="flex items-start justify-between rounded-xl px-4 py-3"
                style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: c.text }}>{o.pageKey}</p>
                    {o.socialImageUrl && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: c.badge, color: c.badgeText }}>
                        OG image
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: c.textSoft }}>{o.seoTitle || '—'}</p>
                  {o.metaDescription && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: c.textSoft }}>{o.metaDescription}</p>
                  )}
                </div>
                <button
                  onClick={() => startEdit(o)}
                  className="text-xs font-medium shrink-0 ml-4 px-2 py-1 rounded"
                  style={{ color: c.accent, backgroundColor: c.badge }}
                >
                  Editează
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Blog Tab ─────────────────────────────────────────────────────────────────

function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [view, setView] = useState<'list' | 'new' | 'edit' | 'preview'>('list')
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null)

  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [content, setContent] = useState(BLOG_TEMPLATE)
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

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
    setHeroImageUrl('')
    setContent(BLOG_TEMPLATE)
    setPublished(false)
    setMsg(null)
    setView('new')
  }

  function openEdit(post: BlogPost) {
    setEditingPost(post)
    setSlug(post.slug)
    setTitle(post.title)
    setSummary(post.summary ?? '')
    setHeroImageUrl(post.coverImageUrl ?? '')
    setContent(post.content)
    setPublished(post.published)
    setMsg(null)
    setView('edit')
  }

  function openPreview(post: BlogPost) {
    setPreviewPost(post)
    setView('preview')
  }

  // Auto-generate slug from title
  function handleTitleChange(v: string) {
    setTitle(v)
    if (view === 'new') {
      setSlug(
        v.toLowerCase()
          .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
      )
    }
  }

  async function savePost() {
    setSaving(true)
    setMsg(null)

    const payload = { slug, title, summary, content, coverImageUrl: heroImageUrl, published }

    if (view === 'new') {
      const res = await apiFetch('/api/admin/blog', { method: 'POST', body: JSON.stringify(payload) })
      if (res.ok) { setMsg({ text: 'Articol creat cu succes.', ok: true }); load(); setTimeout(() => setView('list'), 800) }
      else { const j = await res.json() as { error: string }; setMsg({ text: j.error ?? 'Eroare.', ok: false }) }
    } else if (editingPost) {
      const res = await apiFetch(`/api/admin/blog/${editingPost.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      if (res.ok) { setMsg({ text: 'Salvat cu succes.', ok: true }); load(); setTimeout(() => setView('list'), 800) }
      else { setMsg({ text: 'Eroare la salvare.', ok: false }) }
    }
    setSaving(false)
  }

  async function deletePost(id: string) {
    if (!confirm('Ștergi definitiv acest articol?')) return
    await apiFetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    load()
  }

  // ── List view ──
  if (view === 'list') {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader title="Blog" description={`${posts.length} articole · URL: /blogs/[slug]`} />
          <Btn onClick={openNew}>+ Articol nou</Btn>
        </div>

        {posts.length === 0 ? (
          <EmptyState message="Niciun articol încă. Creează primul articol." />
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}
              >
                <div className="flex items-start gap-4 px-4 py-4">
                  {/* Hero thumbnail */}
                  {post.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImageUrl}
                      alt=""
                      className="w-16 h-12 rounded-lg object-cover shrink-0"
                      style={{ border: `1px solid ${c.border}` }}
                    />
                  ) : (
                    <div className="w-16 h-12 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: c.badge }}>
                      <span className="text-xl">📝</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: c.text }}>{post.title}</p>
                      <StatusBadge published={post.published} />
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>/blogs/{post.slug}</p>
                    {post.summary && (
                      <p className="text-xs mt-1 line-clamp-1" style={{ color: c.textMid }}>{post.summary}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openPreview(post)}
                      className="text-xs px-2.5 py-1 rounded-lg font-medium"
                      style={{ color: c.textMid, backgroundColor: c.surfaceHover, border: `1px solid ${c.border}` }}
                    >
                      Preview
                    </button>
                    <button onClick={() => openEdit(post)} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ color: c.accent, backgroundColor: c.badge }}>
                      Editează
                    </button>
                    <button onClick={() => deletePost(post.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ color: c.danger, backgroundColor: c.dangerBg }}>
                      Șterge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Preview view ──
  if (view === 'preview' && previewPost) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('list')} className="text-sm flex items-center gap-1" style={{ color: c.textSoft }}>
            ← Înapoi
          </button>
          <span className="text-sm font-semibold" style={{ color: c.text }}>Preview: {previewPost.title}</span>
          <StatusBadge published={previewPost.published} />
        </div>

        <BlogPreview post={previewPost} />
      </div>
    )
  }

  // ── Edit / New view ──
  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('list')} className="text-sm flex items-center gap-1" style={{ color: c.textSoft }}>
          ← Înapoi
        </button>
        <h1 className="text-xl font-bold" style={{ color: c.text }}>
          {view === 'new' ? 'Articol nou' : `Editează: ${editingPost?.title}`}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: c.textSoft }}>Conținut</h3>
            <div className="space-y-4">
              <Field
                label="Titlu (H1)"
                value={title}
                onChange={handleTitleChange}
                placeholder="Titlul articolului"
              />
              <Field
                label="Slug (URL) — /blogs/[slug]"
                value={slug}
                onChange={setSlug}
                placeholder="ex: cum-functioneaza-platforma"
              />
              <Field
                label="Rezumat (meta description)"
                value={summary}
                onChange={setSummary}
                placeholder="1-2 propoziții — apare în listing și în Google"
              />
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: c.textMid }}>
                  Conținut (Markdown)
                </label>
                <p className="text-xs mb-2" style={{ color: c.textSoft }}>
                  Folosește templateul de mai jos. H2 = ## Secțiune, H3 = ### Subsecțiune
                </p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={22}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-y font-mono"
                  style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text, lineHeight: '1.6' }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-5">
          <Card>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: c.textSoft }}>Publicare</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setPublished(!published)}
                className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
                style={{ backgroundColor: published ? c.accent : c.border }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  style={{ transform: published ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </div>
              <span className="text-sm font-medium" style={{ color: c.text }}>
                {published ? 'Publicat' : 'Draft'}
              </span>
            </label>
            <p className="text-xs mt-2" style={{ color: c.textSoft }}>
              {published ? 'Articolul este vizibil pe site.' : 'Articolul nu este vizibil publicului.'}
            </p>
          </Card>

          <Card>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: c.textSoft }}>Imagine Hero</h3>
            <Field
              label="URL imagine"
              value={heroImageUrl}
              onChange={setHeroImageUrl}
              placeholder="https://..."
              hint="Afișată în headerul articolului și la share social"
            />
            {heroImageUrl && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImageUrl}
                  alt="Hero preview"
                  className="w-full rounded-lg object-cover"
                  style={{ maxHeight: '160px', border: `1px solid ${c.border}` }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>
            )}
          </Card>

          <Card>
            {msg && (
              <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: msg.ok ? c.successBg : c.dangerBg, color: msg.ok ? c.success : c.danger }}>
                {msg.text}
              </div>
            )}
            <Btn onClick={savePost} loading={saving} fullWidth>
              {view === 'new' ? 'Publică articol' : 'Salvează modificările'}
            </Btn>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Blog Preview Component ────────────────────────────────────────────────────

function BlogPreview({ post }: { post: BlogPost }) {
  const sections = parseMarkdownToSections(post.content)

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
      {/* Hero image */}
      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="w-full object-cover"
          style={{ maxHeight: '360px' }}
        />
      )}

      <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-4">
          <StatusBadge published={post.published} />
          {post.publishedAt && (
            <span className="text-xs" style={{ color: c.textSoft }}>
              {new Date(post.publishedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* H1 */}
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3" style={{ color: c.text }}>{post.title}</h1>

        {/* Summary / lead */}
        {post.summary && (
          <p className="text-base leading-relaxed mb-6 pb-6" style={{ color: c.textMid, borderBottom: `1px solid ${c.border}` }}>
            {post.summary}
          </p>
        )}

        {/* Rendered sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i}>
              {section.heading2 && (
                <h2 className="text-xl font-bold mb-3" style={{ color: c.text }}>{section.heading2}</h2>
              )}
              {section.heading3 && (
                <h3 className="text-base font-semibold mb-2" style={{ color: c.text }}>{section.heading3}</h3>
              )}
              {section.body && (
                <div className="prose-like space-y-2">
                  {section.body.split('\n').filter(Boolean).map((line, j) => (
                    <p key={j} className="text-sm leading-relaxed" style={{ color: c.textMid }}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function parseMarkdownToSections(md: string): Array<{ heading2?: string; heading3?: string; body?: string }> {
  const lines = md.split('\n')
  const sections: Array<{ heading2?: string; heading3?: string; body?: string }> = []
  let current: { heading2?: string; heading3?: string; bodyLines: string[] } = { bodyLines: [] }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current.bodyLines.length || current.heading2 || current.heading3) {
        sections.push({ heading2: current.heading2, heading3: current.heading3, body: current.bodyLines.join('\n') })
      }
      current = { heading2: line.replace('## ', ''), bodyLines: [] }
    } else if (line.startsWith('### ')) {
      if (current.bodyLines.length) {
        sections.push({ heading2: current.heading2, heading3: current.heading3, body: current.bodyLines.join('\n') })
        current = { heading2: current.heading2, heading3: undefined, bodyLines: [] }
      }
      current.heading3 = line.replace('### ', '')
    } else if (!line.startsWith('#')) {
      current.bodyLines.push(line)
    }
  }

  if (current.bodyLines.length || current.heading2 || current.heading3) {
    sections.push({ heading2: current.heading2, heading3: current.heading3, body: current.bodyLines.join('\n') })
  }

  return sections
}

const BLOG_TEMPLATE = `## Introducere

Scrie o introducere captivantă care să explice despre ce este articolul și de ce contează pentru cititori.

## Secțiunea principală

### Subsecțiunea 1

Conținutul primei subsecțiuni. Explică conceptul în detaliu.

### Subsecțiunea 2

Mai mult conținut relevant. Poți adăuga exemple, sfaturi practice sau date.

## A doua secțiune majoră

Continuă cu un alt subiect important legat de tema articolului.

### Detalii suplimentare

Aprofundează subiectul cu informații concrete.

## Concluzie

Rezumă punctele principale și adaugă un call-to-action dacă este cazul.
`

// ─── Pages Tab ─────────────────────────────────────────────────────────────────

function PagesTab() {
  const [pages, setPages] = useState<SitePage[]>([])
  const [view, setView] = useState<'list' | 'new' | 'edit'>('list')
  const [editingPage, setEditingPage] = useState<SitePage | null>(null)
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [metaDesc, setMetaDesc] = useState('')
  const [menuPosition, setMenuPosition] = useState(10)
  const [parentId, setParentId] = useState<string>('')
  const [isPublished, setIsPublished] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const load = useCallback(async () => {
    const res = await apiFetch('/api/admin/pages')
    if (res.ok) {
      const json = await res.json() as { pages: SitePage[] }
      setPages(json.pages)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() {
    setEditingPage(null)
    setTitle('')
    setSlug('')
    setContent('')
    setMetaDesc('')
    setMenuPosition((pages.filter(p => !p.parentId).length + 1) * 10)
    setParentId('')
    setIsPublished(true)
    setMsg(null)
    setView('new')
  }

  function openEdit(page: SitePage) {
    setEditingPage(page)
    setTitle(page.title)
    setSlug(page.slug)
    setContent(page.content)
    setMetaDesc(page.metaDescription ?? '')
    setMenuPosition(page.menuPosition)
    setParentId(page.parentId ?? '')
    setIsPublished(page.isPublished)
    setMsg(null)
    setView('edit')
  }

  function handleTitleChange(v: string) {
    setTitle(v)
    if (view === 'new') {
      setSlug(
        v.toLowerCase()
          .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
      )
    }
  }

  async function savePage() {
    setSaving(true)
    setMsg(null)
    const payload = {
      title, slug, content, metaDescription: metaDesc,
      menuPosition, parentId: parentId || null, isPublished,
    }

    if (view === 'new') {
      const res = await apiFetch('/api/admin/pages', { method: 'POST', body: JSON.stringify(payload) })
      if (res.ok) { setMsg({ text: 'Pagina a fost creată.', ok: true }); load(); setTimeout(() => setView('list'), 800) }
      else { const j = await res.json() as { error: string }; setMsg({ text: j.error ?? 'Eroare.', ok: false }) }
    } else if (editingPage) {
      const res = await apiFetch(`/api/admin/pages/${editingPage.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      if (res.ok) { setMsg({ text: 'Salvat.', ok: true }); load(); setTimeout(() => setView('list'), 800) }
      else { setMsg({ text: 'Eroare la salvare.', ok: false }) }
    }
    setSaving(false)
  }

  async function deletePage(id: string) {
    if (!confirm('Ștergi această pagină? Paginile copil vor rămâne fără părinte.')) return
    await apiFetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
    load()
  }

  function toggleParent(id: string) {
    setExpandedParents(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (view === 'list') {
    const topLevel = pages.filter(p => !p.parentId).sort((a, b) => a.menuPosition - b.menuPosition)
    const childrenOf = (id: string) => pages.filter(p => p.parentId === id).sort((a, b) => a.menuPosition - b.menuPosition)

    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Pagini Site"
            description="Pagini statice adăugate în meniu. Paginile copil sunt vizibile prin toggle."
          />
          <Btn onClick={openNew}>+ Pagină nouă</Btn>
        </div>

        {pages.length === 0 ? (
          <EmptyState message="Nicio pagină încă. Creează prima pagină." />
        ) : (
          <div className="space-y-2">
            {topLevel.map((page) => {
              const children = childrenOf(page.id)
              const isExpanded = expandedParents.has(page.id)

              return (
                <div key={page.id}>
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      {children.length > 0 && (
                        <button
                          onClick={() => toggleParent(page.id)}
                          className="p-0.5 rounded transition-transform"
                          style={{ color: c.textSoft, transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                      {children.length === 0 && <span className="w-5" />}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold" style={{ color: c.text }}>{page.title}</span>
                          <StatusBadge published={page.isPublished} />
                          {children.length > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: c.badge, color: c.badgeText }}>
                              {children.length} sub-pagini
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>
                          /{page.slug} · Poziție meniu: {page.menuPosition}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => openEdit(page)} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ color: c.accent, backgroundColor: c.badge }}>
                          Editează
                        </button>
                        <button onClick={() => deletePage(page.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ color: c.danger, backgroundColor: c.dangerBg }}>
                          Șterge
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Children (collapsible) */}
                  {isExpanded && children.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1">
                      {children.map(child => (
                        <div
                          key={child.id}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                          style={{ backgroundColor: c.surface, border: `1px solid ${c.border}`, borderLeft: `3px solid ${c.accent}` }}
                        >
                          <span className="text-xs" style={{ color: c.textSoft }}>↳</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium" style={{ color: c.text }}>{child.title}</span>
                              <StatusBadge published={child.isPublished} />
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>/{child.slug} · Poziție: {child.menuPosition}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => openEdit(child)} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ color: c.accent, backgroundColor: c.badge }}>
                              Editează
                            </button>
                            <button onClick={() => deletePage(child.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ color: c.danger, backgroundColor: c.dangerBg }}>
                              Șterge
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Edit / New form
  const parentOptions = pages.filter(p => !p.parentId && p.id !== editingPage?.id)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('list')} className="text-sm" style={{ color: c.textSoft }}>← Înapoi</button>
        <h1 className="text-xl font-bold" style={{ color: c.text }}>
          {view === 'new' ? 'Pagină nouă' : `Editează: ${editingPage?.title}`}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: c.textSoft }}>Conținut pagină</h3>
            <div className="space-y-4">
              <Field label="Titlu pagină" value={title} onChange={handleTitleChange} placeholder="ex: Despre noi" />
              <Field label="Slug (URL) — /[slug]" value={slug} onChange={setSlug} placeholder="ex: despre-noi" />
              <Field label="Meta description" value={metaDesc} onChange={setMetaDesc} placeholder="Descriere scurtă pentru SEO" />
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: c.textMid }}>Conținut pagină (Markdown)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={14}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-y font-mono"
                  style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text }}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: c.textSoft }}>Meniu & Structură</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: c.textMid }}>Poziție în meniu</label>
                <input
                  type="number"
                  value={menuPosition}
                  onChange={(e) => setMenuPosition(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text }}
                />
                <p className="text-xs mt-1" style={{ color: c.textSoft }}>Ordine crescătoare (10, 20, 30...)</p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: c.textMid }}>Pagină părinte (opțional)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text }}
                >
                  <option value="">— Niciuna (pagină principală) —</option>
                  {parentOptions.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                <p className="text-xs mt-1" style={{ color: c.textSoft }}>
                  Sub-paginile sunt ascunse implicit și apar la hover/toggle pe pagina părinte.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: c.textSoft }}>Publicare</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIsPublished(!isPublished)}
                className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
                style={{ backgroundColor: isPublished ? c.accent : c.border }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  style={{ transform: isPublished ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </div>
              <span className="text-sm font-medium" style={{ color: c.text }}>
                {isPublished ? 'Publicată' : 'Draft'}
              </span>
            </label>
          </Card>

          <Card>
            {msg && (
              <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: msg.ok ? c.successBg : c.dangerBg, color: msg.ok ? c.success : c.danger }}>
                {msg.text}
              </div>
            )}
            <Btn onClick={savePage} loading={saving} fullWidth>
              {view === 'new' ? 'Creează pagina' : 'Salvează modificările'}
            </Btn>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Events / Donation Stats Tab ───────────────────────────────────────────────

function EventsTab() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [search, setSearch] = useState('')
  const [blockingId, setBlockingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
      setSaving(true)
      await apiFetch('/api/admin/events', { method: 'POST', body: JSON.stringify({ eventId: event.id, action: 'unblock' }) })
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
    await apiFetch('/api/admin/events', { method: 'POST', body: JSON.stringify({ eventId: blockingId, action: 'block', reason }) })
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

  const totalDonations = filtered.reduce((s, e) => s + (e.totalRaised ?? 0), 0)
  const totalCommission = filtered.reduce((s, e) => s + (e.totalTips ?? 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Statistici Donații" description="Toate paginile de donații — vizualizare completă și control." />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total pagini" value={String(events.length)} />
        <StatCard label="Pagini active" value={String(events.filter(e => !e.isBlocked).length)} color={c.success} />
        <StatCard label="Donații colectate" value={`${totalDonations.toLocaleString('ro-RO')} RON`} color={c.accent} />
        <StatCard label="Comision platformă" value={`${totalCommission.toLocaleString('ro-RO')} RON`} color={c.warning} />
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: c.textSoft }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Caută după nume sau slug..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ backgroundColor: c.surface, border: `1px solid ${c.border}`, color: c.text }}
        />
      </div>

      {/* Block modal */}
      {blockingId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-xl" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
            <h2 className="font-semibold" style={{ color: c.text }}>Motivul blocării</h2>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Descrie motivul (opțional)..."
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text }}
            />
            <div className="flex gap-2">
              <Btn onClick={confirmBlock} loading={saving} variant="danger">Blochează pagina</Btn>
              <Btn onClick={() => setBlockingId(null)} variant="ghost">Anulează</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Table — desktop */}
      <div className="hidden md:block rounded-2xl overflow-hidden" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: c.bg, borderBottom: `1px solid ${c.border}` }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textSoft }}>Pagină</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textSoft }}>Tip</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textSoft }}>Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textSoft }}>Target</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textSoft }}>Colectat</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textSoft }}>Comision</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textSoft }}>Expiră</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: c.textSoft }}>Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: c.border }}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: c.textSoft }}>Nicio pagină găsită.</td>
                </tr>
              ) : filtered.map((event) => (
                <tr key={event.id} style={{ borderBottom: `1px solid ${c.border}` }}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: c.text }}>{event.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>{event.eventType}/{event.slug}</p>
                    {event.blockInfo?.reason && (
                      <p className="text-xs mt-0.5" style={{ color: c.danger }}>Motiv: {event.blockInfo.reason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: c.badge, color: c.badgeText }}>
                      {event.eventType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge published={!event.isBlocked} activeLabel="Activ" inactiveLabel="Blocat" />
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: c.textMid }}>
                    {event.goalAmount ? `${event.goalAmount.toLocaleString('ro-RO')} RON` : <span style={{ color: c.textSoft }}>—</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: c.success }}>
                    {event.totalRaised > 0 ? `${event.totalRaised.toLocaleString('ro-RO')} RON` : <span style={{ color: c.textSoft, fontWeight: 400 }}>0 RON</span>}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: c.warning }}>
                    {event.totalTips > 0 ? `${event.totalTips.toLocaleString('ro-RO')} RON` : <span style={{ color: c.textSoft }}>0 RON</span>}
                  </td>
                  <td className="px-4 py-3" style={{ color: c.textMid }}>
                    {event.expiresAt
                      ? new Date(event.expiresAt).toLocaleDateString('ro-RO')
                      : <span style={{ color: c.textSoft }}>—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleBlock(event)}
                      disabled={saving}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                      style={
                        event.isBlocked
                          ? { color: c.success, backgroundColor: c.successBg, border: `1px solid ${c.success}30` }
                          : { color: c.danger, backgroundColor: c.dangerBg, border: `1px solid ${c.danger}30` }
                      }
                    >
                      {event.isBlocked ? 'Deblochează' : 'Blochează'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <EmptyState message="Nicio pagină găsită." />
        ) : filtered.map((event) => (
          <div
            key={event.id}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: c.surface, border: `1px solid ${event.isBlocked ? c.danger + '40' : c.border}` }}
          >
            <div
              className="flex items-start justify-between px-4 py-3 cursor-pointer"
              onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: c.text }}>{event.name}</span>
                  <StatusBadge published={!event.isBlocked} activeLabel="Activ" inactiveLabel="Blocat" />
                </div>
                <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>{event.eventType}/{event.slug}</p>
              </div>
              <svg
                width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                style={{ color: c.textSoft, transform: expandedId === event.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {expandedId === event.id && (
              <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${c.border}` }}>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <MobileStatRow label="Target" value={event.goalAmount ? `${event.goalAmount.toLocaleString('ro-RO')} RON` : '—'} />
                  <MobileStatRow label="Colectat" value={`${(event.totalRaised ?? 0).toLocaleString('ro-RO')} RON`} color={c.success} />
                  <MobileStatRow label="Comision" value={`${(event.totalTips ?? 0).toLocaleString('ro-RO')} RON`} color={c.warning} />
                  <MobileStatRow label="Expiră" value={event.expiresAt ? new Date(event.expiresAt).toLocaleDateString('ro-RO') : '—'} />
                </div>
                {event.blockInfo?.reason && (
                  <p className="text-xs" style={{ color: c.danger }}>Motiv blocare: {event.blockInfo.reason}</p>
                )}
                <button
                  onClick={() => toggleBlock(event)}
                  disabled={saving}
                  className="w-full py-2 rounded-xl text-sm font-semibold"
                  style={
                    event.isBlocked
                      ? { color: c.success, backgroundColor: c.successBg, border: `1px solid ${c.success}30` }
                      : { color: c.danger, backgroundColor: c.dangerBg, border: `1px solid ${c.danger}30` }
                  }
                >
                  {event.isBlocked ? 'Deblochează pagina' : 'Blochează pagina'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ color: c.text }}>{title}</h1>
      {description && <p className="text-sm mt-1" style={{ color: c.textSoft }}>{description}</p>}
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: c.textSoft }}>
      {children}
    </p>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center rounded-2xl" style={{ backgroundColor: c.surface, border: `1px dashed ${c.border}` }}>
      <p className="text-sm" style={{ color: c.textSoft }}>{message}</p>
    </div>
  )
}

function StatusBadge({
  published,
  activeLabel = 'Publicat',
  inactiveLabel = 'Draft',
}: {
  published: boolean
  activeLabel?: string
  inactiveLabel?: string
}) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={
        published
          ? { backgroundColor: c.successBg, color: c.success }
          : { backgroundColor: c.warningBg, color: c.warning }
      }
    >
      {published ? activeLabel : inactiveLabel}
    </span>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl px-4 py-4" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
      <p className="text-xs font-medium mb-1" style={{ color: c.textSoft }}>{label}</p>
      <p className="text-lg font-bold" style={{ color: color ?? c.text }}>{value}</p>
    </div>
  )
}

function MobileStatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-xs" style={{ color: c.textSoft }}>{label}</p>
      <p className="text-sm font-semibold mt-0.5" style={{ color: color ?? c.text }}>{value}</p>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, disabled, hint, hintColor,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  hint?: string
  hintColor?: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-medium" style={{ color: c.textMid }}>{label}</label>
        {hint && <span className="text-xs" style={{ color: hintColor ?? c.textSoft }}>{hint}</span>}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none disabled:opacity-40 transition-colors"
        style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text }}
        onFocus={(e) => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${c.accent}18` }}
        onBlur={(e) => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function Btn({
  onClick, children, loading, variant = 'primary', fullWidth,
}: {
  onClick: () => void
  children: React.ReactNode
  loading?: boolean
  variant?: 'primary' | 'ghost' | 'danger'
  fullWidth?: boolean
}) {
  const styles = {
    primary: { backgroundColor: c.accent, color: '#fff' },
    ghost: { backgroundColor: 'transparent', color: c.textMid, border: `1px solid ${c.border}` },
    danger: { backgroundColor: c.dangerBg, color: c.danger, border: `1px solid ${c.danger}30` },
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-opacity${fullWidth ? ' w-full' : ''}`}
      style={{ ...styles[variant], opacity: loading ? 0.6 : 1 }}
      onMouseOver={(e) => { if (variant === 'primary' && !loading) e.currentTarget.style.backgroundColor = c.accentHover }}
      onMouseOut={(e) => { if (variant === 'primary') e.currentTarget.style.backgroundColor = c.accent }}
    >
      {loading ? 'Se salvează...' : children}
    </button>
  )
}
