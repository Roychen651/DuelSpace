-- Sprint 20: Discount Engine
-- Adds global_discount_pct to proposals.
-- per-item discount_pct lives inside the add_ons JSONB column — no migration needed.

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS global_discount_pct numeric(5,2) DEFAULT 0
    CHECK (global_discount_pct >= 0 AND global_discount_pct <= 100);

-- Back-fill existing rows (NULL → 0 means no discount — safe default)
UPDATE proposals SET global_discount_pct = 0 WHERE global_discount_pct IS NULL;
