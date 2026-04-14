'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import QRCode from 'qrcode'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/db/supabase'
import { Event, Payout } from '@/types'

interface DashboardEvent extends Event {
  totalRaised: number
  payouts: Payout[]
}

const EVENT_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  inmormantare: { label: 'Înmormântare', emoji: '🕯️' },
  nunta: { label: 'Nuntă', emoji: '💍' },
  bebe: { label: 'Bebe', emoji: '👶' },
  sanatate: { label: 'Sănătate', emoji: '🌿' },
  altele: { label: 'Altele', emoji: '🌟' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [events, setEvents] = useState<DashboardEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [payoutLoading, setPayoutLoading] = useState<string | null>(null)
  const [payoutAmounts, setPayoutAmounts] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const [deletingFor, setDeletingFor] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  async function load() {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    setUserName(session.user.email?.split('@')[0] ?? 'tu')

    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .eq('organiser_id', session.user.id)
      .order('created_at', { ascending: false })

    if (!eventsData) { setLoading(false); return }

    const enriched: DashboardEvent[] = await Promise.all(
      eventsData.map(async (row) => {
        const eventId = row.id as string
        const [donationsRes, payoutsRes] = await Promise.all([
          supabase.from('donations').select('amount').eq('event_id', eventId).eq('status', 'confirmed'),
          fetch(`/api/payouts?eventId=${eventId}`, { headers: { Authorization: `Bearer ${session.access_token}` } })
            .then((r) => r.json()).then((d) => (d.payouts ?? []) as Payout[]).catch(() => [] as Payout[]),
        ])
        const totalRaised = (donationsRes.data ?? []).reduce((sum, d) => sum + (d.amount as number), 0)
        return {
          id: eventId,
          slug: row.slug as string,
          eventType: row.event_type as string,
          name: row.name as string,
          description: row.description as string | undefined,
          coverImageUrl: row.cover_image_url as string | undefined,
          goalAmount: row.goal_amount as number | undefined,
          organiserId: row.organiser_id as string,
          organiserIban: row.organiser_iban as string,
          isActive: row.is_active as boolean,
          expiresAt: row.expires_at as string | undefined,
          createdAt: row.created_at as string,
          totalRaised,
          payouts: payoutsRes,
        }
      })
    )
    setEvents(enriched)
    setLoading(false)
  }

  useEffect(() => { load() }, [router]) // eslint-disable-line react-hooks/exhaustive-deps

  async function requestPayout(event: DashboardEvent) {
    setPayoutLoading(event.id)
    setError(null)
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const amount = parseFloat(payoutAmounts[event.id] ?? '')
    if (isNaN(amount) || amount < 50) {
      setError('Suma minimă pentru retragere este 50 RON.')
      setPayoutLoading(null)
      return
    }
    const res = await fetch('/api/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ eventId: event.id, amount }),
    })
    const data = await res.json() as { error?: string }
    if (!res.ok) { setError(data.error ?? 'Eroare la retragere.') }
    else { load() }
    setPayoutLoading(null)
  }

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
            <StatCard label="Donatori" value="—" />
          </div>
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
              payoutAmount={payoutAmounts[event.id] ?? ''}
              onPayoutAmountChange={(v) => setPayoutAmounts((prev) => ({ ...prev, [event.id]: v }))}
              onRequestPayout={() => requestPayout(event)}
              payoutLoading={payoutLoading === event.id}
              uploadingCover={uploadingFor === event.id}
              onUploadCover={(file) => uploadCover(event.id, file)}
              onEventUpdated={load}
              confirmingDelete={confirmDeleteId === event.id}
              deletingEvent={deletingFor === event.id}
              onDeleteRequest={() => setConfirmDeleteId(event.id)}
              onDeleteConfirm={() => handleDeleteEvent(event.id)}
              onDeleteCancel={() => setConfirmDeleteId(null)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: highlight ? '#2D2016' : '#FFFDFB',
        border: highlight ? 'none' : '1px solid #EDE0D0',
      }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: highlight ? '#C4956A' : '#9A7B60' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: highlight ? '#FDFAF7' : '#2D2016' }}>{value}</p>
    </div>
  )
}

