-- Sprint 41: Guided Tour persistence
-- mark_tour_seen() sets has_seen_tour in user raw_user_meta_data.
-- Called fire-and-forget after the guided tour completes or is skipped.

CREATE OR REPLACE FUNCTION public.mark_tour_seen()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data =
    COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"has_seen_tour": true}'::jsonb
  WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_tour_seen() TO authenticated;
