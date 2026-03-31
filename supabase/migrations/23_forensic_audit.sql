-- ─── Sprint 37: Forensic Audit Trail — IP + User-Agent capture ───────────────
--
-- 1. Adds signer_ip and signer_user_agent columns to proposals.
-- 2. Drops and re-creates accept_proposal with two optional new parameters
--    so the RPC saves forensic metadata atomically with the status change.
--    p_ip and p_ua both default to NULL so existing callers are unaffected.

-- ─── Schema ───────────────────────────────────────────────────────────────────

ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS signer_ip          TEXT,
  ADD COLUMN IF NOT EXISTS signer_user_agent  TEXT;

-- ─── accept_proposal() — forensic-aware ──────────────────────────────────────
-- Adding parameters changes the function signature, so we must DROP first.
-- Existing callers that omit p_ip/p_ua get NULL (both columns nullable).

DROP FUNCTION IF EXISTS accept_proposal(TEXT);

CREATE FUNCTION accept_proposal(
  p_token TEXT,
  p_ip    TEXT DEFAULT NULL,
  p_ua    TEXT DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE proposals
  SET
    status             = 'accepted'::proposal_status,
    updated_at         = NOW(),
    signer_ip          = p_ip,
    signer_user_agent  = p_ua
  WHERE public_token = p_token
    AND status IN ('sent', 'viewed', 'needs_revision');

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION accept_proposal(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION accept_proposal(TEXT, TEXT, TEXT) TO authenticated;
