-- Sprint 14.8: Cinematic Deal Room
-- Adds video_url (text) and testimonials (jsonb) to proposals

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS video_url    TEXT,
  ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]';
