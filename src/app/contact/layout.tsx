import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('contact', {
    title: 'Contact · pentrumomente.ro',
    description: 'Ia legătura cu echipa pentrumomente.ro. Suntem aici să te ajutăm.',
    openGraph: { siteName: 'pentrumomente.ro', locale: 'ro_RO', type: 'website' },
  })
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
