-- ─── Sprint 41: Signature Storage — persist signature dataUrl in DB ────────────
--
-- The signature image produced by the client's canvas must survive the browser
-- session so the business owner can download a signed PDF at any time.
--
-- 1. Adds signature_data_url TEXT column to proposals.
-- 2. Drops and re-creates accept_proposal with p_sig TEXT DEFAULT NULL so
--    DealRoom can atomically save the base64 PNG alongside ip/ua at signing.
--    COALESCE(NULLIF(p_sig,''), ...) means an empty string is treated as NULL
--    and does not overwrite an existing value.
--    Existing callers that omit p_sig are fully backward-compatible.

-- ─── Schema ───────────────────────────────────────────────────────────────────

ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS signature_data_url TEXT;

-- ─── accept_proposal() — with signature storage ───────────────────────────────

DROP FUNCTION IF EXISTS accept_proposal(TEXT, TEXT, TEXT);

CREATE FUNCTION accept_proposal(
  p_token TEXT,
  p_ip    TEXT DEFAULT NULL,
  p_ua    TEXT DEFAULT NULL,
  p_sig   TEXT DEFAULT NULL
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
    status              = 'accepted'::proposal_status,
    updated_at          = NOW(),
    signer_ip           = p_ip,
    signer_user_agent   = p_ua,
    -- Store signature only when provided; preserve any previously stored value
    signature_data_url  = COALESCE(NULLIF(p_sig, ''), signature_data_url)
  WHERE public_token = p_token
    AND status IN ('sent', 'viewed', 'needs_revision');

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION accept_proposal(TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION accept_proposal(TEXT, TEXT, TEXT, TEXT) TO authenticated;
