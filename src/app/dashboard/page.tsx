'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import QRCode from 'qrcode'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/db/supabase'
import { Event, EventItem, Payout } from '@/types'
import { IconPicker } from '@/components/ui/IconPicker'
import { SupportModal } from '@/components/SupportModal/SupportModal'

interface DonorEntry {
  displayName: string | null
  isAnonymous: boolean
  amount: number
  showAmount: boolean
  createdAt: string
  eventId: string
  eventName: string
}

interface DashboardEvent extends Event {
  totalRaised: number
  payouts: Payout[]
  donors: DonorEntry[]
}

const EVENT_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  inmormantare: { label: 'Înmormântare', emoji: '🕯️' },
  nunta: { label: 'Nuntă', emoji: '💍' },
  bebe: { label: 'Bebe', emoji: '🍼' },
  sanatate: { label: 'Sănătate', emoji: '🌿' },
  altele: { label: 'Altele', emoji: '🌟' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [events, setEvents] = useState<DashboardEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const [deletingFor, setDeletingFor] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [togglingFor, setTogglingFor] = useState<string | null>(null)
  const [donorsModal, setDonorsModal] = useState(false)

  async function load() {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    setUserName(session.user.email?.split('@')[0] ?? 'tu')
    setAccessToken(session.access_token)

    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .eq('organiser_id', session.user.id)
      .neq('is_deleted', true)
      .order('created_at', { ascending: false })

    if (!eventsData) { setLoading(false); return }

    const enriched: DashboardEvent[] = await Promise.all(
      eventsData.map(async (row) => {
        const eventId = row.id as string
        const eventName = row.name as string
        const [donationsRes, donorsRes, payoutsRes] = await Promise.all([
          supabase.from('donations').select('amount').eq('event_id', eventId).in('status', ['confirmed', 'pending']),
          supabase.from('donations').select('display_name, is_anonymous, amount, show_amount, created_at').eq('event_id', eventId).eq('status', 'confirmed').order('created_at', { ascending: false }),
          fetch(`/api/payouts?eventId=${eventId}`, { headers: { Authorization: `Bearer ${session.access_token}` } })
            .then((r) => r.json()).then((d) => (d.payouts ?? []) as Payout[]).catch(() => [] as Payout[]),
        ])
        const totalRaised = (donationsRes.data ?? []).reduce((sum, d) => sum + (d.amount as number), 0)
        const donors: DonorEntry[] = (donorsRes.data ?? []).map((d) => ({
          displayName: d.display_name as string | null,
          isAnonymous: (d.is_anonymous as boolean) ?? false,
          amount: d.amount as number,
          showAmount: (d.show_amount as boolean) ?? true,
          createdAt: d.created_at as string,
          eventId,
          eventName,
        }))
        return {
          id: eventId,
          slug: row.slug as string,
          eventType: row.event_type as string,
          name: eventName,
          description: row.description as string | undefined,
          coverImageUrl: row.cover_image_url as string | undefined,
          goalAmount: row.goal_amount as number | undefined,
          organiserId: row.organiser_id as string,
          stripeConnectAccountId: row.stripe_connect_account_id as string | undefined,
          connectOnboardingComplete: (row.connect_onboarding_complete as boolean) ?? false,
          isActive: row.is_active as boolean,
          expiresAt: row.expires_at as string | undefined,
          createdAt: row.created_at as string,
          totalRaised,
          payouts: payoutsRes,
          donors,
        }
      })
    )
    setEvents(enriched)
    setLoading(false)
  }

  useEffect(() => { load() }, [router]) // eslint-disable-line react-hooks/exhaustive-deps

  async function uploadCover(eventId: string, file: File) {
    setUploadingFor(eventId)
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`/api/events/${eventId}/cover`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: form,
    })
    if (res.ok) { load() }
    else { const d = await res.json() as { error: string }; setError(d.error) }
    setUploadingFor(null)
  }

  async function handleDeleteEvent(eventId: string) {
    setDeletingFor(eventId)
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
    } else {
      const d = await res.json() as { error: string }
      setError(d.error ?? 'Eroare la ștergere.')
    }
    setDeletingFor(null)
    setConfirmDeleteId(null)
  }

  async function handleToggleActive(eventId: string, currentlyActive: boolean) {
    setTogglingFor(eventId)
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch(`/api/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ isActive: !currentlyActive }),
    })
    if (res.ok) {
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, isActive: !currentlyActive } : e))
    } else {
      const d = await res.json() as { error: string }
      setError(d.error ?? 'Eroare la actualizare.')
    }
    setTogglingFor(null)
  }

  async function handleLogout() {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFAF7' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: '#E0D0C0', borderTopColor: '#C4956A' }} />
      </div>
    )
  }

  const totalAcrossAll = events.reduce((sum, e) => sum + e.totalRaised, 0)
  const totalDonors = events.reduce((sum, e) => sum + e.donors.length, 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid #EDE0D0', backgroundColor: '#FFFDFB' }}>
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-base font-bold tracking-tight" style={{ color: '#2D2016' }}>
            pentru<span style={{ color: '#C4956A' }}>momente</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/create"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#C4956A' }}
            >
              + Pagină nouă
            </Link>
            <button onClick={handleLogout} className="text-sm transition-colors" style={{ color: '#9A7B60' }}>
              Ieși
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#2D2016' }}>
            Bună, {userName} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: '#9A7B60' }}>
            Aici îți găsești paginile de donații și poți retrage fondurile strânse.
          </p>
        </div>

        {/* Stats row */}
        {events.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Pagini active" value={String(events.filter(e => e.isActive).length)} />
            <StatCard label="Total strâns" value={`${totalAcrossAll} RON`} highlight />
            <StatCard
              label="Donatori"
              value={totalDonors > 0 ? String(totalDonors) : '0'}
              clickable={totalDonors > 0}
              onClick={() => setDonorsModal(true)}
            />
          </div>
        )}

        {donorsModal && (
          <DonorsModal events={events} onClose={() => setDonorsModal(false)} />
        )}

        {error && (
          <p className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
            {error}
          </p>
        )}

        {/* Empty state */}
        {events.length === 0 && (
          <div
            className="rounded-2xl p-12 text-center space-y-4"
            style={{ backgroundColor: '#FFFDFB', border: '2px dashed #EDE0D0' }}
          >
            <p className="text-4xl">🌱</p>
            <p className="font-semibold" style={{ color: '#2D2016' }}>Nicio pagină încă</p>
            <p className="text-sm" style={{ color: '#9A7B60' }}>Creează prima ta pagină de donații în 3 minute.</p>
            <Link
              href="/create"
              className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#C4956A' }}
            >
              Creează o pagină
            </Link>
          </div>
        )}

        {/* Event cards */}
        <div className="space-y-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              accessToken={accessToken}
              uploadingCover={uploadingFor === event.id}
              onUploadCover={(file) => uploadCover(event.id, file)}
              onEventUpdated={load}
              confirmingDelete={confirmDeleteId === event.id}
              deletingEvent={deletingFor === event.id}
              onDeleteRequest={() => setConfirmDeleteId(event.id)}
              onDeleteConfirm={() => handleDeleteEvent(event.id)}
              onDeleteCancel={() => setConfirmDeleteId(null)}
              togglingActive={togglingFor === event.id}
              onToggleActive={() => handleToggleActive(event.id, event.isActive)}
            />
          ))}
        </div>
      </main>

      {/* Support floating button + modal */}
      {accessToken && <SupportModal accessToken={accessToken} />}
    </div>
  )
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, highlight, clickable, onClick }: {
  label: string; value: string; highlight?: boolean; clickable?: boolean; onClick?: () => void
}) {
  const inner = (
    <>
      <p className="text-xs font-medium mb-1" style={{ color: highlight ? '#C4956A' : '#9A7B60' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: highlight ? '#FDFAF7' : '#2D2016' }}>{value}</p>
      {clickable && (
        <p className="text-xs mt-1" style={{ color: '#C4956A' }}>Vezi detalii →</p>
      )}
    </>
  )
  const style = {
    backgroundColor: highlight ? '#2D2016' : '#FFFDFB',
    border: highlight ? 'none' : '1px solid #EDE0D0',
  }
  if (clickable && onClick) {
    return (
      <button
        onClick={onClick}
        className="rounded-2xl p-5 text-left w-full transition-opacity hover:opacity-80"
        style={{ ...style, cursor: 'pointer' }}
      >
        {inner}
      </button>
    )
  }
  return (
    <div className="rounded-2xl p-5" style={style}>
      {inner}
    </div>
  )
}

// ─── Event card ────────────────────────────────────────────────────────────────

interface LocalItem extends EventItem {
  dirty?: boolean
}

interface EventCardProps {
  event: DashboardEvent
  accessToken: string
  uploadingCover: boolean
  onUploadCover: (file: File) => void
  onEventUpdated: () => void
  confirmingDelete: boolean
  deletingEvent: boolean
  onDeleteRequest: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
  togglingActive: boolean
  onToggleActive: () => void
}

function EventCard({
  event, accessToken, uploadingCover, onUploadCover, onEventUpdated,
  confirmingDelete, deletingEvent, onDeleteRequest, onDeleteConfirm, onDeleteCancel,
  togglingActive, onToggleActive,
}: EventCardProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [coverUrl, setCoverUrl] = useState(event.coverImageUrl ?? null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(event.name)
  const [editDescription, setEditDescription] = useState(event.description ?? '')
  const [editGoal, setEditGoal] = useState(event.goalAmount ? String(event.goalAmount) : '')
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editExpiry, setEditExpiry] = useState(
    event.expiresAt ? new Date(event.expiresAt).toISOString().split('T')[0] : ''
  )

  // ── Items state (loaded when edit panel opens) ──────────────────────────────
  const [items, setItems] = useState<LocalItem[]>([])
  const [itemsLoaded, setItemsLoaded] = useState(false)
  const [itemSaving, setItemSaving] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newEmoji, setNewEmoji] = useState('')
  const [newCustom, setNewCustom] = useState(false)
  const [newItemError, setNewItemError] = useState('')
  const [creatingCustomItem, setCreatingCustomItem] = useState(false)

  async function loadItems() {
    if (itemsLoaded) return
    const res = await fetch(`/api/events/${event.id}/items`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (res.ok) {
      const data = (await res.json()) as { items: EventItem[] }
      setItems(data.items)
      setItemsLoaded(true)
    }
  }

  function openEdit() {
    setEditing(true)
    loadItems()
  }

  function cancelEdit() {
    setEditing(false)
    setEditError('')
    setAddingNew(false)
    setNewItemError('')
  }

  async function saveItemField(itemId: string, patch: Record<string, unknown>) {
    setItemSaving(itemId)
    await fetch(`/api/events/${event.id}/items?itemId=${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(patch),
    })
    setItemSaving(null)
  }

  function updateItemLocal(itemId: string, patch: Partial<LocalItem>) {
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, ...patch } : i))
  }

  async function deleteItem(itemId: string) {
    await fetch(`/api/events/${event.id}/items?itemId=${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  async function addItem() {
    if (!newName.trim()) return
    setNewItemError('')
    const res = await fetch(`/api/events/${event.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        name: newName.trim(),
        targetAmount: newCustom ? 0 : (parseFloat(newAmount) || 0),
        emoji: newEmoji || undefined,
        isCustomAmount: newCustom,
        sortOrder: items.length,
      }),
    })
    if (res.ok) {
      const data = (await res.json()) as { item: EventItem }
      setItems((prev) => [...prev, data.item])
      setNewName(''); setNewAmount(''); setNewEmoji(''); setNewCustom(false); setAddingNew(false)
    } else {
      const d = (await res.json()) as { error: string }
      setNewItemError(d.error ?? 'Eroare la adăugare.')
    }
  }

  async function addCustomAmountItem() {
    setCreatingCustomItem(true)
    const res = await fetch(`/api/events/${event.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ name: 'Sumă personalizată', targetAmount: 0, emoji: 'heart', isCustomAmount: true, sortOrder: items.length }),
    })
    if (res.ok) {
      const data = (await res.json()) as { item: EventItem }
      setItems((prev) => [...prev, data.item])
    }
    setCreatingCustomItem(false)
  }

  const hasCustomItem = items.some((i) => i.isCustomAmount)
  const meta = EVENT_TYPE_LABELS[event.eventType] ?? { label: event.eventType, emoji: '🌟' }
  const goalPercent = event.goalAmount ? Math.min(100, Math.round((event.totalRaised / event.goalAmount) * 100)) : null
  const eventUrl = `/${event.eventType}/${event.slug}`
  const isExpired = event.expiresAt ? new Date(event.expiresAt) < new Date() : false

  function handleUpload(file: File) {
    onUploadCover(file)
    const localPreview = URL.createObjectURL(file)
    setCoverUrl(localPreview)
  }

  async function saveEdit() {
    setSaving(true)
    setEditError('')
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch(`/api/events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        name: editName,
        description: editDescription,
        goalAmount: editGoal ? parseFloat(editGoal) : null,
        expiresAt: editExpiry ? new Date(editExpiry).toISOString() : null,
      }),
    })

    if (res.ok) {
      cancelEdit()
      onEventUpdated()
    } else {
      const d = await res.json() as { error: string }
      setEditError(d.error ?? 'Eroare la salvare.')
    }
    setSaving(false)
  }

  return (
    <article
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
    >
      {/* Cover image area */}
      <div
        className="relative w-full group"
        style={{ height: coverUrl ? 200 : 100, backgroundColor: '#F5EDE3' }}
      >
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt={event.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <span className="text-2xl">{meta.emoji}</span>
            <p className="text-xs font-medium" style={{ color: '#B09070' }}>Adaugă o imagine de copertă</p>
          </div>
        )}

        {/* Hover overlay — button sits on top of everything including the Image */}
        <button
          type="button"
          className="absolute inset-0 w-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          style={{ backgroundColor: 'rgba(45,32,22,0.5)' }}
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.value = ''
              fileRef.current.click()
            }
          }}
        >
          {uploadingCover ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <span className="text-white text-sm font-medium">
              {coverUrl ? '✎ Schimbă imaginea' : '+ Adaugă imagine'}
            </span>
          )}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
      />

      {/* Card body */}
      <div className="p-6 space-y-5">

        {/* Title row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-base">{meta.emoji}</span>
              <span className="text-xs font-medium" style={{ color: '#9A7B60' }}>{meta.label}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={
                  isExpired
                    ? { backgroundColor: '#FEF2F2', color: '#B91C1C' }
                    : event.isActive
                    ? { backgroundColor: '#F0FFF4', color: '#166534' }
                    : { backgroundColor: '#F5F5F5', color: '#6B7280' }
                }
              >
                {isExpired ? 'Expirat' : event.isActive ? 'Activ' : 'Inactiv'}
              </span>
              {event.expiresAt && !isExpired && (
                <span className="text-xs" style={{ color: '#B09070' }}>
                  Expiră {new Date(event.expiresAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold" style={{ color: '#2D2016' }}>{event.name}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={editing ? cancelEdit : openEdit}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ border: '1px solid #EDE0D0', color: editing ? '#C4956A' : '#7A6652' }}
            >
              {editing ? 'Anulează' : '✎ Editează'}
            </button>
            <Link
              href={eventUrl}
              target="_blank"
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ border: '1px solid #EDE0D0', color: '#7A6652' }}
            >
              Vezi ↗
            </Link>
            {event.connectOnboardingComplete && !isExpired && (
              <button
                onClick={onToggleActive}
                disabled={togglingActive}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                style={
                  event.isActive
                    ? { border: '1px solid #FCD34D', color: '#92400E', backgroundColor: '#FFFBEB', opacity: togglingActive ? 0.6 : 1 }
                    : { border: '1px solid #BBF7D0', color: '#166534', backgroundColor: '#F0FFF4', opacity: togglingActive ? 0.6 : 1 }
                }
                title={event.isActive ? 'Închide pagina' : 'Redeschide pagina'}
              >
                {togglingActive ? '...' : event.isActive ? '⏸ Închide' : '▶ Deschide'}
              </button>
            )}
            <button
              onClick={onDeleteRequest}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ border: '1px solid #FECACA', color: '#DC2626' }}
            >
              🗑
            </button>
          </div>
        </div>

        {/* Delete confirmation */}
        {confirmingDelete && (
          <div
            className="rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
          >
            <p className="text-sm font-medium" style={{ color: '#991B1B' }}>
              Ești sigur? Pagina și toate donațiile asociate vor fi șterse permanent.
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={onDeleteCancel}
                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ border: '1px solid #FECACA', color: '#7A6652', backgroundColor: '#fff' }}
              >
                Anulează
              </button>
              <button
                onClick={onDeleteConfirm}
                disabled={deletingEvent}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white transition-opacity"
                style={{ backgroundColor: '#DC2626', opacity: deletingEvent ? 0.6 : 1 }}
              >
                {deletingEvent ? 'Se șterge...' : 'Șterge pagina'}
              </button>
            </div>
          </div>
        )}

        {/* Inline edit panel */}
        {editing && (
          <div
            className="rounded-2xl p-5 space-y-5"
            style={{ backgroundColor: '#F5EDE3', border: '1px solid #E0D0C0' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9A7B60' }}>
              Editează pagina
            </p>

            {/* ── Page details ── */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A6652' }}>Nume</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FFFDFB' }}
                onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
                onBlur={(e) => (e.target.style.borderColor = '#E0D0C0')}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A6652' }}>Descriere</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-y"
                style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FFFDFB' }}
                onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
                onBlur={(e) => (e.target.style.borderColor = '#E0D0C0')}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A6652' }}>
                Obiectiv (RON) <span style={{ color: '#B09070' }}>— opțional</span>
              </label>
              <input
                type="number"
                value={editGoal}
                onChange={(e) => setEditGoal(e.target.value)}
                placeholder="ex: 5000"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FFFDFB' }}
                onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
                onBlur={(e) => (e.target.style.borderColor = '#E0D0C0')}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A6652' }}>
                Data de expirare <span style={{ color: '#B09070' }}>— opțional</span>
              </label>
              <input
                type="date"
                value={editExpiry}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setEditExpiry(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ border: '1px solid #E0D0C0', color: editExpiry ? '#2D2016' : '#B09070', backgroundColor: '#FFFDFB' }}
                onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
                onBlur={(e) => (e.target.style.borderColor = '#E0D0C0')}
              />
              {editExpiry && (
                <button
                  type="button"
                  onClick={() => setEditExpiry('')}
                  className="mt-1 text-xs"
                  style={{ color: '#9A7B60' }}
                >
                  Elimină data de expirare
                </button>
              )}
            </div>

            {editError && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
                {editError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity"
                style={{ backgroundColor: '#C4956A', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Se salvează...' : 'Salvează detalii'}
              </button>
              <button
                onClick={cancelEdit}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
                style={{ border: '1px solid #E0D0C0', color: '#7A6652' }}
              >
                Anulează
              </button>
            </div>

            {/* ── Items editor ── */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9A7B60' }}>
                Articole &amp; sume
              </p>

              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl p-3 space-y-2"
                    style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
                  >
                    <div className="flex items-center gap-2">
                      <IconPicker
                        value={item.emoji}
                        onChange={(id) => {
                          updateItemLocal(item.id, { emoji: id || undefined })
                          saveItemField(item.id, { emoji: id || null })
                        }}
                      />
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItemLocal(item.id, { name: e.target.value })}
                        onBlur={(e) => { saveItemField(item.id, { name: e.target.value }); e.target.style.borderColor = '#E0D0C0' }}
                        className="flex-1 rounded-lg px-2.5 py-1.5 text-sm outline-none"
                        style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FDFAF7' }}
                        onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
                      />
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        className="shrink-0 rounded-lg px-2 py-1.5 text-xs transition-colors"
                        style={{ border: '1px solid #FECACA', color: '#DC2626' }}
                      >
                        🗑
                      </button>
                    </div>

                    <div className="flex items-center gap-3 pl-12">
                      {!item.isCustomAmount && (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="number"
                            min={0}
                            value={item.targetAmount === 0 ? '' : item.targetAmount}
                            onChange={(e) => updateItemLocal(item.id, { targetAmount: parseFloat(e.target.value) || 0 })}
                            onBlur={(e) => saveItemField(item.id, { targetAmount: parseFloat(e.target.value) || 0 })}
                            onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
                            placeholder="Sumă (opțional)"
                            className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
                            style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FDFAF7' }}
                            onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
                          />
                          <span className="text-xs shrink-0" style={{ color: '#9A7B60' }}>Lei</span>
                        </div>
                      )}
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={item.isCustomAmount}
                          onChange={(e) => {
                            updateItemLocal(item.id, { isCustomAmount: e.target.checked })
                            saveItemField(item.id, { isCustomAmount: e.target.checked })
                          }}
                          className="h-3.5 w-3.5 rounded"
                        />
                        <span className="text-xs" style={{ color: '#7A6652' }}>Sumă liberă</span>
                      </label>
                      {itemSaving === item.id && (
                        <span className="text-xs" style={{ color: '#B09070' }}>salvare…</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add custom amount item shortcut */}
              {!hasCustomItem && (
                <button
                  type="button"
                  onClick={addCustomAmountItem}
                  disabled={creatingCustomItem}
                  className="mt-2 w-full rounded-xl py-2.5 text-xs font-medium transition-colors"
                  style={{
                    border: '1.5px dashed #C4956A',
                    color: '#C4956A',
                    backgroundColor: '#FFFBF5',
                    opacity: creatingCustomItem ? 0.6 : 1,
                  }}
                >
                  + Adaugă articol cu sumă liberă
                </button>
              )}

              {/* Add new item form */}
              {addingNew ? (
                <div
                  className="mt-2 rounded-xl p-3 space-y-2"
                  style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
                >
                  <p className="text-xs font-semibold" style={{ color: '#7A6652' }}>Articol nou</p>

                  <div className="flex items-center gap-2">
                    <IconPicker value={newEmoji} onChange={setNewEmoji} />
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Numele articolului"
                      className="flex-1 rounded-lg px-2.5 py-1.5 text-sm outline-none"
                      style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FDFAF7' }}
                      onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
                    />
                  </div>

                  {!newCustom && (
                    <div className="flex items-center gap-1.5 pl-12">
                      <input
                        type="number"
                        min={0}
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
                        placeholder="Sumă țintă (opțional)"
                        className="flex-1 rounded-lg px-2.5 py-1.5 text-sm outline-none"
                        style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FDFAF7' }}
                        onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
                      />
                      <span className="text-xs shrink-0" style={{ color: '#9A7B60' }}>Lei</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pl-12">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCustom}
                        onChange={(e) => setNewCustom(e.target.checked)}
                        className="h-3.5 w-3.5 rounded"
                      />
                      <span className="text-xs" style={{ color: '#7A6652' }}>Sumă liberă (donatorul alege)</span>
                    </label>
                  </div>

                  {newItemError && (
                    <p className="text-xs pl-12" style={{ color: '#B91C1C' }}>{newItemError}</p>
                  )}

                  <div className="flex gap-2 pl-12">
                    <button
                      type="button"
                      onClick={addItem}
                      disabled={!newName.trim()}
                      className="rounded-xl px-4 py-1.5 text-xs font-semibold text-white transition-opacity"
                      style={{ backgroundColor: '#C4956A', opacity: newName.trim() ? 1 : 0.5 }}
                    >
                      Adaugă
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddingNew(false); setNewItemError('') }}
                      className="rounded-xl px-4 py-1.5 text-xs font-medium transition-colors"
                      style={{ border: '1px solid #EDE0D0', color: '#7A6652' }}
                    >
                      Anulează
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingNew(true)}
                  className="mt-2 w-full rounded-xl py-2.5 text-xs font-medium transition-colors"
                  style={{ border: '1px solid #EDE0D0', color: '#7A6652', backgroundColor: '#FFFDFB' }}
                >
                  + Adaugă articol nou
                </button>
              )}
            </div>
          </div>
        )}

        {/* Share section */}
        <ShareSection eventUrl={eventUrl} eventName={event.name} />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ backgroundColor: '#F5EDE3' }}>
            <p className="text-xs mb-0.5" style={{ color: '#9A7B60' }}>Total strâns</p>
            <p className="text-xl font-bold" style={{ color: '#2D2016' }}>{event.totalRaised} <span className="text-sm font-medium">RON</span></p>
          </div>
          {event.goalAmount ? (
            <div className="rounded-xl p-3" style={{ backgroundColor: '#F5EDE3' }}>
              <p className="text-xs mb-0.5" style={{ color: '#9A7B60' }}>Obiectiv</p>
              <p className="text-xl font-bold" style={{ color: '#2D2016' }}>{event.goalAmount} <span className="text-sm font-medium">RON</span></p>
            </div>
          ) : (
            <div className="rounded-xl p-3" style={{ backgroundColor: '#F5EDE3' }}>
              <p className="text-xs mb-0.5" style={{ color: '#9A7B60' }}>Creat</p>
              <p className="text-sm font-semibold" style={{ color: '#2D2016' }}>
                {new Date(event.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {goalPercent !== null && (
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: '#9A7B60' }}>
              <span>{goalPercent}% din obiectiv</span>
              <span>{event.totalRaised} / {event.goalAmount} RON</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE0D0' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${goalPercent}%`, backgroundColor: '#C4956A' }}
              />
            </div>
          </div>
        )}

        {/* Stripe Connect status + payout history */}
        <div className="rounded-xl p-4 space-y-3" style={{ border: '1px solid #EDE0D0' }}>
          <p className="text-sm font-semibold" style={{ color: '#2D2016' }}>Plăți</p>

          {!event.connectOnboardingComplete ? (
            <div className="space-y-2">
              <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#FFFBEB', color: '#92400E' }}>
                Configurarea plăților nu este finalizată. Pagina nu este încă activă pentru donații.
              </p>
              <OnboardingResumeButton eventSlug={event.slug} />
            </div>
          ) : (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#F0FFF4', color: '#166534' }}>
              Stripe Connect activ — donațiile ajung automat în contul tău.
            </p>
          )}

          {/* Payout history */}
          {event.payouts.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-medium" style={{ color: '#9A7B60' }}>Istoric plăți Stripe</p>
              {event.payouts.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs" style={{ color: '#7A6652' }}>
                  <span>{new Date(p.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="font-medium">{p.amount} RON</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={
                      p.status === 'paid'
                        ? { backgroundColor: '#F0FFF4', color: '#166534' }
                        : p.status === 'failed'
                        ? { backgroundColor: '#FEF2F2', color: '#B91C1C' }
                        : { backgroundColor: '#FFFBEB', color: '#92400E' }
                    }
                  >
                    {p.status === 'paid' ? 'Plătit' : p.status === 'failed' ? 'Eșuat' : 'În curs'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </article>
  )
}

// ─── Onboarding resume button ──────────────────────────────────────────────────

function OnboardingResumeButton({ eventSlug }: { eventSlug: string }) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function resume() {
    setLoading(true)
    setErr('')
    const res = await fetch('/api/connect/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventSlug }),
    })
    const data = (await res.json()) as { onboardingUrl?: string; error?: string }
    if (!res.ok || !data.onboardingUrl) {
      setErr(data.error ?? 'Eroare la generarea linkului.')
      setLoading(false)
      return
    }
    window.location.href = data.onboardingUrl
  }

  return (
    <div>
      <button
        onClick={resume}
        disabled={loading}
        className="text-xs px-3 py-2 rounded-lg font-semibold text-white transition-opacity"
        style={{ backgroundColor: '#C4956A', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Se încarcă...' : 'Finalizează configurarea Stripe →'}
      </button>
      {err && <p className="mt-1 text-xs" style={{ color: '#B91C1C' }}>{err}</p>}
    </div>
  )
}

// ─── Share section ─────────────────────────────────────────────────────────────

function ShareSection({ eventUrl, eventName }: { eventUrl: string; eventName: string }) {
  const [copied, setCopied] = useState(false)
  const fullUrl = `https://pentrumomente.ro${eventUrl}`

  const downloadQr = useCallback(async () => {
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, fullUrl, {
      width: 512,
      margin: 2,
      color: { dark: '#2D2016', light: '#FDFAF7' },
    })
    const link = document.createElement('a')
    link.download = `qr-${eventName.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [fullUrl, eventName])

  function copyLink() {
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${eventName} — donează aici: ${fullUrl}`)}`
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`

  return (
    <div className="space-y-3">
      {/* Link row */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{ backgroundColor: '#F5EDE3' }}
      >
        <span className="text-xs truncate flex-1" style={{ color: '#7A6652' }}>
          pentrumomente.ro{eventUrl}
        </span>
        <button
          onClick={copyLink}
          className="text-xs font-semibold shrink-0 transition-colors"
          style={{ color: copied ? '#166534' : '#C4956A' }}
        >
          {copied ? '✓ Copiat' : 'Copiază'}
        </button>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <ShareButton
          onClick={() => window.open(waUrl, '_blank')}
          color="#25D366"
          icon={<WhatsAppIcon />}
          label="WhatsApp"
        />
        <ShareButton
          onClick={() => window.open(fbUrl, '_blank')}
          color="#1877F2"
          icon={<FacebookShareIcon />}
          label="Facebook"
        />
        <ShareButton
          onClick={downloadQr}
          color="#2D2016"
          icon={<QrIcon />}
          label="Cod QR"
        />
      </div>
    </div>
  )
}

function ShareButton({
  onClick, color, icon, label,
}: {
  onClick: () => void
  color: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-85"
      style={{ backgroundColor: color }}
    >
      {icon}
      {label}
    </button>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function FacebookShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

// ─── Donors modal ──────────────────────────────────────────────────────────────

function DonorsModal({ events, onClose }: { events: DashboardEvent[]; onClose: () => void }) {
  const eventsWithDonors = events.filter((e) => e.donors.length > 0)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    eventsWithDonors.length === 1 ? eventsWithDonors[0].id : null
  )

  const selectedEvent = eventsWithDonors.find((e) => e.id === selectedEventId) ?? null
  const donors = selectedEvent?.donors ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #EDE0D0' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: '#2D2016' }}>Donatori</h2>
            <p className="text-xs mt-0.5" style={{ color: '#9A7B60' }}>
              {events.reduce((s, e) => s + e.donors.length, 0)} donații confirmate
            </p>
          </div>
          <button onClick={onClose} className="text-sm px-2 py-1 transition-opacity hover:opacity-60" style={{ color: '#9A7B60' }}>✕</button>
        </div>

        {/* Page selector — shown when multiple pages have donors */}
        {eventsWithDonors.length > 1 && (
          <div className="px-6 pt-4 pb-2 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedEventId(null)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
              style={
                selectedEventId === null
                  ? { backgroundColor: '#2D2016', color: '#FDFAF7' }
                  : { border: '1px solid #EDE0D0', color: '#7A6652' }
              }
            >
              Toate ({events.reduce((s, e) => s + e.donors.length, 0)})
            </button>
            {eventsWithDonors.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelectedEventId(e.id)}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                style={
                  selectedEventId === e.id
                    ? { backgroundColor: '#C4956A', color: '#fff' }
                    : { border: '1px solid #EDE0D0', color: '#7A6652' }
                }
              >
                {e.name} ({e.donors.length})
              </button>
            ))}
          </div>
        )}

        {/* Donor list */}
        <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4 space-y-2">
          {(selectedEventId === null ? eventsWithDonors.flatMap((e) => e.donors) : donors).map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
              style={{ backgroundColor: '#F5EDE3' }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: '#2D2016' }}>
                  {d.isAnonymous ? 'Anonim' : (d.displayName || 'Anonim')}
                </p>
                {selectedEventId === null && (
                  <p className="text-xs truncate mt-0.5" style={{ color: '#B09070' }}>{d.eventName}</p>
                )}
                <p className="text-xs mt-0.5" style={{ color: '#9A7B60' }}>
                  {new Date(d.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className="text-sm font-bold shrink-0" style={{ color: '#C4956A' }}>
                {d.showAmount ? `${d.amount} RON` : '—'}
              </span>
            </div>
          ))}

          {(selectedEventId === null ? eventsWithDonors.flatMap((e) => e.donors) : donors).length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: '#9A7B60' }}>Nicio donație confirmată.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function QrIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/>
      <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
    </svg>
  )
}
