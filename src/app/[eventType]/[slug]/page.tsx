import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getEventTypeConfig, isValidEventType } from '@/config/event-types'
import { getEventBySlug, getEventItems } from '@/lib/db/events'
import { getDonationsForEvent, getTotalRaisedForEvent } from '@/lib/db/donations'
import { EventPage } from '@/components/EventPage/EventPage'
import { Event } from '@/types'
import Link from 'next/link'

interface PageParams {
  params: Promise<{ eventType: string; slug: string }>
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { eventType, slug } = await params

  if (!isValidEventType(eventType)) return {}

  const event = await getEventBySlug(eventType, slug)
  if (!event) return {}

  const config = getEventTypeConfig(eventType)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const title = config.copy.pageTitle
    .replace('{name}', event.name)
    .replace('{name1}', event.name.split(' & ')[0] ?? event.name)
    .replace('{name2}', event.name.split(' & ')[1] ?? '')

  return {
    title,
    description: event.description ?? `${config.copy.donationVerb} pentru ${event.name} pe pentrumomente.ro`,
    openGraph: {
      title,
      description: event.description ?? `${config.copy.donationVerb} pentru ${event.name}`,
      url: `${appUrl}/${eventType}/${slug}`,
      siteName: 'pentrumomente.ro',
      images: event.coverImageUrl
        ? [{ url: event.coverImageUrl, width: 1200, height: 630 }]
        : [],
      type: 'website',
      locale: 'ro_RO',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: event.description ?? `${config.copy.donationVerb} pentru ${event.name}`,
      images: event.coverImageUrl ? [event.coverImageUrl] : [],
    },
  }
}

export default async function EventPublicPage({ params }: PageParams) {
  const { eventType, slug } = await params

  if (!isValidEventType(eventType)) notFound()

  const config = getEventTypeConfig(eventType)
  const event = await getEventBySlug(eventType, slug)

  // Active event — render normally
  if (event) {
    const [items, donations, totalRaised] = await Promise.all([
      getEventItems(event.id),
      getDonationsForEvent(event.id),
      getTotalRaisedForEvent(event.id),
    ])
    return (
      <EventPage
        event={event}
        items={items}
        donations={donations}
        config={config}
        totalRaised={totalRaised}
      />
    )
  }

  // Active event not found — check if it exists but is inactive/expired/deleted.
  // Use a direct service-role client here (not the proxy singleton) to guarantee
  // RLS is bypassed regardless of Next.js module initialisation order.
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: archivedRow } = await adminClient
    .from('events')
    .select('*')
    .eq('event_type', eventType)
    .eq('slug', slug)
    .single()

  const archivedEvent: Event | null = archivedRow
    ? {
        id: archivedRow.id as string,
        slug: archivedRow.slug as string,
        eventType: archivedRow.event_type as string,
        name: archivedRow.name as string,
        description: archivedRow.description as string | undefined,
        coverImageUrl: archivedRow.cover_image_url as string | undefined,
        goalAmount: archivedRow.goal_amount as number | undefined,
        organiserId: archivedRow.organiser_id as string,
        stripeConnectAccountId: archivedRow.stripe_connect_account_id as string | undefined,
        connectOnboardingComplete: (archivedRow.connect_onboarding_complete as boolean) ?? false,
        isActive: archivedRow.is_active as boolean,
        isDeleted: (archivedRow.is_deleted as boolean) ?? false,
        expiresAt: archivedRow.expires_at as string | undefined,
        createdAt: archivedRow.created_at as string,
      }
    : null

  if (!archivedEvent) notFound()

  const isExpired = archivedEvent.expiresAt ? new Date(archivedEvent.expiresAt) < new Date() : false
  const primary = config.palette.primary

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: '#FDFAF7' }}>
      <div
        className="w-full max-w-md rounded-2xl p-10 space-y-5"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE0D0', boxShadow: '0 4px 24px rgba(196,149,106,0.08)' }}
      >
        <p className="text-4xl">🕊️</p>
        <h1 className="text-xl font-bold" style={{ color: '#2D2016' }}>
          Această pagină nu mai este activă
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: '#7A6652' }}>
          {isExpired
            ? `Pagina de donații pentru ${archivedEvent.name} a expirat și nu mai acceptă contribuții.`
            : `Pagina de donații pentru ${archivedEvent.name} a fost închisă de organizator.`}
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: primary }}
        >
          Înapoi la pentrumomente.ro
        </Link>
      </div>
    </div>
  )
}
