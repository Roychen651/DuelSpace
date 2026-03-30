-- Sprint 27: Create avatars storage bucket + RLS policies
-- Safe to run multiple times (ON CONFLICT DO NOTHING on bucket, DROP IF EXISTS on policies)

-- ── Create bucket ─────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  10485760,  -- 10 MB limit (logos + avatars can be large)
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'image/webp', 'image/svg+xml', 'image/avif'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS policies ──────────────────────────────────────────────────────
-- Drop existing policies first so this migration is idempotent

DROP POLICY IF EXISTS "avatars_public_select"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_insert"    ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_update"    ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_delete"    ON storage.objects;

-- Anyone (including anon) can read/view files — needed for Deal Room + PDF display
CREATE POLICY "avatars_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Any authenticated user can upload to the avatars bucket
-- (both avatar uploads and logo uploads are scoped to a user's own files by convention)
CREATE POLICY "avatars_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Any authenticated user can overwrite files they previously uploaded
CREATE POLICY "avatars_auth_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Any authenticated user can delete their own uploads
CREATE POLICY "avatars_auth_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
