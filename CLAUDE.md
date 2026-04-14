# pentrumomente.ro — Project Context for Claude

You are a senior Next.js developer helping build **pentrumomente.ro**, a Romanian life-moments fundraising platform. This file is your complete project brief. Read it fully before responding to any request.

---

## What this platform does

pentrumomente.ro ("for moments") allows people to raise funds during emotionally significant life events. Organisers create a fundraise page for an event, add a list of items or a general fund, and share the URL. Donors visit the page, choose what to contribute to, and pay. Funds accumulate and are paid out to the organiser/family via Wise Business.

### Supported event types (modular, config-driven — see architecture below)
- **Funeral** (`inmormantare`) — digital wreaths, candles, tributes; proceeds to bereaved family
- **Wedding** (`nunta`) — gift registry and honeymoon fund
- **New baby** (`bebe`) — wishlist items and general fund
- **Health fundraise** (`sanatate`) — medical costs for a person or pet
- **Custom** (`altele`) — open category

New event types are added by creating a new config file only — zero changes to engine code.

---

## Core UX principles (never compromise these)

1. **Donors never need an account.** Registration is only for organisers.
2. **Donation flow is maximum 3 steps**: (1) choose item/amount, (2) name + message + visibility prefs, (3) pay. No exceptions.
3. **Donor visibility is always the donor's choice**: they choose whether their name is shown and whether their amount is shown.
4. **Anonymous donations are always allowed.**
5. **The platform's "100% to family" promise is preserved**: monetisation is via optional tip-to-platform at checkout, not a percentage of donations.
6. **Pages must be shareable and fast**: all public event pages are server-side rendered with correct OG metadata for WhatsApp/Facebook previews.

---

## Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14+ (App Router) | TypeScript throughout |
| Styling | Tailwind CSS | No CSS-in-JS |
| Database | Supabase (PostgreSQL) | Also handles auth and file storage |
| Payments (in) | Stripe | Card, Apple Pay, Google Pay |
| Payouts (out) | Wise Business API | Romanian IBAN transfers to organisers |
| Email | Brevo (transactional) | One template per event type |
| Hosting | Vercel | Auto-deploy from GitHub main branch |
| Language | Romanian (primary UI), English (code and comments) |

---

## Project folder structure

```
src/
├── app/
│   ├── [eventType]/[slug]/       ← public event pages (SSR)
│   │   └── page.tsx
│   ├── dashboard/                ← organiser portal (authenticated)
│   ├── create/                   ← new event creation flow
│   ├── login/                    ← auth (login + register)
│   └── api/
│       ├── donations/
│       ├── events/
│       ├── payouts/
│       └── webhooks/
│           └── stripe/
├── components/
│   ├── EventPage/                ← renders any event type via config
│   ├── DonationFlow/             ← 3-step donation checkout
│   ├── ItemTracker/              ← progress bars per item
│   ├── DonorWall/                ← scrolling donor feed
│   └── ui/                      ← shared primitives (Button, Input, etc.)
├── config/
│   └── event-types/
│       ├── index.ts              ← registry + getEventTypeConfig()
│       ├── funeral.ts
│       ├── wedding.ts
│       ├── baby.ts
│       ├── health.ts
│       └── custom.ts
├── lib/
│   ├── db/                       ← Supabase queries
│   ├── email/                    ← Brevo integration
│   ├── payments/                 ← Stripe integration
│   └── payouts/                  ← Wise integration
└── types/
    └── index.ts                  ← shared TypeScript types
```

---

## Core type definitions

