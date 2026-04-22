export interface EventTypeConfig {
  slug: string
  label: string
  palette: {
    primary: string
    accent: string
    background: string
  }
  copy: {
    pageTitle: string // supports {name}, {name1}, {name2} tokens
    donationVerb: string
    thankYouMessage: string
    emptyState: string
    donationEmailSubject: string   // email subject for donor confirmation
    donationEmailIntro: string     // opening paragraph in donor confirmation email
  }
  suggestedItems: SuggestedItem[]
  donationVisibilityDefault: 'visible' | 'hidden'
  allowAnonymous: boolean
  showDonorWall: boolean
  donorWallLabel: string
  emailTemplateId: string // Brevo template ID
  milestoneMessages: Record<number, string> // % -> message
  allowQrCard: boolean
  tipDefault: number // RON
}

export interface SuggestedItem {
  name: string
  defaultAmount: number
  emoji?: string
}

export interface Event {
  id: string
  slug: string
  eventType: string // matches config slug
  name: string // person/couple name
  description?: string
  coverImageUrl?: string
  goalAmount?: number // optional, some events have no hard goal
  organiserId: string
  stripeConnectAccountId?: string       // set after Stripe Express onboarding starts
  connectOnboardingComplete: boolean    // false until Stripe confirms onboarding done
  isActive: boolean                     // only true after onboarding complete
  isDeleted?: boolean                   // soft-deleted by organiser — kept for archive
  expiresAt?: string   // ISO datetime — page becomes inactive after this
  createdAt: string
}

export interface EventItem {
  id: string
  eventId: string
  name: string
  emoji?: string               // icon shown on the item card
  targetAmount: number         // 0 means no target (free-choice amount)
  raisedAmount: number         // updated on each confirmed donation
  isFullyFunded: boolean
  isCustomAmount: boolean      // true = donor enters their own amount freely
}

export interface Donation {
  id: string
  eventId: string
  itemId?: string // null = general fund donation
  amount: number
  tipAmount: number // platform tip, 0 if declined
  displayName?: string // null if anonymous
  message?: string
  isAnonymous: boolean
  showAmount: boolean
  cardCountry?: string            // ISO 3166-1 alpha-2, declared by donor at checkout
  stripePaymentIntentId: string
  status: 'pending' | 'confirmed' | 'refunded'
  createdAt: string
}

export interface Payout {
  id: string
  eventId: string
  stripePayoutId?: string       // from Stripe Connect payout.created webhook
  amount: number
  status: 'pending' | 'paid' | 'failed'
  arrivalDate?: string
  createdAt: string
}

export interface ApiError {
  error: string
  code?: string
}
