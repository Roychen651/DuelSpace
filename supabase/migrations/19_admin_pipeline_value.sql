-- ─── Sprint 34.5: Add total_pipeline_value to get_admin_users_data() ──────────
-- Re-creates the RPC with the new aggregate column.
-- admin_set_user_tier is unchanged — no need to touch it.

CREATE OR REPLACE FUNCTION get_admin_users_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email text;
  v_result       json;
BEGIN
  v_caller_email := auth.jwt() ->> 'email';
  IF v_caller_email IS DISTINCT FROM 'roychen651@gmail.com' THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  SELECT json_agg(row_to_json(t))
  INTO v_result
  FROM (
    SELECT
      u.id,
      u.email,
      COALESCE(u.raw_user_meta_data ->> 'plan_tier', 'free')   AS plan_tier,
      COALESCE(u.raw_user_meta_data ->> 'full_name', '')        AS full_name,
      u.created_at,
      u.last_sign_in_at,
      COALESCE(p.proposal_count, 0)                            AS proposal_count,
      COALESCE(p.total_pipeline_value, 0)                      AS total_pipeline_value
    FROM auth.users u
    LEFT JOIN (
      SELECT
        user_id,
        COUNT(*)                    AS proposal_count,
        SUM(COALESCE(base_price,0)) AS total_pipeline_value
      FROM public.proposals
      GROUP BY user_id
    ) p ON p.user_id = u.id
    ORDER BY u.created_at DESC
  ) t;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_users_data() TO authenticated;
