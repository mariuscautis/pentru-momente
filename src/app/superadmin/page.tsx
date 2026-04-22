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
  isDeleted: boolean
  isBlocked: boolean
  createdAt: string
  goalAmount: number | null
  expiresAt: string | null
  totalRaised: number
  totalTips: number
  blockInfo: { reason: string | null; blockedBy: string; blockedAt: string } | null
  organiserEmail: string
  organiserName: string
  stripeConnectAccountId: string | null
  connectOnboardingComplete: boolean
}

type Tab = 'seo' | 'blog' | 'terms' | 'cookies' | 'gdpr' | 'menu' | 'events' | 'coming-soon' | 'testimoniale' | 'tichete'

interface AdminDonation {
  id: string
  amount: number
  tipAmount: number
  displayName: string | null
  message: string | null
  isAnonymous: boolean
  showAmount: boolean
  status: string
  createdAt: string
  itemId: string | null
}

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
  const [tab, setTab] = useState<Tab>('events')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ticketUnread, setTicketUnread] = useState(0)

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

  // Poll unread ticket count every 30s
  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await apiFetch('/api/admin/tickets')
        if (res.ok) {
          const j = await res.json() as { unreadCount: number }
          setTicketUnread(j.unreadCount ?? 0)
        }
      } catch { /* ignore */ }
    }
    fetchUnread()
    const id = setInterval(fetchUnread, 30_000)
    return () => clearInterval(id)
  }, [])

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

  const navItems: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: 'events',        label: 'Statistici Donații', icon: '📊' },
    { id: 'tichete',       label: 'Tichete',            icon: '🎫', badge: ticketUnread },
    { id: 'testimoniale',  label: 'Testimoniale',       icon: '💬' },
    { id: 'seo',           label: 'SEO',                icon: '⚙️' },
    { id: 'blog',          label: 'Blog',               icon: '📝' },
    { id: 'terms',         label: 'Termeni & Condiții', icon: '📋' },
    { id: 'cookies',       label: 'Politica Cookies',   icon: '🍪' },
    { id: 'gdpr',          label: 'Politica GDPR',      icon: '🔒' },
    { id: 'menu',          label: 'Meniu',              icon: '☰' },
    { id: 'coming-soon',   label: 'Coming Soon',        icon: '🚧' },
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

      <div className="flex flex-1">
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 md:hidden" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setSidebarOpen(false)} />
        )}
        <aside
          className={`w-56 shrink-0 flex flex-col py-5 px-3 z-30 fixed md:static inset-y-0 left-0 transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ backgroundColor: c.sidebar, borderRight: `1px solid rgba(255,255,255,0.06)`, top: '56px', minHeight: 'calc(100vh - 56px)' }}
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
                <span className="flex-1">{item.label}</span>
                {!!item.badge && item.badge > 0 && (
                  <span
                    className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold"
                    style={{ backgroundColor: c.danger, color: '#fff' }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="px-4 md:px-8 py-8">
            {tab === 'seo'           && <SeoTab />}
            {tab === 'blog'          && <BlogTab />}
            {tab === 'terms'         && <TermsTab />}
            {tab === 'cookies'       && <CookiesTab />}
            {tab === 'gdpr'          && <GdprTab />}
            {tab === 'menu'          && <MenuTab />}
            {tab === 'coming-soon'   && <ComingSoonTab />}
            {tab === 'events'        && <EventsTab />}
            {tab === 'testimoniale'  && <TestimonialeTab />}
            {tab === 'tichete'       && <TicheteTab onUnreadChange={setTicketUnread} />}
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── Testimoniale Tab ─────────────────────────────────────────────────────────

interface Testimonial {
  id: string
  quote: string
  name: string
  city: string
  eventType: string
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const BLANK_TESTIMONIAL = { quote: '', name: '', city: '', eventType: '', imageUrl: '', sortOrder: 0, isActive: true }

function TestimonialeTab() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState(BLANK_TESTIMONIAL)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const load = useCallback(async () => {
    const res = await apiFetch('/api/admin/testimonials')
    if (res.ok) {
      const json = await res.json() as { testimonials: Testimonial[] }
      setItems(json.testimonials)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function startNew() {
    setEditing(null)
    setForm(BLANK_TESTIMONIAL)
    setMsg(null)
  }

  function startEdit(t: Testimonial) {
    setEditing(t)
    setForm({ quote: t.quote, name: t.name, city: t.city, eventType: t.eventType, imageUrl: t.imageUrl ?? '', sortOrder: t.sortOrder, isActive: t.isActive })
    setMsg(null)
  }

  async function save() {
    if (!form.quote.trim() || !form.name.trim() || !form.city.trim() || !form.eventType.trim()) {
      setMsg({ text: 'Completează toate câmpurile obligatorii.', ok: false }); return
    }
    setSaving(true); setMsg(null)
    const payload = { ...form, imageUrl: form.imageUrl || null }
    const res = editing
      ? await apiFetch(`/api/admin/testimonials/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      : await apiFetch('/api/admin/testimonials', { method: 'POST', body: JSON.stringify(payload) })
    if (res.ok) {
      setMsg({ text: editing ? 'Testimonial actualizat.' : 'Testimonial adăugat.', ok: true })
      startNew(); load()
    } else {
      setMsg({ text: 'Eroare la salvare.', ok: false })
    }
    setSaving(false)
  }

  async function remove(id: string) {
    setDeleting(id)
    await apiFetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    setDeleting(null)
    load()
  }

  async function toggleActive(t: Testimonial) {
    await apiFetch(`/api/admin/testimonials/${t.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !t.isActive }) })
    load()
  }

  const f = (key: keyof typeof form, val: string | number | boolean) => setForm(p => ({ ...p, [key]: val }))

  return (
    <div className="max-w-5xl space-y-8">
      <PageHeader title="Testimoniale" description="Gestionează testimonialele afișate pe homepage. Ordinea este dată de câmpul Ordine." />

      {/* ── Form ── */}
      <Card>
        <h2 className="text-base font-bold mb-5" style={{ color: c.text }}>
          {editing ? 'Editează testimonial' : 'Adaugă testimonial nou'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quote */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium mb-1.5" style={{ color: c.textMid }}>Citat *</label>
            <textarea
              value={form.quote}
              onChange={(e) => f('quote', e.target.value)}
              rows={3}
              placeholder="Ce a spus clientul..."
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
              style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text }}
              onFocus={(e) => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${c.accent}18` }}
              onBlur={(e) => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          {/* Name */}
          <Field label="Nume *" value={form.name} onChange={(v) => f('name', v)} placeholder="ex. Andreea M." />

          {/* City */}
          <Field label="Oraș *" value={form.city} onChange={(v) => f('city', v)} placeholder="ex. Cluj-Napoca" />

          {/* Event type */}
          <Field label="Categorie *" value={form.eventType} onChange={(v) => f('eventType', v)} placeholder="ex. Înmormântare" />

          {/* Sort order */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: c.textMid }}>Ordine</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => f('sortOrder', parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ backgroundColor: '#FAFBFF', border: `1px solid ${c.border}`, color: c.text }}
              onFocus={(e) => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${c.accent}18` }}
              onBlur={(e) => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-end pb-1">
            <Toggle value={form.isActive} onChange={(v) => f('isActive', v)} label="Afișat pe homepage" />
          </div>

          {/* Image upload */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium mb-1.5" style={{ color: c.textMid }}>Fotografie (opțional)</label>
            <ImageUpload
              value={form.imageUrl}
              onChange={(v) => f('imageUrl', v)}
              folder="testimonials"
              hint="Recomandăm o imagine pătratică, min 200×200px"
            />
          </div>
        </div>

        {msg && <div className="mt-4"><Msg ok={msg.ok} text={msg.text} /></div>}

        <div className="flex gap-2 mt-5">
          <Btn onClick={save} loading={saving}>{editing ? 'Salvează modificările' : 'Adaugă testimonial'}</Btn>
          {editing && <Btn onClick={startNew} variant="ghost">Anulează</Btn>}
        </div>
      </Card>

      {/* ── List ── */}
      {items.length === 0 ? (
        <EmptyState message="Niciun testimonial adăugat încă." />
      ) : (
        <div className="space-y-3">
          <SectionLabel>{items.length} testimoniale</SectionLabel>
          {items.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl p-4"
              style={{ backgroundColor: c.surface, border: `1px solid ${t.isActive ? c.border : c.borderStrong}`, opacity: t.isActive ? 1 : 0.65 }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-lg font-bold" style={{ backgroundColor: c.badge, color: c.accent }}>
                  {t.imageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                    : t.name.charAt(0).toUpperCase()
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-bold" style={{ color: c.text }}>{t.name}</p>
                    <p className="text-xs" style={{ color: c.textSoft }}>{t.city}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: c.badge, color: c.badgeText }}>{t.eventType}</span>
                    <span className="text-xs" style={{ color: c.textSoft }}>#{t.sortOrder}</span>
                    <StatusBadge published={t.isActive} activeLabel="Activ" inactiveLabel="Ascuns" />
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-2" style={{ color: c.textMid }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-1.5">
                  <button
                    onClick={() => toggleActive(t)}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: c.surfaceHover, color: c.textMid, border: `1px solid ${c.border}` }}
                    title={t.isActive ? 'Ascunde' : 'Afișează'}
                  >
                    {t.isActive ? 'Ascunde' : 'Afișează'}
                  </button>
                  <button
                    onClick={() => startEdit(t)}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: c.badge, color: c.accent, border: `1px solid ${c.accent}30` }}
                  >
                    Editează
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    disabled={deleting === t.id}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: c.dangerBg, color: c.danger, border: `1px solid ${c.danger}30`, opacity: deleting === t.id ? 0.5 : 1 }}
                  >
                    {deleting === t.id ? '...' : 'Șterge'}
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

// ─── Tichete Tab ─────────────────────────────────────────────────────────────

interface AdminTicket {
  id: string
  organiserId: string
  organiserEmail: string
  organiserName: string
  subject: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  hasUnreadAdmin: boolean
  hasUnreadUser: boolean
  createdAt: string
  updatedAt: string
}

interface AdminTicketMessage {
  id: string
  ticketId: string
  senderRole: 'user' | 'admin'
  senderName: string
  body: string
  createdAt: string
}

const TICKET_STATUS_LABELS: Record<string, string> = {
  open: 'Deschis',
  in_progress: 'În lucru',
  completed: 'Rezolvat',
  cancelled: 'Anulat',
}

const TICKET_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open:        { bg: '#EEF1FD', color: '#4F6EF5' },
  in_progress: { bg: '#EFF6FF', color: '#1D4ED8' },
  completed:   { bg: c.successBg, color: c.success },
  cancelled:   { bg: '#F1F5F9', color: '#64748B' },
}

function fmtTicketDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function TicheteTab({ onUnreadChange }: { onUnreadChange: (n: number) => void }) {
  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTicket, setActiveTicket] = useState<AdminTicket | null>(null)
  const [messages, setMessages] = useState<AdminTicketMessage[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const bottomRef = useRef<HTMLDivElement>(null)
  const activeTicketRef = useRef<AdminTicket | null>(null)
  activeTicketRef.current = activeTicket

  const loadTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/admin/tickets')
      if (res.ok) {
        const j = await res.json() as { tickets: AdminTicket[]; unreadCount: number }
        setTickets(j.tickets)
        onUnreadChange(j.unreadCount ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }, [onUnreadChange])

  useEffect(() => { loadTickets() }, [loadTickets])

  const loadMessages = useCallback(async (ticketId: string) => {
    setLoadingMsgs(true)
    try {
      const res = await apiFetch(`/api/admin/tickets/${ticketId}/messages`)
      if (res.ok) {
        const j = await res.json() as { messages: AdminTicketMessage[]; ticket: AdminTicket }
        setMessages(j.messages)
        setTickets(prev => {
          const next = prev.map(t => t.id === ticketId ? { ...t, hasUnreadAdmin: false } : t)
          onUnreadChange(next.filter(t => t.hasUnreadAdmin).length)
          return next
        })
      }
    } finally {
      setLoadingMsgs(false)
    }
  }, [onUnreadChange])

  // ── Realtime: new messages ────────────────────────────────────────────────
  useEffect(() => {
    const supabase = getSupabase()
    const channel = supabase
      .channel('admin-ticket-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_messages' },
        (payload) => {
          const row = payload.new as {
            id: string; ticket_id: string; sender_role: string
            sender_name: string; body: string; created_at: string
          }
          // Append to open thread if it matches
          if (activeTicketRef.current?.id === row.ticket_id && row.sender_role === 'user') {
            const msg: AdminTicketMessage = {
              id: row.id,
              ticketId: row.ticket_id,
              senderRole: row.sender_role as 'user' | 'admin',
              senderName: row.sender_name,
              body: row.body,
              createdAt: row.created_at,
            }
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev
              return [...prev, msg]
            })
            // Mark as read immediately since admin has the thread open
            apiFetch(`/api/admin/tickets/${row.ticket_id}/messages`).catch(() => null)
          }
          // Refresh ticket list for updated timestamps + unread dots
          loadTickets()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [loadTickets])

  // ── Realtime: ticket status / unread changes ──────────────────────────────
  useEffect(() => {
    const supabase = getSupabase()
    const channel = supabase
      .channel('admin-ticket-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'support_tickets' },
        (payload) => {
          const row = payload.new as {
            id: string; status: string; has_unread_admin: boolean
            has_unread_user: boolean; updated_at: string
          }
          setTickets(prev => {
            const next = prev.map(t =>
              t.id === row.id
                ? { ...t, status: row.status as AdminTicket['status'], hasUnreadAdmin: row.has_unread_admin, hasUnreadUser: row.has_unread_user, updatedAt: row.updated_at }
                : t
            )
            onUnreadChange(next.filter(t => t.hasUnreadAdmin).length)
            return next
          })
          if (activeTicketRef.current?.id === row.id) {
            setActiveTicket(prev => prev ? { ...prev, status: row.status as AdminTicket['status'] } : null)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [onUnreadChange])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function openThread(ticket: AdminTicket) {
    setActiveTicket(ticket)
    setMessages([])
    setReply('')
    loadMessages(ticket.id)
  }

  async function sendReply() {
    if (!reply.trim() || !activeTicket) return
    setSending(true)
    const optimistic: AdminTicketMessage = {
      id: `opt-${Date.now()}`,
      ticketId: activeTicket.id,
      senderRole: 'admin',
      senderName: 'Support',
      body: reply.trim(),
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    const text = reply.trim()
    setReply('')
    try {
      const res = await apiFetch(`/api/admin/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      })
      if (res.ok) {
        const j = await res.json() as { message: AdminTicketMessage }
        setMessages(prev => prev.map(m => m.id === optimistic.id ? j.message : m))
        setTickets(prev => prev.map(t =>
          t.id === activeTicket.id ? { ...t, hasUnreadUser: true, updatedAt: new Date().toISOString() } : t
        ))
      } else {
        setMessages(prev => prev.filter(m => m.id !== optimistic.id))
        setReply(text)
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setReply(text)
    } finally {
      setSending(false)
    }
  }

  async function setStatus(status: AdminTicket['status']) {
    if (!activeTicket) return
    setStatusSaving(true)
    try {
      const res = await apiFetch(`/api/admin/tickets/${activeTicket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const updated = { ...activeTicket, status }
        setActiveTicket(updated)
        setTickets(prev => prev.map(t => t.id === activeTicket.id ? updated : t))
      }
    } finally {
      setStatusSaving(false)
    }
  }

  const filtered = filterStatus === 'all'
    ? tickets
    : tickets.filter(t => t.status === filterStatus)

  const unreadCount = tickets.filter(t => t.hasUnreadAdmin).length

  // ── Split view: list + thread ──────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          title="Tichete suport"
          description="Conversații cu organizatorii de pagini."
        />
        {unreadCount > 0 && (
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ backgroundColor: c.dangerBg, color: c.danger }}
          >
            {unreadCount} mesaj{unreadCount !== 1 ? 'e' : ''} nou{unreadCount !== 1 ? 'ă' : ''}
          </span>
        )}
      </div>

      <div
        className="rounded-2xl overflow-hidden flex"
        style={{ border: `1px solid ${c.border}`, minHeight: 520, backgroundColor: c.surface }}
      >
        {/* ── Ticket list panel ── */}
        <div
          className={`flex flex-col shrink-0 ${activeTicket ? 'hidden md:flex' : 'flex'}`}
          style={{ width: activeTicket ? 300 : '100%', borderRight: activeTicket ? `1px solid ${c.border}` : 'none' }}
        >
          {/* Filter bar */}
          <div
            className="flex items-center gap-1 px-4 py-3 shrink-0 flex-wrap"
            style={{ borderBottom: `1px solid ${c.border}`, backgroundColor: c.bg }}
          >
            {['all', 'open', 'in_progress', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="text-xs px-2.5 py-1 rounded-full font-medium transition-colors"
                style={filterStatus === s
                  ? { backgroundColor: c.accent, color: '#fff' }
                  : { backgroundColor: c.border, color: c.textMid }
                }
              >
                {s === 'all' ? 'Toate' : TICKET_STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading && filtered.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-sm" style={{ color: c.textSoft }}>Se încarcă...</p>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState message="Niciun tichet în această categorie." />
            ) : (
              <ul>
                {filtered.map(t => {
                  const isActive = activeTicket?.id === t.id
                  return (
                    <li key={t.id} style={{ borderBottom: `1px solid ${c.border}` }}>
                      <button
                        onClick={() => openThread(t)}
                        className="w-full text-left px-4 py-3.5 transition-colors"
                        style={{
                          backgroundColor: isActive ? c.sidebarActiveBg.replace('0.12', '0.06') : 'transparent',
                        }}
                        onMouseOver={e => { if (!isActive) e.currentTarget.style.backgroundColor = c.surfaceHover }}
                        onMouseOut={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {t.hasUnreadAdmin && (
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.danger }} />
                            )}
                            <p className="text-sm font-semibold truncate" style={{ color: c.text }}>
                              {t.subject}
                            </p>
                          </div>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                            style={TICKET_STATUS_COLORS[t.status]}
                          >
                            {TICKET_STATUS_LABELS[t.status]}
                          </span>
                        </div>
                        <p className="text-xs truncate" style={{ color: c.textSoft }}>
                          {t.organiserEmail}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>
                          {fmtTicketDate(t.updatedAt)}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* ── Thread panel ── */}
        {activeTicket ? (
          <div className="flex flex-col flex-1 min-w-0">
            {/* Thread header */}
            <div
              className="flex items-center gap-3 px-5 py-3.5 shrink-0 flex-wrap"
              style={{ borderBottom: `1px solid ${c.border}`, backgroundColor: c.bg }}
            >
              {/* Back on mobile */}
              <button
                onClick={() => { setActiveTicket(null); loadTickets() }}
                className="md:hidden p-1 rounded-lg"
                style={{ color: c.textSoft }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: c.text }}>{activeTicket.subject}</p>
                <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>
                  {activeTicket.organiserEmail} · {activeTicket.organiserName}
                </p>
              </div>

              {/* Status selector */}
              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                {(['open', 'in_progress', 'completed', 'cancelled'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    disabled={statusSaving || activeTicket.status === s}
                    className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                    style={{
                      ...TICKET_STATUS_COLORS[s],
                      opacity: activeTicket.status === s ? 1 : 0.5,
                      outline: activeTicket.status === s ? `2px solid ${TICKET_STATUS_COLORS[s].color}` : 'none',
                      outlineOffset: 2,
                      cursor: activeTicket.status === s ? 'default' : 'pointer',
                    }}
                  >
                    {TICKET_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-24">
                  <p className="text-sm" style={{ color: c.textSoft }}>Se încarcă...</p>
                </div>
              ) : messages.length === 0 ? (
                <p className="text-sm text-center" style={{ color: c.textSoft }}>Niciun mesaj.</p>
              ) : (
                messages.map(m => {
                  const isAdmin = m.senderRole === 'admin'
                  return (
                    <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${isAdmin ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                        style={{
                          backgroundColor: isAdmin ? c.accent : c.bg,
                          color: isAdmin ? '#fff' : c.text,
                          border: isAdmin ? 'none' : `1px solid ${c.border}`,
                        }}
                      >
                        {!isAdmin && (
                          <p className="text-xs font-semibold mb-1" style={{ color: c.accent }}>{m.senderName}</p>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
                        <p
                          className="text-xs mt-2 text-right"
                          style={{ color: isAdmin ? 'rgba(255,255,255,0.6)' : c.textSoft }}
                        >
                          {fmtTicketDate(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Reply box */}
            {activeTicket.status === 'completed' || activeTicket.status === 'cancelled' ? (
              <div
                className="px-5 py-3 shrink-0 flex items-center gap-2"
                style={{ borderTop: `1px solid ${c.border}`, backgroundColor: c.bg }}
              >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: c.textSoft }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs" style={{ color: c.textSoft }}>
                  Tichetul este {activeTicket.status === 'completed' ? 'rezolvat' : 'anulat'}.
                  Schimbă statusul pentru a relua conversația.
                </p>
              </div>
            ) : (
              <div
                className="px-4 py-3 shrink-0"
                style={{ borderTop: `1px solid ${c.border}`, backgroundColor: c.bg }}
              >
                <div
                  className="flex items-end gap-3 rounded-xl px-3 py-2"
                  style={{ border: `1px solid ${c.border}`, backgroundColor: c.surface }}
                >
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() }
                    }}
                    placeholder="Scrie un răspuns..."
                    rows={2}
                    className="flex-1 text-sm outline-none resize-none bg-transparent"
                    style={{ color: c.text, maxHeight: 120, overflowY: 'auto' }}
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: reply.trim() ? c.accent : c.border,
                      color: reply.trim() ? '#fff' : c.textSoft,
                      opacity: sending ? 0.6 : 1,
                    }}
                    onMouseOver={e => { if (reply.trim() && !sending) e.currentTarget.style.backgroundColor = c.accentHover }}
                    onMouseOut={e => { if (reply.trim()) e.currentTarget.style.backgroundColor = c.accent }}
                  >
                    {sending ? 'Se trimite...' : 'Trimite'}
                  </button>
                </div>
                <p className="text-xs mt-1.5 text-right" style={{ color: c.textSoft }}>
                  Enter · Shift+Enter pentru rând nou
                </p>
              </div>
            )}
          </div>
        ) : (
          // Empty state when no ticket selected (desktop only)
          <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-3">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} style={{ color: c.textSoft }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm" style={{ color: c.textSoft }}>Selectează un tichet din listă</p>
          </div>
        )}
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
  { id: '__tarife__',               title: 'Tarife',              slug: 'tarife' },
  { id: '__create__',               title: 'Creează o pagină',    slug: 'create' },
  { id: '__login__',                title: 'Autentificare',       slug: 'login' },
  { id: '__termeni-si-conditii__',  title: 'Termeni și Condiții', slug: 'termeni-si-conditii' },
  { id: '__politica-cookies__',     title: 'Politica Cookies',    slug: 'politica-cookies' },
  { id: '__politica-gdpr__',        title: 'Politica GDPR',       slug: 'politica-gdpr' },
  { id: '__stergere-date__',        title: 'Ștergere Date',        slug: 'stergere-date' },
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
    // DB-created pages not in menu and not shadowed by a static page with the same slug
    ...dbPages
      .filter(p =>
        !inMenuIds.has(p.id) &&
        !ALL_STATIC_PAGES.some(sp => sp.id === p.id || sp.slug === p.slug)
      )
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

// ─── Coming Soon Tab ──────────────────────────────────────────────────────────

function ComingSoonTab() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    apiFetch('/api/admin/coming-soon')
      .then(r => r.json())
      .then((j: { enabled: boolean }) => { setEnabled(j.enabled); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function save(value: boolean) {
    setSaving(true); setMsg(null)
    const res = await apiFetch('/api/admin/coming-soon', {
      method: 'POST',
      body: JSON.stringify({ enabled: value }),
    })
    if (res.ok) {
      setEnabled(value)
      setMsg({ text: value ? 'Banner-ul "În curând" este acum activ.' : 'Banner-ul "În curând" a fost dezactivat.', ok: true })
    } else {
      setMsg({ text: 'Eroare la salvare.', ok: false })
    }
    setSaving(false)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: c.text }}>Banner „În curând"</h2>
        <p className="text-sm" style={{ color: c.textSoft }}>
          Activează un overlay semitransparent pe homepage care informează vizitatorii că platforma este în curs de lansare.
        </p>
      </div>

      <div
        className="rounded-xl p-6 flex items-center justify-between gap-6"
        style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}
      >
        <div className="space-y-1">
          <p className="text-sm font-semibold" style={{ color: c.text }}>Afișare banner pe homepage</p>
          <p className="text-xs" style={{ color: c.textSoft }}>
            {loading ? 'Se încarcă...' : enabled ? 'Banner activ — vizibil pentru toți vizitatorii.' : 'Banner inactiv — homepage-ul se afișează normal.'}
          </p>
        </div>

        {/* Toggle switch */}
        <button
          disabled={loading || saving}
          onClick={() => save(!enabled)}
          aria-label="Toggle coming soon"
          className="relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none"
          style={{ backgroundColor: enabled ? c.accent : c.border }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
            style={{ transform: enabled ? 'translateX(24px)' : 'translateX(0)' }}
          />
        </button>
      </div>

      {msg && (
        <p
          className="text-sm px-4 py-2.5 rounded-lg"
          style={{ backgroundColor: msg.ok ? c.successBg : c.dangerBg, color: msg.ok ? c.success : c.danger }}
        >
          {msg.text}
        </p>
      )}

      {/* Preview */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: c.textSoft }}>Previzualizare banner</p>
        <div
          className="relative rounded-xl overflow-hidden"
          style={{ border: `1px solid ${c.border}`, minHeight: '160px', backgroundColor: '#FDFAF7' }}
        >
          {/* Fake homepage background */}
          <div className="p-6 space-y-2 opacity-30">
            <div className="h-3 rounded-full w-2/3" style={{ backgroundColor: '#C4956A' }} />
            <div className="h-2 rounded-full w-full" style={{ backgroundColor: '#EAD8C8' }} />
            <div className="h-2 rounded-full w-5/6" style={{ backgroundColor: '#EAD8C8' }} />
            <div className="h-2 rounded-full w-4/6" style={{ backgroundColor: '#EAD8C8' }} />
          </div>
          {/* Overlay preview */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(253,250,247,0.82)', backdropFilter: 'blur(2px)' }}
          >
            <div className="text-center px-4">
              <div className="text-2xl mb-2">🚧</div>
              <p className="text-sm font-bold" style={{ color: '#2D1A0E' }}>Lansăm în curând</p>
              <p className="text-xs mt-1" style={{ color: '#7A6652' }}>Platforma este în curs de pregătire.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Events / Donation Stats Tab ───────────────────────────────────────────────

function EventsTab() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'deleted' | 'expired'>('all')
  const [blockingId, setBlockingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [donationsModal, setDonationsModal] = useState<{ eventId: string; eventName: string } | null>(null)

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true)
    try {
      const res = await apiFetch('/api/admin/events')
      if (res.ok) {
        const json = await res.json() as { events: AdminEvent[] }
        setEvents(json.events)
      }
    } finally {
      if (showSpinner) setRefreshing(false)
    }
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
    const isExpired = !!e.expiresAt && new Date(e.expiresAt) < new Date()
    const matchStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? (e.isActive && !e.isDeleted && !e.isBlocked && !isExpired) :
      statusFilter === 'inactive' ? (!e.isActive && !e.isDeleted && !isExpired) :
      statusFilter === 'deleted' ? e.isDeleted :
      statusFilter === 'expired' ? isExpired : true
    return matchSearch && matchFrom && matchTo && matchStatus
  })

  const totalDonations = filtered.reduce((s, e) => s + (e.totalRaised ?? 0), 0)
  const totalCommission = filtered.reduce((s, e) => s + (e.totalTips ?? 0), 0)
  const allTimeCommission = events.reduce((s, e) => s + (e.totalTips ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Statistici Donații" description="Toate paginile de donații — vizualizare completă și control." />
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors mt-1"
          style={{ backgroundColor: c.surface, border: `1px solid ${c.border}`, color: c.textMid, opacity: refreshing ? 0.7 : 1 }}
          title="Reîncarcă datele"
        >
          {refreshing ? (
            <div
              className="animate-spin shrink-0"
              style={{
                width: 13, height: 13, borderRadius: '50%',
                border: `2px solid ${c.border}`,
                borderTopColor: c.accent,
              }}
            />
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          )}
          {refreshing ? 'Se încarcă...' : 'Reîncarcă'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total pagini" value={String(events.length)} />
        <StatCard label="Pagini active" value={String(events.filter(e => e.isActive && !e.isBlocked && !e.isDeleted && !(e.expiresAt && new Date(e.expiresAt) < new Date())).length)} color={c.success} />
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

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {([
          { key: 'all',      label: 'Toate' },
          { key: 'active',   label: 'Active' },
          { key: 'inactive', label: 'Inactive' },
          { key: 'expired',  label: 'Expirate' },
          { key: 'deleted',  label: 'Șterse' },
        ] as { key: typeof statusFilter; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
            style={statusFilter === key
              ? { backgroundColor: c.accent, color: '#fff', border: `1px solid ${c.accent}` }
              : { backgroundColor: c.surface, color: c.textMid, border: `1px solid ${c.border}` }
            }
          >
            {label}
            {key !== 'all' && (
              <span className="ml-1.5 opacity-70">
                {key === 'active'   ? events.filter(e => e.isActive && !e.isBlocked && !(e.expiresAt && new Date(e.expiresAt) < new Date())).length :
                 key === 'inactive' ? events.filter(e => !e.isActive && !e.isDeleted && !(e.expiresAt && new Date(e.expiresAt) < new Date())).length :
                 key === 'expired'  ? events.filter(e => !!e.expiresAt && new Date(e.expiresAt) < new Date()).length :
                 key === 'deleted'  ? events.filter(e => e.isDeleted && !e.isActive).length : 0}
              </span>
            )}
          </button>
        ))}
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

      {/* Event list — unified expandable cards (desktop + mobile) */}
      {filtered.length === 0 ? (
        <EmptyState message="Nicio pagină găsită." />
      ) : (
        <div className="space-y-2">
          {filtered.map((event) => {
            const isOpen = expandedId === event.id
            const stripeStatus = event.connectOnboardingComplete
              ? 'complet'
              : event.stripeConnectAccountId
              ? 'în curs'
              : 'neconfigurat'
            const stripeColor = event.connectOnboardingComplete ? c.success : event.stripeConnectAccountId ? c.warning : c.textSoft
            const stripeBg = event.connectOnboardingComplete ? c.successBg : event.stripeConnectAccountId ? c.warningBg : c.bg

            return (
              <div
                key={event.id}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: c.surface, border: `1px solid ${event.isBlocked ? c.danger + '50' : c.border}`, transition: 'border-color .15s' }}
              >
                {/* ── Row header — always visible, click to toggle ── */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
                  onClick={() => setExpandedId(isOpen ? null : event.id)}
                  style={{ backgroundColor: isOpen ? c.bg : 'transparent', transition: 'background-color .15s' }}
                >
                  {/* Chevron */}
                  <svg
                    width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    className="shrink-0"
                    style={{ color: c.textSoft, transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .2s ease' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>

                  {/* Name + slug */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: c.text }}>{event.name}</span>
                      <EventStatusBadge event={event} />
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: c.badge, color: c.badgeText }}>{event.eventType}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>
                      <a
                        href={`/${event.eventType}/${event.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: c.accent, textDecoration: 'none' }}
                        onMouseOver={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                        onMouseOut={(e) => { e.currentTarget.style.textDecoration = 'none' }}
                      >
                        {event.eventType}/{event.slug}
                      </a>
                      {' · creat '}{new Date(event.createdAt).toLocaleDateString('ro-RO')}
                    </p>
                  </div>

                  {/* Key financials — shown on wider screens */}
                  <div className="hidden sm:flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <p className="text-xs" style={{ color: c.textSoft }}>Colectat</p>
                      <p className="text-sm font-semibold" style={{ color: event.totalRaised > 0 ? c.success : c.textSoft }}>
                        {(event.totalRaised ?? 0).toLocaleString('ro-RO')} RON
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: c.textSoft }}>Transferat</p>
                      <p className="text-sm font-semibold" style={{ color: c.accent }}>
                        {Math.max(0, (event.totalRaised ?? 0) - (event.totalTips ?? 0)).toLocaleString('ro-RO')} RON
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: c.textSoft }}>Comision</p>
                      <p className="text-sm font-semibold" style={{ color: event.totalTips > 0 ? c.warning : c.textSoft }}>
                        {(event.totalTips ?? 0).toLocaleString('ro-RO')} RON
                      </p>
                    </div>
                  </div>

                  {/* Block/unblock button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBlock(event) }}
                    disabled={saving}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={event.isBlocked
                      ? { color: c.success, backgroundColor: c.successBg, border: `1px solid ${c.success}30` }
                      : { color: c.danger, backgroundColor: c.dangerBg, border: `1px solid ${c.danger}30` }}
                  >
                    {event.isBlocked ? 'Deblochează' : 'Blochează'}
                  </button>
                </div>

                {/* ── Expandable detail panel ── */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    transition: 'grid-template-rows .25s ease',
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ borderTop: `1px solid ${c.border}` }}>

                      {/* Two-column detail sections */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0" style={{ borderBottom: `1px solid ${c.border}` }}>

                        {/* Organiser section */}
                        <div className="px-5 py-4" style={{ borderRight: `1px solid ${c.border}` }}>
                          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textSoft }}>Organizator</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ color: c.textSoft, flexShrink: 0 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-sm font-medium" style={{ color: c.text }}>
                                {event.organiserName || <span style={{ color: c.textSoft }}>—</span>}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ color: c.textSoft, flexShrink: 0 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm" style={{ color: c.textMid }}>
                                {event.organiserEmail || <span style={{ color: c.textSoft }}>—</span>}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stripe section */}
                        <div className="px-5 py-4">
                          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: c.textSoft }}>Stripe Connect</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: stripeBg, color: stripeColor }}>
                                {stripeStatus === 'complet' ? '✓ Onboarding complet' : stripeStatus === 'în curs' ? '⏳ Onboarding în curs' : '— Neconfigurat'}
                              </span>
                            </div>
                            {event.stripeConnectAccountId && (
                              <div className="flex items-center gap-2">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ color: c.textSoft, flexShrink: 0 }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                <span className="text-xs font-mono" style={{ color: c.textSoft }}>{event.stripeConnectAccountId}</span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Stats + metadata row */}
                      <div className="px-5 py-4 flex flex-wrap gap-x-8 gap-y-3">
                        <MobileStatRow label="Colectat" value={`${(event.totalRaised ?? 0).toLocaleString('ro-RO')} RON`} color={c.success} />
                        <MobileStatRow label="Transferat" value={`${Math.max(0, (event.totalRaised ?? 0) - (event.totalTips ?? 0)).toLocaleString('ro-RO')} RON`} color={c.accent} />
                        <MobileStatRow label="Comision" value={`${(event.totalTips ?? 0).toLocaleString('ro-RO')} RON`} color={c.warning} />
                        <MobileStatRow label="Target" value={event.goalAmount ? `${event.goalAmount.toLocaleString('ro-RO')} RON` : '—'} />
                        <MobileStatRow label="Expiră" value={event.expiresAt ? new Date(event.expiresAt).toLocaleDateString('ro-RO') : '—'} />
                        {event.blockInfo?.reason && (
                          <MobileStatRow label="Motiv blocare" value={event.blockInfo.reason} color={c.danger} />
                        )}
                        {event.blockInfo?.blockedBy && (
                          <MobileStatRow label="Blocat de" value={event.blockInfo.blockedBy} />
                        )}
                      </div>

                      {/* Donations log button */}
                      <div className="px-5 pb-4 pt-1" style={{ borderTop: `1px solid ${c.border}` }}>
                        <button
                          onClick={() => setDonationsModal({ eventId: event.id, eventName: event.name })}
                          className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg transition-colors mt-3"
                          style={{ backgroundColor: c.badge, color: c.accent, border: `1px solid ${c.accent}20` }}
                        >
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Vezi donații
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Totals footer */}
      {filtered.length > 0 && (
        <div className="rounded-xl px-5 py-4 flex flex-wrap gap-x-8 gap-y-2 items-center" style={{ backgroundColor: c.surface, border: `2px solid ${c.borderStrong}` }}>
          <span className="text-sm font-semibold" style={{ color: c.textMid }}>Total ({filtered.length} pagini)</span>
          <MobileStatRow label="Donații colectate" value={`${totalDonations.toLocaleString('ro-RO')} RON`} color={c.success} />
          <MobileStatRow label="Transferat organizatori" value={`${Math.max(0, totalDonations - totalCommission).toLocaleString('ro-RO')} RON`} color={c.accent} />
          <MobileStatRow label="Comision platformă" value={`${totalCommission.toLocaleString('ro-RO')} RON`} color={c.warning} />
          {filtered.length < events.length && (
            <span className="text-xs ml-auto" style={{ color: c.textSoft }}>Total platformă: {allTimeCommission.toLocaleString('ro-RO')} RON</span>
          )}
        </div>
      )}

      {/* Donations log modal */}
      {donationsModal && (
        <DonationsModal
          eventId={donationsModal.eventId}
          eventName={donationsModal.eventName}
          onClose={() => setDonationsModal(null)}
        />
      )}
    </div>
  )
}

