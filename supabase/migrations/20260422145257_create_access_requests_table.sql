/*
  # Create access_requests table

  1. New Tables
    - `access_requests`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `company` (text)
      - `email` (text)
      - `country` (text)
      - `hiring_need` (text)
      - `candidate_slug` (text, nullable)
      - `message` (text)
      - `status` (text) - pending, contacted, approved, rejected
      - `created_at` (timestamptz)
      - `reviewed_by` (uuid, nullable, references profiles)

  2. Security
    - Enable RLS
    - Anonymous users can insert access requests (public form)
    - Admins can read, update all access requests
*/

CREATE TABLE IF NOT EXISTS access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  hiring_need text NOT NULL DEFAULT '',
  candidate_slug text,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES profiles(id)
);

ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit access requests"
  ON access_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all access requests"
  ON access_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update access requests"
  ON access_requests FOR UPDATE
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
