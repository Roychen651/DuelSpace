-- Sprint 11: Decline flow + success_template column
-- Adds decline_proposal RPC (anon-callable) and success_template column

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS success_template text;

-- ── RPC: decline_proposal ──────────────────────────────────────────────────────
-- Called from the public Deal Room (anon) when the client clicks "Decline Offer".
-- Only transitions from sent/viewed → rejected (idempotent on repeated calls).

DROP FUNCTION IF EXISTS decline_proposal(TEXT);

CREATE OR REPLACE FUNCTION decline_proposal(p_token TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE proposals
  SET status = 'rejected'
  WHERE public_token = p_token
    AND status IN ('sent', 'viewed');
END;
$$;

GRANT EXECUTE ON FUNCTION decline_proposal(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION decline_proposal(TEXT) TO authenticated;
