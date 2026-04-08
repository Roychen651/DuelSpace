-- Migration 34: Critical security & quota hotfix (Sprint 76)
--
-- F1 — Patch data leak: public_token_select RLS policy grants anonymous SELECT
--       on ALL proposals (since every row has a non-null public_token).
--       The get_deal_room_proposal RPC (SECURITY DEFINER) handles public access;
--       the blanket policy is unnecessary and dangerous.
--
-- F2 — Enforce Pro tier quota: Migration 33 only gated free-tier users.
--       Pro users (advertised at 100/month) had no server-side enforcement.
--       Updated check_proposal_quota() enforces per-tier monthly limits:
--         free      →   5 + bonus_quota
--         pro       → 100 + bonus_quota
--         unlimited → no limit (skipped entirely)

-- ═══════════════════════════════════════════════════════════════════════════════
-- F1: Lock down the public_token_select RLS policy
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "public_token_select" ON proposals;

-- Recreate as a deny-all policy. Public Deal Room access is handled exclusively
-- by the get_deal_room_proposal RPC (SECURITY DEFINER, SET search_path = public)
-- which bypasses RLS. No direct anonymous SELECT is needed.
CREATE POLICY "public_token_select" ON proposals
  FOR SELECT USING (false);

-- ═══════════════════════════════════════════════════════════════════════════════
-- F2: Enforce per-tier monthly quota (replaces Migration 33 function)
-- ═══════════════════════════════════════════════════════════════════════════════

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

  -- Unlimited tier has no quota — exit early
  IF v_plan_tier = 'unlimited' THEN
    RETURN NEW;
  END IF;

  -- Determine base limit by tier
  IF v_plan_tier = 'pro' THEN
    v_limit := 100 + v_bonus;
  ELSE
    -- free tier (including NULL/missing plan_tier)
    v_limit := 5 + v_bonus;
  END IF;

  -- Count proposals created by this user in the current calendar month
  SELECT COUNT(*)
  INTO v_count
  FROM proposals
  WHERE user_id = NEW.user_id
    AND created_at >= date_trunc('month', now());

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Monthly proposal quota exceeded. Your plan limit: % proposals per month.', v_limit
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger already exists from Migration 33 — no need to recreate.
-- CREATE OR REPLACE FUNCTION replaces the function body in-place;
-- the existing trg_check_proposal_quota trigger continues to reference it.
