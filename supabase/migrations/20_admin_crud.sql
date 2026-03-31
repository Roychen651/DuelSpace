-- ─── Sprint 34.8: Admin CRUD RPCs ────────────────────────────────────────────
-- Destructive and mutative powers for the founder's Admin Panel.
-- Both RPCs are SECURITY DEFINER, hardcoded to roychen651@gmail.com.

-- ─── admin_delete_user(p_target_user_id) ──────────────────────────────────────
-- Hard-deletes a user from auth.users.
-- Cascades automatically to proposals and services (FK ON DELETE CASCADE).

CREATE OR REPLACE FUNCTION admin_delete_user(p_target_user_id uuid)
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

  DELETE FROM auth.users WHERE id = p_target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_target_user_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_delete_user(uuid) TO authenticated;

-- ─── admin_update_user_profile(p_target_user_id, p_full_name) ─────────────────
-- Overwrites the user's full_name in raw_user_meta_data.

CREATE OR REPLACE FUNCTION admin_update_user_profile(
  p_target_user_id uuid,
  p_full_name       text
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
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('full_name', p_full_name)
  WHERE id = p_target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_target_user_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_user_profile(uuid, text) TO authenticated;
