'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

type Tab = 'seo' | 'blog' | 'terms' | 'cookies' | 'gdpr' | 'menu' | 'events'

// ─── Design tokens ─────────────────────────────────────────────────────────────

const c = {
  bg: '#F8F9FC',
  surface: '#FFFFFF',
  surfaceHover: '#F1F3F8',
  border: '#E2E6EF',
  borderStrong: '#C8CFDE',
  sidebar: '#1E2337',
  sidebarText: '#8B92A8',
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
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  })
}

/** Upload an image file via the admin upload endpoint. Returns public URL. */
async function uploadImage(file: File, folder: string): Promise<string> {
  const token = await getToken()
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  if (!res.ok) {
    const j = await res.json() as { error: string }
    throw new Error(j.error ?? 'Upload failed')
  }
  const j = await res.json() as { url: string }
  return j.url
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
      if (!data.session) { router.replace('/superadmin-login-portal'); return }
      const res = await apiFetch('/api/admin/seo')
      if (res.status === 401) { router.replace('/superadmin-login-portal'); return }
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
    { id: 'seo',     label: 'SEO',               icon: '⚙️' },
    { id: 'blog',    label: 'Blog',              icon: '📝' },
    { id: 'terms',   label: 'Termeni & Condiții', icon: '📋' },
    { id: 'cookies', label: 'Politica Cookies',  icon: '🍪' },
    { id: 'gdpr',    label: 'Politica GDPR',     icon: '🔒' },
    { id: 'menu',    label: 'Meniu',             icon: '☰' },
    { id: 'events',  label: 'Statistici Donații', icon: '📊' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
      {/* Top bar */}
      <header
        className="h-14 flex items-center justify-between px-4 md:px-6 shrink-0"
        style={{ backgroundColor: c.topbar, borderBottom: `1px solid ${c.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <button className="md:hidden p-1 rounded" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: c.textMid }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight" style={{ color: c.text }}>
              pentru<span style={{ color: c.accent }}>momente</span>
            </span>
            <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: c.badge, color: c.badgeText }}>
              Super Admin
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
          style={{ color: c.textMid, border: `1px solid ${c.border}` }}
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
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 md:hidden" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setSidebarOpen(false)} />
        )}
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
                style={tab === item.id ? { backgroundColor: c.sidebarActiveBg, color: '#7B97FF' } : { color: c.sidebarText }}
                onMouseOver={(e) => { if (tab !== item.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
                onMouseOut={(e) => { if (tab !== item.id) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="px-4 md:px-8 py-8">
            {tab === 'seo'     && <SeoTab />}
            {tab === 'blog'    && <BlogTab />}
            {tab === 'terms'   && <TermsTab />}
            {tab === 'cookies' && <CookiesTab />}
            {tab === 'gdpr'    && <GdprTab />}
            {tab === 'menu'    && <MenuTab />}
            {tab === 'events'  && <EventsTab />}
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
    setEditing(o); setNewKey(o.pageKey); setNewTitle(o.seoTitle ?? '')
    setNewDesc(o.metaDescription ?? ''); setNewSocialImg(o.socialImageUrl ?? ''); setMsg(null)
  }
  function startNew() {
    setEditing(null); setNewKey(''); setNewTitle(''); setNewDesc(''); setNewSocialImg(''); setMsg(null)
  }

  async function save() {
    setSaving(true); setMsg(null)
    const res = await apiFetch('/api/admin/seo', {
      method: 'POST',
      body: JSON.stringify({ pageKey: newKey, seoTitle: newTitle, metaDescription: newDesc, socialImageUrl: newSocialImg }),
    })
    if (res.ok) { setMsg({ text: 'Salvat cu succes.', ok: true }); setEditing(null); startNew(); load() }
    else setMsg({ text: 'Eroare la salvare.', ok: false })
    setSaving(false)
  }

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader title="SEO" description="Configurează titlul, meta description și imaginea de share social." />
      <Card>
        <h2 className="text-sm font-semibold mb-5" style={{ color: c.text }}>
          {editing ? `Editează: ${editing.pageKey}` : 'Adaugă / actualizează pagină'}
        </h2>
        <div className="space-y-4">
          <Field label="Page key" value={newKey} onChange={setNewKey} placeholder="ex: home" disabled={!!editing} hint="Identificator unic — poate fi un path URL" />
          <Field label="SEO Title" value={newTitle} onChange={setNewTitle} placeholder="Titlul paginii" hint={`${newTitle.length}/60`} hintColor={newTitle.length > 60 ? c.danger : c.textSoft} />
          <Field label="Meta Description" value={newDesc} onChange={setNewDesc} placeholder="Descriere scurtă" hint={`${newDesc.length}/160`} hintColor={newDesc.length > 160 ? c.danger : c.textSoft} />
          <Field label="Social Share Image URL" value={newSocialImg} onChange={setNewSocialImg} placeholder="https://... (1200×630px)" hint="Imaginea afișată la share Facebook/WhatsApp" />
          {newSocialImg && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={newSocialImg} alt="preview" className="rounded-lg object-cover" style={{ maxHeight: 160, border: `1px solid ${c.border}` }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
          )}
        </div>
        {msg && <Msg ok={msg.ok} text={msg.text} />}
        <div className="flex gap-2 mt-5">
          <Btn onClick={save} loading={saving}>Salvează</Btn>
          {editing && <Btn onClick={startNew} variant="ghost">Anulează</Btn>}
        </div>
      </Card>

      {overrides.length > 0 && (
        <div>
          <SectionLabel>Pagini configurate ({overrides.length})</SectionLabel>
          <div className="space-y-2 mt-3">
            {overrides.map((o) => (
              <div key={o.id} className="flex items-start justify-between rounded-xl px-4 py-3" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: c.text }}>{o.pageKey}</p>
                    {o.socialImageUrl && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: c.badge, color: c.badgeText }}>OG image</span>}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: c.textSoft }}>{o.seoTitle || '—'}</p>
                </div>
                <button onClick={() => startEdit(o)} className="text-xs font-medium shrink-0 ml-4 px-2 py-1 rounded" style={{ color: c.accent, backgroundColor: c.badge }}>Editează</button>
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
    if (res.ok) { const json = await res.json() as { posts: BlogPost[] }; setPosts(json.posts) }
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() {
    setEditingPost(null); setSlug(''); setTitle(''); setSummary(''); setHeroImageUrl('')
    setContent(BLOG_TEMPLATE); setPublished(false); setMsg(null); setView('new')
  }
  function openEdit(post: BlogPost) {
    setEditingPost(post); setSlug(post.slug); setTitle(post.title); setSummary(post.summary ?? '')
    setHeroImageUrl(post.coverImageUrl ?? ''); setContent(post.content); setPublished(post.published)
    setMsg(null); setView('edit')
  }
  function handleTitleChange(v: string) {
    setTitle(v)
    if (view === 'new') setSlug(toSlug(v))
  }

  async function savePost() {
    setSaving(true); setMsg(null)
    const payload = { slug, title, summary, content, coverImageUrl: heroImageUrl, published }
    if (view === 'new') {
      const res = await apiFetch('/api/admin/blog', { method: 'POST', body: JSON.stringify(payload) })
      if (res.ok) { setMsg({ text: 'Articol creat.', ok: true }); load(); setTimeout(() => setView('list'), 800) }
      else { const j = await res.json() as { error: string }; setMsg({ text: j.error ?? 'Eroare.', ok: false }) }
    } else if (editingPost) {
      const res = await apiFetch(`/api/admin/blog/${editingPost.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      if (res.ok) { setMsg({ text: 'Salvat.', ok: true }); load(); setTimeout(() => setView('list'), 800) }
      else setMsg({ text: 'Eroare.', ok: false })
    }
    setSaving(false)
  }

  async function deletePost(id: string) {
    if (!confirm('Ștergi definitiv acest articol?')) return
    await apiFetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    load()
  }

  if (view === 'list') {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader title="Blog" description={`${posts.length} articole · URL: /blogs/[slug]`} />
          <Btn onClick={openNew}>+ Articol nou</Btn>
        </div>
        {posts.length === 0 ? <EmptyState message="Niciun articol încă." /> : (
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
                <div className="flex items-start gap-4 px-4 py-4">
                  {post.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.coverImageUrl} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" style={{ border: `1px solid ${c.border}` }} />
                  ) : (
                    <div className="w-16 h-12 rounded-lg shrink-0 flex items-center justify-center text-xl" style={{ backgroundColor: c.badge }}>📝</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: c.text }}>{post.title}</p>
                      <StatusBadge published={post.published} />
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>/blogs/{post.slug}</p>
                    {post.summary && <p className="text-xs mt-1 line-clamp-1" style={{ color: c.textMid }}>{post.summary}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { setPreviewPost(post); setView('preview') }} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ color: c.textMid, backgroundColor: c.surfaceHover, border: `1px solid ${c.border}` }}>Preview</button>
                    <button onClick={() => openEdit(post)} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ color: c.accent, backgroundColor: c.badge }}>Editează</button>
                    <button onClick={() => deletePost(post.id)} className="text-xs px-2.5 py-1 rounded-lg" style={{ color: c.danger, backgroundColor: c.dangerBg }}>Șterge</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (view === 'preview' && previewPost) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('list')} className="text-sm" style={{ color: c.textSoft }}>← Înapoi</button>
          <span className="text-sm font-semibold" style={{ color: c.text }}>Preview: {previewPost.title}</span>
          <StatusBadge published={previewPost.published} />
        </div>
        <BlogPreview post={previewPost} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('list')} className="text-sm" style={{ color: c.textSoft }}>← Înapoi</button>
        <h1 className="text-xl font-bold" style={{ color: c.text }}>{view === 'new' ? 'Articol nou' : `Editează: ${editingPost?.title}`}</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: c.textSoft }}>Conținut</h3>
            <div className="space-y-4">
              <Field label="Titlu (H1)" value={title} onChange={handleTitleChange} placeholder="Titlul articolului" />
              <Field label="Slug (URL) — /blogs/[slug]" value={slug} onChange={setSlug} placeholder="ex: cum-functioneaza-platforma" />
              <Field label="Rezumat (meta description)" value={summary} onChange={setSummary} placeholder="1-2 propoziții" />
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: c.textMid }}>Conținut (Markdown)</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={22}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-y font-mono"
                  style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text, lineHeight: '1.6' }}
                />
              </div>
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: c.textSoft }}>Publicare</h3>
            <Toggle value={published} onChange={setPublished} label={published ? 'Publicat' : 'Draft'} />
            <p className="text-xs mt-2" style={{ color: c.textSoft }}>{published ? 'Vizibil pe site.' : 'Invizibil publicului.'}</p>
          </Card>
          <Card>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: c.textSoft }}>Imagine Hero</h3>
            <ImageUpload
              value={heroImageUrl}
              onChange={setHeroImageUrl}
              folder="blog"
              hint="Afișată în header și la share social"
            />
          </Card>
          <Card>
            {msg && <Msg ok={msg.ok} text={msg.text} />}
            <Btn onClick={savePost} loading={saving} fullWidth>{view === 'new' ? 'Publică articol' : 'Salvează'}</Btn>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Blog Preview ─────────────────────────────────────────────────────────────

