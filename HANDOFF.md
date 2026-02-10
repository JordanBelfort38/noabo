# 📋 No Abo — Project Handoff for Claude Code

> **Generated:** February 10, 2025
> **Last successful build:** 40 routes, 0 errors ✅
> **Current phase:** Phase 5 complete, Phase 5D (UI redesign) complete

---

## 1. 🎯 PROJECT OVERVIEW

**Project Name:** No Abo ("No Subscription")
**Purpose:** French subscription management platform that helps users track, manage, and cancel recurring subscriptions. Users connect their bank accounts (or upload statements), the system detects subscriptions automatically, and provides step-by-step cancellation guides with legal letter templates.

**Target Users:** French consumers who want to:
- See all their subscriptions in one place
- Detect hidden/forgotten subscriptions from bank transactions
- Cancel subscriptions easily with guided processes
- Track cancellation requests
- Save money by identifying alternatives

**Value Proposition:** "Reprenez le contrôle de vos dépenses récurrentes" (Take back control of your recurring expenses)

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5.x |
| React | React | 19.2.3 |
| Styling | Tailwind CSS | v4 |
| UI Components | Shadcn/ui (manual) | Custom |
| ORM | Prisma | v7.3.0 |
| DB Adapter | @prisma/adapter-pg | v7.3.0 |
| Database | PostgreSQL | 17 (local) |
| Auth | NextAuth.js | v5.0.0-beta.30 |
| Validation | Zod | v4.3.6 |
| Charts | Recharts | v3.7.0 |
| Icons | Lucide React | v0.563.0 |
| Forms | React Hook Form | v7.71.1 |
| Date utils | date-fns | v4.1.0 |
| CSV parsing | PapaParse | v5.5.3 |
| PDF parsing | pdf-parse | v2.4.5 |
| Passwords | bcryptjs | v3.0.3 |

---

## 2. ✅ COMPLETED PHASES

### Phase 1 — Project Setup ✅
- Next.js 16 project initialized with App Router
- TypeScript, Tailwind CSS v4, ESLint configured
- PostgreSQL 17 database (`noabo`) set up locally
- Prisma v7 with `@prisma/adapter-pg` driver adapter configured
- Shadcn/ui components manually created

### Phase 2 — Authentication ✅
**Objective:** Complete user auth system with GDPR compliance

**Implemented:**
- Email/password registration with bcrypt hashing
- Login with NextAuth.js Credentials provider (+ Google/GitHub stubs)
- JWT session strategy with user ID in token
- Password reset flow (token-based)
- Email verification tokens
- Profile management (name update, password change, account deletion)
- GDPR consent tracking
- Rate limiting on auth endpoints
- Protected route wrapper component

**Key Files:**
- `src/auth.ts` — NextAuth configuration
- `src/lib/password.ts` — bcrypt hash/verify
- `src/lib/validations.ts` — Zod schemas for all forms
- `src/lib/tokens.ts` — Verification & password reset token generation
- `src/lib/rate-limit.ts` — In-memory rate limiter
- `src/lib/api-auth.ts` — `requireAuth()` helper for API routes
- `src/components/auth/LoginForm.tsx` — Login form with callbackUrl
- `src/components/auth/RegisterForm.tsx` — Registration with GDPR consent
- `src/components/auth/PasswordStrengthIndicator.tsx` — Visual password strength
- `src/components/auth/ProtectedRoute.tsx` — Client-side auth guard
- `src/components/Header.tsx` — Navigation with auth state

**Pages:**
- `/login` — Login page
- `/register` — Registration page
- `/forgot-password` — Password reset request
- `/reset-password/[token]` — Password reset with token
- `/profile` — User profile management
- `/privacy` — Privacy policy (GDPR)
- `/terms` — Terms of service

**DB Models:** User, Account, Session, VerificationToken, PasswordResetToken

### Phase 3 — Bank Connection & Transactions ✅
**Objective:** Connect bank accounts and import transactions

