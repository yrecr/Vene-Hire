/*
  # Create resources storage bucket

  1. Storage
    - Create `resources` bucket (public read)
    - Files stored at `{resource_id}/{filename}`

  2. Security
    - Public read (visibility filtering happens at the `resources` table level, not storage)
    - Only admins can INSERT/UPDATE/DELETE objects in this bucket
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  true,
  20971520,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Admins can manage all resource files
DROP POLICY IF EXISTS "Admins can manage all resource files" ON storage.objects;
CREATE POLICY "Admins can manage all resource files"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'resources'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'resources'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
  )
);
