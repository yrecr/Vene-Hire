-- Fase 7: monthly hours reporting + auto-generated billing statements.

-- ─── selection_processes: hourly rate, set by the employer once terms are agreed ───
ALTER TABLE selection_processes ADD COLUMN IF NOT EXISTS hourly_rate numeric(10,2);

-- ─── employer_profiles: how this client pays (DEAL, bank transfer, etc.) ───
ALTER TABLE employer_profiles ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE employer_profiles ADD COLUMN IF NOT EXISTS payment_details text;

-- ─── timesheets: one row per (process, month) ───
CREATE TABLE IF NOT EXISTS timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id uuid NOT NULL REFERENCES selection_processes(id) ON DELETE CASCADE,
  month text NOT NULL, -- 'YYYY-MM'
  days jsonb NOT NULL DEFAULT '[]', -- [{ "date": "YYYY-MM-DD", "hours": 8.25, "note": "" }, ...]
  total_hours numeric(6,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  invoice_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (process_id, month)
);

ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applicants manage own timesheets" ON timesheets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM selection_processes sp
      JOIN talent_profiles tp ON tp.id = sp.applicant_id
      WHERE sp.id = timesheets.process_id
        AND tp.user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM selection_processes sp
      JOIN talent_profiles tp ON tp.id = sp.applicant_id
      WHERE sp.id = timesheets.process_id
        AND tp.user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Employers read own process timesheets" ON timesheets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM selection_processes sp
      JOIN employer_profiles ep ON ep.id = sp.employer_id
      WHERE sp.id = timesheets.process_id
        AND ep.user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Employers review own process timesheets" ON timesheets
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM selection_processes sp
      JOIN employer_profiles ep ON ep.id = sp.employer_id
      WHERE sp.id = timesheets.process_id
        AND ep.user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM selection_processes sp
      JOIN employer_profiles ep ON ep.id = sp.employer_id
      WHERE sp.id = timesheets.process_id
        AND ep.user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Admins manage all timesheets" ON timesheets
  FOR ALL TO authenticated USING (public.user_role() = 'admin') WITH CHECK (public.user_role() = 'admin');

-- ─── timesheet_events: audit trail (submit/approve/reject/resubmit) ───
CREATE TABLE IF NOT EXISTS timesheet_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id uuid NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('submitted', 'approved', 'rejected')),
  actor_profile_id uuid REFERENCES profiles(id),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE timesheet_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants read own process timesheet events" ON timesheet_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM timesheets t
      JOIN selection_processes sp ON sp.id = t.process_id
      WHERE t.id = timesheet_events.timesheet_id
        AND (
          sp.applicant_id IN (SELECT id FROM talent_profiles WHERE user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
          OR sp.employer_id IN (SELECT id FROM employer_profiles WHERE user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
        )
    )
  );

CREATE POLICY "Admins manage all timesheet events" ON timesheet_events
  FOR ALL TO authenticated USING (public.user_role() = 'admin') WITH CHECK (public.user_role() = 'admin');
