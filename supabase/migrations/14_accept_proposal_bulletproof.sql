-- Migration 14: Bulletproof accept_proposal
--
-- Problem 1: Migration 13 added `accepted_at = NOW()` to the UPDATE statement.
--   If the `accepted_at` column doesn't exist on the proposals table, this causes
--   a runtime error. Since the function is RETURNS void with no error handling,
--   behaviour was undefined — DB not updated but Supabase JS returned error: null
--   in some PostgreSQL configurations, firing confetti with no actual DB change.
--   Fix: remove the accepted_at reference entirely. The DB update only sets status.
--
-- Problem 2: Function is RETURNS void → caller cannot detect when 0 rows were
--   updated (e.g. status was already 'accepted', or public_token not found).
--   Fix: return BOOLEAN (TRUE if a row was actually updated, FALSE otherwise).
--   DealRoom.tsx now checks the return value and aborts if FALSE.

-- Must DROP to change return type (PostgreSQL disallows CREATE OR REPLACE
-- to change the return type of an existing function).
DROP FUNCTION IF EXISTS accept_proposal(TEXT);

CREATE FUNCTION accept_proposal(p_token TEXT)
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
    status     = 'accepted'::proposal_status,
    updated_at = NOW()
  WHERE public_token = p_token
    AND status IN ('sent', 'viewed', 'needs_revision');

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION accept_proposal(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION accept_proposal(TEXT) TO authenticated;
