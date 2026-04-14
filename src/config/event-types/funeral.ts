import { EventTypeConfig } from '@/types'

export const funeralConfig: EventTypeConfig = {
  slug: 'inmormantare',
  label: 'Înmormântare',
  palette: {
    primary: '#4A5568',
    accent: '#718096',
    background: '#F7F7F7',
  },
  copy: {
    pageTitle: 'În memoria lui {name}',
    donationVerb: 'Trimite o coroană',
    thankYouMessage: 'Mulțumim pentru gândul tău. Gestul tău contează enorm pentru familie.',
    emptyState: 'Fii primul care trimite un omagiu.',
  },
  suggestedItems: [
    { name: 'Lumânare digitală', defaultAmount: 20, emoji: '🕯️' },
    { name: 'Coroană de flori', defaultAmount: 150, emoji: '💐' },
    { name: 'Jerbe', defaultAmount: 300, emoji: '🌿' },
    { name: 'Contribuție generală pentru familie', defaultAmount: 100, emoji: '🤍' },
  ],
  donationVisibilityDefault: 'visible',
  allowAnonymous: true,
  showDonorWall: true,
  donorWallLabel: 'Cei care și-au exprimat condoleanțele',
  emailTemplateId: 'funeral-donation-confirmation',
  milestoneMessages: {
    25: 'Familia a primit primele mesaje de susținere.',
    50: 'Jumătate din suma necesară a fost strânsă.',
    100: 'Suma necesară a fost strânsă integral. Mulțumim tuturor!',
  },
  allowQrCard: true,
  tipDefault: 5,
}
