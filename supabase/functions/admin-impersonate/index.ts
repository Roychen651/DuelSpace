// ─── Admin Impersonation Edge Function ────────────────────────────────────────
// Generates a one-time magic link for any user email so the admin can sign
// in as that user without knowing their password.
//
// Security: Validates the calling JWT against Supabase, verifies caller email
// is the hardcoded admin address, then uses the service role key to generate
// the link via the Supabase Admin API.
//
// Required secrets (Supabase Dashboard → Edge Functions → Secrets):
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected
//   SUPABASE_URL              — auto-injected
//   SUPABASE_ANON_KEY         — auto-injected
//   APP_URL                   — set manually: https://duel-space.vercel.app

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_EMAIL = 'roychen651@gmail.com'

Deno.serve(async (req: Request) => {
  // Only POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // ── Verify caller identity ────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Missing Authorization header', { status: 401 })
  }

  const supabaseCaller = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data: { user: callerUser }, error: callerError } =
    await supabaseCaller.auth.getUser()

  if (callerError || callerUser?.email !== ADMIN_EMAIL) {
    console.warn('[admin-impersonate] Access denied for:', callerUser?.email ?? 'unauthenticated')
    return new Response('Access Denied', { status: 403 })
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let target_email: string
  try {
    const body = await req.json()
    target_email = body?.target_email
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  if (!target_email || typeof target_email !== 'string') {
    return new Response('target_email is required', { status: 400 })
  }

  // Prevent admin from generating a link for themselves (not harmful but pointless)
  if (target_email === ADMIN_EMAIL) {
    return new Response('Cannot impersonate the admin account', { status: 400 })
  }

  // ── Generate magic link via Admin API ──────────────────────────────────────
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const redirectTo = `${Deno.env.get('APP_URL') ?? 'https://duel-space.vercel.app'}/dashboard`

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: target_email,
    options: { redirectTo },
  })

  if (error || !data?.properties?.action_link) {
    console.error('[admin-impersonate] generateLink error:', error?.message)
    return new Response(
      JSON.stringify({ error: error?.message ?? 'Failed to generate link' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  console.log(`[admin-impersonate] Admin ${ADMIN_EMAIL} generated link for ${target_email}`)

  return new Response(
    JSON.stringify({ link: data.properties.action_link }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
})
