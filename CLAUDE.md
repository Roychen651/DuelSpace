# DealSpace — CLAUDE.md

Authoritative reference for Claude when working in this repository.
Read this before touching any file. Everything here reflects the live codebase.

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
| Signatures | react-signature-canvas | latest |

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
// ❌ Removed — causes type errors in fm v12
whileHover={{ scale: 1.02 } as object}

// ✅ Just pass the object directly
whileHover={{ scale: 1.02 }}
```

### 4.4 React StrictMode — DISABLED
`main.tsx` does NOT use `<React.StrictMode>`. Framer Motion v12 has a double-invoke bug in dev mode under StrictMode. Do not re-enable it.

---

## 5. File & Folder Map

```
src/
├── pages/
│   ├── LandingPage.tsx      # / — marketing page, bilingual He/En, default Hebrew
│   ├── Auth.tsx             # /auth — Linear.app style, pure black bg, glassmorphism card
│   ├── AuthCallback.tsx     # /auth/callback — Supabase PKCE redirect handler
│   ├── ResetPassword.tsx    # /auth/reset-password — password reset flow
│   ├── Dashboard.tsx        # /dashboard — KPI cards, proposal grid, avatar dropdown
│   ├── ProposalBuilder.tsx  # /proposals/new + /proposals/:id — split-screen editor
│   ├── DealRoom.tsx         # /deal/:token — public, no auth, client-facing
│   └── Profile.tsx          # /profile — name, avatar upload, password change
│
├── components/
│   ├── builder/
│   │   ├── EditorPanel.tsx      # Left pane: collapsible sections, drag-and-drop add-ons
│   │   └── LivePreview.tsx      # Right pane: real-time proposal preview, useSpring price
│   ├── deal-room/
│   │   ├── PremiumSliderCard.tsx  # Interactive add-on card with range slider
│   │   ├── CheckoutClimax.tsx     # Sticky bottom bar: animated total + SignaturePad
│   │   └── SignaturePad.tsx       # Canvas draw signature (react-signature-canvas)
│   ├── dashboard/
│   │   ├── ProposalCard.tsx     # Grid card with status badge, actions
│   │   ├── ProposalCardSkeleton # Loading skeleton
│   │   └── BottomSheet.tsx      # Mobile preview sheet
│   └── ui/                      # Primitive components (Button, etc.)
│
├── stores/
│   ├── useAuthStore.ts      # Zustand: auth state, signIn/Up/Out, updateProfile/Password
│   └── useProposalStore.ts  # Zustand: proposals CRUD with optimistic updates
│
├── lib/
│   ├── supabase.ts          # Supabase client singleton
│   ├── i18n.ts              # Zustand i18n store, He/En translations, dir/lang on <html>
│   └── passwordValidation.ts # Strength rules (score 1-4, color, label_en/he, rules[])
│
├── types/
│   └── proposal.ts          # Proposal, ProposalInsert, AddOn, ProposalStatus,
│                            #   proposalTotal(), formatCurrency(), STATUS_META
│
└── App.tsx                  # BrowserRouter, routes, ProtectedRoute, PublicRoute, ErrorBoundary

supabase/
└── migrations/
    ├── 01_proposals_schema.sql  # proposals table, RLS, indexes, updated_at trigger
    └── 02_deal_room_rpcs.sql    # mark_proposal_viewed(), accept_proposal() — SECURITY DEFINER
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
/deal/:token               → DealRoom            (fully public, no auth)
/profile                   → Profile             (ProtectedRoute)
*                          → redirect to /
```

**`/deal/:token` is intentionally public.** Clients receive this link — never add auth guards to it.

---

## 7. Authentication & Auth Store

### PKCE flow
Supabase is configured with PKCE. Do not switch to implicit flow.

### Auth Store (`useAuthStore`)
```ts
// Key actions:
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
```

`ProposalInsert` = `Proposal` minus server-managed fields: `id, user_id, public_token, view_count, time_spent_seconds, created_at, updated_at`.

---

## 9. Database Schema

### `proposals` table
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | gen_random_uuid() |
| `user_id` | uuid FK | references auth.users, cascade delete |
| `client_name` | text | default '' |
| `client_email` | text | nullable |
| `project_title` | text | default '' |
| `description` | text | nullable |
| `base_price` | numeric(12,2) | default 0 |
| `currency` | text | default 'ILS' |
| `add_ons` | jsonb | `[{ id, label, description, price, enabled }]` |
| `status` | enum | draft/sent/viewed/accepted/rejected |
| `expires_at` | timestamptz | nullable |
| `public_token` | text unique | hex-encoded 16 random bytes |
| `view_count` | integer | default 0 |
| `last_viewed_at` | timestamptz | nullable |
| `time_spent_seconds` | integer | default 0 |
| `created_at` | timestamptz | now() |
| `updated_at` | timestamptz | auto-updated via trigger |

### RLS Policies
- `owner_select / owner_insert / owner_update / owner_delete` — auth.uid() = user_id
- `public_token_select` — public_token IS NOT NULL (lets anyone read via token — required for Deal Room)

### RPCs (SECURITY DEFINER, granted to `anon`)
```sql
mark_proposal_viewed(p_token TEXT)  -- increments view_count, sets last_viewed_at, status→viewed
accept_proposal(p_token TEXT)       -- sets status→accepted (only from sent/viewed)
```

Both are called from the unauthenticated Deal Room client.

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
- **Gold accent:** `#d4af37` (urgency, star ratings)
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
- **Spring counters:** `useMotionValue` + `useSpring` + `useTransform` (Dashboard KPIs, CheckoutClimax total)

