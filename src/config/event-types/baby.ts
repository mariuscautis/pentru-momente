import { EventTypeConfig } from '@/types'

export const babyConfig: EventTypeConfig = {
  slug: 'bebe',
  label: 'Bebe nou',
  palette: {
    primary: '#7EB8F7',
    accent: '#5AA0E8',
    background: '#F0F8FF',
  },
  copy: {
    pageTitle: 'Bun venit, {name}! 👶',
    donationVerb: 'Dăruiește',
    thankYouMessage: 'Mulțumim pentru cadoul minunat! {name} va fi răsfățat datorită ție.',
    emptyState: 'Fii primul care îi urează bun venit micuțului.',
    donationEmailSubject: 'Cadoul tău pentru {eventName} a ajuns! 🍼',
    donationEmailIntro: 'Ce veste minunată! Cadoul tău a sosit și va aduce zâmbete în familia lui {eventName}. Mulțumim că îi ești alături micuțului în primele lui momente de viață.',
  },
  suggestedItems: [
    { name: 'Căruț', defaultAmount: 500, emoji: '🍼' },
    { name: 'Monitor bebe', defaultAmount: 300, emoji: '📡' },
    { name: 'Scaun auto', defaultAmount: 400, emoji: '🚗' },
    { name: 'Hăinuțe & accesorii', defaultAmount: 100, emoji: '👕' },
    { name: 'Fond general pentru bebe', defaultAmount: 150, emoji: '💛' },
  ],
  donationVisibilityDefault: 'visible',
  allowAnonymous: true,
  showDonorWall: true,
  donorWallLabel: 'Cei care au dăruit',
  emailTemplateId: 'baby-donation-confirmation',
  milestoneMessages: {
    25: 'Primele cadouri au sosit pentru cel mic!',
    50: 'Jumătate din lista de dorințe a fost îndeplinită.',
    100: 'Toate dorințele au fost îndeplinite. Mulțumim!',
  },
  allowQrCard: false,
  tipDefault: 5,
}
