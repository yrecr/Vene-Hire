-- Restore applicant (student) self-update policies for talent_profiles and talent_skills
-- These were accidentally dropped when fix_rls_recursion.sql replaced all policies
-- without recreating the non-admin ones.

-- ─── Talent Profiles ─────────────────────────────────────────────────────────
-- Allow applicants to read their own profile (even if not public_visible)
DROP POLICY IF EXISTS "Students can read own talent profile" ON talent_profiles;
CREATE POLICY "Students can read own talent profile"
  ON talent_profiles FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Allow applicants to update their own profile (video_url, resume_url, etc.)
DROP POLICY IF EXISTS "Students can update own talent profile" ON talent_profiles;
CREATE POLICY "Students can update own talent profile"
  ON talent_profiles FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

-- ─── Talent Skills ────────────────────────────────────────────────────────────
-- Allow applicants to read their own skills
DROP POLICY IF EXISTS "Students can read own skills" ON talent_skills;
CREATE POLICY "Students can read own skills"
  ON talent_skills FOR SELECT
  TO authenticated
  USING (
    talent_profile_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- Allow applicants to insert their own skills
DROP POLICY IF EXISTS "Students can insert own skills" ON talent_skills;
CREATE POLICY "Students can insert own skills"
  ON talent_skills FOR INSERT
  TO authenticated
  WITH CHECK (
    talent_profile_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- Allow applicants to update their own skills
DROP POLICY IF EXISTS "Students can update own skills" ON talent_skills;
CREATE POLICY "Students can update own skills"
  ON talent_skills FOR UPDATE
  TO authenticated
  USING (
    talent_profile_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    talent_profile_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- Allow applicants to delete their own skills
DROP POLICY IF EXISTS "Students can delete own skills" ON talent_skills;
CREATE POLICY "Students can delete own skills"
  ON talent_skills FOR DELETE
  TO authenticated
  USING (
    talent_profile_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );
