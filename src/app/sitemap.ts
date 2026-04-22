import { MetadataRoute } from 'next'
import { getSupabaseAdmin } from '@/lib/db/supabase'

// Regenerate sitemap at most once per minute as a baseline.
// The events API also calls revalidatePath('/sitemap.xml') immediately
// whenever a page is blocked or deleted, so stale entries are purged on-demand.
export const revalidate = 60

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/create`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Only active, non-deleted, non-expired events belong in the sitemap
  const { data: events } = await getSupabaseAdmin()
    .from('events')
    .select('event_type, slug, created_at')
    .eq('is_active', true)
    .eq('is_deleted', false)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })

  const eventRoutes: MetadataRoute.Sitemap = (events ?? []).map((row) => ({
    url: `${appUrl}/${row.event_type as string}/${row.slug as string}`,
    lastModified: new Date(row.created_at as string),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  return [...staticRoutes, ...eventRoutes]
}
