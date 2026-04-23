import type { Metadata } from 'next'
import { getSeoOverride } from '@/lib/db/admin'

const DEFAULT_OG_IMAGE = { url: '/og-image.png', width: 1200, height: 630, alt: 'pentrumomente.ro' }

/**
 * Merges a DB SEO override on top of page-level defaults.
 * Only fields that are non-empty in the DB override take effect.
 */
export async function buildMetadata(pageKey: string, defaults: Metadata): Promise<Metadata> {
  const override = await getSeoOverride(pageKey)

  const title = override?.seoTitle?.trim() || defaults.title
  const description = override?.metaDescription?.trim() || defaults.description
  const ogImage = override?.socialImageUrl?.trim()
    ? { url: override.socialImageUrl, width: 1200, height: 630, alt: 'pentrumomente.ro' }
    : DEFAULT_OG_IMAGE

  return {
    ...defaults,
    title,
    description,
    openGraph: {
      ...(defaults.openGraph as object | undefined),
      ...(title ? { title: title as string } : {}),
      ...(description ? { description: description as string } : {}),
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      ...(title ? { title: title as string } : {}),
      ...(description ? { description: description as string } : {}),
      images: [ogImage.url],
    },
  }
}
