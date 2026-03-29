# DealSpace — CLAUDE.md

Authoritative reference for Claude when working in this repository.
Read this before touching any file. Everything here reflects the live codebase after Sprints 1–12.

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
| Routing | react-router-dom | ^7.13 |
| State | Zustand | ^5.0 |
| Backend | Supabase JS | ^2.100 |
| Icons | Lucide React | ^1.7 |
| PDF | @react-pdf/renderer | latest |

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

---

## 5. File & Folder Map

```
src/
├── pages/
│   ├── LandingPage.tsx      # / — marketing page, bilingual He/En, default Hebrew
│   ├── Auth.tsx             # /auth — Linear.app style, pure black bg, glassmorphism card
│   ├── AuthCallback.tsx     # /auth/callback — Supabase PKCE redirect handler
│   ├── ResetPassword.tsx    # /auth/reset-password — password reset flow
│   ├── Dashboard.tsx        # /dashboard — KPI cards, grid/list/kanban views, filter/sort bar, Help button in Navbar
│   ├── ProposalBuilder.tsx  # /proposals/new + /proposals/:id — split-screen editor
│   ├── DealRoom.tsx         # /deal/:token — public, no auth, full client-facing flow
│   ├── Profile.tsx          # /profile — identity, avatar, password, business info, brand color, VAT
│   ├── ServicesLibrary.tsx  # /services — reusable service definitions
│   ├── ContractLibrary.tsx  # /contracts — contract template management
│   └── Legal.tsx            # /terms + /privacy — legal pages
│
├── components/
│   ├── builder/
│   │   ├── EditorPanel.tsx       # Left pane: all proposal fields, VAT toggle, milestones, contract picker, AI Ghostwriter
│   │   ├── LivePreview.tsx       # Right pane: real-time preview, spring-animated total, VAT-aware
│   │   ├── AIGhostwriter.tsx     # AI description generator (contextual, bilingual)
│   │   └── ReusableServices.tsx  # Pick from saved services library to add to proposal
│   ├── deal-room/
│   │   ├── PremiumSliderCard.tsx  # Interactive add-on card with range slider
│   │   ├── CheckoutClimax.tsx     # Sticky bottom bar: animated total, VAT breakdown, signature, CTA
│   │   ├── SignaturePad.tsx       # Native canvas draw signature — NO external dependency
│   │   ├── ClientDetailsForm.tsx  # Client legal identity capture (name, company, tax ID, address, role)
│   │   └── MilestoneTimeline.tsx  # Animated payment schedule — spring-animated amounts
│   ├── dashboard/
│   │   ├── ProposalCard.tsx       # Grid card with status badge, responsive 3-dot menu (desktop dropdown / mobile bottom sheet)
│   │   ├── ProposalCardSkeleton   # Loading skeleton
│   │   ├── KanbanBoard.tsx        # Kanban view grouped by status
│   │   └── BottomSheet.tsx        # Mobile bottom sheet
│   ├── onboarding/
│   │   └── GuidedTour.tsx         # First-run highlight tour
│   └── ui/
│       ├── PremiumInputs.tsx      # Shared input primitives (Radix slider, date picker)
│       ├── AccessibilityWidget.tsx # Draggable FAB + fixed panel, 14 a11y controls, IS 5568 / WCAG 2.2 AA
│       └── HelpCenterDrawer.tsx   # Side drawer with 10 bilingual FAQ items + category filter; controlled via props
│
├── stores/
│   ├── useAuthStore.ts        # Zustand: auth state, signIn/Up/Out, updateProfile/Password
│   ├── useProposalStore.ts    # Zustand: proposals CRUD with optimistic updates + demo injection
│   └── useAccessibilityStore.ts # 14 a11y states, CSS DOM mutations, localStorage persistence (ds:a11y:*)
│
├── lib/
│   ├── supabase.ts          # Supabase client singleton
│   ├── i18n.ts              # Zustand i18n store, He/En translations, dir/lang on <html>
│   ├── pdfEngine.tsx        # @react-pdf/renderer — bilingual PDF with brand color + milestones
│   └── passwordValidation.ts # Strength rules (score 1-4, color, label_en/he, rules[])
│
├── types/
│   └── proposal.ts          # Proposal, ProposalInsert, AddOn, PaymentMilestone, CreatorInfo,
│                            #   proposalTotal(), applyVat(), formatCurrency(), milestonesValid(), STATUS_META
│
└── App.tsx                  # BrowserRouter, routes, ProtectedRoute, PublicRoute, ErrorBoundary

supabase/
└── migrations/
    ├── 01_proposals_schema.sql     # proposals table, RLS, indexes, updated_at trigger
    ├── 02_deal_room_rpcs.sql       # mark_proposal_viewed(), accept_proposal()
    ├── 03_vat_field.sql            # include_vat column + update_proposal_time_spent RPC
    ├── 04_access_code.sql          # access_code column + get_deal_room_proposal RPC
    ├── 05_fix_deal_room_rpc.sql    # Adds SET search_path = public, grants to authenticated
    ├── 06_sprint10.sql             # payment_milestones, client capture fields, brand_color, creator_info + save_client_details RPC
    └── 07_sprint11.sql             # success_template column + decline_proposal() RPC
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
/contracts                 → ContractLibrary      (ProtectedRoute)
/deal/:token               → DealRoom            (fully public, no auth)
/profile                   → Profile             (ProtectedRoute)
/terms                     → Legal               (always public)
/privacy                   → Legal               (always public)
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

---

## 9. Database Schema

### `proposals` table — all columns across all 6 migrations

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
| `created_at` | timestamptz | now() |
| `updated_at` | timestamptz | auto-updated via trigger |

### RLS Policies
- `owner_select / owner_insert / owner_update / owner_delete` — `auth.uid() = user_id`
- `public_token_select` — `public_token IS NOT NULL` (lets anyone read via token — required for Deal Room)

### RPCs (all SECURITY DEFINER, SET search_path = public)

```sql
-- Migration 02
mark_proposal_viewed(p_token TEXT)
  → increments view_count, sets last_viewed_at, advances status to 'viewed'
  → granted to: anon

accept_proposal(p_token TEXT)
  → sets status = 'accepted' (only from sent/viewed)
  → granted to: anon

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

### Premium inputs
```css
background: rgba(255,255,255,0.05);
border: 1px solid rgba(255,255,255,0.1);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
border-radius: 1rem; /* rounded-2xl */
/* on focus: */
border: 1px solid rgba(99,102,241,0.55);
box-shadow: 0 0 0 3px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.06);
```

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

---

## 12. ProposalBuilder Architecture

Split-screen at `100dvh`, no page scroll.

```
<header>          ← sticky top bar: back button, save status, Send button
<div flex flex-1 overflow-hidden>
  <EditorPanel>   ← left ~35% on desktop, full-width on mobile (overflow-y-auto)
  <LivePreview>   ← right ~65% on desktop only (hidden lg:flex)
<BottomSheet>     ← mobile-only preview (62vh, triggered by eye icon)
<SendModal>       ← AnimatePresence modal with share URL + copy button
```

### EditorPanel sections (collapsible)
1. **Project** — title, cover image URL, description, AI Ghostwriter button
2. **Client** — name, email (collapsed by default)
3. **Pricing** — base price, currency, VAT toggle (`include_vat`), date picker (`expires_at`)
4. **Add-ons** — drag-to-reorder (`Reorder.Group`), price inputs
5. **Payment Milestones** — milestone rows (name + percentage), sum indicator, validation
6. **Contract** — contract template picker (from ContractLibrary), access code (`access_code`)

### Send button condition
`canSend = Boolean(draft.project_title?.trim())` — only title is required.

### Autosave
Debounced 1500ms on every `handleChange`. On Send, the debounce is flushed synchronously before the status update.

### Refs pattern
`draftRef` and `proposalIdRef` are kept in sync with their state counterparts to give stable references inside setTimeout/async callbacks without stale closures.

### Creator info auto-injection
`EditorPanel` reads `user.user_metadata` in a `useEffect` and calls `onChange({ creator_info, brand_color })` on mount and whenever `user` changes. This ensures every saved proposal carries the latest business identity, which the PDF engine and Deal Room use without requiring auth.

---

## 13. Deal Room Architecture

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
  ↓ ClientDetailsForm    ← if !clientDetails && !accepted (capture legal identity before signing)
  ↓ Legal consent checkbox ← if clientDetails && !accepted
  ↓ CheckoutClimax        ← sticky bottom: animated VAT-aware total + SignaturePad + CTA
      → disabled until: clientDetails captured + legalConsent checked + signature drawn + confirmed
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

## 14. Profile Page

`/profile` (ProtectedRoute) — four sections:

1. **Avatar** — upload to Supabase Storage, `updateProfile({ avatar_url })`
2. **Display Name** — `updateProfile({ full_name })`
3. **Password** — strength meter (evaluatePassword), `updatePassword(newPassword)`
4. **Business Identity** (Building2 icon) — company_name, tax_id, phone, address, signatory_name — saved directly via `supabase.auth.updateUser({ data: biz })` (not through auth store)
5. **Brand Color** (Palette icon) — 12 preset swatches + custom hex input + native `<input type="color">` (sr-only) + live preview chip — saved via `supabase.auth.updateUser({ data: { brand_color } })`
6. **VAT Rate** (Percent icon) — decimal input persisted to `localStorage('dealspace:vat-rate')`, default `0.18`

### user_metadata fields (auth.users)
These live in `user.user_metadata` and are read by EditorPanel to populate `creator_info`:
- `full_name` — display name
- `avatar_url` — avatar URL
- `company_name`
- `tax_id`
- `address`
- `phone`
- `signatory_name` — printed name for contract signature block
- `brand_color` — hex string, e.g. `#6366f1`

