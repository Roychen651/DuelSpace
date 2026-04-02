-- Migration 29: Lean Market Domination — Document Only Mode, Hide Grand Total, B'H (בס"ד)
-- Sprint 43

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS display_bsd       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hide_grand_total  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_document_only  BOOLEAN NOT NULL DEFAULT FALSE;
