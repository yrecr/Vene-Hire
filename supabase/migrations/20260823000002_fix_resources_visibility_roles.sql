/*
  # Fix stale visibility/role values on resources

  The `resources.visibility` column and its RLS policies were written back when
  the app had `client`/`student` roles. Roles were later cut down to
  `admin`/`employer`/`applicant`, but this table was never updated, so:
    - existing rows can carry now-meaningless `client`/`student` values
    - the CHECK constraint would reject the correct new values
    - the per-role SELECT policies check `p.role = 'client' / 'student'`,
      which can never match a real profile anymore (employers/applicants
      could never read their own resources)

  1. Data: remap any `client`/`student` rows to `all` (safest default - still
     visible to everyone) before the constraint changes shape.
  2. Constraint: replace the CHECK to allow `all/admin/employer/applicant`.
  3. Policies: replace the old client/student SELECT policies with
     employer/applicant equivalents.
*/

UPDATE resources SET visibility = 'all' WHERE visibility IN ('client', 'student');

ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_visibility_check;
ALTER TABLE resources ADD CONSTRAINT resources_visibility_check
  CHECK (visibility IN ('all', 'admin', 'employer', 'applicant'));

DROP POLICY IF EXISTS "Clients can read client-visible resources" ON resources;
DROP POLICY IF EXISTS "Students can read student-visible resources" ON resources;

CREATE POLICY "Employers can read employer-visible resources"
  ON resources FOR SELECT
  TO authenticated
  USING (
    visibility IN ('all', 'employer')
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'employer'
    )
  );

CREATE POLICY "Applicants can read applicant-visible resources"
  ON resources FOR SELECT
  TO authenticated
  USING (
    visibility IN ('all', 'applicant')
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'applicant'
    )
  );
