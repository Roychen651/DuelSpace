// ─── Stripe Webhook Handler ───────────────────────────────────────────────────
// Deno Edge Function deployed on Supabase.
//
// Listens for Stripe events and updates the user's plan_tier + billing_status
// in auth.users user_metadata so useTier() / useBillingStatus() in the client
// immediately reflects the new state.
//
// Required environment variables (set in Supabase Dashboard → Edge Functions → Secrets):
//   STRIPE_WEBHOOK_SECRET     — from Stripe Dashboard → Webhooks → Signing secret
//   STRIPE_SECRET_KEY         — Stripe secret key (sk_live_... / sk_test_...)
//   STRIPE_PRICE_PRO          — Stripe Price ID for Pro plan
//   STRIPE_PRICE_PREMIUM      — Stripe Price ID for Unlimited plan
//   SUPABASE_URL              — auto-injected by Supabase runtime
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase runtime
//
// Stripe events handled:
//   checkout.session.completed       — new subscription after payment → set plan_tier + billing_status:'active'
//   customer.subscription.updated    — plan change (upgrade/downgrade) → update plan_tier
//   customer.subscription.deleted    — cancellation/expiry → revert to free, clear billing_status
//   invoice.payment_failed           — dunning: set billing_status:'past_due', lock proposal creation
//   invoice.payment_succeeded        — dunning resolved: set billing_status:'active'
//
// User lookup priority:
//   1. session.client_reference_id (checkout) — most reliable, set by buildCheckoutUrl()
//   2. subscription.metadata.supabase_user_id — set at subscription creation time
//   3. Lookup by stripe_customer_id in user_metadata — fallback for older subscriptions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

// ─── Boot ─────────────────────────────────────────────────────────────────────

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  // @ts-ignore — Deno fetch is compatible but types expect Node globals
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2024-06-20',
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } },
)

// ─── Plan tier mapping ────────────────────────────────────────────────────────
// Map Stripe Price IDs to DealSpace plan tiers.
// Configure STRIPE_PRICE_PRO and STRIPE_PRICE_PREMIUM in Supabase secrets.

const PRICE_TO_TIER: Record<string, 'pro' | 'unlimited'> = {
  [Deno.env.get('STRIPE_PRICE_PRO') ?? '']:      'pro',
  [Deno.env.get('STRIPE_PRICE_PREMIUM') ?? '']:  'unlimited',
}

function tierFromPriceId(priceId: string | null | undefined): 'pro' | 'unlimited' | null {
  if (!priceId) return null
  return PRICE_TO_TIER[priceId] ?? null
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''
  const secret    = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

  // ── Verify the webhook signature ─────────────────────────────────────────
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, secret)
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err)
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  console.log(`[stripe-webhook] Received event: ${event.type} (${event.id})`)

  try {
    switch (event.type) {

      // ── New checkout completed — subscription just started ────────────────
      // This is the most reliable event: client_reference_id = supabase user.id
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const userId = session.client_reference_id
        if (!userId) {
          console.warn('[stripe-webhook] checkout.session.completed missing client_reference_id')
          break
        }

        // Determine tier from the subscription's price
        let tier: 'pro' | 'unlimited' | null = null
        let checkoutSub: Stripe.Subscription | null = null
        if (session.subscription) {
          checkoutSub = await stripe.subscriptions.retrieve(session.subscription as string)
          tier = tierFromPriceId(checkoutSub.items.data[0]?.price?.id)

          // Tag the subscription with the supabase user id so future events can find it
          if (!checkoutSub.metadata?.supabase_user_id) {
            await stripe.subscriptions.update(checkoutSub.id, {
              metadata: { supabase_user_id: userId },
            })
          }
        }

        if (!tier || !checkoutSub) {
          console.warn('[stripe-webhook] Could not determine tier from session:', session.id)
          break
        }

        // Save the stripe_customer_id, tier, and billing cycle info
        const customerId = session.customer as string | null
        await updateUserMetadata(userId, {
          plan_tier:                        tier,
          billing_status:                   'active',
          subscription_period_end:          checkoutSub.current_period_end.toString(),
          subscription_cancel_at_period_end: checkoutSub.cancel_at_period_end ? 'true' : 'false',
          ...(customerId ? { stripe_customer_id: customerId } : {}),
        })
        break
      }

      // ── Subscription updated — plan change (upgrade / downgrade) ──────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription

        const userId = await resolveUserId(sub.metadata?.supabase_user_id ?? null, sub.customer as string)
        if (!userId) break

        const priceId = sub.items.data[0]?.price?.id ?? null
        const tier    = tierFromPriceId(priceId)

        if (!tier) {
          console.warn('[stripe-webhook] Could not map priceId to tier:', priceId)
          break
        }

        await updateUserMetadata(userId, {
          plan_tier:                        tier,
          subscription_period_end:          sub.current_period_end.toString(),
          subscription_cancel_at_period_end: sub.cancel_at_period_end ? 'true' : 'false',
        })
        break
      }

      // ── Subscription cancelled / expired — revert to free ─────────────────
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = await resolveUserId(sub.metadata?.supabase_user_id ?? null, sub.customer as string)
        if (!userId) break

        await updateUserMetadata(userId, {
          plan_tier:                        'free',
          billing_status:                   'canceled',
          subscription_period_end:          null,
          subscription_cancel_at_period_end: 'false',
        })
        break
      }

      // ── Invoice payment failed — dunning / past_due ───────────────────────
      // Locks new proposal creation in the UI until payment is resolved.
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const userId  = await resolveUserId(null, invoice.customer as string)
        if (!userId) break

        await updateUserMetadata(userId, { billing_status: 'past_due' })
        console.log(`[stripe-webhook] Dunning: user ${userId} → billing_status: past_due`)
        break
      }

      // ── Invoice payment succeeded — dunning resolved ──────────────────────
      // Unblocks proposal creation and refreshes billing cycle dates.
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        // Only clear past_due on non-zero invoices (zero-dollar trials etc. fire this too)
        if ((invoice.amount_paid ?? 0) === 0) break

        const userId = await resolveUserId(null, invoice.customer as string)
        if (!userId) break

        // Refresh subscription period end on each successful charge
        const periodEndUpdate: Record<string, string | null> = { billing_status: 'active' }
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
          periodEndUpdate.subscription_period_end          = sub.current_period_end.toString()
          periodEndUpdate.subscription_cancel_at_period_end = sub.cancel_at_period_end ? 'true' : 'false'
        }
        await updateUserMetadata(userId, periodEndUpdate)
        console.log(`[stripe-webhook] Dunning resolved: user ${userId} → billing_status: active`)
        break
      }

      default:
        // Unhandled events are silently ignored — respond 200 to prevent Stripe retries
        break
    }
  } catch (err) {
    console.error('[stripe-webhook] Error processing event:', err)
    // Return 200 so Stripe does not retry — the error is on our side
    return new Response('Internal error (logged)', { status: 200 })
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Merge partial user_metadata fields without overwriting unrelated keys. */
async function updateUserMetadata(
  userId: string,
  fields: Record<string, string | null | undefined>,
): Promise<void> {
  // Supabase admin.updateUserById performs a shallow merge on user_metadata —
  // passing only changed fields is safe; other metadata keys are preserved.
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: fields,
  })

  if (error) {
    throw new Error(`updateUserMetadata(${userId}): ${error.message}`)
  }

  console.log(`[stripe-webhook] Updated user ${userId}:`, fields)
}

/**
 * Resolve a Supabase user ID from:
 *   1. A supabase_user_id already stored in Stripe subscription metadata
 *   2. The Stripe customer ID stored in user_metadata.stripe_customer_id
 *
 * Falls back to null if neither resolves. Logs a warning so we can investigate.
 */
async function resolveUserId(
  directId: string | null,
  stripeCustomerId: string,
): Promise<string | null> {
  if (directId) return directId

  // Paginated scan for the matching stripe_customer_id in user_metadata.
  // Iterates through all pages until the user is found or the list is exhausted.
  let pageNum = 1
  while (true) {
    const page = await supabaseAdmin.auth.admin.listUsers({ page: pageNum, perPage: 1000 })
    const match = page.data?.users?.find(
      u => (u.user_metadata?.stripe_customer_id as string | undefined) === stripeCustomerId,
    )
    if (match) return match.id

    // Stop when we receive fewer users than requested — no more pages remain
    if (!page.data?.users || page.data.users.length < 1000) break
    pageNum++
  }

  console.warn(`[stripe-webhook] Could not find user for Stripe customer: ${stripeCustomerId}`)
  return null
}
