import { EventTypeConfig } from '@/types'

export const customConfig: EventTypeConfig = {
  slug: 'altele',
  label: 'Altele',
  palette: {
    primary: '#667EEA',
    accent: '#5A67D8',
    background: '#FAF5FF',
  },
  copy: {
    pageTitle: 'Strângere de fonduri pentru {name}',
    donationVerb: 'Contribuie',
    thankYouMessage: 'Mulțumim pentru contribuție! Gestul tău contează.',
    emptyState: 'Fii primul care contribuie.',
  },
  suggestedItems: [
    { name: 'Contribuție generală', defaultAmount: 50, emoji: '💜' },
    { name: 'Susținere', defaultAmount: 100, emoji: '🌟' },
    { name: 'Donație mare', defaultAmount: 250, emoji: '🎁' },
  ],
  donationVisibilityDefault: 'hidden',
  allowAnonymous: true,
  showDonorWall: true,
  donorWallLabel: 'Susținătorii noștri',
  emailTemplateId: 'custom-donation-confirmation',
  milestoneMessages: {
    25: 'Primele contribuții au sosit!',
    50: 'Suntem la jumătatea drumului!',
    100: 'Obiectivul a fost atins. Mulțumim tuturor!',
  },
  allowQrCard: false,
  tipDefault: 5,
}
