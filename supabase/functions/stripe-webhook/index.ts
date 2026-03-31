// ─── Stripe Webhook Handler ───────────────────────────────────────────────────
// Deno Edge Function deployed on Supabase.
//
// Listens for Stripe events and updates the user's plan_tier in auth.users
// user_metadata so useTier() in the client immediately reflects the new plan.
//
// Required environment variables (set in Supabase Dashboard → Edge Functions → Secrets):
//   STRIPE_WEBHOOK_SECRET   — from Stripe Dashboard → Webhooks → Signing secret
//   SUPABASE_URL            — auto-injected by Supabase runtime
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase runtime
//
// Stripe events handled:
//   checkout.session.completed       — new subscription created after payment
//   customer.subscription.updated    — plan change (upgrade / downgrade)
//   customer.subscription.deleted    — cancellation / expiry → revert to 'free'

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
// Set these in the Supabase secrets dashboard — never hardcode price IDs here.

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
  // Only POST is valid — Stripe always POSTs
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
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // client_reference_id is the Supabase user.id we appended in buildCheckoutUrl()
        const userId = session.client_reference_id
        if (!userId) {
          console.warn('[stripe-webhook] checkout.session.completed missing client_reference_id')
          break
        }

        // Retrieve the subscription to get the price ID
        let tier: 'pro' | 'unlimited' | null = null
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          const priceId = sub.items.data[0]?.price?.id ?? null
          tier = tierFromPriceId(priceId)
        }

        if (!tier) {
          console.warn('[stripe-webhook] Could not determine tier from session:', session.id)
          break
        }

        await updateUserTier(userId, tier)
        break
      }

      // ── Subscription updated — plan change (upgrade / downgrade) ──────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription

        // Read user ID from subscription metadata (set this when creating the subscription,
        // or look it up via the customer's email against auth.users)
        const userId = sub.metadata?.supabase_user_id ?? null
        if (!userId) {
          console.warn('[stripe-webhook] subscription.updated missing supabase_user_id in metadata')
          break
        }

        const priceId = sub.items.data[0]?.price?.id ?? null
        const tier    = tierFromPriceId(priceId)

        if (!tier) {
          console.warn('[stripe-webhook] Could not map priceId to tier:', priceId)
          break
        }

        await updateUserTier(userId, tier)
        break
      }

      // ── Subscription cancelled / expired — revert to free ─────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id ?? null

        if (!userId) {
          console.warn('[stripe-webhook] subscription.deleted missing supabase_user_id in metadata')
          break
        }

        await updateUserTier(userId, 'free')
        break
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('[stripe-webhook] Error processing event:', err)
    // Return 200 so Stripe does not retry — the error is on our side, not theirs
    return new Response('Internal error (logged)', { status: 200 })
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function updateUserTier(userId: string, tier: 'pro' | 'unlimited' | 'free'): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { plan_tier: tier },
  })

  if (error) {
    // Re-throw — caller will log and return 200 (no Stripe retry storm)
    throw new Error(`Failed to update user ${userId} to tier '${tier}': ${error.message}`)
  }

  console.log(`[stripe-webhook] Updated user ${userId} → plan_tier: ${tier}`)
}