---

## 12. ProposalBuilder Architecture

Split-screen at `100dvh`, no page scroll.

```
<header>          ← sticky top bar: back button, save status, Send button
<div flex flex-1 overflow-hidden>
  <EditorPanel>   ← left 35% on desktop, full-width on mobile (overflow-y-auto)
  <LivePreview>   ← right 65% on desktop only (hidden lg:flex)
<BottomSheet>     ← mobile-only preview (62vh, triggered by eye icon)
<SendModal>       ← AnimatePresence modal with share URL + copy button
```

### Send button condition
`canSend = Boolean(draft.project_title?.trim())` — only title is required. Client name is in a collapsible section that users may not open first.

### Autosave
Debounced 1500ms on every `handleChange`. On Send, the debounce is flushed synchronously before the status update.

### Refs pattern
`draftRef` and `proposalIdRef` are kept in sync with their state counterparts to give stable references inside setTimeout/async callbacks without stale closures.

---

## 13. Deal Room Architecture

**Fully public route — no auth required.**

```
DealRoom.tsx
  ↓ fetch proposal by public_token
  ↓ supabase.rpc('mark_proposal_viewed', { p_token })  ← silent, fire-and-forget
  ↓ render proposal header + countdown banner
  ↓ PremiumSliderCard[]  ← one per add-on
  ↓ CheckoutClimax        ← sticky bottom: animated total + SignaturePad + accept button
  ↓ on accept → supabase.rpc('accept_proposal', { p_token })
  ↓ success overlay (full-screen)
```

### Signature flow
1. `SignaturePad` renders a canvas via `react-signature-canvas`
2. On "Confirm Signature" → `getTrimmedCanvas().toDataURL('image/png')` → passed up to `CheckoutClimax`
3. Non-empty dataUrl → `canSign = true` → accept button enables

---

## 14. Environment Variables

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

## 15. Running Migrations

```bash
npm run migrate
# Reads SUPABASE_ACCESS_TOKEN from .env.local
# Runs: supabase db push --yes
# Requires: supabase CLI installed (brew install supabase/tap/supabase)
# Requires: project already linked (supabase link --project-ref aefyytktbpynkbxhzhyt)
```

If a migration was applied manually outside the CLI, mark it:
```bash
supabase migration repair --status applied <timestamp>
```

---

## 16. Known Patterns & Decisions

### Logout hover dropdown
Using `onMouseEnter/Leave` on a wrapper div (not CSS `group-hover`) because the `mt-2` gap between the avatar and the dropdown causes `group-hover:block` to flash off when the mouse crosses the gap. The fix uses a `pt-2` padding inside the dropdown to bridge the gap.

### PrimaryButton shimmer
The shimmer `<span>` has `pointer-events-none`, so `onMouseEnter` on it never fires. The trigger must be on the parent `<button>` using `onMouseEnter` + `querySelector('[data-shimmer]')` + forced reflow (`void el.offsetWidth`) before re-applying the animation.

### Framer Motion first-render visibility
Framer Motion v12 with React 19 (no StrictMode) can occasionally drop first-render `initial` states. Rule: entrance effects on mount use CSS `animation:` via a style prop. Framer Motion is only used for interactive transitions triggered by state changes after mount.

### CSS keyframe injection
Each page/component that needs custom keyframes injects them via a `<style>` tag inside JSX. Keep keyframe names namespaced (`ds-`, `lp-`, `checkout-`) to avoid collisions.

### `add_ons` in Supabase
`add_ons` is a `jsonb` column. Supabase returns it as a plain JS object — TypeScript treats it as `AddOn[]` via the `Proposal` type. Always update the whole array (not individual elements) in `updateProposal`.

---

## 17. Git & Deployment Workflow

- **Branch:** `main` is the single branch. All commits go to `main`.
- **Vercel:** Auto-deploys every push to `main`. No preview branches currently configured.
- **Commit after every logical unit of work** — do not let multiple features accumulate uncommitted.
- **Commit message format:** `feat:`, `fix:`, `chore:`, `refactor:` prefix. Body lists what changed and why.
- **Always push after committing** — Vercel deployment depends on it.

```bash
# Standard commit flow
npx tsc -b                      # must be clean
git add <specific files>        # never git add -A blindly (avoid .env.local)
git commit -m "feat: ..."
git push origin main
```

---

## 18. What NOT To Do

- **Do not add StrictMode** — Framer Motion v12 double-invokes effects.
- **Do not use `ease: number[]`** in Framer Motion variants — use string names with `as const`.
- **Do not add error handling for impossible states** — trust Zustand, trust TypeScript.
- **Do not add docstrings or comments** to existing code you didn't change.
- **Do not abstract prematurely** — three similar JSX blocks are fine; a helper is only justified when there are 4+ uses with real shared logic.
- **Do not commit `.env.local`** — it contains the Supabase PAT and service role key.
- **Do not use `git add -A`** for commits — stage files explicitly.
- **Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser** — only `VITE_*` variables reach the bundle.
- **Do not guard `/deal/:token` with auth** — it's the public client-facing URL.
- **Do not run `supabase db push` without the PAT** in `SUPABASE_ACCESS_TOKEN` env var.
