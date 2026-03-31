-- ─── Admin Panel RPCs ──────────────────────────────────────────────────────────
-- Sprint 34 / 34.5: God-Mode Admin Panel
--
-- Both RPCs are SECURITY DEFINER and hardcode the admin email check.
-- Regular authenticated users calling these functions will get an Access Denied
-- exception — they cannot read auth.users data under any circumstances.
--
-- set search_path = public, auth ensures both schemas are reachable inside the
-- SECURITY DEFINER context.

-- ─── get_admin_users_data() ───────────────────────────────────────────────────
-- Returns a JSON array of all users with their metadata, proposal counts,
-- and total pipeline value (sum of base_price across all their proposals).
-- Only callable by roychen651@gmail.com.

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
  -- Verify caller is the admin
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

-- ─── admin_set_user_tier(p_target_user_id, p_new_tier) ───────────────────────
-- Overwrites plan_tier in raw_user_meta_data for any user.
-- Only callable by roychen651@gmail.com.
-- Valid tiers: 'free', 'pro', 'unlimited'

CREATE OR REPLACE FUNCTION admin_set_user_tier(
  p_target_user_id uuid,
  p_new_tier        text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email text;
BEGIN
  -- Verify caller is the admin
  v_caller_email := auth.jwt() ->> 'email';
  IF v_caller_email IS DISTINCT FROM 'roychen651@gmail.com' THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  -- Validate tier value
  IF p_new_tier NOT IN ('free', 'pro', 'unlimited') THEN
    RAISE EXCEPTION 'Invalid tier: %. Must be free, pro, or unlimited.', p_new_tier;
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('plan_tier', p_new_tier)
  WHERE id = p_target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_target_user_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_set_user_tier(uuid, text) TO authenticated;
