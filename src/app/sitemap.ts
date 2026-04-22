import { MetadataRoute } from 'next'
import { getSupabaseAdmin } from '@/lib/db/supabase'

// Always fetch fresh — on-demand revalidation via revalidatePath('/sitemap.xml')
// in the events API handles cache purging when pages are blocked or deleted.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: appUrl,                               lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${appUrl}/create`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/despre-noi`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${appUrl}/tarife`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${appUrl}/contact`,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${appUrl}/blogs`,                    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${appUrl}/termeni-si-conditii`,      lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${appUrl}/politica-gdpr`,            lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${appUrl}/politica-cookies`,         lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${appUrl}/stergere-date`,            lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]

  const db = getSupabaseAdmin()

  // Published blog posts
  const { data: blogPosts } = await db
    .from('blog_posts')
    .select('slug, published_at, created_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  const blogRoutes: MetadataRoute.Sitemap = (blogPosts ?? []).map((row) => ({
    url: `${appUrl}/blogs/${row.slug as string}`,
    lastModified: new Date((row.published_at ?? row.created_at) as string),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Active, non-deleted, non-expired donation event pages
  const { data: events } = await db
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

  return [...staticRoutes, ...blogRoutes, ...eventRoutes]
}
