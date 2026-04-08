-- Migration 33: Server-side proposal quota enforcement (Sprint 70)
--
-- Prevents free-tier users from bypassing the client-side quota check by
-- calling supabase.from('proposals').insert(...) directly.
--
-- Logic:
--   1. Read plan_tier and bonus_quota from auth.users.raw_user_meta_data
--   2. If plan_tier is 'free' (or NULL/missing), enforce monthly limit
--   3. Limit = 5 + COALESCE(bonus_quota, 0)
--   4. Count proposals created by this user in the current calendar month
--   5. If count >= limit, RAISE EXCEPTION to abort the INSERT

CREATE OR REPLACE FUNCTION check_proposal_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_tier  TEXT;
  v_bonus      INT;
  v_limit      INT;
  v_count      INT;
BEGIN
  -- Read tier and bonus from the inserting user's metadata
  SELECT
    COALESCE(raw_user_meta_data ->> 'plan_tier', 'free'),
    COALESCE((raw_user_meta_data ->> 'bonus_quota')::INT, 0)
  INTO v_plan_tier, v_bonus
  FROM auth.users
  WHERE id = NEW.user_id;

  -- Only enforce quota for free-tier users
  IF v_plan_tier = 'free' OR v_plan_tier IS NULL THEN
    v_limit := 5 + v_bonus;

    -- Count proposals created by this user in the current calendar month
    SELECT COUNT(*)
    INTO v_count
    FROM proposals
    WHERE user_id = NEW.user_id
      AND created_at >= date_trunc('month', now());

    IF v_count >= v_limit THEN
      RAISE EXCEPTION 'Monthly proposal quota exceeded. Free plan limit: % proposals per month.', v_limit
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach as BEFORE INSERT trigger
DROP TRIGGER IF EXISTS trg_check_proposal_quota ON proposals;
CREATE TRIGGER trg_check_proposal_quota
  BEFORE INSERT ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION check_proposal_quota();
