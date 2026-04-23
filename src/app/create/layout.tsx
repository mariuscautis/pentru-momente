import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('create', {
    title: 'Creează o pagină de donații · pentrumomente.ro',
    description: 'Creează o pagină de donații pentru un eveniment de viață în 3 minute. Distribuie link-ul. Primești banii direct în contul tău.',
    openGraph: { siteName: 'pentrumomente.ro', locale: 'ro_RO', type: 'website' },
  })
}

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children
}
