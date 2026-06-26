-- Fix: allow students (applicants) to upsert their own talent_profile row.
-- The previous migrations only granted UPDATE, but PostgREST's .upsert() always
-- attempts an INSERT first (even when the row already exists), so without an
-- INSERT policy for students the operation was rejected with
-- "new row violates row-level security policy for table talent_profiles".

-- Grant students INSERT on their own talent_profile row.
-- (The admin-only INSERT policy from fix_rls_recursion.sql remains for admins.)
DROP POLICY IF EXISTS "Students can insert own talent profile" ON talent_profiles;
CREATE POLICY "Students can insert own talent profile"
  ON talent_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );
