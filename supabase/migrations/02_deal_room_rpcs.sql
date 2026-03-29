-- ─── Deal Room RPCs ───────────────────────────────────────────────────────────
-- These functions run with SECURITY DEFINER so anonymous clients (deal room
-- viewers) can update proposal state without an RLS write policy.

-- 1. Silently mark a proposal as viewed + increment view counter
CREATE OR REPLACE FUNCTION mark_proposal_viewed(p_token TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE proposals
  SET
    status         = CASE
                       WHEN status IN ('draft', 'sent') THEN 'viewed'::proposal_status
                       ELSE status
                     END,
    view_count     = view_count + 1,
    last_viewed_at = NOW()
  WHERE public_token = p_token;
END;
$$;

-- 2. Client accepts the proposal (signs electronically)
CREATE OR REPLACE FUNCTION accept_proposal(p_token TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE proposals
  SET
    status     = 'accepted'::proposal_status,
    updated_at = NOW()
  WHERE public_token = p_token
    AND status IN ('sent', 'viewed');
END;
$$;

-- Grant execute to the anonymous/public roles
GRANT EXECUTE ON FUNCTION mark_proposal_viewed(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION mark_proposal_viewed(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_proposal(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION accept_proposal(TEXT) TO authenticated;
