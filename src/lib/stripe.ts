// ─── Stripe Configuration ─────────────────────────────────────────────────────
// Central place for all Stripe-related constants and helpers.
//
// Required .env.local entries:
//   VITE_STRIPE_PRO_LINK=https://buy.stripe.com/...       ← for new subscribers only
//   VITE_STRIPE_PREMIUM_LINK=https://buy.stripe.com/...   ← for new subscribers only
//   VITE_STRIPE_CUSTOMER_PORTAL=https://billing.stripe.com/p/login/...  ← legacy fallback only
//
// Routing rule:
//   user.user_metadata.stripe_customer_id EXISTS  → createPortalSession() (dynamic, no duplicates)
//   stripe_customer_id MISSING (first-time buyer) → buildCheckoutUrl() (static Payment Link)

import { supabase } from './supabase'

export const STRIPE_PRO_LINK        = import.meta.env.VITE_STRIPE_PRO_LINK        ?? ''
export const STRIPE_PREMIUM_LINK    = import.meta.env.VITE_STRIPE_PREMIUM_LINK    ?? ''
// Kept for legacy callers only — prefer createPortalSession() for all portal navigation
export const STRIPE_CUSTOMER_PORTAL = import.meta.env.VITE_STRIPE_CUSTOMER_PORTAL ?? ''

// ─── buildCheckoutUrl ─────────────────────────────────────────────────────────
// Only call this for users WITHOUT a stripe_customer_id (first-time purchase).
// Existing customers must use createPortalSession() to avoid duplicate subscriptions.

export function buildCheckoutUrl(
  baseLink: string,
  userId: string,
  email?: string | null,
): string {
  if (!baseLink) return ''
  const url = new URL(baseLink)
  url.searchParams.set('client_reference_id', userId)
  if (email) url.searchParams.set('prefilled_email', email)
  return url.toString()
}

// ─── createPortalSession ──────────────────────────────────────────────────────
// Calls the stripe-portal Edge Function which creates a one-time Stripe Customer
// Portal session URL. Returns the URL to redirect to.
//
// Only call this when user.user_metadata.stripe_customer_id is set.
// The Edge Function will return 400 if no customer exists.

export async function createPortalSession(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
        'Content-Type': 'application/json',
      },
    },
  )

  if (!res.ok) {
    const body = await res.json().catch(() => ({} as Record<string, string>))
    throw new Error((body as { error?: string }).error ?? `stripe-portal ${res.status}`)
  }

  const { url } = await res.json() as { url: string }
  return url
}