```typescript
// src/types/index.ts

export interface EventTypeConfig {
  slug: string
  label: string
  palette: {
    primary: string
    accent: string
    background: string
  }
  copy: {
    pageTitle: string          // supports {name}, {name1}, {name2} tokens
    donationVerb: string
    thankYouMessage: string
    emptyState: string
  }
  suggestedItems: SuggestedItem[]
  donationVisibilityDefault: 'visible' | 'hidden'
  allowAnonymous: boolean
  showDonorWall: boolean
  donorWallLabel: string
  emailTemplateId: string      // Brevo template ID
  milestoneMessages: Record<number, string>  // % -> message
  allowQrCard: boolean
  tipDefault: number           // RON
}

export interface SuggestedItem {
  name: string
  defaultAmount: number
  emoji?: string
}

export interface Event {
  id: string
  slug: string
  eventType: string            // matches config slug
  name: string                 // person/couple name
  description?: string
  coverImageUrl?: string
  goalAmount?: number          // optional, some events have no hard goal
  organiserId: string
  organiserIban: string        // collected at creation, used for Wise payout
  isActive: boolean
  createdAt: string
}

export interface EventItem {
  id: string
  eventId: string
  name: string
  targetAmount: number
  raisedAmount: number         // updated on each confirmed donation
  isFullyFunded: boolean
}

export interface Donation {
  id: string
  eventId: string
  itemId?: string              // null = general fund donation
  amount: number
  tipAmount: number            // platform tip, 0 if declined
  displayName?: string         // null if anonymous
  message?: string
  isAnonymous: boolean
  showAmount: boolean
  stripePaymentIntentId: string
  status: 'pending' | 'confirmed' | 'refunded'
  createdAt: string
}
```

---

## Config-driven architecture — the key pattern

The engine (components, API routes, email logic) is **event-type-agnostic**. It reads everything it needs from the config object. This is how you add a new event type with zero engine changes:

```typescript
// src/config/event-types/index.ts
import { funeralConfig } from './funeral'
import { weddingConfig } from './wedding'
import { babyConfig } from './baby'

const registry: Record<string, EventTypeConfig> = {
  inmormantare: funeralConfig,
  nunta: weddingConfig,
  bebe: babyConfig,
}

export function getEventTypeConfig(slug: string): EventTypeConfig {
  const config = registry[slug]
  if (!config) throw new Error(`Unknown event type: ${slug}`)
  return config
}
```

The dynamic route `app/[eventType]/[slug]/page.tsx` calls `getEventTypeConfig(params.eventType)` and passes the result into `<EventPage config={config} event={event} />`. That component handles all rendering.

---

## Money flow

```
Donor card payment
    → Stripe (payment processor, handles card/Apple Pay/Google Pay)
    → Stripe settles to Wise Business account (configured as Stripe payout destination)
    → Funds sit in Wise RON balance
    → On organiser withdrawal request → Wise API transfer to organiser IBAN
    → Organiser's Romanian bank account
```

**Stripe** = accepting money in (donor-facing)
**Wise Business** = sending money out (organiser-facing)
These are two separate integrations that never overlap.

---

## Environment variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Wise (payouts)
WISE_API_KEY=
WISE_PROFILE_ID=

# Brevo (email)
BREVO_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Email architecture (Brevo)

Each event type has its own Brevo template ID stored in its config. The notification service is generic — it receives a donation, an event, and the config, and fires the right template automatically.

Emails to send:
- **Donation confirmation** → to donor (uses `config.emailTemplateId`)
- **Donation received** → to organiser (new donation notification)
- **Milestone reached** → to organiser (25%, 50%, 100% of goal)
- **Payout initiated** → to organiser (when Wise transfer is sent)
- **Payout confirmed** → to organiser (when Wise transfer completes)

Brevo template variables available in all emails:
`donorName`, `eventName`, `amount`, `tipAmount`, `message`, `eventUrl`, `organiserName`

---

## Payout rules

- Organiser must provide a valid Romanian IBAN during event creation
- Minimum payout threshold: 50 RON
- Organiser requests withdrawal manually from dashboard
- Backend calls Wise API `POST /v1/transfers` with organiser IBAN
- Payout status is tracked in database and shown in dashboard
- Brevo email sent on initiation and on completion (via Wise webhook)

---

