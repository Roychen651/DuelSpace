// ─── Stripe Customer Portal Session Generator ─────────────────────────────────
// Deno Edge Function — creates a one-time Stripe Customer Portal session URL
// so the client never touches a static portal link (prevents duplicate subscriptions).
//
// Auth: caller must pass a valid Supabase user JWT in Authorization header.
// The function reads stripe_customer_id from user_metadata and calls
// stripe.billingPortal.sessions.create() — returns { url }.
//
// Required secrets (Supabase Dashboard → Edge Functions → Secrets):
//   STRIPE_SECRET_KEY         — sk_live_... / sk_test_...
//   APP_URL                   — https://dealspace.app (return URL base)
//   SUPABASE_URL              — auto-injected by Supabase runtime
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase runtime
//
// Deploy:
//   supabase functions deploy stripe-portal --project-ref aefyytktbpynkbxhzhyt

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  // @ts-ignore — Deno fetch is compatible but types expect Node globals
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2024-06-20',
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    // ── 1. Verify caller JWT ─────────────────────────────────────────────────
    const auth = req.headers.get('Authorization') ?? ''
    const jwt  = auth.replace('Bearer ', '').trim()
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(jwt)
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // ── 2. Resolve Stripe customer ───────────────────────────────────────────
    const stripeCustomerId = user.user_metadata?.stripe_customer_id as string | undefined
    if (!stripeCustomerId) {
      return new Response(
        JSON.stringify({ error: 'No Stripe customer found for this user. Use Checkout for new subscriptions.' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
      )
    }

    // ── 3. Create portal session ─────────────────────────────────────────────
    const returnUrl = (Deno.env.get('APP_URL') ?? 'https://dealspace.app') + '/billing'

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[stripe-portal]', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
