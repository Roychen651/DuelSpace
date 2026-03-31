// ─── Send Proposal Edge Function ─────────────────────────────────────────────
// Sends a branded HTML email via Resend, then stamps email_sent_at + delivery_email
// on the proposal record.
//
// Body: { proposal_id: string, to_email: string, message?: string }
// Auth: Bearer <user JWT> — must be the proposal owner

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers — required for all browser fetch() calls to Edge Functions
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const APP_URL     = Deno.env.get('APP_URL')     ?? 'https://duel-space.vercel.app'
const RESEND_KEY  = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL  = 'proposals@dealspace.app'
const FROM_NAME   = 'DealSpace'

// ─── HTML email template ──────────────────────────────────────────────────────

function buildEmailHtml(opts: {
  clientName: string
  projectTitle: string
  creatorName: string
  message: string
  dealUrl: string
}): string {
  const { clientName, projectTitle, creatorName, message, dealUrl } = opts
  const hasMessage = message.trim().length > 0

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${projectTitle}</title>
</head>
<body style="margin:0;padding:0;background:#030305;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#030305;padding:40px 0;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

      <!-- Logo strip -->
      <tr><td align="center" style="padding-bottom:32px;">
        <span style="font-size:18px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;">
          Deal<span style="color:#6366f1;">Space</span>
        </span>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:linear-gradient(160deg,rgba(22,22,36,1) 0%,rgba(10,10,20,1) 100%);border:1px solid rgba(255,255,255,0.09);border-radius:24px;padding:40px 36px;box-shadow:0 40px 100px rgba(0,0,0,0.8);">

        <!-- Icon -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td align="center">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,rgba(99,102,241,0.22),rgba(168,85,247,0.14));border:1px solid rgba(99,102,241,0.3);box-shadow:0 0 32px rgba(99,102,241,0.22);">
              <span style="font-size:24px;">📋</span>
            </div>
          </td></tr>
        </table>

        <!-- Heading -->
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#ffffff;text-align:center;letter-spacing:-0.5px;">
          הצעה מוכנה עבורך
        </h1>
        <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.45);text-align:center;line-height:1.6;">
          ${clientName ? `שלום ${clientName}` : 'שלום'} · ${creatorName} שלח לך הצעה לפרויקט
        </p>

        <!-- Project title badge -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${hasMessage ? '20px' : '28px'};">
          <tr><td style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:14px;padding:14px 18px;">
            <p style="margin:0;font-size:12px;font-weight:700;color:rgba(129,140,248,0.7);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
              פרויקט
            </p>
            <p style="margin:0;font-size:16px;font-weight:800;color:#ffffff;">
              ${escapeHtml(projectTitle)}
            </p>
          </td></tr>
        </table>

        ${hasMessage ? `
        <!-- Personal message -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px 18px;">
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
          </td></tr>
        </table>
        ` : ''}

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr><td align="center">
            <a href="${dealUrl}"
               style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:14px;font-size:15px;font-weight:800;color:#ffffff;text-decoration:none;box-shadow:0 0 32px rgba(99,102,241,0.35),inset 0 1px 0 rgba(255,255,255,0.15);letter-spacing:-0.2px;">
              צפה וחתום על ההצעה ←
            </a>
          </td></tr>
        </table>

        <!-- Features row -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td align="center" width="33%" style="padding:8px;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">⚡ צפייה מיידית</p>
            </td>
            <td align="center" width="33%" style="padding:8px;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">🔒 חתימה דיגיטלית</p>
            </td>
            <td align="center" width="33%" style="padding:8px;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">📄 חוזה אוטומטי</p>
            </td>
          </tr>
        </table>

        <!-- Link fallback -->
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);text-align:center;word-break:break-all;direction:ltr;">
          ${dealUrl}
        </p>

      </td></tr>

      <!-- Footer -->
      <tr><td align="center" style="padding-top:24px;">
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">
          נשלח דרך DealSpace · <a href="${APP_URL}" style="color:rgba(99,102,241,0.6);text-decoration:none;">dealspace.app</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: CORS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS })
  }

  // ── Verify caller JWT ─────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Missing Authorization header', { status: 401, headers: CORS })
  }

  const callerClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data: { user }, error: authError } = await callerClient.auth.getUser()
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401, headers: CORS })
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let proposal_id: string, to_email: string, message: string
  try {
    const body = await req.json()
    proposal_id = body?.proposal_id
    to_email    = body?.to_email
    message     = body?.message ?? ''
  } catch {
    return new Response('Invalid JSON body', { status: 400, headers: CORS })
  }

  if (!proposal_id || !to_email) {
    return new Response('proposal_id and to_email are required', { status: 400, headers: CORS })
  }

  // Basic email sanity check
  if (!to_email.includes('@') || !to_email.includes('.')) {
    return new Response('Invalid to_email', { status: 400, headers: CORS })
  }

  // ── Fetch proposal via admin client ───────────────────────────────────────
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: proposal, error: fetchError } = await adminClient
    .from('proposals')
    .select('id, user_id, public_token, project_title, client_name, creator_info')
    .eq('id', proposal_id)
    .single()

  if (fetchError || !proposal) {
    return new Response('Proposal not found', { status: 404, headers: CORS })
  }

  // Ensure the caller owns this proposal
  if (proposal.user_id !== user.id) {
    return new Response('Forbidden', { status: 403, headers: CORS })
  }

  // ── Build email ───────────────────────────────────────────────────────────
  const dealUrl    = `${APP_URL}/deal/${proposal.public_token}?source=email`
  const creatorName =
    (proposal.creator_info as { full_name?: string } | null)?.full_name ||
    user.email?.split('@')[0] ||
    'שולח ההצעה'

  const emailSubject = `הצעה: ${proposal.project_title || 'פרויקט חדש'}`
  const html = buildEmailHtml({
    clientName:   proposal.client_name ?? '',
    projectTitle: proposal.project_title ?? 'פרויקט חדש',
    creatorName,
    message,
    dealUrl,
  })

  // ── Send via Resend ───────────────────────────────────────────────────────
  if (!RESEND_KEY) {
    console.error('[send-proposal] RESEND_API_KEY is not set')
    return new Response(
      JSON.stringify({ error: 'Email service not configured' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    `${FROM_NAME} <${FROM_EMAIL}>`,
      to:      [to_email],
      subject: emailSubject,
      html,
    }),
  })

  if (!resendRes.ok) {
    const errorBody = await resendRes.text()
    console.error('[send-proposal] Resend error:', errorBody)
    return new Response(
      JSON.stringify({ error: 'Failed to send email', detail: errorBody }),
      { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }

  // ── Stamp proposal: email_sent_at + delivery_email ────────────────────────
  await adminClient
    .from('proposals')
    .update({
      email_sent_at:  new Date().toISOString(),
      delivery_email: to_email,
    })
    .eq('id', proposal_id)

  console.log(`[send-proposal] Sent to ${to_email} for proposal ${proposal_id}`)

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } },
  )
})
