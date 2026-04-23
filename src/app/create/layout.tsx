import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Creează o pagină de donații · pentrumomente.ro',
  description: 'Creează o pagină de donații pentru un eveniment de viață în 3 minute. Distribuie link-ul. Primești banii direct în contul tău.',
  openGraph: {
    title: 'Creează o pagină de donații · pentrumomente.ro',
    description: 'Creează o pagină de donații pentru un eveniment de viață în 3 minute. Distribuie link-ul. Primești banii direct în contul tău.',
    siteName: 'pentrumomente.ro',
    locale: 'ro_RO',
    type: 'website',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'pentrumomente.ro' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creează o pagină de donații · pentrumomente.ro',
    description: 'Creează o pagină de donații pentru un eveniment de viață în 3 minute.',
    images: ['/og-image.svg'],
  },
}

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children
}