function BlogPreview({ post }: { post: BlogPost }) {
  const sections = parseSections(post.content)
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImageUrl} alt={post.title} className="w-full object-cover" style={{ maxHeight: 360 }} />
      )}
      <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <StatusBadge published={post.published} />
          {post.publishedAt && <span className="text-xs" style={{ color: c.textSoft }}>{new Date(post.publishedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3" style={{ color: c.text }}>{post.title}</h1>
        {post.summary && <p className="text-base leading-relaxed mb-6 pb-6" style={{ color: c.textMid, borderBottom: `1px solid ${c.border}` }}>{post.summary}</p>}
        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i}>
              {s.h2 && <h2 className="text-xl font-bold mb-3" style={{ color: c.text }}>{s.h2}</h2>}
              {s.h3 && <h3 className="text-base font-semibold mb-2" style={{ color: c.text }}>{s.h3}</h3>}
              {s.body && <div className="space-y-2">{s.body.split('\n').filter(Boolean).map((line, j) => <p key={j} className="text-sm leading-relaxed" style={{ color: c.textMid }}>{line}</p>)}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Terms Tab ────────────────────────────────────────────────────────────────

// Key used to store T&C in seo_overrides table (repurposed as a generic KV store)
const TERMS_KEY = '__terms_and_conditions__'

function TermsTab() {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    apiFetch('/api/admin/terms')
      .then(r => r.ok ? r.json() : { content: '' })
      .then((j: { content: string }) => { setContent(j.content ?? ''); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true); setMsg(null)
    const res = await apiFetch('/api/admin/terms', {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
    if (res.ok) setMsg({ text: 'Termenii au fost salvați.', ok: true })
    else setMsg({ text: 'Eroare la salvare.', ok: false })
    setSaving(false)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Termeni și Condiții"
        description="Conținut afișat pe pagina /termeni-si-conditii. Suportă Markdown."
      />
      <Card>
        {loading ? (
          <p className="text-sm" style={{ color: c.textSoft }}>Se încarcă...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: c.textMid }}>
                Conținut (Markdown) — H2 pentru secțiuni, H3 pentru sub-secțiuni
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={28}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-y font-mono"
                style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text, lineHeight: '1.6' }}
              />
            </div>
            {msg && <Msg ok={msg.ok} text={msg.text} />}
            <Btn onClick={save} loading={saving}>Salvează termenii</Btn>
          </div>
        )}
      </Card>

      {/* Live preview */}
      {content && (
        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: c.textSoft }}>Previzualizare</h3>
          <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
            {parseSections(content).map((s, i) => (
              <div key={i}>
                {s.h2 && <h2 className="text-base font-bold mb-2" style={{ color: c.text }}>{s.h2}</h2>}
                {s.h3 && <h3 className="text-sm font-semibold mb-1.5" style={{ color: c.text }}>{s.h3}</h3>}
                {s.body && (
                  <div className="space-y-1.5">
                    {s.body.split('\n').filter(Boolean).map((line, j) => (
                      <p key={j} className="text-sm leading-relaxed" style={{ color: c.textMid }}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// Suppress unused warning — TERMS_KEY is used conceptually (referenced in API)
void TERMS_KEY

// ─── Reusable legal-content editor ───────────────────────────────────────────

function LegalContentTab({
  title, description, apiPath, saveLabel,
}: { title: string; description: string; apiPath: string; saveLabel: string }) {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    apiFetch(apiPath)
      .then(r => r.ok ? r.json() : { content: '' })
      .then((j: { content: string }) => { setContent(j.content ?? ''); setLoading(false) })
      .catch(() => setLoading(false))
  }, [apiPath])

  async function save() {
    setSaving(true); setMsg(null)
    const res = await apiFetch(apiPath, { method: 'POST', body: JSON.stringify({ content }) })
    if (res.ok) setMsg({ text: 'Conținutul a fost salvat.', ok: true })
    else setMsg({ text: 'Eroare la salvare.', ok: false })
    setSaving(false)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        {loading ? (
          <p className="text-sm" style={{ color: c.textSoft }}>Se încarcă...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: c.textMid }}>
                Conținut (Markdown) — H2 pentru secțiuni, H3 pentru sub-secțiuni
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={28}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-y font-mono"
                style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text, lineHeight: '1.6' }}
              />
            </div>
            {msg && <Msg ok={msg.ok} text={msg.text} />}
            <Btn onClick={save} loading={saving}>{saveLabel}</Btn>
          </div>
        )}
      </Card>

      {content && (
        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: c.textSoft }}>Previzualizare</h3>
          <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
            {parseSections(content).map((s, i) => (
              <div key={i}>
                {s.h2 && <h2 className="text-base font-bold mb-2" style={{ color: c.text }}>{s.h2}</h2>}
                {s.h3 && <h3 className="text-sm font-semibold mb-1.5" style={{ color: c.text }}>{s.h3}</h3>}
                {s.body && (
                  <div className="space-y-1.5">
                    {s.body.split('\n').filter(Boolean).map((line, j) => (
                      <p key={j} className="text-sm leading-relaxed" style={{ color: c.textMid }}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function CookiesTab() {
  return (
    <LegalContentTab
      title="Politica de Cookies"
      description="Conținut afișat pe pagina /politica-cookies. Suportă Markdown."
      apiPath="/api/admin/cookies"
      saveLabel="Salvează politica cookies"
    />
  )
}

function GdprTab() {
  return (
    <LegalContentTab
      title="Politica GDPR"
      description="Conținut afișat pe pagina /politica-gdpr. Suportă Markdown."
      apiPath="/api/admin/gdpr"
      saveLabel="Salvează politica GDPR"
    />
  )
}

// ─── Menu Tab (WordPress-style drag-to-order) ─────────────────────────────────

// All known static pages (hardcoded Next.js routes). Shown in the library
// so the admin can pick which ones appear in the nav menu.
const ALL_STATIC_PAGES: { id: string; title: string; slug: string }[] = [
  { id: '__despre-noi__',           title: 'Despre noi',          slug: 'despre-noi' },
  { id: '__contact__',              title: 'Contact',             slug: 'contact' },
  { id: '__blog__',                 title: 'Blog',                slug: 'blogs' },
  { id: '__termeni-si-conditii__',  title: 'Termeni și Condiții', slug: 'termeni-si-conditii' },
  { id: '__politica-cookies__',     title: 'Politica Cookies',    slug: 'politica-cookies' },
  { id: '__politica-gdpr__',        title: 'Politica GDPR',       slug: 'politica-gdpr' },
]

interface MenuItem {
  id: string
  title: string
  slug: string
  menuPosition: number
  parentId: string | null
  isStatic: boolean
}

function MenuTab() {
  const [items, setItems] = useState<MenuItem[]>([])       // items IN the menu
  const [dbPages, setDbPages] = useState<{ id: string; title: string; slug: string }[]>([])  // extra DB pages
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)

  const load = useCallback(async () => {
    const [menuRes, pagesRes] = await Promise.all([
      apiFetch('/api/admin/menu'),
      apiFetch('/api/admin/pages'),
    ])

    type DbItem = { id: string; title: string; slug: string; menuPosition: number; parentId: string | null }
    const savedItems: DbItem[] = menuRes.ok ? ((await menuRes.json()) as { items: DbItem[] }).items ?? [] : []

    type PageRow = { id: string; title: string; slug: string }
    const allDbPages: PageRow[] = pagesRes.ok ? ((await pagesRes.json()) as { pages: PageRow[] }).pages ?? [] : []
    setDbPages(allDbPages)

    // Rebuild menu: only pages that were explicitly saved in menu_items
    const menuItems: MenuItem[] = savedItems.map((d, idx) => {
      const isStatic = ALL_STATIC_PAGES.some(sp => sp.id === d.id)
      return {
        id: d.id, title: d.title, slug: d.slug,
        menuPosition: d.menuPosition ?? (idx + 1) * 10,
        parentId: d.parentId,
        isStatic,
      }
    })

    menuItems.sort((a, b) => a.menuPosition - b.menuPosition)
    setItems(menuItems)
  }, [])

  useEffect(() => { load() }, [load])

  // Pages available in the library (not yet added to the menu)
  const inMenuIds = new Set(items.map(i => i.id))

  const libraryPages: { id: string; title: string; slug: string; isStatic: boolean }[] = [
    // Static pages not in menu
    ...ALL_STATIC_PAGES
      .filter(sp => !inMenuIds.has(sp.id))
      .map(sp => ({ ...sp, isStatic: true })),
    // DB-created pages not in menu
    ...dbPages
      .filter(p => !inMenuIds.has(p.id) && !ALL_STATIC_PAGES.some(sp => sp.id === p.id))
      .map(p => ({ ...p, isStatic: false })),
  ]

  function addToMenu(page: { id: string; title: string; slug: string; isStatic: boolean }) {
    const maxPos = items.reduce((m, i) => Math.max(m, i.menuPosition), 0)
    setItems(prev => [...prev, {
      id: page.id, title: page.title, slug: page.slug,
      menuPosition: maxPos + 10, parentId: null, isStatic: page.isStatic,
    }])
  }

  function removeFromMenu(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const topLevel = items.filter(i => !i.parentId)
  const childrenOf = (id: string) => items.filter(i => i.parentId === id)

  function flatList(): MenuItem[] {
    const result: MenuItem[] = []
    for (const item of topLevel) {
      result.push(item)
      for (const child of childrenOf(item.id)) result.push(child)
    }
    return result
  }

  function handleDragStart(idx: number) { dragItem.current = idx }
  function handleDragEnter(idx: number) { dragOver.current = idx }

  function handleDrop() {
    if (dragItem.current === null || dragOver.current === null) return
    const flat = flatList()
    const from = dragItem.current; const to = dragOver.current
    if (from === to) { dragItem.current = null; dragOver.current = null; return }
    const moved = flat.splice(from, 1)[0]
    flat.splice(to, 0, moved)
    setItems(flat.map((item, idx) => ({ ...item, menuPosition: (idx + 1) * 10 })))
    dragItem.current = null; dragOver.current = null
  }

  function setParent(id: string, parentId: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, parentId: parentId || null } : i))
  }

  async function saveMenu() {
    setSaving(true); setMsg(null)
    const flat = flatList()
    try {
      await apiFetch('/api/admin/menu', {
        method: 'POST',
        body: JSON.stringify({
          items: flat.map((item, idx) => ({
            id: item.id, title: item.title, slug: item.slug,
            menuPosition: (idx + 1) * 10, parentId: item.parentId,
          })),
        }),
      })
      setMsg({ text: 'Meniu salvat cu succes.', ok: true })
      load()
    } catch {
      setMsg({ text: 'Eroare la salvare.', ok: false })
    }
    setSaving(false)
  }

  const flat = flatList()

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Meniu Site"
        description="Adaugă pagini din bibliotecă, trage pentru a reordona, setează ierarhia din dropdown."
      />

      {/* Active menu */}
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: c.textSoft }}>
          Pagini active în meniu ({flat.length})
        </p>

        {flat.length === 0 ? (
          <div
            className="rounded-xl py-8 text-center"
            style={{ border: `2px dashed ${c.border}` }}
          >
            <p className="text-sm" style={{ color: c.textSoft }}>Nicio pagină în meniu. Adaugă din biblioteca de mai jos.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {flat.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-grab active:cursor-grabbing select-none"
                style={{
                  backgroundColor: c.surface, border: `1px solid ${c.border}`,
                  marginLeft: item.parentId ? '2rem' : '0',
                  borderLeft: item.parentId ? `3px solid ${c.accent}` : `1px solid ${c.border}`,
                }}
              >
                {/* Drag handle */}
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: c.textSoft, flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                </svg>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {item.parentId && <span className="text-xs" style={{ color: c.textSoft }}>↳</span>}
                    <span className="text-sm font-medium truncate" style={{ color: c.text }}>{item.title}</span>
                    {item.isStatic && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: c.badge, color: c.badgeText }}>static</span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>/{item.slug}</p>
                </div>

                {/* Parent selector */}
                <select
                  value={item.parentId ?? ''}
                  onChange={(e) => setParent(item.id, e.target.value)}
                  className="text-xs rounded-lg px-2 py-1.5 outline-none shrink-0"
                  style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.textMid, maxWidth: '120px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">— Top-level —</option>
                  {items.filter(p => !p.parentId && p.id !== item.id).map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>

                {/* Remove button */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromMenu(item.id) }}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50"
                  style={{ color: c.danger }}
                  title="Elimină din meniu"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {msg && <div className="mt-4"><Msg ok={msg.ok} text={msg.text} /></div>}
        <div className="mt-5"><Btn onClick={saveMenu} loading={saving}>Salvează meniu</Btn></div>
      </Card>

      {/* Library — pages not yet in menu */}
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: c.textSoft }}>
          Bibliotecă pagini disponibile
        </p>
        <p className="text-xs mb-4" style={{ color: c.textSoft }}>
          Pagini existente pe site care nu sunt încă în meniu. Apasă + pentru a le adăuga.
        </p>

        {libraryPages.length === 0 ? (
          <p className="text-sm py-3 text-center" style={{ color: c.textSoft }}>Toate paginile sunt deja în meniu.</p>
        ) : (
          <div className="space-y-1.5">
            {libraryPages.map(page => (
              <div
                key={page.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ backgroundColor: c.bg, border: `1px dashed ${c.border}` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: c.textMid }}>{page.title}</span>
                    {page.isStatic && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: c.badge, color: c.badgeText }}>static</span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>/{page.slug}</p>
                </div>
                <button
                  onClick={() => addToMenu(page)}
                  className="shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                  style={{ backgroundColor: c.accent, color: '#fff' }}
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Adaugă
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Structure preview */}
      {flat.length > 0 && (
        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textSoft }}>Previzualizare structură</h3>
          <div className="space-y-1">
            {items.filter(i => !i.parentId).sort((a, b) => a.menuPosition - b.menuPosition).map(item => (
              <div key={item.id}>
                <div className="flex items-center gap-2 py-1">
                  <span className="w-4 h-0.5 rounded" style={{ backgroundColor: c.accent }} />
                  <span className="text-sm font-medium" style={{ color: c.text }}>{item.title}</span>
                  <span className="text-xs" style={{ color: c.textSoft }}>/{item.slug}</span>
                </div>
                {items.filter(i => i.parentId === item.id).sort((a, b) => a.menuPosition - b.menuPosition).map(child => (
                  <div key={child.id} className="flex items-center gap-2 py-1 ml-6">
                    <span className="text-xs" style={{ color: c.textSoft }}>↳</span>
                    <span className="text-sm" style={{ color: c.textMid }}>{child.title}</span>
                    <span className="text-xs" style={{ color: c.textSoft }}>/{child.slug}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Events / Donation Stats Tab ───────────────────────────────────────────────

function EventsTab() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [blockingId, setBlockingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await apiFetch('/api/admin/events')
    if (res.ok) { const json = await res.json() as { events: AdminEvent[] }; setEvents(json.events) }
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleBlock(event: AdminEvent) {
    if (event.isBlocked) {
      setSaving(true)
      await apiFetch('/api/admin/events', { method: 'POST', body: JSON.stringify({ eventId: event.id, action: 'unblock' }) })
      setSaving(false); load()
    } else { setBlockingId(event.id); setReason('') }
  }

  async function confirmBlock() {
    if (!blockingId) return
    setSaving(true)
    await apiFetch('/api/admin/events', { method: 'POST', body: JSON.stringify({ eventId: blockingId, action: 'block', reason }) })
    setSaving(false); setBlockingId(null); setReason(''); load()
  }

  const filtered = events.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.slug.toLowerCase().includes(search.toLowerCase())
    const created = new Date(e.createdAt)
    const matchFrom = !dateFrom || created >= new Date(dateFrom)
    const matchTo = !dateTo || created <= new Date(dateTo + 'T23:59:59')
    return matchSearch && matchFrom && matchTo
  })

  const totalDonations = filtered.reduce((s, e) => s + (e.totalRaised ?? 0), 0)
  const totalCommission = filtered.reduce((s, e) => s + (e.totalTips ?? 0), 0)
  const allTimeCommission = events.reduce((s, e) => s + (e.totalTips ?? 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Statistici Donații" description="Toate paginile de donații — vizualizare completă și control." />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total pagini" value={String(events.length)} />
        <StatCard label="Pagini active" value={String(events.filter(e => !e.isBlocked).length)} color={c.success} />
        <StatCard label="Donații colectate" value={`${totalDonations.toLocaleString('ro-RO')} RON`} color={c.accent} />
        <StatCard label="Comision platformă" value={`${totalCommission.toLocaleString('ro-RO')} RON`} color={c.warning}
          sub={filtered.length < events.length ? `Total: ${allTimeCommission.toLocaleString('ro-RO')} RON` : undefined} />
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: c.textSoft }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după nume sau slug..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ backgroundColor: c.surface, border: `1px solid ${c.border}`, color: c.text }} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs shrink-0" style={{ color: c.textSoft }}>De la</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ backgroundColor: c.surface, border: `1px solid ${c.border}`, color: c.text }} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs shrink-0" style={{ color: c.textSoft }}>Până la</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ backgroundColor: c.surface, border: `1px solid ${c.border}`, color: c.text }} />
        </div>
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo('') }}
            className="text-xs px-3 py-2 rounded-lg"
            style={{ color: c.danger, backgroundColor: c.dangerBg }}>
            Resetează
          </button>
        )}
      </div>

      {/* Block modal */}
      {blockingId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-xl" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
            <h2 className="font-semibold" style={{ color: c.text }}>Motivul blocării</h2>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              placeholder="Descrie motivul (opțional)..."
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text }} />
            <div className="flex gap-2">
              <Btn onClick={confirmBlock} loading={saving} variant="danger">Blochează</Btn>
              <Btn onClick={() => setBlockingId(null)} variant="ghost">Anulează</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl overflow-hidden" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: c.bg, borderBottom: `1px solid ${c.border}` }}>
                {['Pagină', 'Tip', 'Status', 'Target', 'Colectat', 'Comision', 'Expiră', 'Creat', 'Acțiuni'].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${h === 'Acțiuni' || h === 'Colectat' || h === 'Comision' || h === 'Target' ? 'text-right' : 'text-left'}`} style={{ color: c.textSoft }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm" style={{ color: c.textSoft }}>Nicio pagină găsită.</td></tr>
              ) : filtered.map((event) => (
                <tr key={event.id} style={{ borderBottom: `1px solid ${c.border}` }}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: c.text }}>{event.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>{event.eventType}/{event.slug}</p>
                    {event.blockInfo?.reason && <p className="text-xs mt-0.5" style={{ color: c.danger }}>Motiv: {event.blockInfo.reason}</p>}
                  </td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: c.badge, color: c.badgeText }}>{event.eventType}</span></td>
                  <td className="px-4 py-3"><StatusBadge published={!event.isBlocked} activeLabel="Activ" inactiveLabel="Blocat" /></td>
                  <td className="px-4 py-3 text-right" style={{ color: c.textMid }}>{event.goalAmount ? `${event.goalAmount.toLocaleString('ro-RO')} RON` : <span style={{ color: c.textSoft }}>—</span>}</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: c.success }}>{event.totalRaised > 0 ? `${event.totalRaised.toLocaleString('ro-RO')} RON` : <span style={{ color: c.textSoft, fontWeight: 400 }}>0 RON</span>}</td>
                  <td className="px-4 py-3 text-right" style={{ color: c.warning }}>{event.totalTips > 0 ? `${event.totalTips.toLocaleString('ro-RO')} RON` : <span style={{ color: c.textSoft }}>0 RON</span>}</td>
                  <td className="px-4 py-3" style={{ color: c.textMid }}>{event.expiresAt ? new Date(event.expiresAt).toLocaleDateString('ro-RO') : <span style={{ color: c.textSoft }}>—</span>}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: c.textSoft }}>{new Date(event.createdAt).toLocaleDateString('ro-RO')}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleBlock(event)} disabled={saving}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={event.isBlocked
                        ? { color: c.success, backgroundColor: c.successBg, border: `1px solid ${c.success}30` }
                        : { color: c.danger, backgroundColor: c.dangerBg, border: `1px solid ${c.danger}30` }}>
                      {event.isBlocked ? 'Deblochează' : 'Blochează'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals footer */}
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: c.bg, borderTop: `2px solid ${c.borderStrong}` }}>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: c.text }} colSpan={4}>
                    Total ({filtered.length} pagini)
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: c.success }}>
                    {totalDonations.toLocaleString('ro-RO')} RON
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: c.warning }}>
                    {totalCommission.toLocaleString('ro-RO')} RON
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? <EmptyState message="Nicio pagină găsită." /> : filtered.map((event) => (
          <div key={event.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: c.surface, border: `1px solid ${event.isBlocked ? c.danger + '40' : c.border}` }}>
            <div className="flex items-start justify-between px-4 py-3 cursor-pointer" onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: c.text }}>{event.name}</span>
                  <StatusBadge published={!event.isBlocked} activeLabel="Activ" inactiveLabel="Blocat" />
                </div>
                <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>{event.eventType}/{event.slug}</p>
              </div>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: c.textSoft, transform: expandedId === event.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
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
                {event.blockInfo?.reason && <p className="text-xs" style={{ color: c.danger }}>Motiv blocare: {event.blockInfo.reason}</p>}
                <button onClick={() => toggleBlock(event)} disabled={saving} className="w-full py-2 rounded-xl text-sm font-semibold"
                  style={event.isBlocked
                    ? { color: c.success, backgroundColor: c.successBg, border: `1px solid ${c.success}30` }
                    : { color: c.danger, backgroundColor: c.dangerBg, border: `1px solid ${c.danger}30` }}>
                  {event.isBlocked ? 'Deblochează pagina' : 'Blochează pagina'}
                </button>
              </div>
            )}
          </div>
        ))}
        {/* Mobile totals */}
        {filtered.length > 0 && (
          <div className="rounded-xl px-4 py-3 grid grid-cols-2 gap-3" style={{ backgroundColor: c.surface, border: `2px solid ${c.borderStrong}` }}>
            <MobileStatRow label={`Total colectat (${filtered.length} pagini)`} value={`${totalDonations.toLocaleString('ro-RO')} RON`} color={c.success} />
            <MobileStatRow label="Total comision" value={`${totalCommission.toLocaleString('ro-RO')} RON`} color={c.warning} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ImageUpload primitive ────────────────────────────────────────────────────

function ImageUpload({ value, onChange, folder, hint }: {
  value: string
  onChange: (url: string) => void
  folder: string
  hint?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true); setError('')
    try {
      const url = await uploadImage(file, folder)
      onChange(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload eșuat')
    }
    setUploading(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-6 px-4 text-center cursor-pointer transition-colors"
        style={{ borderColor: uploading ? c.accent : c.border, backgroundColor: uploading ? c.badge : '#FAFBFF' }}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {uploading ? (
          <p className="text-sm" style={{ color: c.accent }}>Se încarcă...</p>
        ) : (
          <>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: c.textSoft, marginBottom: 6 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm font-medium" style={{ color: c.textMid }}>Click sau trage o imagine</p>
            <p className="text-xs mt-1" style={{ color: c.textSoft }}>JPG, PNG, WebP — max 20MB</p>
            {hint && <p className="text-xs mt-1" style={{ color: c.textSoft }}>{hint}</p>}
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </div>

      {error && <p className="text-xs" style={{ color: c.danger }}>{error}</p>}

      {/* URL fallback */}
      <div>
        <label className="block text-xs mb-1" style={{ color: c.textSoft }}>sau introdu URL imagine</label>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..."
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text }} />
      </div>

      {/* Preview */}
      {value && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="w-full rounded-lg object-cover" style={{ maxHeight: 180, border: `1px solid ${c.border}` }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <button onClick={() => onChange('')} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff' }}>✕</button>
        </div>
      )}
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
  return <div className="rounded-2xl p-6" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>{children}</div>
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: c.textSoft }}>{children}</p>
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center rounded-2xl" style={{ backgroundColor: c.surface, border: `1px dashed ${c.border}` }}>
      <p className="text-sm" style={{ color: c.textSoft }}>{message}</p>
    </div>
  )
}

function StatusBadge({ published, activeLabel = 'Publicat', inactiveLabel = 'Draft' }: { published: boolean; activeLabel?: string; inactiveLabel?: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={published ? { backgroundColor: c.successBg, color: c.success } : { backgroundColor: c.warningBg, color: c.warning }}>
      {published ? activeLabel : inactiveLabel}
    </span>
  )
}

function StatCard({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="rounded-xl px-4 py-4" style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}>
      <p className="text-xs font-medium mb-1" style={{ color: c.textSoft }}>{label}</p>
      <p className="text-lg font-bold" style={{ color: color ?? c.text }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>{sub}</p>}
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

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div onClick={() => onChange(!value)} className="relative w-10 h-5 rounded-full transition-colors cursor-pointer" style={{ backgroundColor: value ? c.accent : c.border }}>
        <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" style={{ transform: value ? 'translateX(20px)' : 'none' }} />
      </div>
      <span className="text-sm font-medium" style={{ color: c.text }}>{label}</span>
    </label>
  )
}

function Msg({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="px-3 py-2 rounded-lg text-sm mb-2" style={{ backgroundColor: ok ? c.successBg : c.dangerBg, color: ok ? c.success : c.danger }}>
      {text}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, disabled, hint, hintColor }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; disabled?: boolean; hint?: string; hintColor?: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-medium" style={{ color: c.textMid }}>{label}</label>
        {hint && <span className="text-xs" style={{ color: hintColor ?? c.textSoft }}>{hint}</span>}
      </div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none disabled:opacity-40 transition-colors"
        style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text }}
        onFocus={(e) => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${c.accent}18` }}
        onBlur={(e) => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function Btn({ onClick, children, loading, variant = 'primary', fullWidth }: {
  onClick: () => void; children: React.ReactNode; loading?: boolean; variant?: 'primary' | 'ghost' | 'danger'; fullWidth?: boolean
}) {
  const styles = {
    primary: { backgroundColor: c.accent, color: '#fff' },
    ghost: { backgroundColor: 'transparent', color: c.textMid, border: `1px solid ${c.border}` },
    danger: { backgroundColor: c.dangerBg, color: c.danger, border: `1px solid ${c.danger}30` },
  }
  return (
    <button onClick={onClick} disabled={loading}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-opacity${fullWidth ? ' w-full' : ''}`}
      style={{ ...styles[variant], opacity: loading ? 0.6 : 1 }}
      onMouseOver={(e) => { if (variant === 'primary' && !loading) e.currentTarget.style.backgroundColor = c.accentHover }}
      onMouseOut={(e) => { if (variant === 'primary') e.currentTarget.style.backgroundColor = c.accent }}>
      {loading ? 'Se salvează...' : children}
    </button>
  )
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function toSlug(v: string): string {
  return v.toLowerCase()
    .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

function parseSections(md: string): Array<{ h2?: string; h3?: string; body?: string }> {
  const lines = md.split('\n')
  const sections: Array<{ h2?: string; h3?: string; body?: string }> = []
  let cur: { h2?: string; h3?: string; bodyLines: string[] } = { bodyLines: [] }
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (cur.bodyLines.length || cur.h2 || cur.h3) sections.push({ h2: cur.h2, h3: cur.h3, body: cur.bodyLines.join('\n') })
      cur = { h2: line.replace('## ', ''), bodyLines: [] }
    } else if (line.startsWith('### ')) {
      if (cur.bodyLines.length) { sections.push({ h2: cur.h2, h3: cur.h3, body: cur.bodyLines.join('\n') }); cur = { h2: cur.h2, bodyLines: [] } }
      cur.h3 = line.replace('### ', '')
    } else if (!line.startsWith('#')) { cur.bodyLines.push(line) }
  }
  if (cur.bodyLines.length || cur.h2 || cur.h3) sections.push({ h2: cur.h2, h3: cur.h3, body: cur.bodyLines.join('\n') })
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
