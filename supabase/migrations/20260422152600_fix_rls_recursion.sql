-- Fix infinite recursion in RLS policies by using a SECURITY DEFINER helper

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid();
$$;

-- ─── Profiles ───────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT TO authenticated USING (public.user_role() = 'admin');

CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT TO authenticated WITH CHECK (public.user_role() = 'admin');

CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE TO authenticated USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');

-- ─── Talent Profiles ────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all talent profiles" ON talent_profiles;
DROP POLICY IF EXISTS "Admins can insert talent profiles" ON talent_profiles;
DROP POLICY IF EXISTS "Admins can update talent profiles" ON talent_profiles;

CREATE POLICY "Admins can read all talent profiles" ON talent_profiles
  FOR SELECT TO authenticated USING (public.user_role() = 'admin');

CREATE POLICY "Admins can insert talent profiles" ON talent_profiles
  FOR INSERT TO authenticated WITH CHECK (public.user_role() = 'admin');

CREATE POLICY "Admins can update talent profiles" ON talent_profiles
  FOR UPDATE TO authenticated USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');

-- ─── Talent Skills ──────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all skills" ON talent_skills;
DROP POLICY IF EXISTS "Admins can insert skills" ON talent_skills;
DROP POLICY IF EXISTS "Admins can update skills" ON talent_skills;
DROP POLICY IF EXISTS "Admins can delete skills" ON talent_skills;

CREATE POLICY "Admins can read all skills" ON talent_skills
  FOR SELECT TO authenticated USING (public.user_role() = 'admin');

CREATE POLICY "Admins can insert skills" ON talent_skills
  FOR INSERT TO authenticated WITH CHECK (public.user_role() = 'admin');

CREATE POLICY "Admins can update skills" ON talent_skills
  FOR UPDATE TO authenticated USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');

CREATE POLICY "Admins can delete skills" ON talent_skills
  FOR DELETE TO authenticated USING (public.user_role() = 'admin');

-- ─── Employer Profiles ──────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all employer profiles" ON employer_profiles;
DROP POLICY IF EXISTS "Admins can insert employer profiles" ON employer_profiles;
DROP POLICY IF EXISTS "Admins can update employer profiles" ON employer_profiles;

CREATE POLICY "Admins can read all employer profiles" ON employer_profiles
  FOR SELECT TO authenticated USING (public.user_role() = 'admin');

CREATE POLICY "Admins can insert employer profiles" ON employer_profiles
  FOR INSERT TO authenticated WITH CHECK (public.user_role() = 'admin');

CREATE POLICY "Admins can update employer profiles" ON employer_profiles
  FOR UPDATE TO authenticated USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');

-- ─── Access Requests ────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all access requests" ON access_requests;
DROP POLICY IF EXISTS "Admins can update access requests" ON access_requests;

CREATE POLICY "Admins can read all access requests" ON access_requests
  FOR SELECT TO authenticated USING (public.user_role() = 'admin');

CREATE POLICY "Admins can update access requests" ON access_requests
  FOR UPDATE TO authenticated USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');

-- ─── Availability Slots ─────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage all availability slots" ON availability_slots;

CREATE POLICY "Admins can manage all availability slots" ON availability_slots
  FOR SELECT TO authenticated USING (public.user_role() = 'admin');

-- ─── Selection Processes ────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all processes" ON selection_processes;
DROP POLICY IF EXISTS "Admins can insert processes" ON selection_processes;
DROP POLICY IF EXISTS "Admins can update processes" ON selection_processes;

CREATE POLICY "Admins can read all processes" ON selection_processes
  FOR SELECT TO authenticated USING (public.user_role() = 'admin');

CREATE POLICY "Admins can insert processes" ON selection_processes
  FOR INSERT TO authenticated WITH CHECK (public.user_role() = 'admin');

CREATE POLICY "Admins can update processes" ON selection_processes
  FOR UPDATE TO authenticated USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');

-- ─── Interview Requests ─────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all interview requests" ON interview_requests;
DROP POLICY IF EXISTS "Admins can update interview requests" ON interview_requests;

CREATE POLICY "Admins can read all interview requests" ON interview_requests
  FOR SELECT TO authenticated USING (public.user_role() = 'admin');

CREATE POLICY "Admins can update interview requests" ON interview_requests
  FOR UPDATE TO authenticated USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');

-- ─── Notifications ─────────────────────────────────────
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can read all notifications" ON notifications;

CREATE POLICY "Admins can insert notifications" ON notifications
  FOR INSERT TO authenticated WITH CHECK (public.user_role() = 'admin');

CREATE POLICY "Admins can read all notifications" ON notifications
  FOR SELECT TO authenticated USING (public.user_role() = 'admin');

-- ─── Bootcamps ─────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all bootcamps" ON bootcamps;
DROP POLICY IF EXISTS "Admins can insert bootcamps" ON bootcamps;
DROP POLICY IF EXISTS "Admins can update bootcamps" ON bootcamps;

CREATE POLICY "Admins can read all bootcamps" ON bootcamps
  FOR SELECT TO authenticated USING (public.user_role() = 'admin');

CREATE POLICY "Admins can insert bootcamps" ON bootcamps
  FOR INSERT TO authenticated WITH CHECK (public.user_role() = 'admin');

CREATE POLICY "Admins can update bootcamps" ON bootcamps
  FOR UPDATE TO authenticated USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');

-- ─── Enrollments ────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins can insert enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins can update enrollments" ON enrollments;

CREATE POLICY "Admins can read all enrollments" ON enrollments
  FOR SELECT TO authenticated USING (public.user_role() = 'admin');

CREATE POLICY "Admins can insert enrollments" ON enrollments
  FOR INSERT TO authenticated WITH CHECK (public.user_role() = 'admin');

CREATE POLICY "Admins can update enrollments" ON enrollments
  FOR UPDATE TO authenticated USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');

-- ─── Resources ─────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all resources" ON resources;
DROP POLICY IF EXISTS "Admins can insert resources" ON resources;
DROP POLICY IF EXISTS "Admins can update resources" ON resources;

CREATE POLICY "Admins can read all resources" ON resources
  FOR SELECT TO authenticated USING (public.user_role() = 'admin');

CREATE POLICY "Admins can insert resources" ON resources
  FOR INSERT TO authenticated WITH CHECK (public.user_role() = 'admin');

CREATE POLICY "Admins can update resources" ON resources
  FOR UPDATE TO authenticated USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');
