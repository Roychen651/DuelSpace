-- ─── Migration 08: Dedicated status-transition timestamps ─────────────────────
-- Problem: mark_proposal_viewed bumped updated_at on EVERY Deal Room load,
-- even for already-accepted proposals. StatusTimeline used updated_at for both
-- "Sent" and "Accepted" steps, so revisiting any signed deal showed "just now"
-- for every step, corrupting real timestamps.
--
-- Fix:
--  1. Add sent_at + accepted_at columns
--  2. DB trigger auto-sets them on status transitions (belt)
--  3. accept_proposal also sets accepted_at explicitly (suspenders)
--  4. mark_proposal_viewed is a no-op for terminal statuses (accepted/rejected)
--     → stops bumping updated_at and corrupting timestamps on revisit

-- ── 1. Add columns ─────────────────────────────────────────────────────────────
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS sent_at     timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;

-- ── 2. Back-fill existing rows (approximations for historic data) ──────────────
-- sent_at = created_at for proposals that have already left 'draft'
UPDATE proposals
  SET sent_at = created_at
  WHERE status != 'draft' AND sent_at IS NULL;

-- accepted_at = updated_at for proposals already marked accepted
UPDATE proposals
  SET accepted_at = updated_at
  WHERE status = 'accepted' AND accepted_at IS NULL;

-- ── 3. Trigger: auto-set timestamps on status transitions ──────────────────────
CREATE OR REPLACE FUNCTION proposals_status_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Lock sent_at to the first moment status leaves 'draft'
  IF OLD.status = 'draft' AND NEW.status != 'draft' AND NEW.sent_at IS NULL THEN
    NEW.sent_at := NOW();
  END IF;

  -- Set accepted_at the instant status becomes 'accepted'
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    NEW.accepted_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

-- Drop if exists (idempotent re-run safety)
DROP TRIGGER IF EXISTS proposals_status_timestamps_trigger ON proposals;

CREATE TRIGGER proposals_status_timestamps_trigger
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION proposals_status_timestamps();

-- ── 4. Fix mark_proposal_viewed: skip terminal statuses entirely ───────────────
-- Previously, this always ran view_count+1 and last_viewed_at=NOW() — even
-- for accepted proposals — which fired the updated_at trigger and corrupted
-- timeline timestamps on every Deal Room revisit.
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
    AND status NOT IN ('accepted', 'rejected');
END;
$$;

-- ── 5. Fix accept_proposal: set accepted_at explicitly ────────────────────────
-- The trigger handles this too, but being explicit makes the intent clear
-- and removes any ordering dependency.
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
    AND status IN ('sent', 'viewed');
END;
$$;

-- ── 6. Re-grant (CREATE OR REPLACE can reset grants in some PG versions) ───────
GRANT EXECUTE ON FUNCTION mark_proposal_viewed(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION mark_proposal_viewed(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_proposal(TEXT)      TO anon;
GRANT EXECUTE ON FUNCTION accept_proposal(TEXT)      TO authenticated;
