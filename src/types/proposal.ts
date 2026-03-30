// ─── DealSpace Proposal Types ─────────────────────────────────────────────────

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'needs_revision'

export interface AddOn {
  id: string
  label: string
  description?: string
  price: number
  enabled: boolean
  /** Per-item discount percentage (0–100). Applied before global discount. */
  discount_pct?: number
  /** When false, the client cannot adjust quantity in the Deal Room (qty is fixed at 1). Default: true */
  clientAdjustable?: boolean
}

export interface PaymentMilestone {
  id: string
  name: string
  /** Whole number 1–100. All milestones in a proposal MUST sum to exactly 100. */
  percentage: number
}

export interface Testimonial {
  id: string
  quote: string
  author: string
  role?: string
}

export interface CreatorInfo {
  full_name?: string
  company_name?: string
  tax_id?: string
  address?: string
  phone?: string
  signatory_name?: string
  logo_url?: string
}

export interface Proposal {
  id: string
  user_id: string
  client_name: string
  client_email?: string
  client_company_name?: string | null
  client_tax_id?: string | null
  client_address?: string | null
  client_signer_role?: string | null
  project_title: string
  cover_image?: string
  description?: string
  base_price: number
  currency: string
  add_ons: AddOn[]
  payment_milestones: PaymentMilestone[]
  status: ProposalStatus
  expires_at?: string | null
  public_token: string
  view_count: number
  last_viewed_at?: string | null
  time_spent_seconds: number
  /** When true, amounts shown to client include VAT */
  include_vat: boolean
  /** Optional 4-digit access code the business shares with the client */
  access_code?: string | null
  /** Hex brand color injected as CSS variable in the Deal Room */
  brand_color?: string | null
  /** Creator business identity — injected from user_metadata by EditorPanel */
  creator_info?: CreatorInfo | null
  /** ID of the selected success template shown post-signature */
  success_template?: string | null
  /** Per-section read time (seconds) accumulated by DealRoom IntersectionObserver */
  section_time?: Record<string, number> | null
  /** Client's revision request — set by request_proposal_revision RPC */
  revision_notes?: string | null
  /** Optional video pitch URL (YouTube, Vimeo, or Loom) */
  video_url?: string | null
  /** Social proof testimonials shown in the Deal Room before pricing */
  testimonials?: Testimonial[] | null
  /** Global discount applied to the subtotal, after per-item discounts (0–100) */
  global_discount_pct?: number | null
  /** Timestamp of first status transition away from 'draft' (when the proposal was sent) */
  sent_at?: string | null
  /** Timestamp of when the client accepted/signed the proposal */
  accepted_at?: string | null
  /**
   * Soft-delete flag — Sprint 29 Archive Engine.
   * When true the proposal is hidden from the active view but NEVER removed from the DB.
   * Signed contracts must not be destructively deleted; archiving is the only allowed action.
   */
  is_archived: boolean
  created_at: string
  updated_at: string
}

export type ProposalInsert = Omit<Proposal,
  | 'id' | 'user_id' | 'public_token' | 'view_count' | 'time_spent_seconds'
  | 'section_time' | 'is_archived' | 'created_at' | 'updated_at'
>

/** Default Israeli VAT rate — configurable per account in Profile */
export const DEFAULT_VAT_RATE = 0.18

export function applyVat(amount: number, vatRate = DEFAULT_VAT_RATE): number {
  return Math.round(amount * (1 + vatRate))
}

export function vatAmount(amount: number, vatRate = DEFAULT_VAT_RATE): number {
  return Math.round(amount * vatRate)
}

export type ProposalUpdate = Partial<ProposalInsert>

/** Computed total price including enabled add-ons, per-item discounts and global discount.
 *  Does NOT include VAT — callers apply VAT separately.
 *  Uses integer-safe rounding to avoid floating-point accumulation. */
export function proposalTotal(p: Proposal): number {
  const addOnsTotal = p.add_ons
    .filter(a => a.enabled)
    .reduce((sum, a) => {
      const disc = a.discount_pct || 0
      return sum + Math.round(a.price * (1 - disc / 100))
    }, 0)
  const subtotal = Math.round(p.base_price) + addOnsTotal
  const globalDisc = p.global_discount_pct || 0
  return Math.round(subtotal * (1 - globalDisc / 100))
}

/** Undiscounted total — used for strikethrough / savings calculation */
export function proposalOriginalTotal(p: Proposal): number {
  const addOnsTotal = p.add_ons
    .filter(a => a.enabled)
    .reduce((sum, a) => sum + Math.round(a.price), 0)
  return Math.round(p.base_price) + addOnsTotal
}

export function formatCurrency(amount: number, currency = 'ILS'): string {
  const locale = currency === 'ILS' ? 'he-IL' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Returns true if all milestones sum to exactly 100%.
 *  Uses Math.round to absorb floating-point drift (e.g. 33.3+33.3+33.4 = 99.999…). */
export function milestonesValid(milestones: PaymentMilestone[]): boolean {
  if (milestones.length === 0) return true
  const sum = milestones.reduce((s, m) => s + m.percentage, 0)
  return Math.round(sum) === 100
}

export const STATUS_META: Record<ProposalStatus, { label_en: string; label_he: string; color: string; glow: string }> = {
  draft:          { label_en: 'Draft',        label_he: 'טיוטה',    color: '#6b7280', glow: 'rgba(107,114,128,0.3)' },
  sent:           { label_en: 'Sent',         label_he: 'נשלח',     color: '#d4af37', glow: 'rgba(212,175,55,0.4)'  },
  viewed:         { label_en: 'Viewed',       label_he: 'נצפה',     color: '#6366f1', glow: 'rgba(99,102,241,0.4)'  },
  accepted:       { label_en: 'Accepted',     label_he: 'אושר',     color: '#22c55e', glow: 'rgba(34,197,94,0.4)'   },
  rejected:       { label_en: 'Rejected',     label_he: 'נדחה',     color: '#ef4444', glow: 'rgba(239,68,68,0.3)'   },
  needs_revision: { label_en: 'Needs Revision', label_he: 'בעריכה', color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
}
