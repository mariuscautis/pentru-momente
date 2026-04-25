import { EventTypeConfig } from '@/types'

export const animalsConfig: EventTypeConfig = {
  slug: 'animale',
  label: 'Animale',
  palette: {
    primary: '#F59E0B',
    accent: '#D97706',
    background: '#FFFBEB',
  },
  copy: {
    pageTitle: 'Ajutor pentru {name}',
    donationVerb: 'Ajută',
    thankYouMessage: 'Îți mulțumim! Donația ta face o diferență uriașă pentru un suflet mic.',
    emptyState: 'Fii primul care ajută.',
    donationEmailSubject: 'Donația ta a ajuns — {eventName}',
    donationEmailIntro: 'Donația ta a ajuns cu bine și îl va ajuta pe {eventName} să primească îngrijirea de care are nevoie. Fiecare contribuție contează enorm pentru un suflet nevinovat. Îți mulțumim din suflet.',
  },
  suggestedItems: [
    { name: 'Contribuție generală', defaultAmount: 50, emoji: '🐾' },
    { name: 'Tratament veterinar', defaultAmount: 150, emoji: '🩺' },
    { name: 'Operație', defaultAmount: 500, emoji: '💊' },
    { name: 'Hrană & îngrijire', defaultAmount: 100, emoji: '🦴' },
  ],
  donationVisibilityDefault: 'visible',
  allowAnonymous: true,
  showDonorWall: true,
  donorWallLabel: 'Cei care au ajutat',
  emailTemplateId: 'animals-donation-confirmation',
  milestoneMessages: {
    25: 'Primele donații au sosit. Mulțumim!',
    50: 'Suntem la jumătatea sumei necesare!',
    100: 'Suma necesară a fost strânsă. Mulțumim tuturor!',
  },
  allowQrCard: false,
  tipDefault: 5,
}
