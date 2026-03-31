-- ─── Sprint 35: Admin V2 — notes, user proposals, refreshed user data ─────────

-- ─── get_admin_users_data() — now includes phone + admin_notes ────────────────

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
      COALESCE(u.raw_user_meta_data ->> 'phone',        '')     AS phone,
      COALESCE(u.raw_user_meta_data ->> 'admin_notes',  '')     AS admin_notes,
      COALESCE((u.raw_user_meta_data ->> 'is_suspended')::boolean, false) AS is_suspended,
      COALESCE((u.raw_user_meta_data ->> 'bonus_quota')::int,     0)      AS bonus_quota,
      u.created_at,
      u.last_sign_in_at,
      COALESCE(p.proposal_count,       0) AS proposal_count,
      COALESCE(p.total_pipeline_value, 0) AS total_pipeline_value
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

-- ─── admin_save_note() ────────────────────────────────────────────────────────
-- Stores a private admin-only note on a user's metadata.

CREATE OR REPLACE FUNCTION admin_save_note(
  p_target_id uuid,
  p_note      text
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
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('admin_notes', p_note)
  WHERE id = p_target_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_target_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_save_note(uuid, text) TO authenticated;

-- ─── admin_get_user_proposals() ───────────────────────────────────────────────
-- Returns a JSON array of a user's last 20 proposals for the admin drawer.

CREATE OR REPLACE FUNCTION admin_get_user_proposals(p_target_id uuid)
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
      id,
      project_title,
      client_name,
      status,
      base_price,
      currency,
      public_token,
      created_at,
      updated_at
    FROM public.proposals
    WHERE user_id = p_target_id
    ORDER BY created_at DESC
    LIMIT 20
  ) t;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION admin_get_user_proposals(uuid) TO authenticated;
