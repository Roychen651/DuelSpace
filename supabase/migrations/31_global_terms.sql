-- ─────────────────────────────────────────────────────────────────
-- Sprint 44.9 — Global Business Terms
-- Removes the Video Pitch feature (video_url column) and introduces
-- business_terms (TEXT) so creators define T&C once in their Profile
-- and the terms are frozen into every proposal they create.
-- ─────────────────────────────────────────────────────────────────

-- Drop video_url — feature removed in Sprint 44.9
ALTER TABLE proposals DROP COLUMN IF EXISTS video_url;

-- Add business_terms — rich-text HTML from creator's Profile
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS business_terms TEXT NOT NULL DEFAULT '';
