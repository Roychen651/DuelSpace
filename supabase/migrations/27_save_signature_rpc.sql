-- ─── Sprint 41: Belt-and-suspenders signature save RPC ───────────────────────
--
-- accept_proposal already stores signature_data_url, but a race condition or
-- serialisation issue in the JS client may cause p_sig to arrive as empty.
-- This separate RPC is called AFTER accept_proposal succeeds to guarantee
-- the signature is persisted.  It only writes when the proposal is already
-- accepted and the provided signature is non-empty.

CREATE OR REPLACE FUNCTION save_proposal_signature(
  p_token TEXT,
  p_sig   TEXT
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
    signature_data_url = p_sig,
    updated_at         = NOW()
  WHERE public_token = p_token
    AND status = 'accepted'
    AND p_sig IS NOT NULL
    AND p_sig != '';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION save_proposal_signature(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION save_proposal_signature(TEXT, TEXT) TO authenticated;
