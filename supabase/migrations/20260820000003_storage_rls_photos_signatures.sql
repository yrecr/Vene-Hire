/*
  # Fase 4: version the RLS for profile-photos / signatures buckets

  Both buckets were created public (20260627000001, 20260628000002) with
  no storage.objects policies recorded anywhere — writes have always gone
  through service-role API routes (app/api/photo/upload,
  app/api/contracts/sign), which bypass RLS, so nothing was broken; this
  just makes the intended access model explicit and versioned instead of
  implicit/undocumented.

  - profile-photos: path is `{talent_profile_id}/photo.{ext}`, so an
    owner-scoped policy can check the folder prefix against the caller's
    own talent_profile id.
  - signatures: path is `contracts/{process_id}-signature.{ext}` — flat,
    not owner-prefixed, so there's no clean owner check to write here.
    Real enforcement already happens in app/api/contracts/sign (checks
    selection_processes.applicant_id belongs to the caller) before it
    ever touches storage. Only a public-read policy is added.
*/

CREATE POLICY "Public can view profile photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Applicants can upload own profile photo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT tp.id::text FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Applicants can replace own profile photo"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT tp.id::text FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view signatures"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'signatures');
