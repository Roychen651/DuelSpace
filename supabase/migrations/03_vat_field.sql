-- Sprint 7.5: Add VAT support and time_spent RPC
-- Israeli VAT (מע"מ) support — default 18%, configurable per account

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS include_vat boolean NOT NULL DEFAULT false;

-- RPC used by DealRoom.tsx to persist time spent reading
CREATE OR REPLACE FUNCTION update_proposal_time_spent(
  p_token  TEXT,
  p_seconds INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE proposals
     SET time_spent_seconds = time_spent_seconds + p_seconds
   WHERE public_token = p_token
     AND public_token IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION update_proposal_time_spent(TEXT, INTEGER) TO anon;
