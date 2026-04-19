import { EventTypeConfig } from '@/types'

export const weddingConfig: EventTypeConfig = {
  slug: 'nunta',
  label: 'Nuntă',
  palette: {
    primary: '#D4A574',
    accent: '#C9956C',
    background: '#FFFBF5',
  },
  copy: {
    pageTitle: 'Nunta lui {name1} și {name2}',
    donationVerb: 'Dăruiește',
    thankYouMessage: 'Mulțumim din suflet! Cadoul tău face parte din povestea noastră.',
    emptyState: 'Fii primul care le urează "La mulți ani!"',
    donationEmailSubject: 'Cadoul tău a ajuns! — {eventName}',
    donationEmailIntro: 'Ce bucurie! Cadoul tău a ajuns cu bine. Mulțumim că faci parte din ziua cea mai frumoasă a lui {eventName}. Gestul tău va rămâne o amintire de neuitat pentru ei.',
  },
  suggestedItems: [
    { name: 'Fond lună de miere', defaultAmount: 200, emoji: '🌙' },
    { name: 'Experiențe & activități', defaultAmount: 150, emoji: '🎭' },
    { name: 'Fond cămin nou', defaultAmount: 300, emoji: '🏡' },
    { name: 'Cina romantică', defaultAmount: 100, emoji: '🍷' },
  ],
  donationVisibilityDefault: 'visible',
  allowAnonymous: false,
  showDonorWall: true,
  donorWallLabel: 'Cei care au dăruit',
  emailTemplateId: 'wedding-donation-confirmation',
  milestoneMessages: {
    25: 'Ați primit primele cadouri. Felicitări!',
    50: 'Jumătate din fondul de nuntă a fost atins.',
    100: 'Fondul de nuntă a fost completat. Vă dorim multă fericire!',
  },
  allowQrCard: true,
  tipDefault: 10,
}
