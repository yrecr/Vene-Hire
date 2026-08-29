-- Fix: Employers and applicants cannot insert notifications for each other.
-- Root cause: Only admins had INSERT permission on notifications table.
-- This caused interview request notifications to fail silently (.catch(()=>{}))
-- and not persist in Supabase, making them disappear on page reload.

-- Allow employers to insert notifications for themselves and for applicants
-- (e.g. "Interview Request Sent" for themselves, "New Interview Request" for applicants)
CREATE POLICY "Employers can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.user_role() = 'employer');

-- Allow applicants to insert notifications
-- (e.g. when accepting/declining an interview, they generate notifications)
CREATE POLICY "Applicants can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.user_role() = 'applicant');

-- Fix: Employers need UPDATE on interview_requests to set meeting_url after
-- the Zoom meeting is created (upsertInterviewRequest called a second time).
-- The original migration only had INSERT for employers, not UPDATE.
CREATE POLICY "Employers can update own interview requests"
  ON interview_requests FOR UPDATE
  TO authenticated
  USING (
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- Allow employers to insert selection_processes when applicant accepts interview
-- (createInterviewRequest -> respondToInterview -> creates SelectionProcess)
CREATE POLICY "Employers can insert selection processes"
  ON selection_processes FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- Allow employers to update their own selection processes
CREATE POLICY "Employers can update own selection processes"
  ON selection_processes FOR UPDATE
  TO authenticated
  USING (
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- Allow employers to read their own selection processes
CREATE POLICY "Employers can read own selection processes"
  ON selection_processes FOR SELECT
  TO authenticated
  USING (
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- Allow applicants to read selection processes they are part of
CREATE POLICY "Applicants can read own selection processes"
  ON selection_processes FOR SELECT
  TO authenticated
  USING (
    applicant_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );
