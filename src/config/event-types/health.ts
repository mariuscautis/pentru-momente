import { EventTypeConfig } from '@/types'

export const healthConfig: EventTypeConfig = {
  slug: 'sanatate',
  label: 'Sănătate',
  palette: {
    primary: '#48BB78',
    accent: '#38A169',
    background: '#F0FFF4',
  },
  copy: {
    pageTitle: 'Ajutor pentru {name}',
    donationVerb: 'Donează',
    thankYouMessage: 'Îți mulțumim din inimă. Donația ta face o diferență reală.',
    emptyState: 'Fii primul care ajută.',
    donationEmailSubject: 'Donația ta contează — {eventName}',
    donationEmailIntro: 'Donația ta a ajuns și face o diferență reală. Fiecare contribuție îl ajută pe {eventName} să treacă mai ușor prin această perioadă dificilă. Îți mulțumim din suflet pentru solidaritatea ta.',
  },
  suggestedItems: [
    { name: 'Contribuție generală', defaultAmount: 100, emoji: '💚' },
    { name: 'Tratament / medicamente', defaultAmount: 200, emoji: '💊' },
    { name: 'Consultație medicală', defaultAmount: 150, emoji: '🏥' },
    { name: 'Recuperare & fizioterapie', defaultAmount: 250, emoji: '🏃' },
  ],
  donationVisibilityDefault: 'visible',
  allowAnonymous: true,
  showDonorWall: true,
  donorWallLabel: 'Cei care au ajutat',
  emailTemplateId: 'health-donation-confirmation',
  milestoneMessages: {
    25: 'Primele donații au sosit. Mulțumim!',
    50: 'Jumătate din suma necesară a fost strânsă!',
    100: 'Suma necesară a fost atinsă. Mulțumim tuturor donatorilor!',
  },
  allowQrCard: false,
  tipDefault: 5,
}
