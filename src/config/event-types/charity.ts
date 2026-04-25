import { EventTypeConfig } from '@/types'

export const charityConfig: EventTypeConfig = {
  slug: 'caritate',
  label: 'Organizații caritabile',
  palette: {
    primary: '#3B82F6',
    accent: '#1D4ED8',
    background: '#EFF6FF',
  },
  copy: {
    pageTitle: 'Susține {name}',
    donationVerb: 'Donează',
    thankYouMessage: 'Îți mulțumim pentru generozitate! Donația ta ajută la schimbarea în bine.',
    emptyState: 'Fii primul care susține această cauză.',
    donationEmailSubject: 'Donația ta contează — {eventName}',
    donationEmailIntro: 'Donația ta a ajuns cu bine la {eventName}. Împreună facem lumea un loc mai bun. Îți mulțumim pentru că ai ales să fii parte din această schimbare.',
  },
  suggestedItems: [
    { name: 'Contribuție generală', defaultAmount: 50, emoji: '💙' },
    { name: 'Susținere lunară', defaultAmount: 100, emoji: '🤝' },
    { name: 'Sponsor proiect', defaultAmount: 500, emoji: '🌍' },
    { name: 'Donație mare', defaultAmount: 1000, emoji: '⭐' },
  ],
  donationVisibilityDefault: 'visible',
  allowAnonymous: true,
  showDonorWall: true,
  donorWallLabel: 'Susținătorii cauzei',
  emailTemplateId: 'charity-donation-confirmation',
  milestoneMessages: {
    25: 'Primele donații au sosit. Mulțumim!',
    50: 'Suntem la jumătatea obiectivului!',
    100: 'Obiectivul a fost atins. Mulțumim tuturor susținătorilor!',
  },
  allowQrCard: false,
  tipDefault: 5,
}
