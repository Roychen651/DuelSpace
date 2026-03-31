// ─── Admin Impersonation Edge Function ────────────────────────────────────────
// Generates a one-time magic link for any user email so the admin can sign
// in as that user without knowing their password.
//
// Security: Validates the calling JWT against Supabase, verifies caller email
// is the hardcoded admin address, then uses the service role key to generate
// the link via the Supabase Admin API.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_EMAIL = 'roychen651@gmail.com'

// CORS headers — required for all browser fetch() calls to Edge Functions
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // ── Handle CORS preflight ─────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: CORS })
  }

  // Only POST past preflight
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS })
  }

  // ── Verify caller identity ────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Missing Authorization header', { status: 401, headers: CORS })
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
    return new Response('Access Denied', { status: 403, headers: CORS })
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let target_email: string
  try {
    const body = await req.json()
    target_email = body?.target_email
  } catch {
    return new Response('Invalid JSON body', { status: 400, headers: CORS })
  }

  if (!target_email || typeof target_email !== 'string') {
    return new Response('target_email is required', { status: 400, headers: CORS })
  }

  if (target_email === ADMIN_EMAIL) {
    return new Response('Cannot impersonate the admin account', { status: 400, headers: CORS })
  }

  // ── Generate magic link via Admin API ─────────────────────────────────────
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
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }

  console.log(`[admin-impersonate] Admin ${ADMIN_EMAIL} generated link for ${target_email}`)

  return new Response(
    JSON.stringify({ link: data.properties.action_link }),
    { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } },
  )
})
