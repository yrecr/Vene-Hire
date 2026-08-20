-- contract_approval_requests had no RLS at all — any authenticated (or even
-- anon, depending on grants) client could read/write every row directly.
-- Writes already go through /api/contract-approval (service role + app-level
-- auth), so these policies mainly need to cover the direct SELECT used by
-- fetchContractApprovalRequests() in lib/supabase-service.ts.

ALTER TABLE contract_approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all contract approval requests"
  ON contract_approval_requests FOR SELECT
  TO authenticated
  USING (public.user_role() = 'admin');

CREATE POLICY "Employers can read own contract approval requests"
  ON contract_approval_requests FOR SELECT
  TO authenticated
  USING (
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Applicants can read own contract approval requests"
  ON contract_approval_requests FOR SELECT
  TO authenticated
  USING (
    applicant_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );
