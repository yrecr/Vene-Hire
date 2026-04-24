/*
  # Create employer_profiles table

  1. New Tables
    - `employer_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `company_name` (text)
      - `contact_name` (text)
      - `summary` (text)
      - `hiring_needs` (text)
      - `status` (text) - active, inactive, pending
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Admins can manage all employer profiles
    - Employers can read and update their own profile
*/

CREATE TABLE IF NOT EXISTS employer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  company_name text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  hiring_needs text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all employer profiles"
  ON employer_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Employers can read own profile"
  ON employer_profiles FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update own profile"
  ON employer_profiles FOR UPDATE
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

CREATE POLICY "Admins can insert employer profiles"
  ON employer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update employer profiles"
  ON employer_profiles FOR UPDATE
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
