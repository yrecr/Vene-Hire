/*
  # Create talent_profiles table

  1. New Tables
    - `talent_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `slug` (text, unique) - URL-friendly identifier
      - `display_name` (text)
      - `title` (text) - professional title
      - `summary` (text) - short summary
      - `bio` (text) - extended biography
      - `tech_stack` (text[]) - array of technologies
      - `english_level` (text) - e.g. Advanced, Fluent, Native
      - `availability_status` (text) - e.g. Available, Hired, In Training
      - `years_experience` (integer)
      - `featured` (boolean) - show on homepage
      - `public_visible` (boolean) - visible on public listing
      - `video_url` (text, nullable) - intro video URL
      - `profile_image_url` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `talent_profiles` table
    - Public can read talent profiles where public_visible is true
    - Admins can perform all operations
    - Students can read and update their own talent profile
*/

CREATE TABLE IF NOT EXISTS talent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  slug text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  tech_stack text[] NOT NULL DEFAULT '{}',
  english_level text NOT NULL DEFAULT 'Intermediate' CHECK (english_level IN ('Basic', 'Intermediate', 'Advanced', 'Fluent', 'Native')),
  availability_status text NOT NULL DEFAULT 'In Training' CHECK (availability_status IN ('Available', 'Hired', 'In Training', 'On Hold')),
  years_experience integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  public_visible boolean NOT NULL DEFAULT false,
  video_url text,
  profile_image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read visible talent profiles"
  ON talent_profiles FOR SELECT
  TO anon, authenticated
  USING (public_visible = true);

CREATE POLICY "Admins can read all talent profiles"
  ON talent_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert talent profiles"
  ON talent_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update talent profiles"
  ON talent_profiles FOR UPDATE
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

CREATE POLICY "Students can read own talent profile"
  ON talent_profiles FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own talent profile"
  ON talent_profiles FOR UPDATE
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
