'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/db/supabase'
import { Event, Payout } from '@/types'
import { Button } from '@/components/ui/Button'

interface DashboardEvent extends Event {
  totalRaised: number
  payouts: Payout[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [events, setEvents] = useState<DashboardEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [payoutLoading, setPayoutLoading] = useState<string | null>(null)
  const [payoutAmounts, setPayoutAmounts] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Fetch events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('organiser_id', session.user.id)
        .order('created_at', { ascending: false })

      if (!eventsData) {
        setLoading(false)
        return
      }

      const enriched: DashboardEvent[] = await Promise.all(
        eventsData.map(async (row) => {
          const eventId = row.id as string

          const [donationsRes, payoutsRes] = await Promise.all([
            supabase
              .from('donations')
              .select('amount')
              .eq('event_id', eventId)
              .eq('status', 'confirmed'),
            fetch(`/api/payouts?eventId=${eventId}`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            })
              .then((r) => r.json())
              .then((d) => (d.payouts ?? []) as Payout[])
              .catch(() => [] as Payout[]),
          ])

          const totalRaised = (donationsRes.data ?? []).reduce(
            (sum, d) => sum + (d.amount as number),
            0
          )

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

    load()
  }, [router])

  async function requestPayout(event: DashboardEvent) {
    setPayoutLoading(event.id)
    setError(null)

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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ eventId: event.id, amount }),
    })

    const data = (await res.json()) as { error?: string }
    if (!res.ok) {
      setError(data.error ?? 'Eroare la inițierea retragerii.')
    } else {
      // Refresh
      window.location.reload()
    }

    setPayoutLoading(null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <h1 className="font-semibold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              + Pagină nouă
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Ieși
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        {events.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-gray-500 mb-4">Nu ai nicio pagină încă.</p>
            <Link
              href="/create"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              Creează prima pagină
            </Link>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            payoutAmount={payoutAmounts[event.id] ?? ''}
            onPayoutAmountChange={(v) =>
              setPayoutAmounts((prev) => ({ ...prev, [event.id]: v }))
            }
            onRequestPayout={() => requestPayout(event)}
            payoutLoading={payoutLoading === event.id}
          />
        ))}
      </main>
    </div>
  )
}

interface EventCardProps {
  event: DashboardEvent
  payoutAmount: string
  onPayoutAmountChange: (v: string) => void
  onRequestPayout: () => void
  payoutLoading: boolean
}

function EventCard({
  event,
  payoutAmount,
  onPayoutAmountChange,
  onRequestPayout,
  payoutLoading,
}: EventCardProps) {
  const pendingPayouts = event.payouts.filter(
    (p) => p.status === 'pending' || p.status === 'processing'
  )

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">{event.name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {event.eventType} ·{' '}
            <Link
              href={`/${event.eventType}/${event.slug}`}
              className="underline hover:text-gray-700"
              target="_blank"
            >
              {event.slug}
            </Link>
          </p>
        </div>
        <span
          className={[
            'rounded-full px-2 py-0.5 text-xs font-medium',
            event.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500',
          ].join(' ')}
        >
          {event.isActive ? 'Activ' : 'Inactiv'}
        </span>
      </div>

      {/* Raised */}
      <div className="flex gap-6 text-sm">
        <div>
          <p className="text-gray-500 text-xs">Strâns</p>
          <p className="font-semibold text-gray-900">{event.totalRaised} RON</p>
        </div>
        {event.goalAmount && (
          <div>
            <p className="text-gray-500 text-xs">Obiectiv</p>
            <p className="font-semibold text-gray-900">{event.goalAmount} RON</p>
          </div>
        )}
        <div>
          <p className="text-gray-500 text-xs">IBAN</p>
          <p className="font-mono text-xs text-gray-700">{event.organiserIban}</p>
        </div>
      </div>

      {/* Payout form */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">Solicită retragere</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={50}
            max={event.totalRaised}
            placeholder="Suma RON"
            value={payoutAmount}
            onChange={(e) => onPayoutAmountChange(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Suma de retras"
          />
          <Button
            size="sm"
            onClick={onRequestPayout}
            loading={payoutLoading}
            disabled={event.totalRaised < 50 || pendingPayouts.length > 0}
          >
            Retrage
          </Button>
        </div>
        {pendingPayouts.length > 0 && (
          <p className="text-xs text-amber-600 mt-1">
            Ai o retragere în curs de procesare.
          </p>
        )}
      </div>

      {/* Payout history */}
      {event.payouts.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Istoric retrageri</p>
          <ul className="space-y-1">
            {event.payouts.map((p) => (
              <li key={p.id} className="flex justify-between text-xs text-gray-600">
                <span>{new Date(p.requestedAt).toLocaleDateString('ro-RO')}</span>
                <span>{p.amount} RON</span>
                <span
                  className={
                    p.status === 'completed'
                      ? 'text-green-600'
                      : p.status === 'failed'
                      ? 'text-red-600'
                      : 'text-amber-600'
                  }
                >
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}
