/*
  # Create interview_requests table

  1. New Tables
    - `interview_requests`
      - `id` (uuid, primary key)
      - `applicant_id` (uuid, references talent_profiles)
      - `employer_id` (uuid, references employer_profiles)
      - `requested_date` (timestamptz, nullable)
      - `status` (text) - pending, accepted, declined, scheduled, completed
      - `message` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Admins full access
    - Employers can create and read own requests
    - Applicants can read and update requests targeting them
*/

CREATE TABLE IF NOT EXISTS interview_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid REFERENCES talent_profiles(id) NOT NULL,
  employer_id uuid REFERENCES employer_profiles(id) NOT NULL,
  requested_date timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'scheduled', 'completed')),
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE interview_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all interview requests"
  ON interview_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update interview requests"
  ON interview_requests FOR UPDATE
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

CREATE POLICY "Employers can read own interview requests"
  ON interview_requests FOR SELECT
  TO authenticated
  USING (
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can create interview requests"
  ON interview_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id IN (
      SELECT ep.id FROM employer_profiles ep
      JOIN profiles p ON p.id = ep.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Applicants can read own interview requests"
  ON interview_requests FOR SELECT
  TO authenticated
  USING (
    applicant_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Applicants can update own interview requests"
  ON interview_requests FOR UPDATE
  TO authenticated
  USING (
    applicant_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    applicant_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );
