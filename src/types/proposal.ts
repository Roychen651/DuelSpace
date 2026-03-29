// ─── DealSpace Proposal Types ─────────────────────────────────────────────────

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected'

export interface AddOn {
  id: string
  label: string
  description?: string
  price: number
  enabled: boolean
}

export interface Proposal {
  id: string
  user_id: string
  client_name: string
  client_email?: string
  project_title: string
  cover_image?: string
  description?: string
  base_price: number
  currency: string
  add_ons: AddOn[]
  status: ProposalStatus
  expires_at?: string | null
  public_token: string
  view_count: number
  last_viewed_at?: string | null
  time_spent_seconds: number
  /** When true, amounts shown to client include 18% Israeli VAT */
  include_vat: boolean
  /** Optional 4-digit access code the business shares with the client */
  access_code?: string | null
  created_at: string
  updated_at: string
}

export type ProposalInsert = Omit<Proposal,
  'id' | 'user_id' | 'public_token' | 'view_count' | 'time_spent_seconds' | 'created_at' | 'updated_at'
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

/** Computed total price including enabled add-ons */
export function proposalTotal(p: Proposal): number {
  const addOnsTotal = p.add_ons
    .filter(a => a.enabled)
    .reduce((sum, a) => sum + a.price, 0)
  return p.base_price + addOnsTotal
}

export function formatCurrency(amount: number, currency = 'ILS'): string {
  const locale = currency === 'ILS' ? 'he-IL' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const STATUS_META: Record<ProposalStatus, { label_en: string; label_he: string; color: string; glow: string }> = {
  draft:    { label_en: 'Draft',    label_he: 'טיוטה',    color: '#6b7280', glow: 'rgba(107,114,128,0.3)' },
  sent:     { label_en: 'Sent',     label_he: 'נשלח',     color: '#d4af37', glow: 'rgba(212,175,55,0.4)'  },
  viewed:   { label_en: 'Viewed',   label_he: 'נצפה',     color: '#6366f1', glow: 'rgba(99,102,241,0.4)'  },
  accepted: { label_en: 'Accepted', label_he: 'אושר',     color: '#22c55e', glow: 'rgba(34,197,94,0.4)'   },
  rejected: { label_en: 'Rejected', label_he: 'נדחה',     color: '#ef4444', glow: 'rgba(239,68,68,0.3)'   },
}
