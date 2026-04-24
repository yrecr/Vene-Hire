/*
  # Create selection_processes table

  1. New Tables
    - `selection_processes`
      - `id` (uuid, primary key)
      - `applicant_id` (uuid, references talent_profiles)
      - `employer_id` (uuid, references employer_profiles)
      - `role_title` (text)
      - `current_stage` (text) - intro_interview, technical_interview, contract_signing
      - `status` (text) - active, hired, not_selected, on_hold
      - `intro_interview_date` (timestamptz, nullable)
      - `technical_interview_date` (timestamptz, nullable)
      - `contract_status` (text, nullable) - pending, under_review, signed
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Admins full access
    - Employers can read/create processes they own
    - Applicants can read processes they are part of
*/

CREATE TABLE IF NOT EXISTS selection_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid REFERENCES talent_profiles(id) NOT NULL,
  employer_id uuid REFERENCES employer_profiles(id) NOT NULL,
  role_title text NOT NULL DEFAULT '',
  current_stage text NOT NULL DEFAULT 'intro_interview' CHECK (current_stage IN ('intro_interview', 'technical_interview', 'contract_signing')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hired', 'not_selected', 'on_hold')),
  intro_interview_date timestamptz,
  technical_interview_date timestamptz,
  contract_status text CHECK (contract_status IS NULL OR contract_status IN ('pending', 'under_review', 'signed')),
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE selection_processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all processes"
  ON selection_processes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert processes"
  ON selection_processes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update processes"
  ON selection_processes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Employers can read own processes"
  ON selection_processes FOR SELECT
  TO authenticated
  USING (
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can insert own processes"
  ON selection_processes FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Applicants can read own processes"
  ON selection_processes FOR SELECT
  TO authenticated
  USING (
    applicant_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );
