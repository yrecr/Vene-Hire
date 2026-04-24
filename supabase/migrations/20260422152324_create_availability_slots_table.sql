/*
  # Create availability_slots table

  1. New Tables
    - `availability_slots`
      - `id` (uuid, primary key)
      - `applicant_id` (uuid, references talent_profiles)
      - `day_of_week` (integer, 0=Sunday to 6=Saturday)
      - `start_time` (time)
      - `end_time` (time)
      - `timezone` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Admins can manage all slots
    - Applicants can manage their own slots
    - Employers can read slots for visible applicants
*/

CREATE TABLE IF NOT EXISTS availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid REFERENCES talent_profiles(id) NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text NOT NULL DEFAULT 'America/New_York',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all availability slots"
  ON availability_slots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Applicants can read own slots"
  ON availability_slots FOR SELECT
  TO authenticated
  USING (
    applicant_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Applicants can insert own slots"
  ON availability_slots FOR INSERT
  TO authenticated
  WITH CHECK (
    applicant_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Applicants can update own slots"
  ON availability_slots FOR UPDATE
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

CREATE POLICY "Applicants can delete own slots"
  ON availability_slots FOR DELETE
  TO authenticated
  USING (
    applicant_id IN (
      SELECT tp.id FROM talent_profiles tp
      JOIN profiles p ON p.id = tp.user_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can read visible applicant slots"
  ON availability_slots FOR SELECT
  TO authenticated
  USING (
    applicant_id IN (
      SELECT id FROM talent_profiles WHERE public_visible = true
    )
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'client'
    )
  );
