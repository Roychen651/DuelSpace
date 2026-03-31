// ─── Stripe Configuration ─────────────────────────────────────────────────────
// Central place for all Stripe-related constants.
// Payment Links live in the Stripe Dashboard → Products → Payment Links.
// Copy each link and set it in .env.local — never hardcode here.
//
// Required .env.local entries:
//   VITE_STRIPE_PRO_LINK=https://buy.stripe.com/...
//   VITE_STRIPE_PREMIUM_LINK=https://buy.stripe.com/...
//   VITE_STRIPE_CUSTOMER_PORTAL=https://billing.stripe.com/p/login/...

export const STRIPE_PRO_LINK        = import.meta.env.VITE_STRIPE_PRO_LINK        ?? ''
export const STRIPE_PREMIUM_LINK    = import.meta.env.VITE_STRIPE_PREMIUM_LINK    ?? ''
export const STRIPE_CUSTOMER_PORTAL = import.meta.env.VITE_STRIPE_CUSTOMER_PORTAL ?? ''

// ─── buildCheckoutUrl ─────────────────────────────────────────────────────────
// Appends the two query params Stripe supports on Payment Links:
//   client_reference_id — forwarded to checkout.session.completed webhook
//                         so the Edge Function knows which user just paid
//   prefilled_email     — pre-fills the Stripe checkout email field
//
// Usage:
//   window.location.href = buildCheckoutUrl(STRIPE_PRO_LINK, user.id, user.email)

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
