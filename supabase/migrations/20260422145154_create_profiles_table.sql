/*
  # Create profiles table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `auth_user_id` (uuid, references auth.users, unique)
      - `full_name` (text)
      - `email` (text)
      - `role` (text) - one of: admin, client, student
      - `company_name` (text, nullable)
      - `status` (text) - one of: active, inactive, pending
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `profiles` table
    - Admin can read all profiles
    - Users can read and update their own profile
    - Admin can insert and update any profile
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'client', 'student')),
  company_name text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
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
