'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
}

function EventCard({
  event, payoutAmount, onPayoutAmountChange, onRequestPayout,
  payoutLoading, uploadingCover, onUploadCover,
}: EventCardProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const meta = EVENT_TYPE_LABELS[event.eventType] ?? { label: event.eventType, emoji: '🌟' }
  const pendingPayouts = event.payouts.filter((p) => p.status === 'pending' || p.status === 'processing')
  const goalPercent = event.goalAmount ? Math.min(100, Math.round((event.totalRaised / event.goalAmount) * 100)) : null
  const eventUrl = `/${event.eventType}/${event.slug}`

  return (
    <article
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0' }}
    >
      {/* Cover image area */}
      <div
        className="relative w-full cursor-pointer group"
        style={{ height: event.coverImageUrl ? 200 : 100, backgroundColor: '#F5EDE3' }}
        onClick={() => fileRef.current?.click()}
      >
        {event.coverImageUrl ? (
          <Image src={event.coverImageUrl} alt={event.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-2xl">{meta.emoji}</span>
            <p className="text-xs font-medium" style={{ color: '#B09070' }}>Adaugă o imagine de copertă</p>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: 'rgba(45,32,22,0.5)' }}
        >
          {uploadingCover ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span className="text-white text-sm font-medium">
                {event.coverImageUrl ? '✎ Schimbă imaginea' : '+ Adaugă imagine'}
              </span>
            </>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadCover(f) }}
        />
      </div>

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
                  event.isActive
                    ? { backgroundColor: '#F0FFF4', color: '#166534' }
                    : { backgroundColor: '#F5F5F5', color: '#6B7280' }
                }
              >
                {event.isActive ? 'Activ' : 'Inactiv'}
              </span>
            </div>
            <h2 className="text-lg font-bold" style={{ color: '#2D2016' }}>{event.name}</h2>
          </div>
          <Link
            href={eventUrl}
            target="_blank"
            className="shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={{ border: '1px solid #EDE0D0', color: '#7A6652' }}
          >
            Vezi pagina ↗
          </Link>
        </div>

        {/* Share link */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ backgroundColor: '#F5EDE3' }}
        >
          <span className="text-xs truncate flex-1" style={{ color: '#7A6652' }}>
            pentrumomente.ro{eventUrl}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(`https://pentrumomente.ro${eventUrl}`)}
            className="text-xs font-semibold shrink-0 transition-colors"
            style={{ color: '#C4956A' }}
          >
            Copiază
          </button>
        </div>

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
