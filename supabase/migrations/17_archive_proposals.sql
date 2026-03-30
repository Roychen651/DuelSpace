-- Sprint 29: Soft Delete / Archive Engine
-- Adds is_archived column — boolean flag for non-destructive proposal archival.
--
-- Rationale: Destructive DELETE is prohibited on signed contracts (accepted proposals).
-- Archiving sets is_archived = true, hiding the proposal from active views while
-- preserving the full row — including the client signature, PDF audit trail, and
-- all JSONB fields — in the database forever.
--
-- RLS: The existing owner_update policy (auth.uid() = user_id) already covers
-- setting is_archived = true. No new policies are required.
--
-- Safe to run multiple times (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- Partial index: the overwhelming majority of queries hit active proposals.
-- This index covers the common case efficiently and skips archived rows.
CREATE INDEX IF NOT EXISTS proposals_user_active_idx
  ON public.proposals (user_id, created_at DESC)
  WHERE is_archived = false;
