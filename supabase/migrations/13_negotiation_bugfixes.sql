-- Migration 13: Negotiation Engine Bug Fixes
-- Fixes 3 silent-failure bugs discovered in the revision flow.

-- ── Fix 1: mark_proposal_viewed ────────────────────────────────────────────────
-- Bug: 'needs_revision' was not excluded from the WHERE clause.
-- If this RPC was called while status = 'needs_revision', it would:
--   • increment view_count (harmless)
--   • update last_viewed_at and updated_at (triggers Realtime noise)
--   • NOT change the status (ELSE branch keeps it as-is)
-- Fix: explicitly exclude 'needs_revision' so the RPC is a true no-op for it.

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
  WHERE public_token = p_token
    AND status NOT IN ('accepted', 'rejected', 'needs_revision');
END;
$$;

-- ── Fix 2: accept_proposal ─────────────────────────────────────────────────────
-- Bug: WHERE clause only allowed transition from 'sent' | 'viewed'.
-- Scenario: Creator resends after revision (status → 'sent'), client signs.
-- But what if there's a race where the client signs while status is still
-- 'needs_revision' (e.g. creator applied discount via update but revision flag
-- hasn't been cleared yet)? Acceptance would silently fail.
-- Fix: also allow acceptance from 'needs_revision' state.

CREATE OR REPLACE FUNCTION accept_proposal(p_token TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE proposals
  SET
    status      = 'accepted'::proposal_status,
    accepted_at = NOW(),
    updated_at  = NOW()
  WHERE public_token = p_token
    AND status IN ('sent', 'viewed', 'needs_revision');
END;
$$;

-- ── Fix 3: request_proposal_revision — return BOOLEAN ─────────────────────────
-- Bug: returns void → caller can't detect silent failure (no rows matched).
-- If status was already 'accepted', 'rejected', or 'needs_revision', the UPDATE
-- affected 0 rows — but the caller had no way to know, so it set revisionSent=true
-- in local state while the DB status was unchanged. On refresh, revisionSent
-- derived from DB status would be false → revision state appeared to reset.
-- Fix: return TRUE if a row was actually updated, FALSE otherwise.
-- TypeScript caller now checks the return value and shows an error on FALSE.
-- Note: DROP required — CREATE OR REPLACE cannot change a function's return type.

DROP FUNCTION IF EXISTS request_proposal_revision(TEXT, TEXT);

CREATE OR REPLACE FUNCTION request_proposal_revision(
  p_token TEXT,
  p_notes TEXT
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
    status         = 'needs_revision',
    revision_notes = p_notes,
    updated_at     = now()
  WHERE
    public_token = p_token
    AND status IN ('sent', 'viewed');

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

-- ── Re-grant (CREATE OR REPLACE resets grants in some PG versions) ─────────────
GRANT EXECUTE ON FUNCTION mark_proposal_viewed(TEXT)                TO anon;
GRANT EXECUTE ON FUNCTION mark_proposal_viewed(TEXT)                TO authenticated;
GRANT EXECUTE ON FUNCTION accept_proposal(TEXT)                     TO anon;
GRANT EXECUTE ON FUNCTION accept_proposal(TEXT)                     TO authenticated;
GRANT EXECUTE ON FUNCTION request_proposal_revision(TEXT, TEXT)     TO anon;
GRANT EXECUTE ON FUNCTION request_proposal_revision(TEXT, TEXT)     TO authenticated;
