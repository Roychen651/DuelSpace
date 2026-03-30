-- Sprint 27: Services catalog table + RLS policies
-- Safe to run multiple times (IF NOT EXISTS + DROP IF EXISTS on policies)

-- ── Create table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label       TEXT          NOT NULL,
  description TEXT,
  price       NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Row-Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_owner_select" ON public.services;
DROP POLICY IF EXISTS "services_owner_insert" ON public.services;
DROP POLICY IF EXISTS "services_owner_update" ON public.services;
DROP POLICY IF EXISTS "services_owner_delete" ON public.services;

CREATE POLICY "services_owner_select" ON public.services
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "services_owner_insert" ON public.services
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "services_owner_update" ON public.services
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "services_owner_delete" ON public.services
  FOR DELETE USING (auth.uid() = user_id);

-- ── Performance index ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS services_user_id_created_at_idx
  ON public.services (user_id, created_at DESC);
