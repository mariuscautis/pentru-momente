import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEventTypeConfig, isValidEventType } from '@/config/event-types'
import { getEventBySlug, getEventItems } from '@/lib/db/events'
import { getDonationsForEvent, getTotalRaisedForEvent } from '@/lib/db/donations'
import { EventPage } from '@/components/EventPage/EventPage'

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

  if (!event) notFound()

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