**Implemented:**
- Bridge API integration with mock mode (no real API key needed for dev)
- OAuth-style bank connection flow
- CSV parser (French bank formats: semicolon-separated, comma decimals)
- OFX parser (standard banking format)
- PDF parser (basic bank statement extraction, uses `require()` for ESM compat)
- Transaction normalizer with 70+ merchant patterns and 10 categories
- File upload endpoint (multipart form data)
- Bank account management (connect, disconnect, sync)

**Key Files:**
- `src/lib/bank-api.ts` — Bridge API client (server-only, mock mode)
- `src/lib/bank-constants.ts` — Client-safe bank data (names, logos)
- `src/lib/parsers/csv-parser.ts` — CSV bank statement parser
- `src/lib/parsers/ofx-parser.ts` — OFX format parser
- `src/lib/parsers/pdf-parser.ts` — PDF bank statement parser
- `src/lib/transaction-normalizer.ts` — Merchant name normalization (70+ patterns)
- `src/lib/encryption.ts` — AES-256-GCM for bank tokens
- `src/components/bank/BankConnectionCard.tsx` — Bank connection display
- `src/components/bank/TransactionTable.tsx` — Transaction list with filters

**Pages:**
- `/dashboard/bank` — Bank connections overview
- `/dashboard/bank/connect` — Connect new bank
- `/dashboard/transactions` — Transaction list with search/filter
- `/help/export-bank-statement` — Help page for exporting statements

**DB Models:** BankConnection, BankAccount, Transaction

### Phase 4 — Subscription Detection & Dashboard ✅
**Objective:** Auto-detect subscriptions from transactions, build dashboard

**Implemented:**
- Subscription detection algorithm:
  - Groups transactions by normalized merchant name
  - Detects frequency patterns (weekly → annual)
  - Confidence scoring 0-100 (threshold ≥60 to suggest)
  - Calculates next charge dates
- Savings calculator with alternatives database
- Renewal tracker (upcoming charges, alerts)
- Full CRUD for subscriptions
- Dashboard with Recharts (spending chart, category breakdown)
- Subscription confirmation flow (user validates detected subscriptions)
- Alert system for upcoming renewals

**Key Files:**
- `src/lib/subscription-detector.ts` — Detection algorithm (10KB, core logic)
- `src/lib/savings-calculator.ts` — Savings estimates with alternatives DB
- `src/lib/renewal-tracker.ts` — Upcoming renewal calculations
- `src/components/subscriptions/SubscriptionCard.tsx` — Subscription display card
- `src/components/subscriptions/SubscriptionForm.tsx` — Add/edit subscription form
- `src/components/subscriptions/EmptyState.tsx` — Empty state component
- `src/components/alerts/AlertBanner.tsx` — Renewal alert banner
- `src/components/charts/SpendingChart.tsx` — Monthly spending chart
- `src/components/charts/CategoryChart.tsx` — Category breakdown chart

**Pages:**
- `/dashboard` — Main dashboard with stats, charts, quick links
- `/dashboard/subscriptions/new` — Add subscription manually
- `/dashboard/subscriptions/[id]` — Subscription detail
- `/dashboard/subscriptions/[id]/edit` — Edit subscription

**DB Models:** Subscription

### Phase 5 — Cancellation System ✅
**Objective:** Cancellation templates, letter generation, request tracking

**Implemented:**
- 22 French service cancellation templates (seeded):
  - **Streaming:** Netflix, Spotify, Amazon Prime, Disney+, Canal+, Deezer, YouTube Premium
  - **Software:** Apple, Microsoft 365, Adobe Creative Cloud, NordVPN, ChatGPT Plus
  - **Telecom:** Free Mobile, Free (Freebox), Orange, SFR, Bouygues Telecom
  - **Health:** Basic-Fit, Fitness Park
  - **Housing:** EDF
  - **Insurance:** MAIF, AXA
- French legal letter templates (Loi Hamon / Loi Chatel)
- Email and postal letter generators with variable substitution
- Cancellation request CRUD (create, track, update status)
- Step-by-step cancellation guides per service
- "Résilier" button added to subscription cards and detail pages

**Key Files:**
- `src/lib/letter-generator.ts` — Letter/email text generation with variable replacement
- `prisma/seed-templates.ts` — Seed script for 22 cancellation templates
- `src/components/cancellation/CancellationGuide.tsx` — Full cancellation guide (OverClarity design)
- `src/components/cancellation/CancellationStepper.tsx` — Interactive step checklist

**Pages:**
- `/dashboard/subscriptions/[id]/cancel` — Cancellation guide for a subscription
- `/dashboard/cancellations` — Cancellation request tracking
- `/help/cancel` — Public service directory (searchable)
- `/help/cancel/[merchant]` — Public service-specific cancellation guide

**DB Models:** CancellationTemplate, CancellationRequest

### Phase 5D — UI Redesign (OverClarity-Inspired) ✅
**Objective:** Redesign cancellation UI with modern SaaS aesthetic

**Applied design language:**
- Gradient accents (blue→indigo, red→orange, emerald→teal)
- Pastel method cards with icons and time estimates
- Rounded-2xl cards with soft shadows on hover
- Generous whitespace, bold typography with gradient text headings
- Pill badges with dot indicators for status/difficulty
- Filter pills (dark active, light inactive)
- Status timeline mini-component (dot + line progress)
- FAQ accordion on help pages
- Stat cards in hero sections

---

## 3. 📁 PROJECT STRUCTURE

```
no-abo/
├── prisma/
│   ├── schema.prisma          # All 10 Prisma models
│   └── seed-templates.ts      # Seed 22 cancellation templates
├── prisma.config.ts           # Prisma config (dotenv, migrations path)
├── src/
│   ├── auth.ts                # NextAuth v5 config (Credentials + Google/GitHub)
│   ├── types/
│   │   └── next-auth.d.ts     # Session type augmentation (adds user.id)
│   ├── generated/
│   │   └── prisma/            # Generated Prisma client (import from @/generated/prisma/client)
│   ├── lib/
│   │   ├── prisma.ts          # Singleton PrismaClient with PrismaPg adapter
│   │   ├── api-auth.ts        # requireAuth() helper for API routes
│   │   ├── password.ts        # bcrypt hash/verify
│   │   ├── encryption.ts      # AES-256-GCM encrypt/decrypt for bank tokens
│   │   ├── tokens.ts          # Email verification & password reset tokens
│   │   ├── rate-limit.ts      # In-memory rate limiter
│   │   ├── validations.ts     # Zod v4 schemas (register, login, profile, etc.)
│   │   ├── utils.ts           # cn() utility (clsx + tailwind-merge)
│   │   ├── bank-api.ts        # Bridge API client (server-only, mock mode)
│   │   ├── bank-constants.ts  # Client-safe bank data
│   │   ├── parsers/
│   │   │   ├── csv-parser.ts  # CSV bank statement parser
│   │   │   ├── ofx-parser.ts  # OFX format parser
│   │   │   └── pdf-parser.ts  # PDF statement parser (uses require())
│   │   ├── transaction-normalizer.ts  # 70+ merchant patterns, 10 categories
│   │   ├── subscription-detector.ts   # Frequency detection, confidence scoring
│   │   ├── savings-calculator.ts      # Alternatives DB, savings estimates
│   │   ├── renewal-tracker.ts         # Upcoming charge calculations
│   │   └── letter-generator.ts        # French legal letter/email generation
│   ├── components/
│   │   ├── Header.tsx                 # Main navigation header
│   │   ├── ui/                        # Shadcn/ui components (manually created)
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── separator.tsx
│   │   │   └── tabs.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── PasswordStrengthIndicator.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── bank/
│   │   │   ├── BankConnectionCard.tsx
│   │   │   └── TransactionTable.tsx
│   │   ├── subscriptions/
│   │   │   ├── SubscriptionCard.tsx
│   │   │   ├── SubscriptionForm.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── cancellation/
│   │   │   ├── CancellationGuide.tsx   # OverClarity-inspired design
│   │   │   └── CancellationStepper.tsx # Interactive checkable steps
│   │   ├── charts/
│   │   │   ├── SpendingChart.tsx
│   │   │   └── CategoryChart.tsx
│   │   └── alerts/
│   │       └── AlertBanner.tsx
│   └── app/
│       ├── layout.tsx           # Root layout (SessionProvider, Header, Geist font)
│       ├── page.tsx             # Redirect: auth→/dashboard, unauth→/login
│       ├── globals.css          # Tailwind v4 import + CSS variables
│       ├── login/page.tsx
│       ├── register/page.tsx
│       ├── forgot-password/page.tsx
│       ├── reset-password/[token]/page.tsx
│       ├── profile/page.tsx
│       ├── privacy/page.tsx
│       ├── terms/page.tsx
│       ├── help/
│       │   ├── export-bank-statement/page.tsx
│       │   ├── cancel/page.tsx              # Public service directory
│       │   └── cancel/[merchant]/page.tsx   # Public service-specific guide
│       ├── dashboard/
│       │   ├── page.tsx                     # Main dashboard (stats, charts)
│       │   ├── bank/page.tsx
│       │   ├── bank/connect/page.tsx
│       │   ├── transactions/page.tsx
│       │   ├── subscriptions/new/page.tsx
│       │   ├── subscriptions/[id]/page.tsx
│       │   ├── subscriptions/[id]/edit/page.tsx
│       │   ├── subscriptions/[id]/cancel/page.tsx
│       │   └── cancellations/page.tsx
│       └── api/
│           ├── auth/[...nextauth]/route.ts
│           ├── auth/register/route.ts
│           ├── auth/forgot-password/route.ts
│           ├── auth/reset-password/route.ts
│           ├── auth/verify/route.ts
│           ├── auth/profile/route.ts
│           ├── auth/change-password/route.ts
│           ├── bank/connect/route.ts
│           ├── bank/callback/route.ts
│           ├── bank/connections/route.ts
│           ├── bank/disconnect/route.ts
│           ├── bank/sync/route.ts
│           ├── bank/transactions/route.ts
│           ├── bank/upload/route.ts
│           ├── subscriptions/route.ts
│           ├── subscriptions/[id]/route.ts
│           ├── subscriptions/[id]/confirm/route.ts
│           ├── subscriptions/detect/route.ts
│           ├── subscriptions/stats/route.ts
│           ├── subscriptions/alerts/route.ts
│           ├── savings/route.ts
│           ├── cancellation/templates/route.ts
│           ├── cancellation/templates/[merchantName]/route.ts
│           ├── cancellation/requests/route.ts
│           ├── cancellation/requests/[id]/route.ts
│           └── cancellation/letter/route.ts
├── package.json
├── tsconfig.json
├── next.config.ts
├── prisma.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── CLAUDE.md                    # Project instructions for Claude
```

---

## 4. 💾 DATABASE SCHEMA

### Models (10 total)

#### User
```prisma
model User {
  id, name?, email (unique), emailVerified?, image?, password?,
  gdprConsent, gdprConsentAt?, createdAt, updatedAt
  → accounts[], sessions[], bankConnections[], bankAccounts[],
    transactions[], subscriptions[], cancellationRequests[]
}
```

#### Account (OAuth)
```prisma
model Account {
  id, userId, type, provider, providerAccountId,
  refresh_token?, access_token?, expires_at?, token_type?, scope?, id_token?, session_state?
  @@unique([provider, providerAccountId])
}
```

#### Session
```prisma
model Session { id, sessionToken (unique), userId, expires }
```

#### VerificationToken
```prisma
model VerificationToken { identifier, token (unique), expires @@unique([identifier, token]) }
```

#### PasswordResetToken
```prisma
model PasswordResetToken { id, email, token (unique), expires @@index([email]) }
```

#### BankConnection
```prisma
model BankConnection {
  id, userId, provider ("bridge"/"tink"/"manual"), providerItemId?,
  accessToken? (encrypted), refreshToken? (encrypted),
  status ("active"/"error"/"expired"/"revoked"),
  consentExpiresAt?, lastSyncAt?, lastSyncError?, bankName?, bankLogoUrl?
  → bankAccounts[]
}
```

#### BankAccount
```prisma
model BankAccount {
  id, userId, bankConnectionId?, providerAccountId?, name, iban?,
  currency ("EUR"), balance? (cents), balanceDate?,
  accountType ("checking"/"savings"/"card")
  → transactions[]
}
```

#### Transaction
```prisma
model Transaction {
  id, userId, bankAccountId?, externalId?, date, description, rawDescription?,
  amount (cents, negative=debit), currency ("EUR"), category?,
  merchantName? (normalized), importSource ("api"/"csv"/"pdf"/"ofx"/"manual"),
  importDate, isRecurring, metadata? (JSON)
  @@unique([userId, externalId])
  @@index([userId, date]), @@index([userId, merchantName]), @@index([userId, isRecurring])
}
```

#### Subscription
```prisma
model Subscription {
  id, userId, merchantName, displayName?, amount (cents, positive),
  currency ("EUR"), frequency (WEEKLY→ANNUAL), category?,
  status ("ACTIVE"/"PAUSED"/"CANCELED"/"ENDING_SOON"),
  confidence (0-100), nextChargeDate?, lastChargeDate?, firstChargeDate?,
  commitmentEndDate?, cancellationUrl?, notes?, transactionIds[]
  → cancellationRequests[]
}
```

#### CancellationTemplate
```prisma
model CancellationTemplate {
  id, merchantName (unique), displayName, category,
  onlineUrl?, emailAddress?, phoneNumber?, postalAddress?,
  difficulty ("EASY"/"MEDIUM"/"HARD"), requiresCall, requiresLetter,
  noticeRequired? (days), emailTemplate? (Text), letterTemplate? (Text),
  steps[], requirements[], tips[],
  lawReference? ("Loi Hamon"/"Loi Chatel"), contractType?
}
```

#### CancellationRequest
```prisma
model CancellationRequest {
  id, userId, subscriptionId,
  status ("PENDING"/"SENT"/"CONFIRMED"/"CANCELLED"/"FAILED"),
  method ("EMAIL"/"PHONE"/"LETTER"/"ONLINE"),
  sentAt?, confirmedAt?, effectiveDate?, notes? (Text), confirmationFile?
}
```

### Migration Status
⚠️ **No migrations directory found.** The project appears to use `prisma db push` for schema sync rather than formal migrations. Run `npx prisma db push` after any schema changes.

---

## 5. 🔌 API ROUTES (26 endpoints)

### Auth (7 routes) — Mixed auth requirements
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| * | `/api/auth/[...nextauth]` | No | NextAuth handler (login, logout, session) |
| POST | `/api/auth/register` | No | User registration with GDPR consent |
| POST | `/api/auth/forgot-password` | No | Send password reset email |
| POST | `/api/auth/reset-password` | No | Reset password with token |
| POST | `/api/auth/verify` | No | Verify email with token |
| GET/PATCH/DELETE | `/api/auth/profile` | ✅ | Get/update/delete user profile |
| POST | `/api/auth/change-password` | ✅ | Change password (requires current) |

### Bank (7 routes) — All require auth ✅
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/bank/connect` | Initiate bank connection (Bridge API) |
| GET | `/api/bank/callback` | OAuth callback from bank provider |
| GET | `/api/bank/connections` | List user's bank connections |
| POST | `/api/bank/disconnect` | Disconnect a bank |
| POST | `/api/bank/sync` | Sync transactions from bank API |
| GET | `/api/bank/transactions` | List transactions with filters |
| POST | `/api/bank/upload` | Upload bank statement (CSV/PDF/OFX) |

### Subscriptions (6 routes) — All require auth ✅
| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/subscriptions` | List all / create subscription |
| GET/PATCH/DELETE | `/api/subscriptions/[id]` | Get/update/delete subscription |
| POST | `/api/subscriptions/[id]/confirm` | Confirm detected subscription |
| POST | `/api/subscriptions/detect` | Run detection algorithm on transactions |
| GET | `/api/subscriptions/stats` | Subscription statistics |
| GET | `/api/subscriptions/alerts` | Upcoming renewal alerts |

### Savings (1 route) — Requires auth ✅
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/savings` | Calculate potential savings with alternatives |

### Cancellation (5 routes) — Mixed auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/cancellation/templates` | No | List all templates (filterable) |
| GET | `/api/cancellation/templates/[merchantName]` | No | Get template by merchant |
| GET/POST | `/api/cancellation/requests` | ✅ | List/create cancellation requests |
| GET/PATCH/DELETE | `/api/cancellation/requests/[id]` | ✅ | Manage a cancellation request |
| POST | `/api/cancellation/letter` | ✅ | Generate cancellation letter text |

---

## 6. 📄 FRONTEND PAGES (20 pages)

### Public Pages (no auth required)
| Route | Description |
|-------|-------------|
| `/` | Redirect: auth→`/dashboard`, unauth→`/login` |
| `/login` | Login form |
| `/register` | Registration form with GDPR consent |
| `/forgot-password` | Password reset request |
| `/reset-password/[token]` | Password reset form |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/help/export-bank-statement` | Help: how to export bank statements |
| `/help/cancel` | Public cancellation service directory (searchable) |
| `/help/cancel/[merchant]` | Public service-specific cancellation guide |

### Protected Pages (require auth — wrapped in `<ProtectedRoute>`)
| Route | Description |
|-------|-------------|
| `/profile` | User profile management |
| `/dashboard` | Main dashboard (stats, charts, quick links) |
| `/dashboard/bank` | Bank connections overview |
| `/dashboard/bank/connect` | Connect new bank account |
| `/dashboard/transactions` | Transaction list with search/filter |
| `/dashboard/subscriptions/new` | Add subscription manually |
| `/dashboard/subscriptions/[id]` | Subscription detail |
| `/dashboard/subscriptions/[id]/edit` | Edit subscription |
| `/dashboard/subscriptions/[id]/cancel` | Cancellation guide (OverClarity design) |
| `/dashboard/cancellations` | Cancellation request tracking |

---

## 7. ✅ FEATURES STATUS

| Feature | Status | Notes |
|---------|--------|-------|
| User registration | ✅ Working | Email/password, GDPR consent, bcrypt |
| User login | ✅ Working | Credentials provider, JWT sessions |
| User logout | ✅ Working | Via NextAuth |
| Password reset | ✅ Working | Token-based flow |
| Email verification | ⚠️ Partial | Tokens generated but no email sending (no Resend/SMTP configured) |
| Profile management | ✅ Working | Name update, password change, account deletion |
| Bank connection (API) | ⚠️ Partial | Bridge API integrated but in **mock mode** (no real API key) |
| Bank statement upload | ✅ Working | CSV, OFX, PDF parsers implemented |
| Transaction list/filter | ✅ Working | Search, category filter, date range |
| Transaction normalization | ✅ Working | 70+ merchant patterns, 10 categories |
| Subscription detection | ✅ Working | Frequency analysis, confidence scoring |
| Subscription CRUD | ✅ Working | Create, read, update, delete, confirm |
| Dashboard with charts | ✅ Working | Recharts (spending + category breakdown) |
| Renewal alerts | ✅ Working | Upcoming charge notifications |
| Savings calculator | ✅ Working | Alternatives database with estimates |
| Cancellation templates | ✅ Working | 22 French services seeded |
| Cancellation guides | ✅ Working | Step-by-step with OverClarity design |
| Letter/email generation | ✅ Working | French legal templates (Loi Hamon/Chatel) |
| Cancellation request tracking | ✅ Working | Status timeline, filter pills |
| PDF letter download | ⚠️ Partial | Text generation works, actual PDF file generation not implemented |
| Help pages (public) | ✅ Working | Service directory + per-merchant guides |

---

## 8. 🐛 KNOWN ISSUES & LIMITATIONS

### Bugs
- **No known build errors** — Last build: 40 routes, 0 errors
- **No runtime errors reported** in current session

### Missing / Incomplete
1. **Email sending not configured** — Password reset and email verification generate tokens but don't actually send emails. Need to integrate Resend, SendGrid, or SMTP.
2. **Bridge API in mock mode** — `bank-api.ts` has a mock mode flag. Real bank connection requires a Bridge API key and production setup.
3. **PDF letter generation** — The letter generator creates text content but doesn't generate actual downloadable PDF files. Only text/copy is available.
4. **No formal Prisma migrations** — Using `prisma db push` instead of `prisma migrate`. Should set up proper migrations for production.
5. **No tests** — No unit tests, integration tests, or E2E tests exist.
6. **No email templates** — Password reset emails are not styled/sent.
7. **Google/GitHub OAuth** — Providers are configured in `auth.ts` but no client IDs are set up.
8. **No middleware.ts** — No Next.js middleware for route protection (relies on client-side `ProtectedRoute` component and API-level `requireAuth()`).
9. **`proxy.ts`** at project root — Purpose unclear, may be leftover.
10. **`nul`** file at project root — Likely accidental, can be deleted.

### Technical Debt
- Shadcn/ui components are manually created (not using CLI) — may drift from upstream
- No error boundary components
- No loading.tsx or error.tsx files in app routes
- No SEO metadata on individual pages (only root layout)
- No sitemap.xml or robots.txt
- Dark mode support is CSS-only (no toggle, relies on `prefers-color-scheme`)

---

## 9. 🔧 ENVIRONMENT SETUP

### Required Environment Variables (`.env.local`)
```env
# Database
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/noabo"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Encryption (for bank tokens) — 64-char hex string (32 bytes)
ENCRYPTION_KEY="your-64-character-hex-string-here"

# OAuth (optional — not yet configured)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Bridge API (optional — mock mode works without)
BRIDGE_CLIENT_ID=""
BRIDGE_CLIENT_SECRET=""
BRIDGE_API_URL="https://api.bridgeapi.io"

# Email (not yet configured)
RESEND_API_KEY=""
```

### External Services
| Service | Status | Purpose |
|---------|--------|---------|
| PostgreSQL 17 | ✅ Required | Local DB at `localhost:5432/noabo` |
| Bridge API | ⚠️ Optional | Bank connection (mock mode available) |
| Resend/SMTP | ❌ Not configured | Email sending |
| Google OAuth | ❌ Not configured | Social login |
| GitHub OAuth | ❌ Not configured | Social login |

### Setup Commands
```bash
# Install dependencies
npm install

# Generate Prisma client (REQUIRED after clone)
npx prisma generate

# Push schema to database
npx prisma db push

# Seed cancellation templates (22 services)
npx tsx prisma/seed-templates.ts

# Run development server
npm run dev

# Build for production
npm run build
```

### Database Setup (PostgreSQL 17 on Windows)
```bash
# PostgreSQL is at: C:\Program Files\PostgreSQL\17\bin
# Database name: noabo
# Create database if needed:
createdb -U postgres noabo
```

---

## 10. 📋 NEXT STEPS (Prioritized)

### High Priority
1. **Add proper Prisma migrations** — Switch from `db push` to `prisma migrate` for production safety
2. **Configure email sending** — Integrate Resend or similar for password reset and email verification
3. **Add Next.js middleware** — Server-side route protection instead of client-only `ProtectedRoute`
4. **PDF letter generation** — Generate actual downloadable PDF files for cancellation letters
5. **Add loading/error states** — Create `loading.tsx` and `error.tsx` for app routes
6. **Write tests** — Unit tests for detection algorithm, parsers, letter generator; E2E for auth flows

### Medium Priority
7. **Real bank API integration** — Configure Bridge API with real credentials
8. **Google/GitHub OAuth** — Set up OAuth apps and configure credentials
9. **Dark mode toggle** — Add explicit dark/light mode switch (currently CSS-only)
10. **SEO optimization** — Add metadata to all pages, create sitemap.xml, robots.txt
11. **Error boundaries** — Add React error boundaries for graceful error handling
12. **Notification system** — Email notifications for renewal alerts, cancellation confirmations

### Low Priority
13. **Landing page** — Create a proper public landing page (currently just redirects)
14. **Onboarding flow** — Guide new users through bank connection and subscription detection
15. **Multi-language support** — Currently French-only, could add i18n
16. **PWA support** — Add service worker for offline access
17. **Export data** — Allow users to export their subscription data (CSV/PDF)
18. **Admin panel** — Manage templates, view user stats

---

## 11. 🧪 TESTING STATUS

| Area | Status |
|------|--------|
| Unit tests | ❌ None |
| Integration tests | ❌ None |
| E2E tests | ❌ None |
| Build verification | ✅ `npm run build` passes (40 routes, 0 errors) |
| Lint | ✅ ESLint configured |
| Manual testing | ⚠️ Basic flows tested during development |

### What Needs Testing
- Auth flows (register, login, password reset)
- Subscription detection algorithm (edge cases)
- CSV/OFX/PDF parsers (various bank formats)
- Cancellation request lifecycle (PENDING → SENT → CONFIRMED)
- Letter generator variable substitution
- API route error handling and validation
- Responsive design on mobile

---

## 12. ⚠️ IMPORTANT NOTES FOR CLAUDE CODE

### Critical Technical Gotchas

1. **Prisma v7 requires driver adapter:**
   ```typescript
   // CORRECT — src/lib/prisma.ts
   import { PrismaClient } from "@/generated/prisma/client";
   import { PrismaPg } from "@prisma/adapter-pg";
   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
   const prisma = new PrismaClient({ adapter });
   ```
   **Never** use `new PrismaClient()` without the adapter.

2. **Prisma client import path:**
   ```typescript
   // CORRECT
   import { PrismaClient } from "@/generated/prisma/client";
   // WRONG
   import { PrismaClient } from "@prisma/client";
   ```

3. **Zod v4 syntax:**
   ```typescript
   // CORRECT (Zod v4)
   z.literal(true, { error: "Message" })
   // WRONG (Zod v3)
   z.literal(true, { errorMap: () => ({ message: "Message" }) })
   ```

4. **pdf-parse must use require():**
   ```typescript
   // CORRECT
   const pdfParse = require("pdf-parse");
   // WRONG (ESM issues with Next.js)
   import pdfParse from "pdf-parse";
   ```

5. **Recharts Tooltip formatter:**
   ```typescript
   // Params can be undefined, always use ?? operator
   formatter={(value) => `${(value ?? 0).toLocaleString("fr-FR")} €`}
   ```

6. **Seed scripts pattern:**
   ```typescript
   import "dotenv/config";
   import { PrismaClient } from "../src/generated/prisma/client";
   import { PrismaPg } from "@prisma/adapter-pg";
   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
   const prisma = new PrismaClient({ adapter });
   ```

7. **All amounts are stored in cents** (integers). Display with `amount / 100`.

8. **All UI text must be in French.**

9. **Shadcn/ui components are manually created** in `src/components/ui/`. Don't use `npx shadcn-ui add` — create/edit files directly.

10. **Tailwind CSS v4** — Uses `@import "tailwindcss"` in globals.css, not `@tailwind base/components/utilities`.

### Design Decisions
- **JWT sessions** (not database sessions) for NextAuth — simpler, stateless
- **Client-side route protection** via `<ProtectedRoute>` wrapper + API-level `requireAuth()`
- **Mock mode for bank API** — allows development without real bank credentials
- **Amounts in cents** — avoids floating point issues
- **Transaction normalization** — 70+ regex patterns map raw bank descriptions to clean merchant names
- **Subscription detection** — confidence threshold of 60/100 to suggest, user must confirm
- **OverClarity design language** — pastel gradients, rounded-2xl, generous whitespace, gradient text headings

### Code Conventions
- TypeScript strict mode
- `"use client"` directive on all interactive components
- API routes use `requireAuth()` from `src/lib/api-auth.ts`
- Zod validation on all API inputs
- French text for all user-facing strings
- Tailwind utility classes (no CSS modules)
- Lucide icons throughout
- `cn()` utility for conditional class merging

---

## 📊 Quick Stats

| Metric | Value |
|--------|-------|
| Total routes | 40 |
| API endpoints | 26 |
| Frontend pages | 20 |
| React components | 25 |
| Prisma models | 10 |
| Cancellation templates | 22 |
| Merchant patterns | 70+ |
| Build errors | 0 |
| Test coverage | 0% |