## Coding standards

- **TypeScript strict mode** — no `any`, no unchecked nulls
- **Server Components by default** — only use `'use client'` when genuinely needed (forms, interactivity)
- **All DB queries in `src/lib/db/`** — never query Supabase directly from components
- **All external API calls in `src/lib/`** — Stripe in `payments/`, Wise in `payouts/`, Brevo in `email/`
- **Romanian strings in config only** — no hardcoded Romanian text in components
- **Error handling on all API routes** — always return typed error responses
- **No inline styles** — Tailwind classes only
- **Accessible markup** — semantic HTML, proper aria labels on interactive elements

---

## Database schema (Supabase / PostgreSQL)

```sql
-- Event types are driven by config, not DB rows

create table events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  event_type text not null,
  name text not null,
  description text,
  cover_image_url text,
  goal_amount numeric,
  organiser_id uuid references auth.users(id),
  organiser_iban text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table event_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  target_amount numeric not null,
  raised_amount numeric default 0,
  is_fully_funded boolean default false,
  sort_order integer default 0
);

create table donations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  item_id uuid references event_items(id),
  amount numeric not null,
  tip_amount numeric default 0,
  display_name text,
  message text,
  is_anonymous boolean default false,
  show_amount boolean default true,
  stripe_payment_intent_id text unique,
  status text default 'pending',
  created_at timestamptz default now()
);

create table payouts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  amount numeric not null,
  wise_transfer_id text,
  organiser_iban text not null,
  status text default 'pending',
  requested_at timestamptz default now(),
  completed_at timestamptz
);
```

---

## Current build status

- [x] Project scaffolded (Next.js, TypeScript, Tailwind)
- [x] Folder structure created
- [x] Core TypeScript types defined (`src/types/index.ts`)
- [x] All 5 event type configs written (funeral, wedding, baby, health, custom)
- [x] Config registry and resolver implemented (`src/config/event-types/index.ts`)
- [x] GitHub repo initialised and pushed
- [x] Vercel project connected
- [x] Dependencies installed (supabase-js, stripe, @stripe/stripe-js, @stripe/react-stripe-js)
- [x] `.env.local` template created (fill in real keys)
- [x] Supabase DB query layer (`src/lib/db/` — events, donations, payouts)
- [x] Stripe payment integration (`src/lib/payments/stripe.ts`)
- [x] Wise payout integration (`src/lib/payouts/wise.ts`)
- [x] Brevo email integration (`src/lib/email/brevo.ts`)
- [x] API routes: donations, events, payouts, Stripe webhook
- [x] Shared UI primitives (Button, Input, Textarea)
- [x] ItemTracker component (progress bars per item)
- [x] DonorWall component (scrolling donor feed)
- [x] DonationFlow component (3 steps: amount → details → payment → success)
- [x] EventPage component (config-driven, event-type-agnostic)
- [x] Public event page SSR + OG metadata (`app/[eventType]/[slug]/page.tsx`)
- [x] Event creation flow (`app/create/page.tsx`)
- [x] Login / register page (`app/login/page.tsx`)
- [x] Organiser dashboard with payout requests (`app/dashboard/page.tsx`)
- [x] Build passes (`npm run build` — 0 type errors)
- [ ] Supabase project created and schema applied (run schema SQL in Supabase dashboard)
- [ ] Stripe account connected (add keys to `.env.local`)
- [ ] Wise Business API key obtained (add to `.env.local`)
- [ ] Brevo templates created (update template IDs in event configs)

---

## How to continue the build

When asked to build a feature, always:
1. Check which layer it belongs to (config / component / API route / lib)
2. Follow the folder structure above — no improvising new locations
3. Keep components event-type-agnostic — read from config, never hardcode event-type logic
4. Write the Supabase query in `src/lib/db/` before using it in a component or API route
5. Update the checklist above when a feature is complete

When in doubt about a decision, ask before building. It is faster to clarify than to refactor.
