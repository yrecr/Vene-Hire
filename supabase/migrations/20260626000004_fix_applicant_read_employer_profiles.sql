-- Fix: Applicants cannot see employer names on interview requests.
-- Root cause: employer_profiles only had SELECT policies for admins and
-- employers, causing fetchEmployerProfiles() to return empty for applicants.
-- The data-context guard then kept stale mock data with fake IDs (ep-acme,
-- ep-innova, ep-next) that never matched real employer_ids from Supabase.

CREATE POLICY "Applicants can read employer profiles"
  ON employer_profiles FOR SELECT
  TO authenticated
  USING (public.user_role() = 'applicant');
