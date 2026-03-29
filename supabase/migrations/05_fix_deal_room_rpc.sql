-- Fix get_deal_room_proposal: add SET search_path = public (required for SECURITY DEFINER)
-- and grant to authenticated role as well

CREATE OR REPLACE FUNCTION get_deal_room_proposal(p_token TEXT, p_code TEXT DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  IF v_access_code IS NOT NULL AND v_access_code <> '' THEN
    IF p_code IS NULL OR p_code = '' THEN
      RETURN json_build_object('_requires_code', true);
    END IF;
    IF p_code <> v_access_code THEN
      RETURN NULL;
    END IF;
  END IF;

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
GRANT EXECUTE ON FUNCTION get_deal_room_proposal(TEXT, TEXT) TO authenticated;
