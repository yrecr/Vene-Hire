/*
  # Create enrollments and resources tables

  1. New Tables
    - `enrollments`
      - `id` (uuid, primary key)
      - `student_profile_id` (uuid, references profiles)
      - `bootcamp_id` (uuid, references bootcamps)
      - `progress` (integer, 0-100)
      - `status` (text) - enrolled, in_progress, completed, dropped
      - `created_at` (timestamptz)

    - `resources`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `file_path` (text)
      - `visibility` (text) - all, admin, client, student
      - `bootcamp_id` (uuid, nullable, references bootcamps)
      - `created_at` (timestamptz)

  2. Security
    - RLS on all tables
    - Admins full access
    - Students can read own enrollments
    - Role-based resource visibility

  3. Additional
    - Add bootcamp read policy for students via enrollments
*/

CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid REFERENCES profiles(id) NOT NULL,
  bootcamp_id uuid REFERENCES bootcamps(id) NOT NULL,
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status text NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    student_profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert enrollments"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update enrollments"
  ON enrollments FOR UPDATE
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

-- Students can read bootcamps they are enrolled in
CREATE POLICY "Students can read enrolled bootcamps"
  ON bootcamps FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT bootcamp_id FROM enrollments e
      JOIN profiles p ON p.id = e.student_profile_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- Resources
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  file_path text NOT NULL DEFAULT '',
  visibility text NOT NULL DEFAULT 'all' CHECK (visibility IN ('all', 'admin', 'client', 'student')),
  bootcamp_id uuid REFERENCES bootcamps(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all resources"
  ON resources FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Clients can read client-visible resources"
  ON resources FOR SELECT
  TO authenticated
  USING (
    visibility IN ('all', 'client')
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'client'
    )
  );

CREATE POLICY "Students can read student-visible resources"
  ON resources FOR SELECT
  TO authenticated
  USING (
    visibility IN ('all', 'student')
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'student'
    )
  );

CREATE POLICY "Admins can insert resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update resources"
  ON resources FOR UPDATE
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
