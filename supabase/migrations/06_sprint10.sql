-- Sprint 10: Payment Milestones, Client Capture, Dynamic Branding, Creator Info
-- Adds columns to proposals and a new anon-accessible RPC

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS payment_milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS client_tax_id       text,
  ADD COLUMN IF NOT EXISTS client_address      text,
  ADD COLUMN IF NOT EXISTS client_signer_role  text,
  ADD COLUMN IF NOT EXISTS client_company_name text,
  ADD COLUMN IF NOT EXISTS brand_color         text,
  ADD COLUMN IF NOT EXISTS creator_info        jsonb;

-- ── RPC: save_client_details ──────────────────────────────────────────────────
-- Called from the public Deal Room (anon) just before accept_proposal.
-- Stores client-entered legal identity on the proposal record.

DROP FUNCTION IF EXISTS save_client_details(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION save_client_details(
  p_token         TEXT,
  p_full_name     TEXT    DEFAULT NULL,
  p_company_name  TEXT    DEFAULT NULL,
  p_tax_id        TEXT    DEFAULT NULL,
  p_address       TEXT    DEFAULT NULL,
  p_signer_role   TEXT    DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE proposals
  SET
    client_name         = COALESCE(NULLIF(p_full_name, ''),    client_name),
    client_company_name = COALESCE(NULLIF(p_company_name, ''), client_company_name),
    client_tax_id       = COALESCE(NULLIF(p_tax_id, ''),       client_tax_id),
    client_address      = COALESCE(NULLIF(p_address, ''),      client_address),
    client_signer_role  = COALESCE(NULLIF(p_signer_role, ''),  client_signer_role)
  WHERE public_token = p_token
    AND status IN ('sent', 'viewed');
END;
$$;

GRANT EXECUTE ON FUNCTION save_client_details(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION save_client_details(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