// ─── Event card ────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: DashboardEvent
  payoutAmount: string
  onPayoutAmountChange: (v: string) => void
  onRequestPayout: () => void
  payoutLoading: boolean
  uploadingCover: boolean
  onUploadCover: (file: File) => void
  onEventUpdated: () => void
  confirmingDelete: boolean
  deletingEvent: boolean
  onDeleteRequest: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

function EventCard({
  event, payoutAmount, onPayoutAmountChange, onRequestPayout,
  payoutLoading, uploadingCover, onUploadCover, onEventUpdated,
  confirmingDelete, deletingEvent, onDeleteRequest, onDeleteConfirm, onDeleteCancel,
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
  const meta = EVENT_TYPE_LABELS[event.eventType] ?? { label: event.eventType, emoji: '🌟' }
  const pendingPayouts = event.payouts.filter((p) => p.status === 'pending' || p.status === 'processing')
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
      setEditing(false)
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
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
              onClick={() => { setEditing(!editing); setEditError('') }}
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
            className="rounded-2xl p-4 flex items-center justify-between gap-4"
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
            className="rounded-2xl p-5 space-y-4"
            style={{ backgroundColor: '#F5EDE3', border: '1px solid #E0D0C0' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9A7B60' }}>
              Editează pagina
            </p>

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

            <div className="flex gap-2 pt-1">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity"
                style={{ backgroundColor: '#C4956A', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Se salvează...' : 'Salvează modificările'}
              </button>
              <button
                onClick={() => { setEditing(false); setEditError('') }}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
                style={{ border: '1px solid #E0D0C0', color: '#7A6652' }}
              >
                Anulează
              </button>
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

        {/* Payout section */}
        <div className="rounded-xl p-4 space-y-3" style={{ border: '1px solid #EDE0D0' }}>
          <p className="text-sm font-semibold" style={{ color: '#2D2016' }}>Retrage fonduri</p>

          {event.totalRaised < 50 ? (
            <p className="text-xs" style={{ color: '#9A7B60' }}>
              Suma minimă pentru retragere este 50 RON. Mai ai nevoie de {50 - event.totalRaised} RON.
            </p>
          ) : pendingPayouts.length > 0 ? (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#FFFBEB', color: '#92400E' }}>
              O retragere este în curs de procesare.
            </p>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min={50}
                  max={event.totalRaised}
                  placeholder="Sumă RON"
                  value={payoutAmount}
                  onChange={(e) => onPayoutAmountChange(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ border: '1px solid #E0D0C0', color: '#2D2016', backgroundColor: '#FDFAF7' }}
                  onFocus={(e) => (e.target.style.borderColor = '#C4956A')}
                  onBlur={(e) => (e.target.style.borderColor = '#E0D0C0')}
                />
              </div>
              <button
                onClick={onRequestPayout}
                disabled={payoutLoading}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity"
                style={{ backgroundColor: '#C4956A', opacity: payoutLoading ? 0.6 : 1 }}
              >
                {payoutLoading ? '...' : 'Retrage'}
              </button>
            </div>
          )}

          {/* Payout history */}
          {event.payouts.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-medium" style={{ color: '#9A7B60' }}>Istoric</p>
              {event.payouts.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs" style={{ color: '#7A6652' }}>
                  <span>{new Date(p.requestedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="font-medium">{p.amount} RON</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={
                      p.status === 'completed'
                        ? { backgroundColor: '#F0FFF4', color: '#166534' }
                        : p.status === 'failed'
                        ? { backgroundColor: '#FEF2F2', color: '#B91C1C' }
                        : { backgroundColor: '#FFFBEB', color: '#92400E' }
                    }
                  >
                    {p.status === 'completed' ? 'Finalizat' : p.status === 'failed' ? 'Eșuat' : 'În curs'}
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

function QrIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/>
      <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
    </svg>
  )
}
