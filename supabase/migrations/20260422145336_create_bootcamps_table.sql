/*
  # Create bootcamps table

  1. New Tables
    - `bootcamps`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `status` (text) - upcoming, active, completed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Admins can manage all bootcamps
    - Students can read bootcamps they are enrolled in (policy added after enrollments table)
*/

CREATE TABLE IF NOT EXISTS bootcamps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bootcamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all bootcamps"
  ON bootcamps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert bootcamps"
  ON bootcamps FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update bootcamps"
  ON bootcamps FOR UPDATE
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
