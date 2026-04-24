/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `message` (text)
      - `type` (text) - info, interview, process, contract, request
      - `read` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can only read their own notifications
    - Users can update (mark as read) their own notifications
    - Admins can insert notifications for any user
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'interview', 'process', 'contract', 'request')),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
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

CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can read all notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );
