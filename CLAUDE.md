# DealSpace — CLAUDE.md

Authoritative reference for Claude when working in this repository.
Read this before touching any file. Everything here reflects the live codebase after Sprints 1–44.9.

---

## 1. Project Overview

**DealSpace** is a B2B SaaS for Israeli freelancers and agencies to create interactive proposals ("Deal Rooms") that clients can view, customize, and electronically sign — replacing static PDFs.

**Live URL:** Deployed on Vercel, auto-deploys from `main`.
**Supabase project ref:** `aefyytktbpynkbxhzhyt`
**Primary market:** Israel (Hebrew-first, ILS default, RTL layout).

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Build | Vite | ^8.0 |
| UI | React | ^19.2 |
| Language | TypeScript | ~5.9 (strict) |
| Styling | Tailwind CSS | ^3.4 |
| Animation | Framer Motion | ^12.38 |
| Smooth Scroll | Lenis | ^1.3.21 |
| Routing | react-router-dom | ^7.13 |
| State | Zustand | ^5.0 |
| Backend | Supabase JS | ^2.100 |
| Icons | Lucide React | ^1.7 |
| PDF | @react-pdf/renderer | ^4.3 |
| Rich Text | TipTap | ^2.x |
| Confetti | canvas-confetti | ^1.x |

**Removed:** `react-signature-canvas` — replaced with a native canvas implementation using pointer events and `quadraticCurveTo` for smooth strokes.

**No** Redux, MUI, Chakra, styled-components, or class-based components.

---

## 3. Commands

```bash
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # tsc -b && vite build  (CI uses this — must pass)
npm run type-check   # tsc --noEmit  (looser than tsc -b)
npm run migrate      # Push pending Supabase migrations via supabase db push
npm run lint         # ESLint
```

**Always run `npx tsc -b` (not `tsc --noEmit`) before committing.** The `-b` flag is stricter and matches what CI runs. Local `--noEmit` can silently pass while CI fails.

---

## 4. Critical TypeScript Rules

These have caused CI failures before — never violate them:

### 4.1 Framer Motion `ease`
```tsx
// ❌ BREAKS tsc -b — number[] not assignable to Easing
transition={{ ease: [0.22, 1, 0.36, 1] }}

// ✅ Correct
transition={{ ease: 'easeOut' as const }}
transition={{ ease: 'easeInOut' as const }}
```

### 4.2 Framer Motion `Variants`
Always import and type `Variants` explicitly. Inline objects with a `transition` inside a variant key fail `tsc -b`.
```tsx
import { type Variants } from 'framer-motion'

const myVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}
```

### 4.3 No `as object` casts on motion props
```tsx
// ❌ Causes type errors in FM v12
whileHover={{ scale: 1.02 } as object}

// ✅ Pass the object directly
whileHover={{ scale: 1.02 }}
```

### 4.4 React StrictMode — DISABLED
`main.tsx` does NOT use `<React.StrictMode>`. Framer Motion v12 has a double-invoke bug in dev mode under StrictMode. Do not re-enable it.

### 4.5 `ProposalInsert` must include all required fields
`payment_milestones` is required (non-optional) on `ProposalInsert`. Any `BLANK_DRAFT` constant or default object must include `payment_milestones: []`. Missing it causes `tsc -b` to fail with a "property missing" error, which has broken CI before.

### 4.6 Combining two `useMotionValue`s with `useTransform`
The tuple overload requires `as const` on the array argument, and the transformer callback must be typed explicitly:
```tsx
// ❌ TypeScript cannot infer element types
const combined = useTransform([a, b], ([x, y]) => x + y)

// ✅ Correct
const combined = useTransform([a, b] as const, ([x, y]: number[]) => x + y)
```

---

## 5. File & Folder Map

```
src/
├── pages/
│   ├── LandingPage.tsx      # / — marketing page, bilingual He/En, Awwwards-level design
│   ├── Auth.tsx             # /auth — Linear.app style, pure black bg, glassmorphism card
│   ├── AuthCallback.tsx     # /auth/callback — Supabase PKCE redirect handler
│   ├── ResetPassword.tsx    # /auth/reset-password — password reset flow
│   ├── Dashboard.tsx        # /dashboard — KPI cards, grid/list/kanban views, filter/sort bar; DunningBanner when billing_status=past_due
│   ├── ProposalBuilder.tsx  # /proposals/new + /proposals/:id — split-screen editor
│   ├── DealRoom.tsx         # /deal/:token — public, no auth, full client-facing flow
│   ├── Profile.tsx          # /profile — identity, avatar, password, business info, brand color, company logo, VAT, global business terms
│   ├── ServicesLibrary.tsx  # /services — services catalog CRUD (Supabase-backed via useServicesStore)
│   ├── Integrations.tsx     # /integrations — Webhook automations hub; free-tier paywall + paid webhook form
│   ├── Legal.tsx            # /security — security policy page
│   ├── TermsOfService.tsx   # /terms — 12-clause bilingual ToS (Israeli corporate standard)
│   ├── PrivacyPolicy.tsx    # /privacy — 12-clause bilingual Privacy Policy (GDPR + Israeli)
│   ├── AccessibilityStatement.tsx # /accessibility — WCAG 2.2 AA + IS 5568 declaration
│   └── admin/
│       ├── AdminDashboard.tsx   # /admin — founder-only panel; KPI cards, user registry table, filter/sort
│       └── UserOpsDrawer.tsx    # Slide-over drawer for a single user; Radix Tabs (Profile/Billing/Security/Danger)
│
├── components/
│   ├── layout/
│   │   └── AdminRoute.tsx        # Three-layer auth guard: idle spinner → unauthenticated → wrong email → /dashboard
│   ├── builder/
│   │   ├── EditorPanel.tsx       # Left pane: all proposal fields, VAT toggle, milestones, AI Ghostwriter
│   │   ├── LivePreview.tsx       # Right pane: real-time preview, spring-animated total, VAT-aware
│   │   ├── AIGhostwriter.tsx     # AI description generator (contextual, bilingual)
│   │   ├── ReusableServices.tsx  # Pick from saved services library to add to proposal
│   │   ├── RichTextEditor.tsx    # TipTap-based rich text editor (proposal description + Profile business terms)
│   └── ReusableServices.tsx  # Services injection modal — multi-select + bulk inject into proposal
│   ├── deal-room/
│   │   ├── PremiumSliderCard.tsx  # Interactive add-on card with range slider
│   │   ├── CheckoutClimax.tsx     # Sticky bottom bar: animated total, VAT breakdown, signature, CTA
│   │   ├── SignaturePad.tsx       # Native canvas draw signature — NO external dependency
│   │   ├── ClientDetailsForm.tsx  # Client legal identity capture (name, company, tax ID, address, role)
│   │   └── MilestoneTimeline.tsx  # Animated payment schedule — spring-animated amounts
│   ├── dashboard/
│   │   ├── ProposalCard.tsx       # Grid card — Radix DropdownMenu (stopPropagation fix), magnetic tilt, status timeline
│   │   ├── ProposalCardSkeleton   # Loading skeleton
│   │   ├── KanbanBoard.tsx        # Kanban view grouped by status
│   │   └── BottomSheet.tsx        # Mobile bottom sheet
│   ├── onboarding/
│   │   └── GuidedTour.tsx         # First-run highlight tour
│   └── ui/
│       ├── PremiumInputs.tsx      # Shared input primitives (Radix slider, date picker)
│       ├── AccessibilityWidget.tsx # Draggable FAB + fixed panel, 14 a11y controls, IS 5568 / WCAG 2.2 AA
│       ├── HelpCenterDrawer.tsx   # Side drawer with 10 bilingual FAQ items + category filter; controlled via props
│       └── GlobalFooter.tsx       # Self-contained footer (useI18n + useNavigate), dual DOM tree (mobile/desktop)
│
├── stores/
│   ├── useAuthStore.ts        # Zustand: auth state, signIn/Up/Out, updateProfile/Password; useTier() + useBillingStatus() selectors
│   ├── useProposalStore.ts    # Zustand: proposals CRUD with optimistic updates + demo injection
│   ├── useServicesStore.ts    # Zustand: services catalog CRUD (Supabase-backed, optimistic)
│   └── useAccessibilityStore.ts # 14 a11y states, CSS DOM mutations, localStorage persistence (ds:a11y:*)
│
├── lib/
│   ├── supabase.ts            # Supabase client singleton
│   ├── i18n.ts                # Zustand i18n store, He/En translations, dir/lang on <html>
│   ├── pdfEngine.tsx          # @react-pdf/renderer v4 — enterprise White Paper PDF (Cover + Content + Business Terms + Cert), Iron Grid architecture
│   ├── successTemplates.ts    # Post-signature success screen template definitions
│   ├── financialMath.ts       # VAT, rounding, milestone math helpers
│   ├── automations.ts         # triggerPostSignatureAutomations — POSTs deal payload to creator's webhook_url
│   ├── knowledgeBase.ts       # Help Center FAQ items — bilingual KBItem[] with categories
│   └── passwordValidation.ts  # Strength rules (score 1-4, color, label_en/he, rules[])
│
├── types/
│   └── proposal.ts          # Proposal (incl. display_bsd, hide_grand_total, is_document_only, business_terms, signer_ip, signer_user_agent, delivery_email, email_sent_at, email_opened_at),
│                            #   ProposalInsert, AddOn, PaymentMilestone, CreatorInfo, proposalTotal(), STATUS_META, …
│
└── App.tsx                  # BrowserRouter, routes, ProtectedRoute, PublicRoute, AdminRoute, ErrorBoundary

supabase/
├── migrations/
│   ├── 01_proposals_schema.sql        # proposals table, RLS, indexes, updated_at trigger
│   ├── 02_deal_room_rpcs.sql          # mark_proposal_viewed(), accept_proposal()
│   ├── 03_vat_field.sql               # include_vat column + update_proposal_time_spent RPC
│   ├── 04_access_code.sql             # access_code column + get_deal_room_proposal RPC
│   ├── 05_fix_deal_room_rpc.sql       # Adds SET search_path = public, grants to authenticated
│   ├── 06_sprint10.sql                # payment_milestones, client capture fields, brand_color, creator_info + save_client_details RPC
│   ├── 07_sprint11.sql                # success_template column + decline_proposal() RPC
│   ├── 08_xray_section_time.sql       # section_time jsonb column for Deal Room X-Ray analytics
│   ├── 09–14_*.sql                    # Negotiation engine, status timestamps, discount engine, bugfixes
│   ├── 15_storage_avatars_bucket.sql  # avatars Storage bucket + RLS policies
│   ├── 16_services_table.sql          # services table + RLS + index (Sprint 27)
│   ├── 17_archive_proposals.sql       # is_archived column + archive/unarchive RPCs
│   ├── 18_admin_panel_rpcs.sql        # get_admin_users_data() + admin_set_user_tier()
│   ├── 19_admin_pipeline_value.sql    # Adds total_pipeline_value to get_admin_users_data
│   ├── 20_admin_crud.sql              # admin_delete_user() + admin_update_user_profile()
│   ├── 21_admin_apex.sql              # admin_update_user_advanced(), admin_toggle_suspend(), refreshed get_admin_users_data with is_suspended + bonus_quota
│   ├── 22_admin_v2.sql                # admin_save_note(), admin_get_user_proposals(), get_admin_users_data with phone + admin_notes
│   ├── 23_forensic_audit.sql          # signer_ip + signer_user_agent columns; accept_proposal updated with p_ip/p_ua params
│   ├── 24_native_delivery.sql         # delivery_email, email_sent_at, email_opened_at columns + mark_email_opened() RPC
│   ├── 29_lean_market.sql             # display_bsd, hide_grand_total, is_document_only boolean columns (Sprint 43)
│   ├── 30_prices_include_vat.sql      # prices_include_vat boolean column (Sprint 44)
│   └── 31_global_terms.sql            # Drops video_url; adds business_terms TEXT NOT NULL DEFAULT '' (Sprint 44.9)
└── functions/
    ├── admin-impersonate/
    │   └── index.ts                   # Deno edge function — verifies caller JWT, generates magic link via Admin API
    ├── send-proposal/
    │   └── index.ts                   # Sends branded HTML email via Resend; stamps email_sent_at + delivery_email; --no-verify-jwt
    └── stripe-webhook/
        └── index.ts                   # Stripe webhook handler — updates plan_tier + billing_status in user_metadata
```

---

## 6. Routing

```
/                          → LandingPage         (always public)
/auth                      → Auth                (PublicRoute — redirects to /dashboard if authed)
/auth/callback             → AuthCallback        (Supabase PKCE)
/auth/reset-password       → ResetPassword       (public — handles PASSWORD_RECOVERY event)
/dashboard                 → Dashboard           (ProtectedRoute)
/proposals/new             → ProposalBuilder     (ProtectedRoute)
/proposals/:id             → ProposalBuilder     (ProtectedRoute)
/services                  → ServicesLibrary      (ProtectedRoute)
/integrations              → Integrations        (ProtectedRoute — webhook automations hub)
/deal/:token               → DealRoom            (fully public, no auth)
/profile                   → Profile             (ProtectedRoute)
/terms                     → TermsOfService      (always public — 12-clause He/En)
/privacy                   → PrivacyPolicy       (always public — 12-clause He/En)
/security                  → Legal               (always public — security policy)
/accessibility             → AccessibilityStatement (always public — WCAG 2.2 AA)
/admin                     → AdminDashboard        (AdminRoute — founder email only: roychen651@gmail.com)
*                          → redirect to /
```

**`/deal/:token` is intentionally public.** Clients receive this link — never add auth guards to it.

---

## 7. Authentication & Auth Store

### PKCE flow
Supabase is configured with PKCE. Do not switch to implicit flow.

### Auth Store (`useAuthStore`)
```ts
initialize()                          // Call once on app mount — restores session
signInWithEmail(email, password)
signUpWithEmail(email, password, name)
signInWithGoogle()                    // OAuth — redirects browser
sendMagicLink(email)
sendPasswordResetEmail(email)         // Sends link to /auth/reset-password
signOut()
updateProfile({ full_name?, avatar_url? })
updatePassword(newPassword)           // Re-auth before calling this in Profile.tsx
deleteAccount()                       // Calls delete_user_account() RPC
clearError()
```

### Plan tier + billing status selectors

```ts
// Read plan_tier from user_metadata reactively. Defaults to 'free'.
export const useTier = (): PlanTier => useAuthStore(s => {
  const raw = s.user?.user_metadata?.plan_tier as string | undefined
  if (raw === 'pro' || raw === 'unlimited') return raw
  return 'free'
})

// Read billing_status from user_metadata reactively. null = never had a paid subscription.
export const useBillingStatus = (): BillingStatus => useAuthStore(s => {
  const raw = s.user?.user_metadata?.billing_status as string | undefined
  if (raw === 'active' || raw === 'past_due' || raw === 'canceled') return raw
  return null
})

export type PlanTier     = 'free' | 'pro' | 'unlimited'
export type BillingStatus = 'active' | 'past_due' | 'canceled' | null
```

`billing_status` is written exclusively by the `stripe-webhook` edge function via the Supabase Admin API. The client only reads it. Do not write it client-side.

- `'active'` — subscription in good standing
- `'past_due'` — payment failed; proposal creation is locked in the UI (DunningBanner + locked navbar button)
- `'canceled'` — subscription cancelled/expired; tier has already been set back to `'free'`
- `null` — user never had a paid subscription

### Auth status lifecycle
`idle` → `loading` → `authenticated` | `unauthenticated`

The `ProtectedRoute` component renders a spinner on `idle` and `loading`, then redirects or renders.

### Password reset flow
1. `sendPasswordResetEmail(email)` → Supabase sends link → `/auth/reset-password`
2. `ResetPassword.tsx` listens for `onAuthStateChange` event `PASSWORD_RECOVERY`
3. Once event fires (`sessionReady = true`), form enables and calls `updatePassword(newPassword)`

---

## 8. Proposal Store (`useProposalStore`)

All mutations are **optimistic** — UI updates immediately, rolls back on error.

```ts
fetchProposals()                 // SELECT * ordered by created_at desc
createProposal(insert)           // Optimistic prepend → Supabase insert → swap real record
updateProposal(id, partial)      // Optimistic update → Supabase update → rollback on fail
deleteProposal(id)               // Optimistic remove → Supabase delete → rollback on fail
duplicateProposal(id)            // Clones proposal, resets status to 'draft'
injectDemoProposal()             // Inserts a rich demo proposal (localStorage gate: dealspace:demo-injected)
```

`ProposalInsert` = `Proposal` minus server-managed fields: `id, user_id, public_token, view_count, time_spent_seconds, created_at, updated_at`.

### Realtime subscription — UPDATE events

`subscribeRealtime()` listens to `postgres_changes` on the `proposals` table. On `UPDATE` events, **always call `get().fetchProposals()`** — never do an optimistic in-place replace with `newRow`. The Realtime payload sends a partial row that omits JSONB columns (`add_ons`, `payment_milestones`, `creator_info`), so replacing the full proposal with `newRow` silently wipes those fields.

```ts
// ❌ BROKEN — newRow is partial, wipes JSONB fields
if (eventType === 'UPDATE' && newRow) {
  set(s => ({ proposals: s.proposals.map(p =>
    p.id === (newRow as Proposal).id ? (newRow as Proposal) : p
  )}))
}

// ✅ Correct — always re-fetch complete data
if (eventType === 'UPDATE') {
  get().fetchProposals()
}
```

### BroadcastChannel sync

`ProposalBuilder` uses `BroadcastChannel('dealspace:proposals')` for instant same-browser sync (e.g., client signs in one tab, builder in another tab sees the status change). The handler calls `fetchProposals()` on any message — not just `'accepted'` events. ProposalBuilder also has a `visibilitychange` listener that re-fetches when the tab becomes visible again.

---

## 9. Database Schema

### `proposals` table — all columns across all migrations

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | gen_random_uuid() |
| `user_id` | uuid FK | references auth.users, cascade delete |
| `client_name` | text | default '' |
| `client_email` | text | nullable |
| `client_company_name` | text | nullable — captured at signing via save_client_details |
| `client_tax_id` | text | nullable — captured at signing |
| `client_address` | text | nullable — captured at signing |
| `client_signer_role` | text | nullable — captured at signing |
| `project_title` | text | default '' |
| `description` | text | nullable |
| `base_price` | numeric(12,2) | default 0 |
| `currency` | text | default 'ILS' |
| `add_ons` | jsonb | `AddOn[]` — `[{ id, label, description, price, enabled }]` |
| `payment_milestones` | jsonb | `PaymentMilestone[]` — `[{ id, name, percentage }]`, default `[]` |
| `status` | enum | draft / sent / viewed / accepted / rejected |
| `expires_at` | timestamptz | nullable |
| `public_token` | text unique | hex-encoded 16 random bytes |
| `include_vat` | boolean | default false |
| `access_code` | text | nullable — 4-digit code gates the Deal Room |
| `brand_color` | text | nullable — hex color injected as CSS var in Deal Room |
| `creator_info` | jsonb | `CreatorInfo` — business identity auto-injected by EditorPanel |
| `view_count` | integer | default 0 |
| `last_viewed_at` | timestamptz | nullable |
| `time_spent_seconds` | integer | default 0 |
| `display_bsd` | boolean | default false — show בס"ד at top of document (Sprint 43) |
| `hide_grand_total` | boolean | default false — hide grand total from client in Deal Room + PDF (Sprint 43) |
| `is_document_only` | boolean | default false — strips all financial blocks, pure e-signing mode (Sprint 43) |
| `prices_include_vat` | boolean | default false — when true, entered prices already include VAT; system back-calculates pre-VAT (Sprint 44) |
| `business_terms` | text | NOT NULL default '' — creator's global business terms (TipTap HTML), frozen into proposal by EditorPanel useEffect (Sprint 44.9) |
| `is_archived` | boolean | default false — soft-delete, never physically removed |
| `sent_at` | timestamptz | nullable — first transition away from 'draft' |
| `accepted_at` | timestamptz | nullable — when client signed |
| `signer_ip` | text | nullable — client IP captured at signing (Sprint 37) |
| `signer_user_agent` | text | nullable — client browser UA captured at signing (Sprint 37) |
| `delivery_email` | text | nullable — email address the proposal was last sent to (Sprint 39) |
| `email_sent_at` | timestamptz | nullable — when the proposal email was last sent (Sprint 39) |
| `email_opened_at` | timestamptz | nullable — when the client first opened the email link (Sprint 39) |
| `created_at` | timestamptz | now() |
| `updated_at` | timestamptz | auto-updated via trigger |

### RLS Policies (proposals)
- `owner_select / owner_insert / owner_update / owner_delete` — `auth.uid() = user_id`
- `public_token_select` — `public_token IS NOT NULL` (lets anyone read via token — required for Deal Room)

### `services` table (Sprint 27 — migration 16)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | gen_random_uuid() |
| `user_id` | uuid FK | references auth.users, cascade delete |
| `label` | text | service name, required |
| `description` | text | nullable |
| `price` | numeric(12,2) | pre-VAT price, default 0 |
| `created_at` | timestamptz | now() |

RLS: `services_owner_select / insert / update / delete` — `auth.uid() = user_id` (owner-only, no public access). Index: `(user_id, created_at DESC)`.

### RPCs (all SECURITY DEFINER, SET search_path = public)

```sql
-- Migration 02 / 14 (14 changed return type to BOOLEAN) / 23 (added forensic params)
mark_proposal_viewed(p_token TEXT)
  → increments view_count, sets last_viewed_at, advances status to 'viewed'
  → granted to: anon

accept_proposal(p_token TEXT, p_ip TEXT DEFAULT NULL, p_ua TEXT DEFAULT NULL)
  → sets status = 'accepted' (only from sent/viewed/needs_revision)
  → saves signer_ip + signer_user_agent atomically — both nullable, old callers unaffected
  → returns BOOLEAN (true = row updated, false = already accepted or token not found)
  → granted to: anon, authenticated

-- Migration 03
update_proposal_time_spent(p_token TEXT, p_seconds INTEGER)
  → accumulates time_spent_seconds
  → granted to: anon

-- Migration 04 / 05 (05 adds SET search_path fix + authenticated grant)
get_deal_room_proposal(p_token TEXT, p_code TEXT DEFAULT NULL) RETURNS json
  → if no access_code: returns proposal JSON (excluding access_code column)
  → if code required and not provided: returns '{"_requires_code": true}'
  → if code wrong: returns NULL (silent — don't reveal proposal existence)
  → granted to: anon, authenticated

-- Migration 06
save_client_details(p_token TEXT, p_full_name TEXT, p_company_name TEXT, p_tax_id TEXT, p_address TEXT, p_signer_role TEXT)
  → COALESCE(NULLIF(p_field, ''), existing_col) — empty strings never overwrite existing data
  → only updates when status IN ('sent', 'viewed')
  → granted to: anon, authenticated

-- Migrations 18–22 (admin RPCs — all check auth.jwt() ->> 'email' = 'roychen651@gmail.com')
get_admin_users_data() RETURNS json
  → returns all users with plan_tier, full_name, company_name, phone, admin_notes,
    is_suspended, bonus_quota, created_at, last_sign_in_at, proposal_count, total_pipeline_value
  → granted to: authenticated

admin_set_user_tier(p_target_id uuid, p_tier text)
  → merges plan_tier into raw_user_meta_data
  → granted to: authenticated

admin_update_user_profile(p_target_id uuid, p_full_name text, p_company_name text)
  → merges display identity fields into raw_user_meta_data
  → granted to: authenticated

admin_update_user_advanced(p_target_id uuid, p_name text, p_company text, p_bonus_quota int)
  → merges full_name, company_name, bonus_quota into raw_user_meta_data (quota cannot be negative)
  → granted to: authenticated

admin_toggle_suspend(p_target_id uuid, p_suspend boolean)
  → sets or clears is_suspended in raw_user_meta_data
  → granted to: authenticated

admin_save_note(p_target_id uuid, p_note text)
  → stores admin_notes in raw_user_meta_data
  → granted to: authenticated

admin_get_user_proposals(p_target_id uuid) RETURNS json
  → returns last 20 proposals for a user (id, project_title, client_name, status, base_price, currency, public_token, created_at, updated_at)
  → granted to: authenticated

admin_delete_user(p_target_id uuid)
  → calls auth.users delete — permanent, irreversible
  → granted to: authenticated

-- Migration 24 (Sprint 39 — native email delivery)
mark_email_opened(p_token TEXT)
  → sets email_opened_at = now() WHERE email_opened_at IS NULL (idempotent — only records first open)
  → called fire-and-forget from DealRoom when ?source=email is in the URL and email_opened_at is null
  → granted to: anon, authenticated
```

---

## 10. i18n System

**Default locale: Hebrew (`he`).** Persisted in localStorage (`dealspace:locale`).

```ts
const { locale, dir, t, setLocale } = useI18n()

t('brand.name')              // → 'DealSpace'
t('auth.tab.signin')         // → 'כניסה' | 'Sign In'
setLocale('en')              // flips locale, dir, document.documentElement dir/lang
```

- `dir` is `'rtl'` for Hebrew, `'ltr'` for English
- All pages must pass `dir={dir}` or `dir={locale === 'he' ? 'rtl' : 'ltr'}` on their root element
- `useI18n` exposes `locale` directly — use `locale === 'he'` for conditional inline text outside the translation map

### Bilingual Strictness — Zero Language Bleed

**This is a hard requirement.** Hebrew UI must never display English words. English UI must never display Hebrew words or ILS (₪) symbols.

- Every label, toggle, button, KPI prefix, and status badge must be locale-aware
- Never hardcode English labels in bilingual components: `label: locale === 'he' ? 'לוח קנבן' : 'Kanban'`
- Currency prefixes on KPI cards must derive from actual proposal data, not be hardcoded to `₪`
- When adding new UI strings, always provide both `label_en` and `label_he`

### Auth Tab RTL gotcha
In Hebrew (RTL), flex items are visually reversed. The tab indicator uses `left: 4` (physical left). The `x` offset must be flipped for RTL:
```tsx
const indicatorX = (isRTL ? active === 'signup' : active === 'signin') ? 0 : 'calc(100% + 4px)'
```

### Hebrew Bidi Period Placement

**Root cause of the "period on wrong side" bug:** If a container has `dir="ltr"` for layout reasons (e.g., enforcing left-to-right visual order of elements), all descendant `<p>`, `<h3>`, etc. inherit it. Hebrew text inside an LTR paragraph context causes neutral characters like `.` to take LTR direction and appear at the visual left instead of the correct visual right (end of line in RTL text).

**Fix:** Add `dir={isHe ? 'rtl' : 'ltr'}` explicitly to every `<h3>` and `<p>` element that contains Hebrew text, overriding the inherited container direction:
```tsx
// Container must be LTR for flow reasons
<div className="flex flex-row" dir="ltr">
  {/* Override direction on each text element */}
  <h3 dir={isHe ? 'rtl' : 'ltr'}>{step.title}</h3>
  <p dir={isHe ? 'rtl' : 'ltr'}>{step.body}</p>
</div>
```

**Never place a trailing period directly after a Latin word** (e.g., `'שלחו PDF.'`) — the period adjacent to the Latin word takes LTR direction, appearing at the wrong visual position. Remove the period or add a Hebrew character immediately after it.

---

## 11. Design System

### Color palette
- **Background:** `#030305` (OLED black, slight blue tint)
- **Auth background:** `#000000` (pure black)
- **Primary:** `#6366f1` (indigo-500)
- **Gradient:** `linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)`
- **Gold accent:** `#d4af37` (urgency, star ratings, active drawing state)
- **Success:** `#22c55e`
- **Error:** `#f87171`

### Glass cards
```css
background: linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%);
border: 1px solid rgba(255,255,255,0.08);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
border-radius: 1.5rem; /* rounded-3xl */
```

### Auth card (Linear.app style)
```css
background: rgba(255,255,255,0.02);
border: 1px solid rgba(255,255,255,0.05);
backdrop-filter: blur(48px);
box-shadow: 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04);
```

### Premium inputs (EditorPanel / Integrations — Sprint 13.8)
```css
background: #0a0a0a;
border: 1px solid rgba(255,255,255,0.08);
border-radius: 0.75rem; /* rounded-xl */
padding: 0 1rem; height: 3.5rem; /* py-3.5 */
box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
/* on focus: */
background: #0f0f1a;
border: 1px solid rgba(99,102,241,0.6);
ring: 4px rgba(99,102,241,0.12);
```
Auth card / legacy components still use the older `rgba(255,255,255,0.05)` style.

### Typography
- **EN / numbers:** `Outfit` (Google Fonts, weights 300–900)
- **HE headings:** `Platypi` (applied via `[dir="rtl"] h1, h2, h3 { font-family: var(--font-hebrew) }`)
- **HE body:** `Heebo` fallback

### Animation approach
- **First render / page entrance:** CSS `@keyframes` with `animation:` style prop — never `initial/animate` on first-render elements (Framer Motion v12 can drop frames on mount)
- **State transitions, mode switches:** Framer Motion `AnimatePresence` + `initial/animate/exit`
- **Scroll reveals:** `useInView` from framer-motion with `once: true` and `margin: '-80px'`
- **Drag:** `Reorder.Group` / `Reorder.Item` (EditorPanel add-ons)
- **Spring counters:** `useMotionValue` + `useSpring` + `useTransform` (Dashboard KPIs, CheckoutClimax total, MilestoneTimeline amounts)
- **Scroll-linked:** `useScroll({ target: ref, offset: [...] })` + `useSpring(useTransform(...))` for precise per-section timing

### CSS keyframe injection
Each page/component injects custom keyframes via a `<style>` tag inside JSX. Names are namespaced to avoid collisions:
- `lp-*` — LandingPage
- `ds-*` — Dashboard
- `checkout-*` — CheckoutClimax
- `builder-*` — ProposalBuilder
- `int-*` — Integrations
- `svc-*` — ServicesLibrary

---

## 12. LandingPage Architecture (Sprint 16 — Awwwards Redesign)

`LandingPage.tsx` is a self-contained ~1600-line file with all copy, section components, and interaction logic. Wrapped in `<ReactLenis root>` for smooth scrolling.

### Section structure
```
<ReactLenis root options={{ lerp: 0.085, duration: 1.4, syncTouch: false }}>
  <div dir={...}>
    <div className="h-[52px]" />   ← spacer for fixed navbar
    <Navbar />                      ← Dynamic Island pill at scrollY > 80px
    <main>
      <HeroSection />               ← Full-screen with DealRoomMockup + gyro/mouse 3D tilt
      <SocialProofNumbers />        ← 4 animated stat counters (ScrambleCounter on viewport entry)
      <HowItWorksSection />         ← 3-step flow, horizontal connector beam, LTR step order
      <ProblemSolutionSection />    ← PDF vs Deal Room, scroll-linked SVG divider drawing
      <BentoFeaturesGrid />         ← 6-card bento grid (AI, signature, PDF, analytics, security, mobile)
      <TestimonialsSection />       ← 3 testimonial cards
      <FinalCTASection />           ← Full-width conversion section
    </main>
    <GlobalFooter />
  </div>
</ReactLenis>
```

### Lenis smooth scroll
```tsx
import { ReactLenis } from 'lenis/react'

// Always use syncTouch: false — syncTouch: true intercepts iOS native composited
// scrolling and runs physics on the JS main thread, causing severe FPS drops on mobile.
<ReactLenis root options={{ lerp: 0.085, duration: 1.4, syncTouch: false }}>
```

### Dynamic Island pill navbar
The navbar morphs from full-width to a centered compact pill at `scrollY > 80`.

```tsx
const [isPill, setIsPill] = useState(false)
const pillRef = useRef(false)  // guard against re-renders on every scroll tick

useMotionValueEvent(scrollY, 'change', (v) => {
  const next = v > 80
  if (next !== pillRef.current) {
    pillRef.current = next
    setIsPill(next)
  }
})

// AnimatePresence mode="wait" — key="pill" | key="full"
```

### Gyroscope + mouse tilt (3D card effect)
`useGyroscope(strength)` hook provides mobile tilt from `DeviceOrientationEvent`. Combined additively with mouse-based tilt in `Tilt3D` and `DealRoomMockup`:

```tsx
function useGyroscope(strength = 1) {
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const springX = useSpring(rotX, { stiffness: 90, damping: 18, restDelta: 0.001 })
  const springY = useSpring(rotY, { stiffness: 90, damping: 18, restDelta: 0.001 })
  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return
    // iOS 13+ requires requestPermission (needs user gesture) — skip silently
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof DOE.requestPermission === 'function') return
    let raf: number | null = null
    function handler(e: DeviceOrientationEvent) {
      if (raf !== null) return  // throttle to one rAF per tick
      const beta = e.beta ?? 45
      const gamma = e.gamma ?? 0
      raf = requestAnimationFrame(() => {
        raf = null
        rotX.set(Math.max(-12, Math.min(12, beta - 45)) * 0.45 * strength)
        rotY.set(Math.max(-12, Math.min(12, gamma)) * 0.65 * strength)
      })
    }
    window.addEventListener('deviceorientation', handler, { passive: true })
    return () => {
      window.removeEventListener('deviceorientation', handler)
      if (raf !== null) cancelAnimationFrame(raf)
    }
  }, [rotX, rotY, strength])
  return { springX, springY }
}

// Combining mouse + gyro into a single motion value:
const rotateX = useTransform([mouseSpringX, gyroX] as const, ([m, g]: number[]) => m + g)
const rotateY = useTransform([mouseSpringY, gyroY] as const, ([m, g]: number[]) => m + g)
```

### ScrambleCounter
Slot-machine number animation that triggers once on viewport entry:
```tsx
function ScrambleCounter({ value, inView }: { value: string; inView: boolean }) {
  // hasRun ref prevents re-triggering
  // 18 frames × 48ms: displays random digits, then locks to value
}
```

### Scroll-linked VS divider
In `ProblemSolutionSection`, the divider line between "Old Way" and "Deal Room" draws as the section scrolls into view:
```tsx
const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 0.9', 'center center'] })
const topLine    = useSpring(useTransform(scrollYProgress, [0.05, 0.45], [0, 1]), { stiffness: 60, damping: 16 })
const vsScale    = useTransform(scrollYProgress, [0.40, 0.65], [0, 1])
const vsRotate   = useTransform(scrollYProgress, [0.40, 0.65], [-180, 0])
const bottomLine = useSpring(useTransform(scrollYProgress, [0.60, 0.90], [0, 1]), { stiffness: 60, damping: 16 })
// Lines use: style={{ scaleY: topLine/bottomLine, transformOrigin: 'top center' }}
```

### Haptic tap states
All CTAs and interactive elements use spring squish:
```tsx
whileTap={{ scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
```

---

## 13. ProposalBuilder Architecture

Split-screen at `100dvh`, no page scroll.

```
<header>          ← sticky top bar: back button, save status, Send button
<div flex flex-1 overflow-hidden>
  <EditorPanel>   ← left ~35% on desktop, full-width on mobile (overflow-y-auto)
  <LivePreview>   ← right ~65% on desktop only (hidden lg:flex)
<BottomSheet>     ← mobile-only preview (62vh, triggered by eye icon)
<SendModal>       ← AnimatePresence modal with share URL + copy button
```

### EditorPanel sections (collapsible — Bento card style)
Each section is a rounded-3xl card with `background: rgba(255,255,255,0.02)` and `border: rgba(255,255,255,0.05)`. The section trigger (`p-5`) shows a conditional gradient `rgba(99,102,241,0.14) → 0.03 → transparent` + `borderBottom` when open. Body uses `p-6 space-y-6`.

1. **Project** — title, cover image URL, description, AI Ghostwriter button
2. **Client** — name + email in 2-column grid (`grid grid-cols-1 sm:grid-cols-2 gap-4`), collapsed by default
3. **Pricing** — base price + currency in 2-column grid, VAT toggle (`include_vat`), date picker (`expires_at`)
4. **Add-ons** — drag-to-reorder (`Reorder.Group`), price inputs, clientAdjustable pill (green glow when open)
5. **Payment Milestones** — milestone rows (name + percentage), sum indicator, validation
6. **Settings** — access code (`access_code`), document settings (BSD toggle, hide grand total toggle)

### EditorPanel `inputClass` pattern (Sprint 13.8)
```ts
const inputClass = [
  'w-full bg-[#0a0a0a] border border-white/[0.08] rounded-xl px-4 py-3.5 text-base text-white placeholder-white/30',
  'outline-none transition-all duration-200',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
  'focus:bg-[#0f0f1a] focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/[0.12]',
].join(' ')
```
- `py-3.5` — tall touch targets
- `focus:ring-4` — strong indigo glow on focus
- Always use `ps-10` + `start-4` (logical properties, RTL-safe) when an icon is inside the input

### Icons inside inputs (RTL-safe pattern)
```tsx
<div className="relative">
  <div className="pointer-events-none absolute inset-y-0 start-4 flex items-center">
    <User size={14} className="text-white/30" />
  </div>
  <input className={inputClass + ' ps-10'} ... />
</div>
```
Use `start-4` (not `left-4`) and `ps-10` (not `pl-10`) — these are logical properties that flip automatically in RTL.

### Field labels
```tsx
<label className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-300">
  <IconName size={13} className="text-indigo-400" />
  {label}
</label>
```
Helper text: `<p className="text-[12px] text-zinc-500 mt-2">{helper}</p>`

### clientAdjustable pill (Add-ons)
Glowing segmented control — green glow when adjustable, muted when locked:
```ts
style={{
  background: addOn.clientAdjustable !== false ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.04)',
  border: `1px solid ${addOn.clientAdjustable !== false ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.1)'}`,
  color: addOn.clientAdjustable !== false ? '#4ade80' : 'rgba(255,255,255,0.35)',
  boxShadow: addOn.clientAdjustable !== false ? '0 0 14px rgba(34,197,94,0.18), inset 0 1px 0 rgba(74,222,128,0.1)' : 'none',
}}
```

### Send button condition
`canSend = Boolean(draft.project_title?.trim())` — only title is required.

### Autosave
Debounced 1500ms on every `handleChange`. On Send, the debounce is flushed synchronously before the status update.

### Refs pattern
`draftRef` and `proposalIdRef` are kept in sync with their state counterparts to give stable references inside setTimeout/async callbacks without stale closures.

### Creator info auto-injection
`EditorPanel` reads `user.user_metadata` in a `useEffect` and calls `onChange({ creator_info, brand_color, business_terms })` on mount and whenever `user` changes. This ensures every saved proposal carries the latest business identity and business terms, which the PDF engine and Deal Room use without requiring auth.

Fields injected (as of Sprint 44.9):
```ts
const info: CreatorInfo = {
  full_name, company_name, tax_id, address, phone, signatory_name,
  logo_url,        // company logo URL — shown in Deal Room + PDF
  webhook_url,     // automation webhook — used by triggerPostSignatureAutomations
}
onChange({
  creator_info: info,
  brand_color: m['brand_color'] ?? null,
  business_terms: m['business_terms'] ?? '',  // frozen into proposal at save time
})
```

---

## 14. Deal Room Architecture

**Fully public route — no auth required.**

Full client flow:

```
DealRoom.tsx
  ↓ supabase.rpc('get_deal_room_proposal', { p_token, p_code })
      → if _requires_code → show access code gate UI
      → if null → show "not found" error
  ↓ supabase.rpc('mark_proposal_viewed', { p_token })  ← fire-and-forget
  ↓ inject brand_color as CSS variables (--primary-brand, --primary-brand-20, --primary-brand-40)
  ↓ render proposal header + countdown expiry banner
  ↓ PremiumSliderCard[]  ← one per add-on (client can toggle/adjust)
  ↓ MilestoneTimeline    ← if payment_milestones.length > 0
  ↓ Business Terms block ← if proposal.business_terms is non-empty (always visible, even after signing)
  ↓ ClientDetailsForm    ← if !clientDetails && !accepted (capture legal identity before signing)
  ↓ Legal consent checkbox ← if clientDetails && !accepted
  ↓ Business terms consent checkbox ← if clientDetails && !accepted && business_terms non-empty
  ↓ CheckoutClimax        ← sticky bottom: animated VAT-aware total + SignaturePad + CTA
      → disabled until: clientDetails captured + legalConsent checked + businessTermsConsent (if terms exist) + signature drawn + confirmed
  ↓ on accept:
      supabase.rpc('save_client_details', { p_token, ...clientDetails })
      supabase.rpc('accept_proposal', { p_token })
  ↓ full-screen success overlay
```

### Signature flow (native canvas — no external library)
1. `SignaturePad` renders `<canvas>` with pointer events, DPR-scaled, `quadraticCurveTo` for smooth strokes
2. User draws → "Confirm Signature" button appears → click → `canvas.toDataURL('image/png')`
3. Non-empty dataUrl passed up to `CheckoutClimax` → `canSign = true`

### Brand color injection
```tsx
// In DealRoom.tsx — injected as <style> tag
`--primary-brand: ${brandHex};`
`--primary-brand-20: ${brandHex}33;`
`--primary-brand-40: ${brandHex}66;`
```
DealRoom is public so it cannot read `user_metadata` directly. Brand color travels through the `brand_color` column on the proposal record, set by EditorPanel from `user_metadata` on save.

### Access code gate
`get_deal_room_proposal` returns `{ _requires_code: true }` when the proposal has a code but none was provided. DealRoom shows a PIN entry UI, then re-calls the RPC with the entered code. Wrong code returns `null` silently.

---

## 15. Profile Page

`/profile` (ProtectedRoute) — eight sections:

1. **Avatar** — upload to Supabase Storage, `updateProfile({ avatar_url })`
2. **Display Name** — `updateProfile({ full_name })`
3. **Password** — strength meter (evaluatePassword), `updatePassword(newPassword)`
4. **Business Identity** (Building2 icon) — company_name, tax_id, phone, address, signatory_name — saved directly via `supabase.auth.updateUser({ data: biz })` (not through auth store)
5. **Brand Color** (Palette icon) — 12 preset swatches + custom hex input + native `<input type="color">` (sr-only) + live preview chip — saved via `supabase.auth.updateUser({ data: { brand_color } })`
6. **Company Logo** (ImageIcon) — upload to Supabase Storage bucket `avatars/logos/${user.id}.ext`, saves URL to `user_metadata.logo_url`. Displayed in Deal Room above project title (white filter for dark bg) and on PDF cover page. Section sits between Brand Color and Password.
7. **Global Business Terms** (FileText icon) — TipTap `RichTextEditor` for formatted business terms (h1/h2/h3, bold, italic, lists). Saved to `user_metadata.business_terms` via `supabase.auth.updateUser({ data: { business_terms } })`. EditorPanel auto-injects this into every saved proposal. In the Deal Room, shown as "תנאי העסק / Business Terms" section (always visible, including after signing). Client must check a consent checkbox before `canSign` is true. Included in PDF on a new page. Section sits between Company Logo and VAT Rate.
8. **VAT Rate** (Percent icon) — decimal input persisted to `localStorage('dealspace:vat-rate')`, default `0.18`

### user_metadata fields (auth.users)
These live in `user.user_metadata` and are read by EditorPanel to populate `creator_info`:
- `full_name` — display name
- `avatar_url` — avatar URL
- `company_name`
- `tax_id`
- `address`
- `phone`
- `signatory_name` — printed name for signature block
- `brand_color` — hex string, e.g. `#6366f1`
- `logo_url` — company logo URL (uploaded to Supabase Storage)
- `business_terms` — TipTap HTML string — creator's global legal/business terms; frozen into each proposal by EditorPanel on save

---

## 16. PDF Engine (`src/lib/pdfEngine.tsx`)

Sprints 23–25 complete overhaul + Sprint 44.9. Built with `@react-pdf/renderer` v4. Generates a bilingual (He/En) enterprise **White Paper** PDF (4 pages when business terms are present).

### Design philosophy — White Paper
- **Backgrounds:** white `#FFFFFF`, surface `#F9FAFB`, never dark/neon
- **Text:** `#111827` body, `#6B7280` muted labels, `#9CA3AF` dim footer
- **Borders:** `#E5E7EB` standard, `#D1D5DB` stronger
- **Brand color** used ONLY for: cover hero strip, cert hero strip, table header backgrounds (white text), section title text, grand total left accent bar, milestone number badges
- **Alternating rows** on add-ons, milestones, and audit trail for legibility

### Font
Heebo TTF from Google Fonts CDN v28 (CORS-enabled). Weights: 400, 700, 900. `Font.registerHyphenationCallback(word => [word])` prevents hyphenation of Hebrew.

### Helpers
```ts
function getBrandColor(proposal: Proposal): string  // validates hex, falls back to #6366f1
function getInitials(name?: string): string         // first letters of each word, max 2 chars
function fmtDate(d: Date | string): string          // DD.MM.YYYY — direction-neutral
function fmtTime(d: Date): string                   // HH:MM — ALWAYS a separate Text node from date
function fmtCurrencyPdf(amount, currency): string   // en-US number + manual symbol (no Bidi control chars)
function forceWrap(text): string                    // injects U+200B after /.-_@ for URL line-breaking
function makeStyles(brand): StyleSheet              // factory called once per render with resolved brand
function parseHtml(html): HtmlBlock[]               // TipTap HTML → typed block array
```

### Iron Grid Architecture (Sprint 25 — mandatory for all rows)

react-pdf renders in LTR context. RTL layout is achieved through `flexDirection: 'row-reverse'` with **strictly sized Views** wrapping each label and value. This is the only reliable approach — `justifyContent: 'space-between'` and bare `<Text>` nodes both fail in mixed Bidi contexts.

```tsx
// EVERY label/value pair (audit trail, sig metadata, party fields) uses this pattern:
<View style={{ flexDirection: 'row-reverse' }}>
  {/* Label — always RIGHT side, fixed width, pure Hebrew text */}
  <View style={{ width: '40%' }}>
    <Text style={{ textAlign: 'right', color: '#6B7280' }}>{label}</Text>
  </View>
  {/* Value — always LEFT side, fixed width */}
  <View style={{ width: '60%' }}>
    <Text style={{ textAlign: 'left', color: '#111827', fontWeight: 700 }}>{value}</Text>
  </View>
</View>
```

**Why fixed Views instead of Text widths:** A `<Text style={{ width: '40%' }}>` still has Bidi applied to its content. A `<View style={{ width: '40%' }}>` creates a hard layout boundary — the Bidi algorithm cannot affect positioning outside the View.

### Bidi rules — NEVER violate these

1. **No colon concatenation with Hebrew.** `שם:` in a `<Text>` node causes the `:` to migrate to the wrong visual side. Labels are plain Hebrew words without colons. Visual separation is provided by color contrast and alignment.
2. **No Hebrew + date/time in one Text node.** `fmtTime()` returns HH:MM as a separate string from `fmtDate()`. Date and time are always rendered as separate `<Text>` nodes inside a `flexDirection: 'row'` sub-View.
3. **No `toLocaleString('he-IL')`** — Hebrew month names cause Bidi scrambling. Always use `fmtDate()` which outputs `DD.MM.YYYY` (digits + dots, direction-neutral).
4. **No Intl.NumberFormat with `he-IL`** — injects Unicode RTL marks (U+200F) that flip digit order. Always use `fmtCurrencyPdf()`.

```tsx
// ❌ BROKEN — colon migrates, date scrambles
<Text>שם: {proposal.client_name}</Text>
<Text>תאריך חתימה: {fmtDate(sigTs)}  {fmtTime(sigTs)}</Text>

// ✅ Correct — Iron Grid + split nodes
<View style={{ flexDirection: 'row-reverse' }}>
  <View style={{ width: '38%' }}><Text style={{ textAlign: 'right' }}>שם</Text></View>
  <View style={{ width: '62%' }}><Text style={{ textAlign: 'left' }}>{proposal.client_name}</Text></View>
</View>

<View style={{ flexDirection: 'row-reverse' }}>
  <View style={{ width: '38%' }}><Text style={{ textAlign: 'right' }}>תאריך חתימה</Text></View>
  <View style={{ width: '62%', flexDirection: 'row', gap: 6 }}>
    <Text>{fmtDate(sigTs)}</Text>
    <Text>{fmtTime(sigTs)}</Text>
  </View>
</View>
```

### Internal helper components (module-level)

These are defined inside `ProposalDocument` as nested functions to access the outer scope. They are stable per render:

```ts
AuditRow({ label, value, idx, total })       // alternating-bg audit trail row
AuditDateRow({ label, date, time, idx, total }) // date + time as separate Text nodes
SigMetaRow({ label, value })                 // 38/62 split for sig metadata
PartyField({ label, value })                 // Iron Grid row inside party box
```

### TipTap HTML parser
`parseHtml()` handles `<h1–h3>`, `<p>`, `<li>`, `<strong>`, `<b>`, `<em>`, `<i>` via regex with full HTML entity decoding. Returns `HtmlBlock[]` rendered as nested `<Text>` nodes. Falls back to plain-text strip if no block tags found.

### Document structure (up to 4 pages)

**Page 1 — Cover**
- Brand-color hero strip: company logo (if `creator_info.logo_url` exists) OR initials badge, company name, doc type label — all center-aligned
- White body: project title (centered, 30pt), divider, "הוכן עבור" / "PREPARED FOR", client name, document ID + date
- Content is vertically centered in the white area via `justifyContent: 'center'` + `alignItems: 'center'`

**Pages 2+ — Main Content (auto-paginates)**
- `paddingTop: 48` / `paddingBottom: 40` to clear fixed header/footer
- **Fixed header**: brand accent bar | company | project | page X/Y
- **Fixed footer**: DealSpace | dealspace.app | token
- Sections: Parties (Iron Grid fields), Description (HTML-parsed), Services & Pricing (brand-header table, alternating rows), VAT box, Grand Total (brand left accent bar), Milestones (brand header, alternating rows)
- All critical rows use `wrap={false}`

**Business Terms — New Page (conditional)**
- Rendered only when `proposal.business_terms?.trim()` is non-empty
- Forced onto a new page via `<View break style={s.section}>` — the `break` is a JSX prop on the View, NOT a CSS `breakBefore` style property
- Section title: `'תנאי העסק'` (he) / `'BUSINESS TERMS'` (en) using brand color
- Body: `HtmlBlocks` fed from `parseHtml(proposal.business_terms)` — same HTML parser used for the description

```tsx
// ✅ Correct — break is a JSX prop
{termsBlocks.length > 0 && (
  <View break style={s.section}>
    <Text style={s.sectionTitle}>{isHe ? 'תנאי העסק' : 'BUSINESS TERMS'}</Text>
    <HtmlBlocks blocks={termsBlocks} s={s} />
  </View>
)}

// ❌ WRONG — breakBefore is not in react-pdf's Style type
<View style={{ ...s.section, breakBefore: 'page' }}>
```

**Last Page — Signature Certificate**
- Brand-color hero with ✓ checkmark circle
- Signature image in `border: '1px solid #D1D5DB', background: '#F9FAFB'` box (no neon glow)
- Signer metadata as Iron Grid rows (no colons in Hebrew labels)
- Date and time split across two separate `<Text>` nodes
- Document Token box (light gray border)
- 8-row Audit Trail (brand header, Iron Grid rows, alternating backgrounds)
- e-Signature Law 5761-2001 legal disclaimer

### PdfOptions
```ts
export interface PdfOptions {
  proposal: Proposal
  totalAmount: number
  enabledAddOnIds: string[]
  signatureDataUrl: string       // data:image/png — rendered directly in sig box
  locale: 'he' | 'en'
  signatureTimestamp?: Date      // captured at accept_proposal() success in DealRoom
  isDraft?: boolean              // adds diagonal watermark + replaces cert with draft notice
}
```

### Export
```ts
export async function generateProposalPdf(opts: PdfOptions): Promise<void>
// downloads file: DealSpace_{title}_{YYYY-MM-DD}.pdf
```

---

## 17. Payment Milestones System

### Types
```ts
interface PaymentMilestone { id: string; name: string; percentage: number }
// percentage is a whole integer 1–100
// all milestones in a proposal must sum to exactly 100

function milestonesValid(milestones: PaymentMilestone[]): boolean
// returns true if milestones.length === 0 (no schedule defined) OR sum === 100
```

### EditorPanel UI
- Milestone rows: name input + percentage input (with `%` suffix) + delete button
- Sum indicator: green when 100, gold when < 100, red when > 100
- "Add Milestone" button — append with `{ id: crypto.randomUUID(), name: '', percentage: 0 }`
- Save is not blocked by invalid milestones (warn, don't block)

### Deal Room rendering
`MilestoneTimeline` renders when `milestones.length > 0`. Shows vertical timeline with animated dots and per-milestone progress bars. `AnimatedAmount` sub-component springs the currency total as `grandTotal` changes. Returns `null` for empty arrays.

---

## 18. Environment Variables

Stored in `.env.local` (gitignored — never commit).

```bash
# ── Browser (client bundle) ───────────────────────────────────────────────────
VITE_SUPABASE_URL=https://aefyytktbpynkbxhzhyt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...                  # anon/public key
VITE_APP_URL=http://localhost:5173              # or https://duel-space.vercel.app in prod

# ── Server-only (never exposed to browser) ───────────────────────────────────
SUPABASE_SERVICE_ROLE_KEY=eyJ...               # server-only, never exposed to browser
SUPABASE_ACCESS_TOKEN=sbp_...                  # Supabase PAT — needed for npm run migrate

# ── Supabase Edge Function secrets (set in Dashboard → Edge Functions → Secrets)
RESEND_API_KEY=re_...                          # Resend API key for send-proposal function
APP_URL=https://duel-space.vercel.app          # Used by send-proposal for email CTA links

STRIPE_SECRET_KEY=sk_live_...                  # Stripe secret key (sk_test_ for local dev)
STRIPE_WEBHOOK_SECRET=whsec_...               # From Stripe Dashboard → Webhooks → Signing secret
STRIPE_PRICE_PRO=price_...                     # Stripe Price ID for Pro plan
STRIPE_PRICE_PREMIUM=price_...                 # Stripe Price ID for Unlimited plan
```

`VITE_*` variables are safe for the browser. All others must never reach the client bundle. Edge Function secrets are set via Supabase Dashboard — they are NOT in `.env.local`.

---

## 19. localStorage Keys

| Key | Value | Owner |
|---|---|---|
| `dealspace:locale` | `'he'` \| `'en'` | i18n store |
| `dealspace:vat-rate` | decimal string e.g. `'0.18'` | Profile.tsx |
| `dealspace:view-mode` | `'grid'` \| `'kanban'` | Dashboard.tsx |
| `dealspace:demo-injected` | `'true'` | useProposalStore |
| `dealspace:contract-defaults` | JSON string | ContractLibrary |
| `ds:a11y:*` | various | useAccessibilityStore (14 keys) |

---

## 20. Running Migrations

```bash
npm run migrate
# Reads SUPABASE_ACCESS_TOKEN from .env.local
# Runs: supabase db push --yes
# Requires: supabase CLI installed (brew install supabase/tap/supabase)
# Requires: project already linked (supabase link --project-ref aefyytktbpynkbxhzhyt)
```

If a migration was applied manually outside the CLI, mark it applied:
```bash
supabase migration repair --status applied <timestamp>
```

**SECURITY DEFINER RPCs must include `SET search_path = public`** — without it, PostgreSQL cannot find the `proposals` table in the anon execution context. This burned us in migration 04 (fixed in 05). Every new RPC must have it.

---

## 21. Known Patterns & Decisions

### GlobalFooter coverage
`GlobalFooter` is imported individually into each page that needs it (Dashboard, LandingPage, DealRoom, Profile, ContractLibrary, ServicesLibrary, TermsOfService, PrivacyPolicy, Legal/Security, AccessibilityStatement). It is NOT injected globally in App.tsx — ProposalBuilder uses a fixed-height split-screen layout that has no room for a footer, and adding it globally would break that layout.

### GlobalFooter z-index vs fixed aurora
Every Dashboard-style page has a `DashboardAurora` component with `position: fixed; inset: 0`. Non-positioned elements (like `<footer>`) paint BELOW positioned elements in the CSS stacking order, making the footer visually invisible. The fix: `GlobalFooter`'s `<footer>` element has `className="relative z-10"`, which places it above the fixed aurora. Any page with a fixed full-screen background must ensure its footer or content sections have `relative z-index` set.

### Radix Portal click propagation (ProposalCard bug fix)
Radix `DropdownMenu.Content` renders in a DOM Portal (`document.body`). React portal events still bubble through the **React component tree** (not the DOM tree). The `ProposalCard`'s `onClick` guard only checked for `button` and `[data-radix-dropdown-menu-trigger]`, but Radix `DropdownMenu.Item` renders as `div[role="menuitem"]`, not `button`. Clicks on menu items bubbled to the card's `onClick` and triggered `onEdit`. Fix: `onClick={e => e.stopPropagation()}` on `DropdownMenu.Content`.

### Legal page tab navigation (history bounce fix)
Tab switchers on legal pages (Terms, Privacy, Security) use `navigate(path, { replace: true })` — **not** `navigate(path)`. Using push creates a growing history stack of legal pages; the back button then bounces between them instead of returning to the previous app page. Always use `replace: true` for in-page tab switches that don't represent distinct navigation steps.

### Logout hover dropdown
Using `onMouseEnter/Leave` on a wrapper div (not CSS `group-hover`) because the `mt-2` gap between the avatar and dropdown causes `group-hover:block` to flash off when the mouse crosses the gap. Bridge the gap with `pt-2` padding on the dropdown container.

### PrimaryButton shimmer
The shimmer `<span>` has `pointer-events-none`, so `onMouseEnter` on it never fires. Trigger on the parent `<button>` using `onMouseEnter` + `querySelector('[data-shimmer]')` + forced reflow (`void el.offsetWidth`) before re-applying the animation.

### Framer Motion first-render visibility
FM v12 + React 19 (no StrictMode) can occasionally drop first-render `initial` states. Entrance effects on mount use CSS `animation:` via a style prop. Framer Motion is only used for interactive transitions triggered by state changes after mount.

### `add_ons` and `payment_milestones` in Supabase
Both are `jsonb` columns — always update the whole array (not individual elements) in `updateProposal`. Supabase returns them as plain JS objects; TypeScript casts via the `Proposal` type.

### Brand color in public Deal Room
DealRoom is fully public (no auth) — it cannot read `user_metadata`. Solution: EditorPanel auto-injects `brand_color` from `user.user_metadata` into the proposal record on every save via `onChange({ brand_color })` in a `useEffect`. DealRoom reads it from the fetched proposal.

### Creator info + logo in public contexts
Same problem as brand color. Solution: `creator_info` (including `logo_url`) is stored as jsonb in the proposal record, auto-populated by EditorPanel's useEffect whenever `user` changes. Both DealRoom and the PDF engine read them from the fetched proposal — no auth required.

```ts
// EditorPanel useEffect — runs on mount and whenever user changes
const info: CreatorInfo = {
  full_name: m['full_name'] ?? '', company_name: m['company_name'] ?? '',
  tax_id: m['tax_id'] ?? '', address: m['address'] ?? '',
  phone: m['phone'] ?? '', signatory_name: m['signatory_name'] ?? '',
  logo_url: m['logo_url'] ?? '',   // ← injected here, read by DealRoom + PDF
}
onChange({ creator_info: info, brand_color: m['brand_color'] ?? '' })
```

### `useMotionValueEvent` state guard
When subscribing to a `MotionValue` (e.g., scroll position) to drive a boolean React state, always gate the `setState` call with a ref to prevent unnecessary re-renders on every tick:
```tsx
const stateRef = useRef(initialValue)
useMotionValueEvent(motionValue, 'change', (v) => {
  const next = v > threshold
  if (next !== stateRef.current) {
    stateRef.current = next
    setState(next)
  }
})
```

### Radix Tooltip — mobile (touch) support
Radix `Tooltip` is hover/focus only by default. On touch devices, `mouseenter` never fires and `tabIndex={-1}` on the trigger removes focus-based fallback too. Fix: use **controlled open state** with an `onClick` toggle on every Tooltip that must work on mobile.

```tsx
const [open, setOpen] = useState(false)

<Tooltip.Root open={open} onOpenChange={setOpen}>
  <Tooltip.Trigger asChild>
    <button
      tabIndex={0}                          // was -1 — must be 0 for focus fallback
      className="touch-manipulation rounded-lg p-1.5"
      onClick={() => setOpen(o => !o)}
    >
      <Info size={14} />
    </button>
  </Tooltip.Trigger>
  <Tooltip.Content>...</Tooltip.Content>
</Tooltip.Root>
```

Apply this pattern to every `(i)` info icon and any other Tooltip that a mobile user needs to access.

### DealRoom locale key
The app-wide i18n store persists the locale under `'dealspace:locale'` (with a colon). DealRoom must use the exact same key when reading/writing `localStorage`. Using `'dealspace-locale'` (hyphen, no colon) causes a key mismatch — mobile users with their device set to English will fall back to `navigator.language` instead of the app's stored preference, showing the wrong language.

```ts
// ✅ Correct — matches i18n store
const saved = localStorage.getItem('dealspace:locale')
localStorage.setItem('dealspace:locale', newLocale)

// ❌ Wrong — silently misses the stored preference
localStorage.getItem('dealspace-locale')
```

### DealRoom two-audience problem — `freshSignedRef`
`/deal/:token` serves two distinct audiences: (1) the **client** in the process of signing, and (2) the **business owner** (or client) revisiting an already-accepted deal. These two states need completely different UI.

Solution: `const freshSignedRef = useRef(false)`. Set `freshSignedRef.current = true` inside `handleAccept()` immediately before `setAccepted(true)`. This distinguishes "just signed in this session" from "proposal was already accepted before this page load".

```ts
// In handleAccept, after accept_proposal RPC succeeds:
freshSignedRef.current = true
setAccepted(true)
```

Use this flag to gate the two modes:
- `accepted && freshSignedRef.current` → show the full-screen **client success overlay** (confetti, "We'll be in touch", download CTA)
- `accepted && !freshSignedRef.current` → show a neutral **sealed summary card** (green completion badge, project + client + total, DealSpace disclaimer) — no conversion UX, no trust signals, no sticky checkout bar

### DealRoom sealed state — what to hide when `accepted && !freshSignedRef.current`
When a business owner (or anyone) visits an already-accepted deal link, suppress all conversion-oriented UI:
- **Countdown timer** — `{proposal.expires_at && !accepted && (` — never count down on a done deal
- **Trust signals** (`Zap`, `Shield`, `Clock` badges) — wrapped in `{!accepted && (`
- **Legal consent checkbox + legal terms box** — wrapped in `{!accepted && (`
- **Sticky checkout bar** (`CheckoutClimax`) — return `null` when `accepted && !freshSignedRef.current`

Replace the checkout bar with an inline sealed summary card:
```tsx
{accepted && !freshSignedRef.current && (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: 0.4 }}
    className="mt-6 rounded-2xl overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, rgba(34,197,94,0.07) 0%, rgba(16,185,129,0.04) 100%)',
      border: '1px solid rgba(34,197,94,0.18)',
      boxShadow: '0 0 40px rgba(34,197,94,0.06), inset 0 1px 0 rgba(34,197,94,0.1)',
    }}
  >
    {/* CheckCircle2 icon + "הסכם חתום ואושר" / "Agreement Signed" */}
    {/* Client name + signing date */}
    {/* Total row */}
    {/* DealSpace disclaimer */}
  </motion.div>
)}
```
Bottom spacer: `<div className={accepted && !freshSignedRef.current ? 'h-10' : 'h-44'} />`

### ProposalBuilder header — button uniformity system
All action buttons in the ProposalBuilder header use a strict sizing system to ensure Apple-level visual uniformity regardless of content or screen width:

```tsx
// Every button in the header right section:
className="flex-none flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 h-9 ..."

// Text labels — hidden on mobile, always nowrap:
<span className="hidden sm:inline whitespace-nowrap">הורד PDF</span>

// Short labels for sm breakpoint only (Send button):
<span className="sm:hidden whitespace-nowrap">{shortLabel}</span>
<span className="hidden sm:inline whitespace-nowrap">{fullLabel}</span>
```

Key rules:
- `h-9` explicit height on every button — never rely on padding alone (content height varies with text wrapping)
- `flex-none` — prevents buttons from shrinking in flex containers
- `whitespace-nowrap` on all `<span>` text — prevents text from wrapping and inflating button height
- Icon-only on mobile (`hidden sm:inline` on text) — preserves space in narrow header
- Title: `max-w-[90px] sm:max-w-[200px]` — clamps truncation on mobile to avoid consuming header space

### Vercel retry vs fresh deploy
When a Vercel deployment fails, the "Redeploy" button in the dashboard replays the **same commit** — it does not pick up newer pushes to `main`. If you've pushed a fix but Vercel is still failing on the old commit, push an empty commit to force a fresh webhook:
```bash
git commit --allow-empty -m "chore: force Vercel redeploy"
git push origin main
```

---

## 22. Git & Deployment Workflow

- **Branch:** `main` is the single branch. All commits go to `main`.
- **Vercel:** Auto-deploys every push to `main`.
- **Commit after every logical unit of work** — do not let multiple features accumulate uncommitted.
- **Commit message format:** `feat:`, `fix:`, `chore:`, `refactor:` prefix. Body lists what changed and why.
- **Always push after committing** — Vercel deployment depends on it.

```bash
# Standard commit flow
npx tsc -b                      # must be clean
git add <specific files>        # never git add -A blindly
git commit -m "feat: ..."
git push origin main
```

---

## 23. Accessibility Engine (Sprint 12)

### `useAccessibilityStore` — 14 states
Persisted under `ds:a11y:*` localStorage keys. `applyToDom()` runs on boot and on every state change via `store.subscribe()`.

| State | Type | Mechanism |
|---|---|---|
| `textSize` | number 1.0–1.5 | CSS var `--a11y-scale` on `<html>` → `font-size: calc(16px * var(--a11y-scale))` |
| `highContrast` | boolean | `style.filter` — `contrast(1.9) brightness(1.06) saturate(1.2)` |
| `monochrome` | boolean | `style.filter` — `grayscale(1)` |
| `invertColors` | boolean | `style.filter` — `invert(1) hue-rotate(180deg)` |
| `colorBlindMode` | `'none'|'protanopia'|'deuteranopia'|'tritanopia'` | `style.filter` — hue-rotate approximations |
| `dyslexiaFont` | boolean | class `a11y-dyslexia-font` → Atkinson Hyperlegible |
| `readableFont` | boolean | class `a11y-readable-font` → Arial |
| `lineHeightBoost` | boolean | class `a11y-line-height` → line-height 2.1 |
| `letterSpacing` | boolean | class `a11y-letter-spacing` → letter-spacing 0.06em |
| `readingMask` | boolean | `<ReadingMask>` React component (pointer-tracked overlay) |
| `stopAnimations` | boolean | class `a11y-stop-animations` → duration 0.001ms |
| `highlightLinks` | boolean | class `a11y-highlight-links` → yellow outline on `a, button` |
| `focusHighlight` | boolean | class `a11y-focus-highlight` → thick yellow focus rings |
| `bigCursor` | boolean | class `a11y-big-cursor` → SVG cursor data URI |

All filter effects are combined into one `style.filter` string (never stacked layers).

### `AccessibilityWidget`
- Draggable FAB: `position: fixed; bottom: 24; right: 20` — dragConstraints computed from window size
- Fixed panel: always `bottom: 88; right: 16` — never moves with FAB drag, never overflows viewport
- Panel is `flex flex-col; height: panelH` — content area is `flex-1 min-h-0 overflow-y-auto` (scrolls properly)
- FAB click guards: `e.stopPropagation()` not needed — panel is a sibling element, not nested
- Reading Mask: separate `<ReadingMask>` component rendered at root level, `z-[9990]`, tracks `mousemove`

### `HelpCenterDrawer`
- **Controlled mode**: pass `open` + `onClose` props → no floating FAB rendered. Used from Dashboard Navbar.
- **Uncontrolled mode**: no props → self-contained with desktop-only (`hidden sm:flex`) floating FAB. Used on non-Dashboard pages via App.tsx if needed.
- Bilingual FAQ items sourced from `src/lib/knowledgeBase.ts` (`KNOWLEDGE_BASE` array)
- Category filter: All / Sending / Pricing / Legal / Settings / Services & Terms (updated Sprint 44.9)
- Dashboard Navbar renders a `<HelpCircle>` button that opens the drawer in controlled mode

### Dashboard mobile layout
- **No floating `+` FAB** — create button lives in the Navbar: icon-only on mobile, icon+text on sm+
- `pb-32 sm:pb-8` on `<main>` ensures cards are never occluded by bottom FABs
- Help Center (`?`) button is in the Navbar, always visible on all screen sizes
- HelpCenterDrawer floating button is `hidden sm:flex` (legacy fallback, not shown on Dashboard)

### Dashboard list view
- Column header row: project/client, status, amount, date
- Rows use CSS `grid` with `gridTemplateColumns: '8px 1fr 96px 112px 90px 56px'` on desktop
- Mobile: simplified flex row (status dot | title+client | price+badge)
- Hover: left `2px` accent bar in status color + subtle background
- Actions (edit, download) visible on `group-hover:opacity-100`

### Company logo in public contexts (Deal Room + PDF)
`creator_info.logo_url` follows the same pattern as `brand_color`: EditorPanel reads it from `user.user_metadata.logo_url` in a `useEffect` and calls `onChange({ creator_info: { ...info, logo_url } })` on every save. Both Deal Room and the PDF engine read it from the saved proposal record — no auth required.

- **Deal Room display:** `<img>` above the project title with `filter: brightness(0) invert(1)` for white rendering on dark backgrounds
- **PDF cover:** `<Image src={logo_url} style={{ width: 100, height: 36, objectFit: 'contain' }} />` inside the brand hero strip; falls back to initials box when `logo_url` is falsy

### Supabase Realtime UPDATE — always re-fetch

The Realtime `postgres_changes` payload for UPDATE events is **partial** — it omits JSONB columns (`add_ons`, `payment_milestones`, `creator_info`). Never do an optimistic in-place replace with `newRow`. Always call `get().fetchProposals()` to get the complete record.

```ts
// In subscribeRealtime():
if (eventType === 'UPDATE') {
  get().fetchProposals()  // ← correct
}
```

This bug recurred multiple times ("שוב ושוב"). The root cause is always the same: `newRow` is partial. Never replace a stored Proposal with it directly.

### ProposalBuilder cross-device sync
Three mechanisms work together to ensure the builder always shows current status:
1. **Realtime subscription** — `subscribeRealtime()` calls `fetchProposals()` on every UPDATE
2. **BroadcastChannel** — `ch.onmessage = () => fetchProposals()` — fires on any event (not just accepted); handles same-browser multi-tab sync
3. **visibilitychange** — `document.addEventListener('visibilitychange', () => { if (!document.hidden) fetchProposals() })` — handles tab switching after client signs on mobile

### PremiumSliderCard sealed state
When the proposal is accepted, all interactive controls in `PremiumSliderCard` must be locked. Pass `sealed={accepted}` from DealRoom. The `sealed` prop:
- Sets `disabled={sealed}` on the toggle button
- Sets `cursor: sealed ? 'default' : 'pointer'` on the toggle
- Removes the `whileHover` lift effect
- Hides the entire quantity slider section: `{enabled && adjustable && !sealed && (`

### Confetti on deal sign (`canvas-confetti`)
Fire confetti only for the client who just signed — never for a creator revisiting an already-accepted deal link. Gate with `freshSignedRef.current`:

```tsx
useEffect(() => {
  if (!accepted || !freshSignedRef.current || !proposal) return
  const brand = proposal.brand_color ?? '#6366f1'
  confetti({ particleCount: 110, spread: 80, origin: { y: 0.68 }, colors: [brand, '#6366f1', '#a855f7', '#22c55e', '#ffffff', '#ffd700'] })
  const t1 = setTimeout(() => {
    confetti({ particleCount: 65, angle: 58, spread: 68, origin: { x: 0, y: 0.72 }, colors: [brand, '#a855f7', '#ffd700'] })
    confetti({ particleCount: 65, angle: 122, spread: 68, origin: { x: 1, y: 0.72 }, colors: [brand, '#6366f1', '#22c55e'] })
  }, 220)
  const t2 = setTimeout(() => {
    confetti({ particleCount: 45, spread: 130, origin: { y: 0.6 }, gravity: 0.55, scalar: 0.75, colors: ['#ffffff', '#ffd700', brand] })
  }, 580)
  return () => { clearTimeout(t1); clearTimeout(t2) }
}, [accepted]) // freshSignedRef is a ref — not a dep, but read safely inside effect
```

When the page loads for an already-accepted proposal, `setAccepted(true)` runs but `freshSignedRef.current` is still `false` — so the effect guard prevents confetti on revisit.

### `triggerPostSignatureAutomations` (Sprint 31 — real implementation)
Lives in `src/lib/automations.ts`. Called from `DealRoom.tsx` immediately after `accept_proposal` RPC succeeds, fire-and-forget:

```ts
// DealRoom.tsx — in handleAccept, after freshSignedRef.current = true; setAccepted(true)
if (proposal) triggerPostSignatureAutomations(proposal).catch(console.error)
```

The function reads `proposal.creator_info?.webhook_url`. If set, it POSTs this JSON payload:
```ts
{
  event: 'proposal.accepted',
  data: {
    proposal_id, project_title, client_name, client_email,
    client_company, grand_total, currency, public_token, signed_at
  }
}
```
If `webhook_url` is empty/absent, the function returns immediately with no side effects. Errors are swallowed — a failed webhook must never block the signing flow. The creator configures the webhook URL on `/integrations`; it is stored in `user_metadata.webhook_url` and auto-injected into `creator_info` by EditorPanel on every save.

### Dashboard CRM KPIs — correct formulas
Three KPI cards with real business intelligence:

| Card | Metric | Formula |
|---|---|---|
| Pipeline Value | Active deal value | `sum(proposalTotal(p))` for `sent + viewed + needs_revision` |
| Closed Won | Actual revenue | `sum(proposalTotal(p))` for `accepted` only |
| Win Rate | Conversion rate | `accepted / (accepted + rejected) * 100` — **not** `accepted / all-non-draft` |

Win Rate uses only **resolved** proposals as denominator — pending proposals are excluded because they haven't been decided yet. Division-by-zero returns `0`.

The `AnimatedNumber` component (uses `useSpring` + `useTransform`) is already in place — just feed the new values in.

### iOS input zoom prevention
iOS Safari zooms in when an input's `font-size < 16px`. Tailwind's `text-sm` (14px) class selector has higher specificity than a bare element selector, overriding `font-size: max(16px, 1em)` without `!important`. The global fix in `index.css`:

```css
input, textarea, select {
  font-size: 16px !important;
}
```

This overrides all utility classes. The body is already 16px, so desktop inputs look identical. **Never remove the `!important`** — doing so silently re-enables iOS zoom.

### Number input spinner removal (global)
Browser-native up/down spinners on `input[type=number]` are hidden globally in `index.css`:

```css
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; appearance: textfield; }
```

All numeric fields also carry the appropriate `inputMode`:
- `inputMode="decimal"` — price/amount fields (allows decimal point)
- `inputMode="numeric"` — percentage, tax ID, integer-only fields

---

## 24. Services Catalog & Injection Engine (Sprint 27)

### Architecture overview

The Services Catalog is a **Stripe Product Catalog** analogue — creators save reusable services once and inject them into proposals with two clicks.

Three layers:
1. **`useServicesStore`** — Zustand store, Supabase-backed, optimistic updates (same pattern as `useProposalStore`)
2. **`ServicesLibrary.tsx`** (`/services`) — full CRUD page: create, edit, delete services in a modal form
3. **`ReusableServices.tsx`** — injection modal opened from EditorPanel with a "✨ Library" button; multi-select + bulk inject

### `useServicesStore` pattern

```ts
import { useServicesStore, type Service, type ServiceInsert } from '../stores/useServicesStore'

const { services, loading, fetchServices, createService, updateService, deleteService } = useServicesStore()

// Fetch on mount — idempotent, safe to call multiple times
useEffect(() => { fetchServices() }, [fetchServices])

// Types
type ServiceInsert = { label: string; description: string | null; price: number }
```

All mutations are optimistic: UI updates instantly, rolls back on error. No realtime subscription needed (services are private, no multi-device sync required).

### Injection modal (`ReusableServices`)

```tsx
// Props
interface ReusableServicesProps {
  open: boolean
  onClose: () => void
  currency: string
  locale: string
  onInject: (addOns: AddOn[]) => void
}

// Usage in EditorPanel
<ReusableServices
  open={libraryOpen}
  onClose={() => setLibraryOpen(false)}
  currency={draft.currency}
  locale={locale}
  onInject={handleInjectServices}
/>
```

The modal fetches services on open (no-op if cached), resets selection on every open, and closes on Escape. Includes a search filter shown only when `services.length > 3`.

### CRITICAL: Always generate fresh UUIDs on injection

```ts
// Inside onInject handler — EditorPanel
const handleInjectServices = (addOns: AddOn[]) => {
  onChange({ add_ons: [...draft.add_ons, ...addOns] })
}

// Inside ReusableServices.handleInject — map from Service → AddOn
const addOns: AddOn[] = services
  .filter(s => selected.has(s.id))
  .map(s => ({
    id: crypto.randomUUID(),   // ← ALWAYS fresh — never use s.id
    label: s.label,
    description: s.description ?? '',
    price: s.price,
    enabled: true,
  }))
```

**Why:** The proposal's `add_ons` array must hold unique instances. If the service is later edited or deleted from the library, existing proposals must not be affected. Using the service's DB `id` as the add-on `id` would silently link them and risk historical mutation.

### Services vs. Add-ons relationship

- **Service** = library template (stored in `services` table, belongs to the creator)
- **Add-on** = proposal instance (stored in `add_ons` jsonb on the proposal)
- A service can be injected into many proposals — each injection creates an independent copy with a fresh UUID
- Editing a service in the library does NOT affect previously injected add-ons

### ServicesLibrary page patterns

- Uses a `<ServiceForm>` modal (AnimatePresence, slide-up panel) for create/edit
- `saving` boolean tracks async state during `createService` / `updateService` — disables submit button
- Service list uses `<AnimatePresence>` with `layout` prop for smooth add/remove animations
- Empty state: floating Layers orb + orbiting dot + shimmer CTA (same `@keyframes` namespace as `svc-*`)
- Stats cards show skeleton loaders (`animate-pulse`) while `loading && services.length === 0`

### EditorPanel trigger button

The "✨ Library" button lives in a `flex gap-2` row next to "Add New Add-on":
```tsx
<div className="flex gap-2">
  <motion.button ...> {/* Add New Add-on */} </motion.button>
  <motion.button onClick={() => setLibraryOpen(true)} ...>
    <Library size={13} />
    <span className="hidden sm:inline whitespace-nowrap">✨ Library / ✨ ספרייה</span>
  </motion.button>
</div>
```
Button sizing: `h-9` + `whitespace-nowrap` to match the header uniformity system. Text hidden on mobile (icon only), shown on `sm+`.

### Deal Room logo display (Sprint 27 fix)

The company logo in Deal Room (`creator_info.logo_url`) is shown inside a **glassmorphism pill** — NOT with `filter: brightness(0) invert(1)` which destroyed colored/white logos:

```tsx
<div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
  className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 overflow-hidden">
  <img src={logo_url} className="max-h-10 max-w-[160px] object-contain" />
</div>
```

Logo container is centered (`flex justify-center` on parent). If no logo but `company_name` exists, the company name is shown as a text fallback.

---

## 25. Integrations & Webhook Automations Engine (Sprint 31)

### Architecture

Three-layer system:
1. **`CreatorInfo.webhook_url`** (`src/types/proposal.ts`) — field on the `CreatorInfo` interface. Optional string.
2. **`EditorPanel` useEffect** — injects `webhook_url: m['webhook_url'] ?? ''` alongside `logo_url` and other metadata fields into every saved proposal's `creator_info` column.
3. **`src/lib/automations.ts`** — `triggerPostSignatureAutomations(proposal)` reads `proposal.creator_info?.webhook_url` and POSTs the deal payload. Fire-and-forget, errors swallowed.
4. **`src/pages/Integrations.tsx`** (`/integrations`) — protected page where creators configure their webhook URL. Saved to `user_metadata.webhook_url` via `supabase.auth.updateUser`.

### Integrations page (`/integrations`)

- **Free tier:** blur overlay (`backdropFilter: blur(8px)`) + lock icon + Upgrade CTA → opens `UpgradeModal`
- **Paid tier (Pro/Unlimited):** webhook URL input + Save button + Test Connection button
- Test fires a dummy payload with `proposal_id: 'test-00000000-...'` and `grand_total: 5000`
- Status indicators (saved / error / webhook-ok / webhook-error) use `AnimatePresence` for smooth transitions
- Compatible tools strip: Make.com, Zapier, n8n, Invoice4u, HubSpot, Pipedrive, monday.com, SendGrid, Slack, WhatsApp Business
- Bilingual (He/En), full RTL support, `GlobalFooter` included
- CSS keyframes namespaced `int-*`

### Webhook payload structure
```ts
{
  event: 'proposal.accepted',
  data: {
    proposal_id: string       // UUID
    project_title: string
    client_name: string
    client_email: string | null
    client_company: string | null
    grand_total: number       // proposalTotal(proposal) — pre-VAT
    currency: string          // 'ILS' | 'USD' | 'EUR' | …
    public_token: string
    signed_at: string         // ISO 8601
  }
}
```

### webhook_url storage path
`user_metadata.webhook_url` → EditorPanel useEffect injects it into `proposal.creator_info.webhook_url` on every save → DealRoom reads it from the fetched proposal (no auth needed in the public route).

### ProtectedLayout dropdown
Integrations added as menu item after Contracts: `<Webhook size={13} />` icon + `'אינטגרציות' | 'Integrations'`.

---

## 27. Admin Panel Architecture (Sprints 34–35)

### Route & Guard

`/admin` is a founder-only route, guarded by `AdminRoute.tsx`:
```
idle/loading  → spinner
unauthenticated → /auth
auth.user.email !== 'roychen651@gmail.com' → /dashboard
```

`AdminDashboard.tsx` and `UserOpsDrawer.tsx` live in `src/pages/admin/`. Import `AdminUser` type from `UserOpsDrawer.tsx`.

### AdminDashboard

- 5 KPI cards: Total Users, Unlimited, Pro, Proposals, Platform Pipeline
- Registry panel with filter pills (All / Free / Pro / Unlimited / Suspended) and sort dropdown (Newest / By Pipeline / By Proposals)
- Filter + sort applied to `users` array client-side before rendering
- Desktop table: fixed column widths (32/12/13/12/14/17%), `py-3` rows, `timeAgo` helper for Last Active column
- Mobile: `MobileUserCard` bento stack
- Clicking a row sets `selected` → opens `UserOpsDrawer`
- Row shows indigo left-border accent when selected

### Date formatting in AdminDashboard
Always use the manual `fmtDate` / `fmtDateFull` / `timeAgo` helpers — **never `toLocaleDateString()`**. The locale-aware method produces browser-dependent output ("Mar 2026 29") that breaks the table layout. The manual formatters output "29 Mar" (current year) / "29 Mar 2026" (past year) deterministically.

```ts
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function fmtDate(iso: string): string {
  const d = new Date(iso)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return sameYear
    ? `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]}`
    : `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
function timeAgo(iso: string | null): string {
  // → 'Just now' | '3h ago' | 'Yesterday' | '5d ago' | '29 Mar 2025'
}
```

### UserOpsDrawer

Radix `Dialog` slide-over (LTR slides from right, RTL from left). Width: `min(480px, 100vw)`. Contains:

1. **Header** — user avatar + name/email + tier badge + big "Impersonate User" button
2. **Radix Tabs** (`@radix-ui/react-tabs`) with 4 tabs:
   - **Profile** (`overview`) — full_name, company_name, phone edit fields + Admin Notes textarea → `admin_update_user_advanced` + `admin_save_note`
   - **Billing** (`billing`) — glowing radio cards (Free/Pro/Unlimited) + ±bonus quota adjuster → `admin_set_user_tier` + `admin_update_user_advanced`
   - **Security** (`security`) — send password reset email + lazy-loaded proposals list with status badges and ExternalLink to deal room → `admin_get_user_proposals`
   - **Danger** (`danger`) — orange Suspend/Unsuspend card + red Delete card → `admin_toggle_suspend` + `admin_delete_user`

### Impersonation edge function

The "Impersonate User" button calls the `admin-impersonate` Supabase Edge Function:

```typescript
// CRITICAL: must include BOTH Authorization AND apikey headers
const res = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-impersonate`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,  // ← required by Supabase gateway
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target_email: user.email }),
  }
)
const { link } = await res.json()
window.open(link, '_blank', 'noopener,noreferrer')
```

The edge function (`supabase/functions/admin-impersonate/index.ts`):
1. Verifies caller JWT via anon client → checks `user.email === 'roychen651@gmail.com'`
2. Uses service role client to call `supabaseAdmin.auth.admin.generateLink({ type: 'magiclink', email: target_email, options: { redirectTo: APP_URL/dashboard } })`
3. Returns `{ link: data.properties.action_link }`

**Deployment:** `supabase functions deploy admin-impersonate --project-ref aefyytktbpynkbxhzhyt`

### `FeedbackState` + `withFb` pattern

```ts
type FeedbackState = 'idle' | 'loading' | 'ok' | 'error'

function withFb(
  setter: (s: FeedbackState) => void,
  fn: () => Promise<void>,
  clearMs = 2500,
) {
  return async () => {
    setter('loading')
    try { await fn(); setter('ok') }
    catch { setter('error') }
    setTimeout(() => setter('idle'), clearMs)
  }
}
```

All tab-level save/delete/suspend actions use this pattern. Feedback buttons show Loader2 → CheckCircle2 → AlertTriangle based on state.

### AdminUser type (exported from UserOpsDrawer.tsx)

```ts
export interface AdminUser {
  id: string
  email: string
  full_name: string
  company_name: string
  phone: string
  admin_notes: string
  plan_tier: 'free' | 'pro' | 'unlimited'
  is_suspended: boolean
  bonus_quota: number
  created_at: string
  last_sign_in_at: string | null
  proposal_count: number
  total_pipeline_value: number
}
```

---

## 28. Forensic Audit Trail (Sprint 37)

### Architecture

Three-layer chain: browser → RPC → PDF.

**DealRoom `handleAccept`:**
```ts
// IP fetch — fire-and-forget, NEVER blocks signing
let signerIp = 'Unknown'
try {
  const r = await fetch('https://api.ipify.org?format=json')
  const j = await r.json() as { ip?: string }
  if (j.ip) signerIp = j.ip
} catch (_) {}

const signerUa = navigator.userAgent

await supabase.rpc('accept_proposal', {
  p_token: token,
  p_ip:    signerIp,
  p_ua:    signerUa,
})
```

**Database:** `signer_ip TEXT` and `signer_user_agent TEXT` saved atomically inside `accept_proposal` UPDATE. Both columns nullable — old callers that omit params get NULL without error.

**Proposal type** (`src/types/proposal.ts`):
```ts
signer_ip?: string | null
signer_user_agent?: string | null
```

**PDF Certificate — Forensic section:**
- Renders only when `proposal.signer_ip` exists (conditional block)
- Placed between the signer metadata row and the document token box
- Uses brand-color header strip identical to the Audit Trail header
- Two Iron Grid rows (38/62 split, `row-reverse`):
  - "כתובת IP" / "IP Address" → `signer_ip`
  - "מזהה מכשיר" / "Device / Browser" → UA truncated at 90 chars
- IP address also appended as a named row inside the main Audit Trail table

**Audit Trail row for IP:**
```ts
...(proposal.signer_ip ? [
  { label: isHe ? 'כתובת IP' : 'Signer IP', value: proposal.signer_ip },
] : []),
```

---

## 29. Native Email Delivery Engine (Sprint 39)

### Architecture

Three-layer chain: ProposalBuilder → Edge Function → Resend → DealRoom ping.

**`supabase/functions/send-proposal/index.ts`** (deployed with `--no-verify-jwt`):
- Accepts `POST { proposal_id, to_email, message? }` with `Authorization: Bearer <user JWT>`
- Verifies JWT via `adminClient.auth.getUser(jwt)` (admin client — more reliable than anon client for server-side verification)
- Fetches proposal via admin client, checks `proposal.user_id === user.id`
- Sends branded RTL HTML email via Resend API
- Stamps `email_sent_at` + `delivery_email` on the proposal record after successful send
- FROM address: `onboarding@resend.dev` (until `dealspace.app` domain is verified in Resend, then switch to `proposals@dealspace.app`)

**`src/components/builder/SendModal.tsx`** — two-view architecture:
```ts
type View      = 'menu' | 'composer'
type SendStatus = 'idle' | 'sending' | 'sent' | 'error'
```
- `menu` view: share URL, copy link, email button
- `composer` view: to_email input + optional message textarea + Send button
- Email send calls edge function:
```ts
await fetch(`${VITE_SUPABASE_URL}/functions/v1/send-proposal`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': VITE_SUPABASE_ANON_KEY,   // ← required by Supabase gateway
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ proposal_id, to_email, message }),
})
```
- Requires `proposalId` prop on `SendModal`

**Email open tracking** (`DealRoom.tsx`):
```ts
// Called once on load when ?source=email is in the URL and email_opened_at is null
if (new URLSearchParams(window.location.search).get('source') === 'email' && !p.email_opened_at) {
  supabase.rpc('mark_email_opened', { p_token: token }).then(() => {})
}
```

**Read receipt badge** (`ProposalCard.tsx`):
```tsx
{proposal.email_opened_at && (
  <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
    <MailCheck size={9} style={{ color: '#818cf8' }} />
    <span>{locale === 'he' ? 'נפתח' : 'Opened'}</span>
  </div>
)}
```

### Proposal type additions (`src/types/proposal.ts`)
```ts
delivery_email?: string | null      // email address the proposal was last sent to
email_sent_at?: string | null       // ISO timestamp of last email send
email_opened_at?: string | null     // ISO timestamp of first email open (set by mark_email_opened RPC)
```

### Deployment notes
- Deploy with: `supabase functions deploy send-proposal --project-ref aefyytktbpynkbxhzhyt --no-verify-jwt`
- The `--no-verify-jwt` flag is required because the Supabase API gateway was rejecting the JWT before the function code could validate it. JWT validation is done manually inside the function via `adminClient.auth.getUser(jwt)`.
- Set `RESEND_API_KEY` in Supabase Dashboard → Edge Functions → Secrets

---

## 30. Stripe Revenue & Dunning Engine (Sprint 40)

### Architecture

Four-layer system: Stripe → Edge Function → user_metadata → React hooks → UI.

**`supabase/functions/stripe-webhook/index.ts`** (no `--no-verify-jwt` — Stripe does not send a Supabase JWT):

| Stripe event | Action |
|---|---|
| `checkout.session.completed` | Set `plan_tier` (from price ID) + `billing_status: 'active'` + save `stripe_customer_id`; tag subscription with `supabase_user_id` metadata |
| `customer.subscription.updated` | Update `plan_tier` from new price ID |
| `customer.subscription.deleted` | Set `plan_tier: 'free'` + `billing_status: 'canceled'` |
| `invoice.payment_failed` | Set `billing_status: 'past_due'` — triggers dunning UI |
| `invoice.payment_succeeded` | Set `billing_status: 'active'` — resolves dunning |

User lookup order:
1. `session.client_reference_id` (checkout.session.completed) — set by `buildCheckoutUrl()`
2. `subscription.metadata.supabase_user_id` — tagged on first checkout
3. Scan `auth.users` list for matching `stripe_customer_id` in `user_metadata` (fallback)

### `user_metadata` fields written by stripe-webhook
```ts
plan_tier:        'free' | 'pro' | 'unlimited'
billing_status:   'active' | 'past_due' | 'canceled'
stripe_customer_id: string  // saved on first checkout, used for user lookup
```

### Dashboard dunning UI (`src/pages/Dashboard.tsx`)

```tsx
const billingStatus = useBillingStatus()

// In JSX, between page heading and KPI grid:
<AnimatePresence>
  {billingStatus === 'past_due' && <DunningBanner isHe={isHe} />}
</AnimatePresence>
```

`DunningBanner` — red glassmorphism card (`rgba(239,68,68,0.1)` bg, `rgba(239,68,68,0.3)` border) with `ds-dunning-pulse` glow keyframe, `AlertTriangle` icon, bilingual warning text, CTA link to `STRIPE_CUSTOMER_PORTAL`.

`handleCreate` blocks navigation when `billing_status === 'past_due'`:
```ts
const handleCreate = () => {
  if (billingStatus === 'past_due') return  // locked
  // ... rest of create logic
}
```

### ProtectedLayout navbar lock (`src/components/layout/ProtectedLayout.tsx`)

When `billingStatus === 'past_due'`, the "New Proposal" button:
- Shows `<Lock>` icon instead of `<Plus>`
- Uses red-muted styling (`rgba(255,255,255,0.06)` bg, `rgba(239,68,68,0.3)` border, `rgba(248,113,113,0.7)` text)
- `cursor: not-allowed`, `opacity: 0.65`
- Hover/tap animations suppressed (`whileHover={{}}`, `whileTap={{}}`)
- `title` tooltip explains the lock in current locale

### Stripe Webhook setup checklist
1. Go to Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://aefyytktbpynkbxhzhyt.supabase.co/functions/v1/stripe-webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`
4. Copy signing secret → Supabase Dashboard → Edge Functions → Secrets → `STRIPE_WEBHOOK_SECRET`
5. Also set: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_PREMIUM`
6. Deploy: `supabase functions deploy stripe-webhook --project-ref aefyytktbpynkbxhzhyt`

---

## 31. Document-Only Mode & Lean Market Features (Sprint 43)

### Three new proposal-level booleans

| Field | Default | Purpose |
|---|---|---|
| `display_bsd` | `false` | Show בס"ד at the top-right of the document (cover page in PDF, top of card in LivePreview/DealRoom) — Israeli market psychological trigger |
| `hide_grand_total` | `false` | Hides the animated grand total and VAT breakdown in Deal Room + LivePreview + PDF — for "menu-style" proposals that avoid sticker-shock |
| `is_document_only` | `false` | Strips ALL financial blocks (base package, add-ons, milestones, pricing table, grand total) — turns the platform into a pure legal e-signing tool |

### EditorPanel UI

- **Document Mode segmented control** — sits between the read-only overlay and the Client Details section. Two modes: "Proposal" (default) and "Legal Document" (`is_document_only: true`). Uses indigo glow on active segment.
- **Document Settings section** — contains BSD toggle and Hide Grand Total toggle. The Hide Grand Total toggle is hidden when `is_document_only` is true (no financial blocks exist to hide).
- Pricing, Add-ons, and Payment Milestones sections are wrapped in `{!draft.is_document_only && ...}` guards.

### Rendering guards — WYSIWYG parity

LivePreview, DealRoom, and PDF all use the same conditional pattern:
- `{!proposal.is_document_only && ...}` wraps base package card, add-ons, milestones
- `{!proposal.hide_grand_total && !proposal.is_document_only && ...}` wraps the total display
- BSD: `{proposal.display_bsd && <בס"ד marker>}` at the top of content

### CheckoutClimax

Two new props: `isDocumentOnly` and `hideGrandTotal`. When either is true:
- Total row is hidden
- Itemized receipt breakdown is hidden
- CTA button text changes: "חתום על המסמך" / "Sign Document" (instead of "אשר וחתום על ההצעה" / "Approve & Sign Proposal")

### PDF Engine

- BSD marker rendered as absolute-positioned text at top-right of cover page
- Cover doc label changes: "הסכם התקשרות" / "SERVICE AGREEMENT" (instead of "הסכם התקשרות והצעת מחיר" / "PROPOSAL & SERVICE AGREEMENT")
- Pricing table, discount/VAT box, and milestones section wrapped in `{!proposal.is_document_only && ...}`
- Grand total box wrapped in `{!proposal.is_document_only && !proposal.hide_grand_total && ...}`

### DealRoom extras

- "Decline Offer" button hidden when `is_document_only` (no financial offer to decline)
- All existing `isFinanciallyLocked` logic from Sprint 42 is unaffected — document-only guards are additive

---

## 32. Israeli VAT Model & Sent-State Locking (Sprint 44)

### Israeli VAT model — prices ALWAYS include VAT

**Business context:** In Israel, all consumer-facing and B2B prices are quoted inclusive of VAT. A freelancer enters ₪12,000 as the project price — that IS what the client pays. The invoice then decomposes this total into a pre-VAT component and a VAT component. This is how KSP, Partner, and every Israeli business operates.

**The `include_vat` toggle meaning:**
- `include_vat = true` → "I am a VAT-registered business (עוסק מורשה)" — show the VAT breakdown to the client. Prices remain unchanged; VAT is **extracted from within** the entered amount.
- `include_vat = false` → "I am VAT-exempt (עוסק פטור)" — no VAT exists. Total is exactly as entered, no VAT component shown.

**Critical:** VAT is NEVER added on top of entered prices. The entered price IS the final price. The system only decomposes it.

### Financial Math Engine (`src/lib/financialMath.ts`)

`calculateFinancials()` is the single source of truth for all financial calculations across the entire app (EditorPanel, LivePreview, DealRoom, CheckoutClimax, PDF).

```ts
// Step 4: VAT — Israeli model
if (proposal.include_vat) {
  // Prices include VAT — grand total IS the entered sum, extract VAT from within
  grandTotal = afterGlobalDiscount
  beforeVat = netFromGross(grandTotal, vatRate)     // total / (1 + 0.18)
  vatAmt = roundILS(grandTotal - beforeVat)
} else {
  // No VAT (עוסק פטור) — prices are final, no VAT component
  beforeVat = afterGlobalDiscount
  vatAmt = 0
  grandTotal = beforeVat
}
```

**Key functions:**
```ts
netFromGross(gross, rate)    // Strip VAT from gross → net: gross / (1 + rate)
vatOnGross(gross, rate)      // Extract VAT component: gross - gross / (1 + rate)
grossFromNet(net, rate)      // Add VAT to net → gross: net * (1 + rate)
calcGrandTotal(...)          // No longer adds VAT — returns entered sum as-is
calcOriginalTotal(...)       // Same — no VAT added on top
```

**`calcGrandTotal` and `calcOriginalTotal`** — the `_includeVat` and `_vatRate` parameters are prefixed with underscore (unused). These functions return the entered amount directly. All VAT logic lives exclusively in `calculateFinancials()`.

### VAT display labels — "מתוכם מע"מ" pattern

Every surface that shows VAT uses the "of which VAT" (מתוכם מע"מ) pattern — never "+VAT" or "VAT added":

| Surface | Hebrew | English |
|---|---|---|
| EditorPanel add-on row | `מתוכם מע"מ 15 ₪` | `VAT incl. ₪15` |
| EditorPanel VAT preview | `סה"כ: 100 ₪ (מתוכם מע"מ: 15 ₪)` | `Total: ₪100 (VAT incl.: ₪15)` |
| EditorPanel VAT summary | `מתוכם מע"מ (18%)` | `Of which VAT (18%)` |
| LivePreview | `כולל מע"מ (18%): 1,830 ₪` | `Incl. VAT (18%): ₪1,830` |
| CheckoutClimax | `מתוכם מע״מ (18%)` | `Of which VAT (18%)` |
| PDF Engine | `מתוכם מע"מ` | `Of which VAT` |
| ServicesLibrary | `מתוכם מע"מ: 15 ₪` | `VAT incl.: ₪15` |
| ReusableServices | `מתוכם מע"מ: 15 ₪` | `VAT incl.: ₪15` |

### `prices_include_vat` column

Migration 30 adds `prices_include_vat BOOLEAN NOT NULL DEFAULT FALSE` to the proposals table. This column exists in the schema and `Proposal` type but is currently a no-op — the VAT model is driven entirely by `include_vat`. The column was added for potential future use (e.g., supporting both net-price and gross-price entry modes).

### Sent-state document locking

After a proposal is sent (`status ∈ {sent, viewed, accepted}`), the business owner must NOT be able to:
1. **Change the document type** (proposal ↔ legal document) — changing `is_document_only` after the client received it creates legal ambiguity

These unlock only when the client sends a revision request (`status = needs_revision`).

**Implementation — `structureLocked` guard:**
```tsx
// Inside EditorPanel, in the document mode segmented control section:
const structureLocked = isFinanciallyLocked && !needsRevision
```

When `structureLocked`:
- Document mode buttons get `disabled` + `cursor: not-allowed` + `opacity: 0.5`
- A Lock icon overlay appears with "נעול לאחר שליחה" / "Locked after sending" text

**Props driving the lock:**
```ts
interface EditorPanelProps {
  isFinanciallyLocked?: boolean  // true when status ∈ {sent, viewed, accepted}
  needsRevision?: boolean        // true when status === 'needs_revision'
}
```

### Removed: secondary VAT toggle

Sprint 44 removed the `prices_include_vat` secondary toggle from EditorPanel. Previously there were two toggles:
1. "כלול מע"מ" (include VAT) — primary
2. "מחירים כוללים מע"מ" (prices include VAT) — secondary, only visible when #1 was on

This was poor UX. Now there is only the single "כלול מע"מ" toggle. When on, prices are always treated as gross (VAT-inclusive). The `applyVat` function is no longer used in EditorPanel, ReusableServices, or ServicesLibrary — only `vatOnGross` and `netFromGross` from `financialMath.ts`.

### CheckoutClimax — simplified VAT section

The `pricesIncludeVat` prop was removed from `CheckoutClimax`. VAT display is now unconditionally "of which VAT" format:

```tsx
{includeVat && (
  <div>
    <div>{isHe ? `מתוכם מע״מ (${pct}%)` : `Of which VAT (${pct}%)`} → {vatAmount}</div>
    <div>{isHe ? 'לפני מע״מ' : 'Before VAT'} → {beforeVat}</div>
  </div>
)}
```

---

## 33. Conversion & Urgency Engine (Sprint 44.5)

### Dark mode — permanently locked

`ThemeProvider.tsx` uses `forcedTheme="dark"` on `NextThemesProvider`. This overrides all system preferences and any user toggle — `.dark` is always present on `<html>`. The `ThemeToggle` component file exists but is not mounted anywhere. Do not re-introduce a theme switcher.

```tsx
// src/components/layout/ThemeProvider.tsx
<NextThemesProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
```

`ProtectedLayout.tsx` no longer imports or renders `<ThemeToggle>`.

### Expiry Lock — DealRoom

When `proposal.expires_at` is in the past and the proposal is not yet accepted or declined, DealRoom shows a prominent "expired" state:

**`isExpired` computation** (at render level, after `brandColor`):
```ts
const isExpired = proposal.expires_at
  ? new Date(proposal.expires_at).getTime() < Date.now()
  : false
```

**Expiry banner** — rendered before the CountdownBanner, only when `isExpired && !accepted && !declined`:
- Red glassmorphism card: `rgba(239,68,68,0.1)` bg, `rgba(239,68,68,0.28)` border, `0 0 40px rgba(239,68,68,0.08)` glow
- `XCircle` icon in a red icon box
- Headline shows exact expiry date: `toLocaleDateString('he-IL', ...)` for Hebrew, `toLocaleDateString('en-US', ...)` for English
- Body: "Pricing and terms are no longer guaranteed. Please contact the sender to renew." (bilingual)
- Entrance: `variants={slideUp}` (Framer Motion, consistent with DealRoom hero)

**CountdownBanner** — suppressed when expired:
```tsx
{proposal.expires_at && !accepted && !isExpired && (
  <motion.div variants={slideUp}>
    <CountdownBanner expiresAt={proposal.expires_at} locale={locale} />
  </motion.div>
)}
```

**Pricing zone blur** — the base package card, add-ons, and milestone timeline are wrapped in a div that applies visual lock when expired:
```tsx
<div
  style={isExpired && !accepted ? {
    opacity: 0.4,
    filter: 'blur(2px)',
    pointerEvents: 'none',
    userSelect: 'none',
    transition: 'opacity 0.4s, filter 0.4s',
  } : {}}
>
  {/* base package, add-ons, milestone timeline */}
</div>
```

**CheckoutClimax** — not modified. The IIFE in DealRoom already returns an "expired" block before CheckoutClimax renders when `isExpired && !accepted`, so CheckoutClimax is never in the DOM for expired+unsigned proposals.

**No duplicate `isExpired`** — the outer `isExpired` const is used everywhere. The IIFE creates a child scope but must not redeclare it.

### Smart Follow-Up — ProposalCard

For `sent` or `viewed` proposals, the dropdown contains a "Follow Up via WhatsApp / מעקב ב-WhatsApp" item:

```ts
// ProposalCard.tsx — imports MessageCircle from lucide-react
const handleFollowUp = () => {
  const client = proposal.client_name || (locale === 'he' ? 'שם הלקוח' : 'there')
  const text = locale === 'he'
    ? `היי ${client}, רק רציתי לוודא שיצא לך לעבור על ההצעה / המסמך ששלחתי. \nאפשר לצפות ולאשר אותה מכל מכשיר ממש כאן:\n${shareUrl}\n\nאני זמין לכל שאלה!`
    : `Hi ${client}, just checking in to see if you had a chance to review the document. \nYou can view and approve it securely right here:\n${shareUrl}\n\nLet me know if you have any questions!`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
}
```

The `DropItem` is conditionally rendered: `(proposal.status === 'sent' || proposal.status === 'viewed')`. Icon: `<MessageCircle size={15} style={{ color: '#25D366' }} />`.

### Premium Share Copy — SendModal

WhatsApp share text in `SendModal.tsx` uses B2B-grade copy with bold project title and structured line breaks:

```ts
const waMsg = isHe
  ? `היי ${clientDisplay},\nהכנתי עבורך את המסמך / הצעת המחיר: *${titleDisplay}*.\n\nאפשר לצפות בפרטים, לבחור אפשרויות ולחתום דיגיטלית באופן מאובטח בלינק הבא:\n${shareUrl}`
  : `Hi ${clientDisplay},\nI've prepared the document / proposal for: *${titleDisplay}*.\n\nYou can review the details, customize options, and securely sign it online here:\n${shareUrl}`
```

`*project title*` renders in bold in WhatsApp. `clientDisplay` falls back to `'שם הלקוח'` (he) / `'there'` (en) when no client name is set.

---

## 34. Global Business Terms (Sprint 44.9)

### Architecture

Two-layer chain: Profile → EditorPanel auto-inject → proposal column → Deal Room + PDF.

**Removed in Sprint 44.9:**
- `ContractLibrary.tsx` (`/contracts` route) — entire page deleted
- `contractTemplates.ts` — entire file deleted
- `video_url` column — dropped in migration 31
- Video Pitch field in EditorPanel — deleted
- Contract template picker in EditorPanel — deleted

**Added in Sprint 44.9:**
- `business_terms TEXT NOT NULL DEFAULT ''` column on proposals (migration 31)
- Global Business Terms section in `Profile.tsx` (section 7, sits between Company Logo and VAT Rate)
- `business_terms` frozen into each proposal by EditorPanel useEffect on every save
- Business Terms consent flow in DealRoom + CheckoutClimax
- Business Terms page in PDF (new page via `<View break>`)
- Updated `knowledgeBase.ts` FAQ items — contracts FAQ removed, business terms FAQ added

### Business Terms display in DealRoom

```tsx
// Always visible when non-empty — even after signing (no !accepted guard)
{!!(proposal.business_terms?.trim()) && (
  <motion.div variants={slideUp} className="...">
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-3">
      {locale === 'he' ? 'תנאי העסק' : 'Business Terms'}
    </p>
    <div
      className="prose prose-invert prose-sm max-w-none text-white/60"
      dangerouslySetInnerHTML={{ __html: proposal.business_terms }}
    />
  </motion.div>
)}
```

**Why always visible (no `!accepted` guard):** A client who revisits a sealed deal after days or months should still be able to read the terms they agreed to. The terms are also always present in the downloadable signed PDF.

### CheckoutClimax business terms consent

```ts
// Props added to CheckoutClimaxProps:
businessTerms?: string
businessTermsConsent?: boolean
onBusinessTermsConsentChange?: (v: boolean) => void

// canSign gate:
const businessTermsRequired = !!(businessTerms?.trim())
const canSign = clientDetailsConfirmed && signatureConfirmed && legalConsent
  && (!businessTermsRequired || businessTermsConsent)
```

The consent checkbox appears via `AnimatePresence` only after the signature is drawn and only when terms exist. It is separate from and in addition to the existing DealSpace platform `legalConsent` checkbox.

### knowledgeBase.ts — Help Center FAQ

`src/lib/knowledgeBase.ts` contains `KNOWLEDGE_BASE: KBItem[]` and `KB_CATEGORIES`. The category previously named "Services & Contracts" / "שירותים וחוזים" was renamed to "Services & Terms" / "שירותים ותנאים" (Sprint 44.9). Contract-related FAQ items were removed and replaced with business terms items.

```ts
interface KBItem {
  id: string
  q_he: string
  q_en: string
  a_he: string
  a_en: string
  category: string
}
```

---

## 26. What NOT To Do

- **Do not add StrictMode** — Framer Motion v12 double-invokes effects, causing animation glitches.
- **Do not use `ease: number[]`** in Framer Motion — use named strings with `as const`.
- **Do not use `react-signature-canvas`** — it was removed due to CJS/ESM crashes in Vite production builds. Use the native canvas `SignaturePad` component.
- **Do not hardcode language strings** in bilingual components — every label needs He/En variants.
- **Do not hardcode currency symbols** (₪) — derive from actual proposal currency data.
- **Do not omit `payment_milestones: []`** from any `ProposalInsert` default objects — it is a required field and its absence breaks `tsc -b`.
- **Do not write SECURITY DEFINER RPCs without `SET search_path = public`** — anon context cannot resolve the `proposals` table without it.
- **Do not add error handling for impossible states** — trust Zustand, trust TypeScript.
- **Do not add docstrings or comments** to existing code you didn't change.
- **Do not abstract prematurely** — three similar JSX blocks are fine; a helper is only justified when there are 4+ uses with real shared logic.
- **Do not commit `.env.local`** — it contains the Supabase PAT and service role key.
- **Do not use `git add -A`** for commits — stage files explicitly.
- **Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser** — only `VITE_*` variables reach the bundle.
- **Do not guard `/deal/:token` with auth** — it's the public client-facing URL.
- **Do not use the Vercel "Redeploy" button on a failed build** if you've pushed a fix — push an empty commit instead to trigger a fresh webhook.
- **Do not use Lenis `syncTouch: true`** — it intercepts iOS native composited scrolling and runs physics on the JS main thread, causing severe FPS drops and eye strain on mobile. Always use `syncTouch: false`.
- **Do not put `dir="ltr"` on a container that holds Hebrew text** without overriding `dir` on the individual text elements — inherited LTR direction makes periods appear at the wrong visual position in Hebrew sentences (they take LTR direction and appear on the left instead of the right).
- **Do not put a trailing period directly after a Latin word in Hebrew text** (e.g., `'שלחו PDF.'`) — the period adjacent to the Latin characters takes LTR direction and renders at the wrong visual position. Remove the period or restructure the sentence.
- **Do not call `setState` inside `useMotionValueEvent` without a ref guard** — it fires on every animation tick (60fps) and causes constant unnecessary re-renders. Always compare against a ref before calling `setState`.
- **Do not fire `DeviceOrientationEvent` handlers without a `requestAnimationFrame` throttle** — the event fires faster than 60fps on some devices. Gate with a single `rAF` per tick.
- **Do not use `tabIndex={-1}` on Radix Tooltip triggers** — it removes the element from the focus order, blocking the only non-hover interaction path on touch devices. Use `tabIndex={0}` and add a controlled `open` + `onClick` toggle.
- **Do not rely on Radix Tooltip's default hover/focus behavior for touch targets** — `mouseenter` never fires on mobile. Every Tooltip that must be accessible on touch must use controlled `open` state with an `onClick` toggle (see §21 Radix Tooltip pattern).
- **Do not use `'dealspace-locale'` as the localStorage key** — the correct key is `'dealspace:locale'` (with a colon, matching the i18n store). Using the wrong key silently falls back to `navigator.language` on mobile.
- **Do not use `py-*` padding alone for button height uniformity** — padding scales with content; if text wraps, the button grows taller than siblings. Always use explicit `h-*` (e.g., `h-9`) on action buttons alongside `whitespace-nowrap` on text spans.
- **Do not omit `whitespace-nowrap` on button text spans** — without it, long labels like "הורד PDF" will wrap to two lines inside a flex button, inflating its height and breaking visual uniformity. Use `whitespace-nowrap` on every `<span>` inside a button, and `hidden sm:inline` to hide text entirely on mobile if space is tight.
- **Do not fire confetti without checking `freshSignedRef.current`** — `setAccepted(true)` also runs on page load for already-accepted proposals. The ref guard is the only thing preventing confetti from playing when a creator or client revisits a sealed deal link.
- **Do not put `triggerPostSignatureAutomations` inside the React component** — it lives in `src/lib/automations.ts` (module level) and takes `Proposal` as input. Placing it inside a component creates a new function reference on every render.
- **Do not throw or re-throw errors from `triggerPostSignatureAutomations`** — it must be fire-and-forget. A failed webhook must never block or break the signing flow. Always swallow errors silently.
- **Do not expose `user_metadata.webhook_url` to clients via the Deal Room** — the webhook URL is a creator-private field. It travels through `creator_info.webhook_url` on the proposal record, but `get_deal_room_proposal` RPC excludes sensitive fields. Never render it in Deal Room UI.
- **Do not use `accepted / all-non-draft` for Win Rate** — drafts and pending proposals dilute the metric incorrectly. The denominator must be `accepted + rejected` only (resolved deals).
- **Do not remove `!important` from `input { font-size: 16px }` in `index.css`** — Tailwind class selectors have higher specificity than element selectors. Without `!important`, the rule is silently overridden by `text-sm` and iOS zoom returns on all inputs.
- **Do not do optimistic in-place replace with Realtime `newRow` for UPDATE events** — the Supabase Realtime payload is partial and omits JSONB columns. Always call `fetchProposals()` on UPDATE. This bug has recurred multiple times.
- **Do not concatenate Hebrew labels with colons in react-pdf `<Text>` nodes** — the colon `:` is a Bidi-neutral character. In react-pdf's LTR rendering context, a trailing colon on Hebrew text migrates to the wrong visual position (renders as `שם :` with space before colon). Hebrew labels in the PDF engine must be plain words without colons; visual separation is provided by color contrast and alignment.
- **Do not concatenate Hebrew text + date + time in a single react-pdf `<Text>` node** — the Bidi algorithm scrambles the output. Always use `fmtDate()` and `fmtTime()` as separate `<Text>` nodes inside a `flexDirection: 'row'` View.
- **Do not use bare `<Text>` nodes for label/value pairs in react-pdf** — use the Iron Grid pattern: each label and value wrapped in its own `<View>` with an explicit percentage width and `textAlign`. Fixed-width Views create hard layout boundaries that the Bidi algorithm cannot cross.
- **Do not use `toLocaleString('he-IL')` inside the PDF engine** — Hebrew locale strings contain Unicode Bidi control characters that cause react-pdf to reorder digits. Use `fmtDate()` (DD.MM.YYYY) and `fmtCurrencyPdf()` (en-US number + manual symbol).
- **Do not use dark/neon backgrounds in the PDF** — the PDF engine uses white paper aesthetics. Brand color is restricted to: cover/cert hero strips, table header backgrounds (white text), section title text, grand total left accent bar, milestone badges. No dark backgrounds, no neon glow, no `rgba(0,0,0,0.x)` card fills.
- **Do not rely on `justifyContent: 'space-between'` in react-pdf for RTL rows** — it behaves unreliably in mixed Bidi contexts. Use `flexDirection: 'row-reverse'` with explicit child widths instead.
- **Do not skip `sealed={accepted}` on `PremiumSliderCard` in DealRoom** — once a proposal is accepted, all slider/toggle controls must be locked. The `sealed` prop disables the toggle, hides the quantity slider, and removes hover effects.
- **Do not use the service's DB `id` as the injected add-on `id`** — always call `crypto.randomUUID()` when mapping a `Service` → `AddOn` in `ReusableServices`. Using the same id links the proposal's add-on to the library entry, causing silent historical mutation if the service is later edited or deleted.
- **Do not apply `filter: brightness(0) invert(1)` to company logos in Deal Room** — this filter first turns all pixels black then white, destroying any logo with a colored or non-transparent background. Display logos inside a glassmorphism pill container instead.
- **Do not read services from localStorage** — `ServicesLibrary.tsx` and `ReusableServices.tsx` both source data from `useServicesStore` (Supabase). The old `dealspace:saved-services` localStorage key is abandoned as of Sprint 27.
- **Do not call Supabase Edge Functions without the `apikey` header** — the Supabase API gateway requires `'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY` alongside `Authorization: Bearer <access_token>`. Omitting it causes the gateway to return a non-2xx response and the function appears to not be deployed (it is deployed — the gateway just rejects the request silently).
- **Do not use `toLocaleDateString()` in admin data tables** — it produces browser/OS-dependent output ("Mar 2026 29") that breaks table layout. Always use the manual `fmtDate()` formatter: `DD Mon` for current year, `DD Mon YYYY` for past years. For recency columns use `timeAgo()` ("Just now", "3h ago", "Yesterday", "5d ago").
- **Do not block the signing flow on IP fetch failure** — `fetch('https://api.ipify.org')` can time out on slow or restricted networks. Always wrap it in try/catch and fall back to `'Unknown'`. The signing must complete regardless of whether IP capture succeeds.
- **Do not re-run `admin_delete_user` without confirmation UI** — it calls `auth.users delete` which is permanent and irreversible. The Danger tab must have a confirmation step (type-to-confirm or explicit confirm button) before calling the RPC.
- **Do not change the admin guard email** — `AdminRoute.tsx` and all admin RPCs are hardcoded to `roychen651@gmail.com`. This is intentional: it is the single founder account. Do not extract it to a config or make it dynamic.
- **Do not deploy the `admin-impersonate` edge function with `supabase functions deploy` without the `--project-ref` flag** — without it the CLI may deploy to the wrong project. Always: `supabase functions deploy admin-impersonate --project-ref aefyytktbpynkbxhzhyt`.
- **Do not add `DROP FUNCTION` to a migration without re-creating with `GRANT`** — every DROP+CREATE pair must end with the appropriate `GRANT EXECUTE ON FUNCTION … TO anon` and/or `authenticated`. Missing grants silently break the function for the intended caller.
- **Do not deploy `send-proposal` without `--no-verify-jwt`** — the Supabase API gateway was rejecting the user JWT before the function could validate it. The function manually validates with `adminClient.auth.getUser(jwt)` instead. Removing the flag silently breaks all email sends with a 401.
- **Do not change `FROM_EMAIL` to a custom domain until the domain is verified in Resend** — Resend rejects unverified sender domains with a 422. Keep `onboarding@resend.dev` until Resend shows "Verified" for `dealspace.app`, then switch to `proposals@dealspace.app` and redeploy.
- **Do not write `billing_status` from the client** — it is written exclusively by the `stripe-webhook` edge function via the Supabase Admin API. Client code only reads it via `useBillingStatus()`.
- **Do not skip the Stripe webhook signature verification** — `stripe.webhooks.constructEventAsync(body, signature, secret)` must always be the first step in the handler. Skipping it allows anyone to spoof Stripe events and grant themselves arbitrary plan tiers.
- **Do not use `session.metadata.plan_tier` to determine the tier in `checkout.session.completed`** — Payment Links cannot set session metadata. Instead, retrieve the subscription and map the `price.id` to a tier using `PRICE_TO_TIER`. Configure `STRIPE_PRICE_PRO` and `STRIPE_PRICE_PREMIUM` in Supabase Edge Function secrets.
- **Do not show `DunningBanner` or lock the create button based on `tier === 'free'`** — the lock is for `billing_status === 'past_due'` only. A `free` user who never had a subscription has `billing_status: null` and should never see the dunning UI.
- **Do not add VAT on top of entered prices** — Israeli VAT model: all prices entered by the creator ALREADY include VAT. The system extracts VAT from within using `netFromGross()` / `vatOnGross()`. Never use `grossFromNet()` or `applyVat()` to inflate a displayed price. The grand total the client sees must ALWAYS equal the sum the creator entered.
- **Do not show "+מע"מ = X" or "VAT = X" labels** — the correct pattern is "מתוכם מע"מ" / "Of which VAT" / "VAT incl." — indicating VAT is extracted from within, not added on top. This distinction is critical for Israeli business users who think in gross prices.
- **Do not add a secondary VAT toggle** — Sprint 44 explicitly removed the two-toggle approach after user feedback. There is only one toggle: `include_vat`. When on, prices are gross. When off, no VAT exists. Do not re-introduce `prices_include_vat` as a separate UI control.
- **Do not allow document type changes after sending** — once `isFinanciallyLocked && !needsRevision`, the document mode segmented control (proposal ↔ legal document) and contract template picker must be disabled. Changing document structure after the client received it creates legal ambiguity.
- **Do not use `applyVat()` from `types/proposal.ts` for display purposes** — this function adds VAT on top (`amount * (1 + rate)`), which contradicts the Israeli gross-price model. For VAT extraction, use `vatOnGross()` and `netFromGross()` from `financialMath.ts`.
- **Do not re-enable light mode or add a ThemeToggle** — the app is permanently locked to dark mode via `forcedTheme="dark"` in `ThemeProvider.tsx`. The `ThemeToggle` component exists but is intentionally not mounted. Do not re-add it to `ProtectedLayout` or any other layout.
- **Do not re-declare `isExpired` inside the DealRoom IIFE** — `isExpired` is computed once at render level in `DealRoom.tsx`. The IIFE forms a child scope so there is no conflict, but re-declaring it creates two sources of truth. Use the outer-scope const throughout.
- **Do not show the CountdownBanner when `isExpired`** — the countdown serves urgency for active proposals only. When a proposal is already expired, `CountdownBanner` must be suppressed and the red expiry banner shown instead. Render condition: `proposal.expires_at && !accepted && !isExpired`.
- **Do not render the Follow-Up WhatsApp item for non-sent proposals** — the item only appears for `status === 'sent'` or `status === 'viewed'`. For `draft`, `accepted`, `rejected`, or `needs_revision` it must be absent.
- **Do not hardcode a recipient phone number in the WhatsApp deep link** — use `https://wa.me/?text=...` (no phone number) so the user can select a contact from their own WhatsApp. Specifying a phone would expose the creator's contact info or fail for international numbers.
- **Do not restore ContractLibrary or contractTemplates** — both were intentionally removed in Sprint 44.9. The `/contracts` route no longer exists. Contract template logic (`CONTRACT_TEMPLATES`, `CATEGORY_LABELS`, `interpolateTemplate`) is gone. Do not re-import these.
- **Do not add a `video_url` field anywhere** — it was dropped from the proposals table in migration 31. The Video Pitch section was removed from EditorPanel. Any reference to `proposal.video_url` or `video_url` in types/proposal.ts is a regression.
- **Do not add `!accepted` guard to the business terms render block in DealRoom** — terms must remain visible even after signing so the client can re-read what they agreed to. The signed PDF also includes the terms. Never hide them on sealed/revisited deal links.
- **Do not use `breakBefore: 'page'` as a CSS style in react-pdf** — `breakBefore` is not in react-pdf's `Style` type. Page breaks are achieved via the `break` JSX prop on `<View>`: `<View break style={s.section}>`. Putting `breakBefore` in a style object causes a TypeScript compile error.
- **Do not let business terms consent be optional when `proposal.business_terms` is non-empty** — the `canSign` condition in CheckoutClimax must include `(!businessTermsRequired || businessTermsConsent)`. Omitting this allows signing without consenting to the creator's business terms.
- **Do not rename the business terms section to "תנאים והתניות"** — that exact label is already used for the DealSpace platform terms. The business terms section must be labelled `'תנאי העסק'` (he) / `'Business Terms'` (en) to avoid confusion.
