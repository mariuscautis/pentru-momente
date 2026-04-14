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
  organiserIban: string // collected at creation, used for Wise payout
  isActive: boolean
  expiresAt?: string   // ISO datetime — page becomes inactive after this
  createdAt: string
}

export interface EventItem {
  id: string
  eventId: string
  name: string
  targetAmount: number
  raisedAmount: number // updated on each confirmed donation
  isFullyFunded: boolean
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
  stripePaymentIntentId: string
  status: 'pending' | 'confirmed' | 'refunded'
  createdAt: string
}

export interface Payout {
  id: string
  eventId: string
  amount: number
  wiseTransferId?: string
  organiserIban: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  requestedAt: string
  completedAt?: string
}

export interface ApiError {
  error: string
  code?: string
}
