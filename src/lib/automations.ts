// ─── Post-Signature Automation Engine ────────────────────────────────────────
// Fires after accept_proposal() RPC succeeds in DealRoom.
// Sends a structured payload to the creator's configured webhook URL.
// Fire-and-forget — errors are swallowed so a failed webhook never blocks signing.

import type { Proposal } from '../types/proposal'
import { proposalTotal } from '../types/proposal'

export async function triggerPostSignatureAutomations(proposal: Proposal): Promise<void> {
  const webhookUrl = proposal.creator_info?.webhook_url
  if (!webhookUrl?.trim()) return

  // Validate protocol — only allow HTTP(S) to prevent javascript: / file:// abuse
  try {
    const parsed = new URL(webhookUrl.trim())
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return
  } catch {
    return // invalid URL — silently skip
  }

  const payload = {
    event: 'proposal.accepted',
    data: {
      proposal_id:   proposal.id,
      project_title: proposal.project_title,
      client_name:   proposal.client_name,
      client_email:  proposal.client_email ?? null,
      client_company: proposal.client_company_name ?? null,
      grand_total:   proposalTotal(proposal),
      currency:      proposal.currency,
      public_token:  proposal.public_token,
      signed_at:     new Date().toISOString(),
    },
  }

  try {
    await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // Fire and forget — never throw
  }
}
