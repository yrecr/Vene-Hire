/*
  # Vacancies & Candidates (Fase 3)

  1. New Tables
    - `vacancies` — job postings owned by an employer.
    - `candidates` — CV applications scored by the n8n/DeepSeek analysis
      pipeline against a vacancy. Owned transitively through vacancy_id.

  2. Security
    - RLS enabled on both tables.
    - Employers can read/manage vacancies and candidates for their own
      vacancies only (via employer_profiles.user_id -> profiles.id ->
      profiles.auth_user_id = auth.uid(), same join pattern as
      selection_processes/interview_requests).
    - Admins can read everything.
    - No direct INSERT policies: writes go through the service-role API
      routes (app/api/vacancies/create, app/api/candidates/*), same pattern
      as interview_requests/notifications/selection_processes.
*/

CREATE TABLE IF NOT EXISTS vacancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES employer_profiles(id) NOT NULL,
  title text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  employment_type text NOT NULL DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time', 'Part-time', 'Freelance')),
  work_mode text NOT NULL DEFAULT 'Remote' CHECK (work_mode IN ('Remote', 'Hybrid', 'On-site')),
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vacancies_employer_id ON vacancies(employer_id);

ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can read own vacancies"
  ON vacancies FOR SELECT
  TO authenticated
  USING (
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all vacancies"
  ON vacancies FOR SELECT
  TO authenticated
  USING (public.user_role() = 'admin');

CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id uuid REFERENCES vacancies(id) NOT NULL,
  name text NOT NULL DEFAULT '',
  initials text NOT NULL DEFAULT '',
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  manual_status text NOT NULL DEFAULT 'Received' CHECK (manual_status IN ('Received', 'Interview', 'Offer')),
  ai_status text NOT NULL DEFAULT 'Hold' CHECK (ai_status IN ('Advance', 'Hold', 'Reject')),
  applied_at timestamptz NOT NULL DEFAULT now(),
  profile_summary text NOT NULL DEFAULT '',
  ai_reasoning text NOT NULL DEFAULT '',
  strengths text[] NOT NULL DEFAULT '{}',
  improvement_areas text[] NOT NULL DEFAULT '{}',
  ai_model text NOT NULL DEFAULT '',
  ai_response_time text NOT NULL DEFAULT '',
  ai_total_tokens integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidates_vacancy_id ON candidates(vacancy_id);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can read candidates for own vacancies"
  ON candidates FOR SELECT
  TO authenticated
  USING (
    vacancy_id IN (
      SELECT v.id FROM vacancies v
      JOIN employer_profiles ep ON ep.id = v.employer_id
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all candidates"
  ON candidates FOR SELECT
  TO authenticated
  USING (public.user_role() = 'admin');
