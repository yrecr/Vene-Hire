/*
  # Create resumes storage bucket

  1. Storage
    - Create `resumes` bucket (public)
    - Files stored at `{applicant_id}/{filename}`

  2. Security
    - Applicants can upload/read/delete their own resumes
    - Admins can manage all resumes
    - Employers can read resumes of visible applicants
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,
  10485760,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Applicants can upload their own resumes
DROP POLICY IF EXISTS "Applicants can upload own resumes" ON storage.objects;
CREATE POLICY "Applicants can upload own resumes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = (
    SELECT tp.id::text FROM talent_profiles tp
    JOIN profiles p ON p.id = tp.user_id
    WHERE p.auth_user_id = auth.uid()
  )
);

-- Applicants can read their own resumes
DROP POLICY IF EXISTS "Applicants can read own resumes" ON storage.objects;
CREATE POLICY "Applicants can read own resumes"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = (
    SELECT tp.id::text FROM talent_profiles tp
    JOIN profiles p ON p.id = tp.user_id
    WHERE p.auth_user_id = auth.uid()
  )
);

-- Applicants can delete their own resumes
DROP POLICY IF EXISTS "Applicants can delete own resumes" ON storage.objects;
CREATE POLICY "Applicants can delete own resumes"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = (
    SELECT tp.id::text FROM talent_profiles tp
    JOIN profiles p ON p.id = tp.user_id
    WHERE p.auth_user_id = auth.uid()
  )
);

-- Admins can manage all resumes
DROP POLICY IF EXISTS "Admins can manage all resumes" ON storage.objects;
CREATE POLICY "Admins can manage all resumes"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
  )
);

-- Employers can read resumes of visible applicants
DROP POLICY IF EXISTS "Employers can read visible applicant resumes" ON storage.objects;
CREATE POLICY "Employers can read visible applicant resumes"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1 FROM talent_profiles tp
    WHERE tp.id::text = (storage.foldername(name))[1]
    AND tp.public_visible = true
  )
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.auth_user_id = auth.uid() AND (p.role = 'client' OR p.role = 'employer')
  )
);
