-- Add missing columns to talent_profiles
ALTER TABLE talent_profiles ADD COLUMN IF NOT EXISTS resume_url text;
ALTER TABLE talent_profiles ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'America/Bogota';
ALTER TABLE talent_profiles ADD COLUMN IF NOT EXISTS profile_completion integer NOT NULL DEFAULT 0;

-- Add meeting_url to selection_processes
ALTER TABLE selection_processes ADD COLUMN IF NOT EXISTS meeting_url text;

-- Add missing columns to interview_requests
ALTER TABLE interview_requests ADD COLUMN IF NOT EXISTS role_title text NOT NULL DEFAULT '';
ALTER TABLE interview_requests ADD COLUMN IF NOT EXISTS meeting_url text;

-- Fix RLS: availability_slots employer policy uses defunct 'client' role
DROP POLICY IF EXISTS "Employers can read visible applicant slots" ON availability_slots;
CREATE POLICY "Employers can read visible applicant slots"
  ON availability_slots FOR SELECT
  TO authenticated
  USING (
    applicant_id IN (SELECT id FROM talent_profiles WHERE public_visible = true)
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'employer'
    )
  );

-- Fix profiles default role (was 'student' before roles changed)
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'applicant';