// ─── DonationsModal ───────────────────────────────────────────────────────────

function DonationsModal({ eventId, eventName, onClose }: {
  eventId: string
  eventName: string
  onClose: () => void
}) {
  const [donations, setDonations] = useState<AdminDonation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch(`/api/admin/events/${eventId}/donations`)
        if (!res.ok) throw new Error('Eroare la încărcare.')
        const json = await res.json() as { donations: AdminDonation[] }
        setDonations(json.donations)
      } catch {
        setError('Nu s-au putut încărca donațiile.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [eventId])

  function exportCSV() {
    const rows = [
      ['Data', 'Nume', 'Suma (RON)', 'Comision (RON)', 'Mesaj', 'Anonim', 'Status'],
      ...donations.map(d => [
        new Date(d.createdAt).toLocaleString('ro-RO'),
        d.isAnonymous ? 'Anonim' : (d.displayName ?? '—'),
        d.amount.toFixed(2),
        d.tipAmount.toFixed(2),
        d.message ?? '',
        d.isAnonymous ? 'Da' : 'Nu',
        d.status,
      ]),
    ]
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donatii-${eventName.replace(/\s+/g, '-').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportExcel() {
    // Build a minimal XLSX-compatible XML workbook (SpreadsheetML) — no library needed
    const headers = ['Data', 'Nume', 'Suma (RON)', 'Comision (RON)', 'Mesaj', 'Anonim', 'Status']
    const rows = donations.map(d => [
      new Date(d.createdAt).toLocaleString('ro-RO'),
      d.isAnonymous ? 'Anonim' : (d.displayName ?? '—'),
      d.amount.toFixed(2),
      d.tipAmount.toFixed(2),
      d.message ?? '',
      d.isAnonymous ? 'Da' : 'Nu',
      d.status,
    ])

    const cell = (v: string) => `<Cell><Data ss:Type="String">${v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>`
    const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Donatii">
  <Table>
   <Row>${headers.map(cell).join('')}</Row>
   ${rows.map(r => `<Row>${r.map(cell).join('')}</Row>`).join('\n   ')}
  </Table>
 </Worksheet>
</Workbook>`
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donatii-${eventName.replace(/\s+/g, '-').toLowerCase()}.xls`
    a.click()
    URL.revokeObjectURL(url)
  }

  const total = donations.filter(d => d.status === 'confirmed').reduce((s, d) => s + d.amount, 0)
  const totalTips = donations.filter(d => d.status === 'confirmed').reduce((s, d) => s + d.tipAmount, 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full flex flex-col rounded-2xl shadow-2xl"
        style={{
          backgroundColor: c.surface,
          border: `1px solid ${c.border}`,
          maxWidth: '780px',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: c.text }}>Donații — {eventName}</h2>
            <p className="text-xs mt-0.5" style={{ color: c.textSoft }}>
              {donations.length} {donations.length === 1 ? 'donație' : 'donații'}
              {donations.length > 0 && (
                <> · Total confirmat: <span style={{ color: c.success, fontWeight: 600 }}>{total.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON</span>
                  {' '}· Comision: <span style={{ color: c.warning, fontWeight: 600 }}>{totalTips.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {donations.length > 0 && (
              <>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: c.badge, color: c.accent, border: `1px solid ${c.accent}25` }}
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  CSV
                </button>
                <button
                  onClick={exportExcel}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', border: '1px solid #2E7D3225' }}
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Excel
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg"
              style={{ color: c.textSoft }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = c.surfaceHover)}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 rounded-full animate-pulse" style={{ backgroundColor: c.accent }} />
              <span className="ml-2 text-sm" style={{ color: c.textSoft }}>Se încarcă...</span>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: c.danger }}>{error}</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium" style={{ color: c.textMid }}>Nicio donație înregistrată.</p>
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ backgroundColor: c.bg, borderBottom: `1px solid ${c.border}` }}>
                  {['Data', 'Donator', 'Sumă', 'Comision', 'Status', 'Mesaj'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: c.textSoft }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {donations.map((d, i) => (
                  <tr
                    key={d.id}
                    style={{
                      backgroundColor: i % 2 === 0 ? c.surface : c.bg,
                      borderBottom: `1px solid ${c.border}`,
                    }}
                  >
                    <td className="px-4 py-2.5 text-xs whitespace-nowrap" style={{ color: c.textSoft }}>
                      {new Date(d.createdAt).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: c.text }}>
                      <span className="font-medium">{d.isAnonymous ? 'Anonim' : (d.displayName ?? '—')}</span>
                      {d.isAnonymous && (
                        <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: c.bg, color: c.textSoft }}>anonim</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-semibold tabular-nums" style={{ color: c.success }}>
                      {d.amount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-xs" style={{ color: d.tipAmount > 0 ? c.warning : c.textSoft }}>
                      {d.tipAmount > 0 ? `${d.tipAmount.toFixed(2)} RON` : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={
                          d.status === 'confirmed' ? { backgroundColor: c.successBg, color: c.success } :
                          d.status === 'refunded'  ? { backgroundColor: c.dangerBg,  color: c.danger  } :
                                                     { backgroundColor: c.warningBg, color: c.warning }
                        }
                      >
                        {d.status === 'confirmed' ? 'confirmat' : d.status === 'refunded' ? 'returnat' : 'în așteptare'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs max-w-[180px] truncate" style={{ color: c.textMid }} title={d.message ?? ''}>
                      {d.message || <span style={{ color: c.textSoft }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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

function EventStatusBadge({ event }: { event: AdminEvent }) {
  const isExpired = !!event.expiresAt && new Date(event.expiresAt) < new Date()
  // Deleted takes priority over everything — a deleted event is never shown as active
  if (event.isDeleted)               return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FFF7ED', color: '#C2410C' }}>Șters</span>
  if (event.isBlocked)               return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: c.dangerBg, color: c.danger }}>Blocat</span>
  if (isExpired)                     return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: c.warningBg, color: c.warning }}>Expirat</span>
  if (event.isActive)                return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: c.successBg, color: c.success }}>Activ</span>
  return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}>Inactiv</span>
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
