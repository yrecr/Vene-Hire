/*
  # Create talent_skills table

  1. New Tables
    - `talent_skills`
      - `id` (uuid, primary key)
      - `talent_profile_id` (uuid, references talent_profiles)
      - `skill_name` (text)
      - `score` (integer, 0-100)
      - `display_order` (integer)

  2. Security
    - Enable RLS
    - Public can read skills for visible talent profiles
    - Admins can manage all skills
*/

CREATE TABLE IF NOT EXISTS talent_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_profile_id uuid REFERENCES talent_profiles(id) NOT NULL,
  skill_name text NOT NULL DEFAULT '',
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE talent_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read skills for visible profiles"
  ON talent_skills FOR SELECT
  TO anon, authenticated
  USING (
    talent_profile_id IN (
      SELECT id FROM talent_profiles WHERE public_visible = true
    )
  );

CREATE POLICY "Admins can read all skills"
  ON talent_skills FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert skills"
  ON talent_skills FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update skills"
  ON talent_skills FOR UPDATE
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

CREATE POLICY "Admins can delete skills"
  ON talent_skills FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );
