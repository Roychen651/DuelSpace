-- ── Migration 04: Access code gate for deal rooms ────────────────────────────

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS access_code text;

-- ── RPC: get_deal_room_proposal ───────────────────────────────────────────────
-- Returns the proposal if:
--   • no access_code is set (public), OR
--   • p_code matches the stored access_code
-- If access_code is set but p_code is NULL, returns {"_requires_code": true}
-- If p_code is wrong, returns NULL (don't reveal proposal exists)
-- The access_code column is NEVER included in the returned JSON.

CREATE OR REPLACE FUNCTION get_deal_room_proposal(p_token TEXT, p_code TEXT DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id          uuid;
  v_access_code text;
BEGIN
  SELECT id, access_code
    INTO v_id, v_access_code
    FROM proposals
   WHERE public_token = p_token;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Code required but not provided → sentinel response
  IF v_access_code IS NOT NULL AND v_access_code <> '' THEN
    IF p_code IS NULL OR p_code = '' THEN
      RETURN json_build_object('_requires_code', true);
    END IF;
    -- Wrong code → null (silent)
    IF p_code <> v_access_code THEN
      RETURN NULL;
    END IF;
  END IF;

  -- Return proposal data, excluding access_code for security
  RETURN (
    SELECT row_to_json(t) FROM (
      SELECT id, user_id, client_name, client_email, project_title, description,
             base_price, currency, add_ons, status, expires_at, public_token,
             view_count, last_viewed_at, time_spent_seconds, created_at, updated_at,
             include_vat
        FROM proposals
       WHERE id = v_id
    ) t
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_deal_room_proposal(TEXT, TEXT) TO anon;
