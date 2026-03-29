-- Sprint 14.5: X-Ray section time telemetry
-- Adds per-section read-time tracking to proposals

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS section_time jsonb DEFAULT '{}';

-- ── update_section_time ───────────────────────────────────────────────────────
-- Accumulates per-section seconds sent by the DealRoom IntersectionObserver.
-- Called from the public Deal Room (anon context) — SECURITY DEFINER required.
-- Merges incoming keys additively: existing + new seconds per key.

CREATE OR REPLACE FUNCTION update_section_time(
  p_token       TEXT,
  p_section_time jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_st jsonb;
  k          TEXT;
  cur_val    NUMERIC;
  inc_val    NUMERIC;
  result     jsonb;
BEGIN
  SELECT COALESCE(section_time, '{}') INTO current_st
  FROM proposals WHERE public_token = p_token;

  IF NOT FOUND THEN RETURN; END IF;

  result := current_st;

  FOR k IN SELECT jsonb_object_keys(p_section_time)
  LOOP
    cur_val := COALESCE((current_st->k)::numeric, 0);
    inc_val := COALESCE((p_section_time->k)::numeric, 0);
    result  := jsonb_set(result, ARRAY[k], to_jsonb(cur_val + inc_val));
  END LOOP;

  UPDATE proposals
  SET section_time = result
  WHERE public_token = p_token;
END;
$$;

GRANT EXECUTE ON FUNCTION update_section_time(TEXT, jsonb) TO anon, authenticated;