---

## 15. PDF Engine (`src/lib/pdfEngine.tsx`)

Built with `@react-pdf/renderer`. Generates a bilingual (He/En) PDF from a signed proposal.

### Font
Heebo TTF from Google Fonts CDN v28 (CORS-enabled). Three weights: 400, 700, 900. `Font.registerHyphenationCallback(word => [word])` prevents hyphenation of Hebrew words.

### Brand color factory
```ts
function getBrandColor(proposal: Proposal): string  // validates hex, falls back to #6366f1
function makeStyles(brand: string): StyleSheet      // factory called at render time
```
Brand color flows through: header background, section title underlines, party labels, VAT/total borders, milestone bars.

### PDF sections
1. Header — company name from `creator_info.company_name` (not hardcoded "DealSpace")
2. Project title block
3. Parties — creator (left) + client (right) side-by-side
4. Description
5. Add-ons table (enabled only)
6. Payment terms — milestone table if `payment_milestones.length > 0`
7. VAT breakdown if `include_vat`
8. Total
9. Signature block — client name, role, signature image, date

### Export
```ts
export async function generateProposalPdf(options: PdfOptions): Promise<Blob>
```

---

## 16. Payment Milestones System

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

## 17. Environment Variables

Stored in `.env.local` (gitignored — never commit).

```bash
VITE_SUPABASE_URL=https://aefyytktbpynkbxhzhyt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...                  # anon/public key
VITE_APP_URL=http://localhost:5173              # or https://duel-space.vercel.app in prod

SUPABASE_SERVICE_ROLE_KEY=eyJ...               # server-only, never exposed to browser
SUPABASE_ACCESS_TOKEN=sbp_...                  # Supabase PAT — needed for npm run migrate
```

`VITE_*` variables are safe for the browser. `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_ACCESS_TOKEN` must never reach the client bundle.

---

## 18. localStorage Keys

| Key | Value | Owner |
|---|---|---|
| `dealspace:locale` | `'he'` \| `'en'` | i18n store |
| `dealspace:vat-rate` | decimal string e.g. `'0.18'` | Profile.tsx |
| `dealspace:view-mode` | `'grid'` \| `'kanban'` | Dashboard.tsx |
| `dealspace:demo-injected` | `'true'` | useProposalStore |
| `dealspace:contract-defaults` | JSON string | ContractLibrary |

---

## 19. Running Migrations

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

## 20. Known Patterns & Decisions

### Logout hover dropdown
Using `onMouseEnter/Leave` on a wrapper div (not CSS `group-hover`) because the `mt-2` gap between the avatar and dropdown causes `group-hover:block` to flash off when the mouse crosses the gap. Bridge the gap with `pt-2` padding on the dropdown container.

### PrimaryButton shimmer
The shimmer `<span>` has `pointer-events-none`, so `onMouseEnter` on it never fires. Trigger on the parent `<button>` using `onMouseEnter` + `querySelector('[data-shimmer]')` + forced reflow (`void el.offsetWidth`) before re-applying the animation.

### Framer Motion first-render visibility
FM v12 + React 19 (no StrictMode) can occasionally drop first-render `initial` states. Entrance effects on mount use CSS `animation:` via a style prop. Framer Motion is only used for interactive transitions triggered by state changes after mount.

### CSS keyframe injection
Each page/component injects custom keyframes via a `<style>` tag inside JSX. Keep names namespaced (`ds-`, `lp-`, `checkout-`, `builder-`) to avoid collisions.

### `add_ons` and `payment_milestones` in Supabase
Both are `jsonb` columns — always update the whole array (not individual elements) in `updateProposal`. Supabase returns them as plain JS objects; TypeScript casts via the `Proposal` type.

### Brand color in public Deal Room
DealRoom is fully public (no auth) — it cannot read `user_metadata`. Solution: EditorPanel auto-injects `brand_color` from `user.user_metadata` into the proposal record on every save via `onChange({ brand_color })` in a `useEffect`. DealRoom reads it from the fetched proposal.

### Creator info in PDF from public context
Same problem as brand color. Solution: `creator_info` is stored as jsonb in the proposal record, auto-populated by EditorPanel's useEffect whenever `user` changes. The anon PDF download has full creator identity because it's embedded in the proposal.

### Vercel retry vs fresh deploy
When a Vercel deployment fails, the "Redeploy" button in the dashboard replays the **same commit** — it does not pick up newer pushes to `main`. If you've pushed a fix but Vercel is still failing on the old commit, push an empty commit to force a fresh webhook:
```bash
git commit --allow-empty -m "chore: force Vercel redeploy"
git push origin main
```

---

## 21. Git & Deployment Workflow

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

## 22. Accessibility Engine (Sprint 12)

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
- 10 bilingual FAQ items (Hebrew + English, professional quality)
- Category filter: All / Sending / Pricing / Legal / Settings
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

---

## 23. What NOT To Do

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
