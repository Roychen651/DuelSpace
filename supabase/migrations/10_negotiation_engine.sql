-- Sprint 15.5: Frictionless Negotiation Engine
-- Adds 'needs_revision' status, revision_notes column, and request_proposal_revision RPC

-- 1. Extend the proposal_status enum
ALTER TYPE proposal_status ADD VALUE IF NOT EXISTS 'needs_revision';

-- 2. Add revision_notes column
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS revision_notes TEXT;

-- 3. RPC — callable from anon (Deal Room is public, no auth required)
CREATE OR REPLACE FUNCTION request_proposal_revision(
  p_token TEXT,
  p_notes TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE proposals
  SET
    status         = 'needs_revision',
    revision_notes = p_notes,
    updated_at     = now()
  WHERE
    public_token = p_token
    AND status IN ('sent', 'viewed');
END;
$$;

GRANT EXECUTE ON FUNCTION request_proposal_revision(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION request_proposal_revision(TEXT, TEXT) TO authenticated;
