-- ─── Sprint 43: Signed Quantities ──────────────────────────────────────────────
--
-- Allows the business to set a default_quantity on add-ons in EditorPanel
-- (stored in the add_ons JSONB as `default_quantity`).
--
-- When the client signs, DealRoom embeds `signed_qty` per add-on into the
-- add_ons JSONB and passes it to accept_proposal as p_add_ons.
-- This atomically records what quantity the client actually agreed to.
--
-- Backward-compatible: p_add_ons defaults to NULL → no change to add_ons column.

DROP FUNCTION IF EXISTS accept_proposal(TEXT, TEXT, TEXT, TEXT);

CREATE FUNCTION accept_proposal(
  p_token   TEXT,
  p_ip      TEXT DEFAULT NULL,
  p_ua      TEXT DEFAULT NULL,
  p_sig     TEXT DEFAULT NULL,
  p_add_ons TEXT DEFAULT NULL
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
    signer_user_agent  = p_ua,
    signature_data_url = COALESCE(NULLIF(p_sig, ''), signature_data_url),
    add_ons            = CASE
                           WHEN p_add_ons IS NOT NULL AND p_add_ons <> ''
                             THEN p_add_ons::jsonb
                           ELSE add_ons
                         END
  WHERE public_token = p_token
    AND status IN ('sent', 'viewed', 'needs_revision');

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION accept_proposal(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION accept_proposal(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
