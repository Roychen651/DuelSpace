-- ─── Sprint 34.9: Admin Apex RPCs ────────────────────────────────────────────
-- Advanced operational powers: suspend, advanced profile edit, bonus quota.
-- Also refreshes get_admin_users_data to return is_suspended + bonus_quota.

-- ─── get_admin_users_data() — refreshed with new fields ──────────────────────

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
      COALESCE(u.raw_user_meta_data ->> 'plan_tier',    'free') AS plan_tier,
      COALESCE(u.raw_user_meta_data ->> 'full_name',    '')     AS full_name,
      COALESCE(u.raw_user_meta_data ->> 'company_name', '')     AS company_name,
      COALESCE((u.raw_user_meta_data ->> 'is_suspended')::boolean, false)
                                                                AS is_suspended,
      COALESCE((u.raw_user_meta_data ->> 'bonus_quota')::int, 0)
                                                                AS bonus_quota,
      u.created_at,
      u.last_sign_in_at,
      COALESCE(p.proposal_count,       0)                      AS proposal_count,
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

-- ─── admin_update_user_advanced() ────────────────────────────────────────────
-- Merges full_name, company_name, and bonus_quota into raw_user_meta_data.

CREATE OR REPLACE FUNCTION admin_update_user_advanced(
  p_target_id   uuid,
  p_name        text,
  p_company     text,
  p_bonus_quota int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email text;
BEGIN
  v_caller_email := auth.jwt() ->> 'email';
  IF v_caller_email IS DISTINCT FROM 'roychen651@gmail.com' THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  IF p_bonus_quota < 0 THEN
    RAISE EXCEPTION 'bonus_quota cannot be negative';
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data
    || jsonb_build_object(
         'full_name',    p_name,
         'company_name', p_company,
         'bonus_quota',  p_bonus_quota
       )
  WHERE id = p_target_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_target_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_user_advanced(uuid, text, text, int) TO authenticated;

-- ─── admin_toggle_suspend() ───────────────────────────────────────────────────
-- Sets or clears is_suspended flag in raw_user_meta_data.

CREATE OR REPLACE FUNCTION admin_toggle_suspend(
  p_target_id uuid,
  p_suspend   boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email text;
BEGIN
  v_caller_email := auth.jwt() ->> 'email';
  IF v_caller_email IS DISTINCT FROM 'roychen651@gmail.com' THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data
    || jsonb_build_object('is_suspended', p_suspend)
  WHERE id = p_target_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_target_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_toggle_suspend(uuid, boolean) TO authenticated;
