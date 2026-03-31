-- ─── Sprint 39: Native Delivery Engine ──────────────────────────────────────
-- Adds email delivery tracking columns to proposals and a public RPC for
-- recording when the client opens the email link.

-- 1. Delivery columns
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS delivery_email    TEXT,
  ADD COLUMN IF NOT EXISTS email_sent_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_opened_at   TIMESTAMPTZ;

-- 2. mark_email_opened — called from DealRoom when ?source=email is present.
--    Idempotent: only sets email_opened_at on the first call (IS NULL guard).
CREATE OR REPLACE FUNCTION mark_email_opened(p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE proposals
  SET    email_opened_at = NOW()
  WHERE  public_token    = p_token
    AND  email_opened_at IS NULL;

  RETURN FOUND;   -- TRUE on first open, FALSE on subsequent calls
END;
$$;

GRANT EXECUTE ON FUNCTION mark_email_opened(TEXT) TO anon, authenticated;
