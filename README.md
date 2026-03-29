<div align="center">

# ⚡ DealSpace

### The interactive proposal platform that closes deals — not just sends them.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

**🇮🇱 Hebrew-first · RTL · ILS · Israeli legal standard**

[🚀 Live Demo](https://duel-space.vercel.app) &nbsp;·&nbsp; [📄 Create a Proposal](https://duel-space.vercel.app/proposals/new) &nbsp;·&nbsp; [🔑 Sign In](https://duel-space.vercel.app/auth)

---

</div>

## 🎯 What Is DealSpace?

DealSpace replaces static PDF proposals with **live, interactive Deal Rooms** — personalized micro-sites where clients can explore services, toggle add-ons, read the contract, and electronically sign, all in one seamless flow.

Built for Israeli freelancers and agencies. Hebrew-first, ILS default, fully RTL — but ships a complete English mode too.

```
Creator builds proposal  →  Sends a private link  →  Client opens Deal Room
      ↓                                                       ↓
  Dashboard KPIs                                   Adjusts add-ons
  track views, time,                               Signs electronically
  acceptance rate                                  Creator downloads PDF
```

---

## ✨ Feature Highlights

<table>
<tr>
<td width="50%">

### 📋 Proposal Builder
Split-screen editor with live preview. Drag-to-reorder add-ons (Framer Motion Reorder), payment milestone scheduling, access code gate, contract template picker, and AI Ghostwriter for bilingual descriptions. Autosaves every 1500ms.

</td>
<td width="50%">

### 🏠 Interactive Deal Room
Fully public, zero-auth client page. Brand-color injection via CSS variables, premium slider add-on cards, animated milestone timeline, legal identity capture, and a native canvas signature pad (no external library).

</td>
</tr>
<tr>
<td width="50%">

### 📄 Enterprise PDF Engine
3-page output: **Cover** → **Auto-paginated Content** → **Signature Certificate**. DocuSign-style audit trail, brand-color injection, Heebo Hebrew typography, TipTap HTML parsing. Every block is `wrap={false}` — nothing slices across pages.

</td>
<td width="50%">

### ♿ Accessibility Engine
14-state a11y widget: text scaling (1.0–1.5×), high contrast, monochrome, invert colors, 3 color-blind modes, dyslexia font, reading mask, stop animations, link highlights, focus rings, big cursor. IS 5568 + WCAG 2.2 AA compliant.

</td>
</tr>
<tr>
<td width="50%">

### 📊 Smart Dashboard
KPI bento grid (revenue pending, win rate, proposals sent), grid + kanban views, search + filter + sort bar, animated spring counters, optimistic UI updates throughout. Guided onboarding tour for new users.

</td>
<td width="50%">

### ⚖️ Israeli Legal Framework
Terms of Service (12 clauses), Privacy Policy (GDPR + Israeli Privacy Law), Accessibility Statement, Security Policy. Electronic Signature Law 5761-2001 (חוק תשס"א-2001) baked into every signed PDF certificate.

</td>
</tr>
</table>

---

## 🏗️ Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| **Build** | Vite | ^8.0 | HMR, tree-shaking, production bundle |
| **UI** | React | ^19.2 | No class components, no StrictMode |
| **Language** | TypeScript | ~5.9 strict | `tsc -b` must pass before every commit |
| **Styling** | Tailwind CSS | ^3.4 | Utility-first, no CSS-in-JS |
| **Animation** | Framer Motion | ^12.38 | CSS keyframes for first-render, FM for transitions |
| **Routing** | react-router-dom | ^7.13 | PKCE-safe redirects |
| **State** | Zustand | ^5.0 | Auth, proposals, a11y — no Redux |
| **Backend** | Supabase | ^2.100 | Postgres + Auth + Storage + RPCs |
| **PDF** | @react-pdf/renderer | ^4.3 | 3-page enterprise output, Heebo font |
| **Rich Text** | TipTap | ^2.x | Contract editor, HTML output |
| **Icons** | Lucide React | ^1.7 | — |
| **Deployment** | Vercel | — | Auto-deploy from `main` |

> **Removed:** `react-signature-canvas` — replaced with native canvas (`quadraticCurveTo` + pointer events). Had CJS/ESM crashes in Vite production builds.

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── LandingPage.tsx            # / — bilingual marketing, OLED dark
│   ├── Auth.tsx                   # /auth — Linear.app style, glass card
│   ├── Dashboard.tsx              # /dashboard — KPIs, grid/kanban, filter
│   ├── ProposalBuilder.tsx        # /proposals/new|:id — split-screen editor
│   ├── DealRoom.tsx               # /deal/:token — public client flow
│   ├── Profile.tsx                # /profile — avatar, biz info, brand color
│   ├── ServicesLibrary.tsx        # /services — reusable service definitions
│   ├── ContractLibrary.tsx        # /contracts — contract templates
│   ├── TermsOfService.tsx         # /terms — 12-clause bilingual ToS
│   ├── PrivacyPolicy.tsx          # /privacy — 12-clause bilingual policy
│   └── AccessibilityStatement.tsx # /accessibility — WCAG 2.2 AA + IS 5568
│
├── components/
│   ├── builder/
│   │   ├── EditorPanel.tsx        # Collapsible sections, AI Ghostwriter, milestone rows
│   │   ├── LivePreview.tsx        # Real-time spring-animated preview
│   │   ├── AIGhostwriter.tsx      # Bilingual description generator
│   │   ├── RichTextEditor.tsx     # TipTap contract editor
│   │   └── ReusableServices.tsx   # Pick services from library
│   ├── deal-room/
│   │   ├── PremiumSliderCard.tsx  # Toggle + range slider add-on card
│   │   ├── CheckoutClimax.tsx     # Sticky total, VAT breakdown, CTA
│   │   ├── SignaturePad.tsx       # Native canvas — DPR-scaled, smooth strokes
│   │   ├── ClientDetailsForm.tsx  # Legal identity capture (name, ח.פ, address)
│   │   └── MilestoneTimeline.tsx  # Animated payment schedule
│   ├── dashboard/
│   │   ├── ProposalCard.tsx       # Magnetic tilt, Radix dropdown, status timeline
│   │   ├── KanbanBoard.tsx        # Status-grouped kanban view
│   │   └── BottomSheet.tsx        # Mobile action sheet
│   └── ui/
│       ├── GlobalFooter.tsx       # Self-contained footer, dual mobile/desktop DOM
│       ├── AccessibilityWidget.tsx # Draggable FAB, 14 a11y controls
│       └── HelpCenterDrawer.tsx   # 10 bilingual FAQ items, category filter
│
├── stores/
│   ├── useAuthStore.ts            # Auth lifecycle, PKCE, profile mutations
│   ├── useProposalStore.ts        # Optimistic CRUD + demo injection
│   └── useAccessibilityStore.ts   # 14 a11y states, DOM mutations, localStorage
│
├── lib/
│   ├── pdfEngine.tsx              # 3-page enterprise PDF + TipTap HTML parser
│   ├── i18n.ts                    # He/En Zustand store, RTL/LTR switching
│   ├── contractTemplates.ts       # Built-in contract templates
│   ├── successTemplates.ts        # Post-signature screen variants
│   ├── financialMath.ts           # VAT, rounding, milestone math
│   └── passwordValidation.ts      # Strength scoring (score 1–4)
│
└── types/
    └── proposal.ts                # All proposal types + pure math utilities
```

---

## 🗄️ Database (Supabase / PostgreSQL)

### `proposals` table — full column set

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid FK | → `auth.users`, cascade delete |
| `client_name / email / company_name / tax_id / address / signer_role` | text | Full legal identity — captured at signing |
| `project_title` | text | Required for "Send" |
| `description` | text | TipTap HTML or plain text |
| `base_price` | numeric(12,2) | Core service price |
| `add_ons` | jsonb `AddOn[]` | `{ id, label, description, price, enabled }` |
| `payment_milestones` | jsonb `PaymentMilestone[]` | Must sum to 100% when non-empty |
| `include_vat` | boolean | 18% Israeli VAT toggle |
| `currency` | text | `ILS` default |
| `status` | enum | `draft → sent → viewed → accepted / rejected` |
| `public_token` | text unique | Deal Room URL key (hex 16 bytes) |
| `access_code` | text | Optional 4-digit PIN gate |
| `brand_color` | text | Hex — CSS var injection in Deal Room + PDF |
| `creator_info` | jsonb `CreatorInfo` | Auto-injected from `user_metadata` by EditorPanel |
| `expires_at` | timestamptz | Proposal expiry countdown |
| `success_template` | text | Post-signature screen variant |
| `view_count / last_viewed_at / time_spent_seconds` | — | Engagement analytics |

### RPC Functions

All are `SECURITY DEFINER, SET search_path = public`:

```sql
get_deal_room_proposal(p_token, p_code DEFAULT NULL)
  -- returns proposal JSON, or {"_requires_code": true}, or NULL
  -- granted to: anon, authenticated

mark_proposal_viewed(p_token)           -- increments view_count, sets last_viewed_at
accept_proposal(p_token)                -- status → accepted (from sent/viewed only)
decline_proposal(p_token)               -- status → rejected
save_client_details(p_token, ...)       -- COALESCE — empty strings never overwrite
update_proposal_time_spent(p_token, n)  -- accumulates seconds
```

> ⚠️ Every RPC **must** include `SET search_path = public`. Without it, the anon execution context cannot resolve the `proposals` table. This caused a production outage fixed in migration 05.

---

## 📄 PDF Engine — Architecture

```
┌─────────────────────────────────────┐
│  PAGE 1 — COVER                     │
│  ██████ brand_color hero ██████    │
│     ○ Company Initials Badge        │
│     Company Name                    │
│     PROPOSAL & SERVICE AGREEMENT    │
│                                     │
│     Project Title (26pt bold)       │
│     ─────────────────────────────   │
│     PREPARED FOR                    │
│     Client Name · Client Company    │
│                                     │
│     Date         ·  ID: abc123…    │
├─────────────────────────────────────┤
│  PAGES 2+ — MAIN CONTENT (auto)     │
│  ┌─ Company · Project  Page X/Y ─┐  │  ← fixed header
│  │                               │  │
│  │  PARTIES TO THE AGREEMENT     │  │
│  │  [Side A: Creator] [Side B: Client] │
│  │                               │  │
│  │  SERVICES & PRICING           │  │
│  │  Base Package        ₪X,XXX  │  │
│  │  + Add-on 1          ₪X,XXX  │  │
│  │  ─────────────────────────   │  │
│  │  VAT 18%               ₪XXX  │  │
│  │  ┌─ Grand Total ₪X,XXX ────┐ │  │
│  │                               │  │
│  │  MILESTONES  [●──●──●──●]   │  │
│  │  TERMS & CONDITIONS           │  │
│  └─ DealSpace · dealspace.app ──┘  │  ← fixed footer
├─────────────────────────────────────┤
│  LAST PAGE — SIGNATURE CERTIFICATE  │
│  ██████ ✓ Digital Signature ██████ │
│  [Signature Image]  Signer: …      │
│                     Role: …        │
│                     Signed: …      │
│                                     │
│  ╔══ UNIQUE DOCUMENT TOKEN ══╗     │
│  ║ abc123def456ghi789jkl012 ║     │
│  ╚═══════════════════════════╝     │
│                                     │
│  ── AUDIT TRAIL ──────────────     │
│  Project          My Project        │
│  Provider         Roy's Agency      │
│  Client           Dana Cohen        │
│  Value            ₪5,663           │
│  Created          29 March 2026     │
│  Signed           29 March 2026     │
│  Platform         DealSpace         │
│  Legal            חוק תשס"א-2001   │
│                                     │
│  Electronic Signature Law notice…   │
└─────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (free tier works)
- Supabase CLI: `brew install supabase/tap/supabase`

### 1. Clone & Install

```bash
git clone https://github.com/Roychen651/DuelSpace.git
cd DuelSpace
npm install
```

### 2. Environment Variables

Create `.env.local` in the project root:

```env
# Browser-safe (VITE_ prefix required)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_URL=http://localhost:5173

# Server-only — NEVER expose to browser
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ACCESS_TOKEN=sbp_...    # Supabase PAT for running migrations
```

> 🔒 `.env.local` is gitignored. **Never commit it.** `SUPABASE_SERVICE_ROLE_KEY` has unrestricted database access.

### 3. Link Supabase & Run Migrations

```bash
# Link once
supabase link --project-ref your-project-ref

# Apply all 7 migrations
npm run migrate

# If a migration was applied manually outside CLI, mark it:
supabase migration repair --status applied <timestamp>
```

### 4. Start Dev Server

```bash
npm run dev
# → http://localhost:5173
```

### 5. Type-Check & Build

```bash
npx tsc -b           # MUST be clean — matches CI
npm run build        # tsc -b + vite build
npm run lint         # ESLint
```

---

## 🔐 Auth Flow

```
┌─────────────────────────────────────────────────┐
│  Sign Up / Sign In (PKCE flow)                  │
│                                                 │
│  Auth.tsx  →  Supabase PKCE  →  /auth/callback  │
│                                   ↓             │
│                              AuthCallback.tsx   │
│                                   ↓             │
│                             /dashboard          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Password Reset                                 │
│                                                 │
│  sendPasswordResetEmail()                       │
│    → User receives email link                   │
│    → /auth/reset-password                       │
│    → listens for PASSWORD_RECOVERY event        │
│    → sessionReady = true                        │
│    → updatePassword(newPassword)                │
└─────────────────────────────────────────────────┘
```

Auth status lifecycle: `idle` → `loading` → `authenticated | unauthenticated`

`ProtectedRoute` renders a spinner during `idle`/`loading`, then redirects or renders children.

---

## 🌍 i18n — Zero Language Bleed

**Default locale: Hebrew (RTL).** Persisted in `localStorage('dealspace:locale')`.

```ts
const { locale, dir, t, setLocale } = useI18n()

t('auth.tab.signin')    // → 'כניסה' | 'Sign In'
setLocale('en')          // flips locale, RTL/LTR, document.documentElement
```

**Hard requirement:** Every UI string must have both `label_he` and `label_en`. Hebrew UI must never show English words. English UI must never show Hebrew characters or `₪`. Currency symbols derive from `proposal.currency`, never hardcoded.

---

## 📦 localStorage Keys

| Key | Value | Owner |
|---|---|---|
| `dealspace:locale` | `'he' \| 'en'` | i18n store |
| `dealspace:vat-rate` | decimal string `'0.18'` | Profile.tsx |
| `dealspace:view-mode` | `'grid' \| 'kanban'` | Dashboard.tsx |
| `dealspace:demo-injected` | `'true'` | useProposalStore |
| `dealspace:contract-defaults` | JSON | ContractLibrary |
| `ds:a11y:*` | various | useAccessibilityStore (14 keys) |

---

## 🚢 Deployment (Vercel)

Pushes to `main` auto-deploy via Vercel webhook.

```bash
# Standard workflow
npx tsc -b                      # clean check
git add src/specific-file.tsx   # never git add -A
git commit -m "feat: ..."
git push origin main            # triggers Vercel
```

**Vercel "Redeploy" gotcha:** The Redeploy button replays the same commit SHA — it does NOT pick up newer pushes. If you've pushed a fix but Vercel is still failing on the old commit:

```bash
git commit --allow-empty -m "chore: force Vercel redeploy"
git push origin main
```

---

## ⚠️ Critical Rules

| ❌ Never | ✅ Instead |
|---|---|
| Add `<React.StrictMode>` | Leave bare `<App />` — FM v12 double-invoke bug |
| `transition={{ ease: [0.22, 1, 0.36, 1] }}` | `transition={{ ease: 'easeOut' as const }}` |
| `whileHover={{ scale: 1.02 } as object}` | `whileHover={{ scale: 1.02 }}` |
| Omit `payment_milestones: []` from `ProposalInsert` | Always include — required field |
| Write RPC without `SET search_path = public` | Always include — anon context needs it |
| Auth-guard `/deal/:token` | It's the public client URL |
| `git add -A` | Stage specific files |
| Commit `.env.local` | Service role key has full DB access |
| Use `navigate(path)` for tab switches | Use `navigate(path, { replace: true })` |

---

## 🤝 Contributing

This is a private commercial project. Contact [Roy Chen](https://github.com/Roychen651) for collaboration.

---

<div align="center">

**© 2026 DealSpace Technologies Ltd. All rights reserved.**

Built with ⚡ in Tel Aviv · Powered by [DealSpace](https://duel-space.vercel.app)

</div>
