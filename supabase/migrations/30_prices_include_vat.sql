-- Migration 30: VAT-inclusive pricing mode
-- Sprint 44 — allows creators to enter prices that already include VAT.
-- When true, the system back-calculates the pre-VAT amount for display
-- instead of adding VAT on top.

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS prices_include_vat BOOLEAN NOT NULL DEFAULT FALSE;
