import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Temporary migration endpoint - remove after running once
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const statements = [
    `CREATE POLICY "Employers can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (public.user_role() = 'employer')`,
    `CREATE POLICY "Applicants can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (public.user_role() = 'applicant')`,
    `CREATE POLICY "Employers can update own interview requests" ON interview_requests FOR UPDATE TO authenticated USING (employer_id IN (SELECT ep.id FROM employer_profiles ep JOIN profiles p ON p.id = ep.user_id WHERE p.auth_user_id = auth.uid())) WITH CHECK (employer_id IN (SELECT ep.id FROM employer_profiles ep JOIN profiles p ON p.id = ep.user_id WHERE p.auth_user_id = auth.uid()))`,
    `CREATE POLICY "Employers can insert selection processes" ON selection_processes FOR INSERT TO authenticated WITH CHECK (employer_id IN (SELECT ep.id FROM employer_profiles ep JOIN profiles p ON p.id = ep.user_id WHERE p.auth_user_id = auth.uid()))`,
    `CREATE POLICY "Employers can update own selection processes" ON selection_processes FOR UPDATE TO authenticated USING (employer_id IN (SELECT ep.id FROM employer_profiles ep JOIN profiles p ON p.id = ep.user_id WHERE p.auth_user_id = auth.uid())) WITH CHECK (employer_id IN (SELECT ep.id FROM employer_profiles ep JOIN profiles p ON p.id = ep.user_id WHERE p.auth_user_id = auth.uid()))`,
    `CREATE POLICY "Employers can read own selection processes" ON selection_processes FOR SELECT TO authenticated USING (employer_id IN (SELECT ep.id FROM employer_profiles ep JOIN profiles p ON p.id = ep.user_id WHERE p.auth_user_id = auth.uid()))`,
    `CREATE POLICY "Applicants can read own selection processes" ON selection_processes FOR SELECT TO authenticated USING (applicant_id IN (SELECT tp.id FROM talent_profiles tp JOIN profiles p ON p.id = tp.user_id WHERE p.auth_user_id = auth.uid()))`,
  ];

  const results: { sql: string; ok: boolean; error?: string }[] = [];

  for (const sql of statements) {
    // The service role client can run DDL via rpc if there's a helper function.
    // Since there's none, we use the raw PostgREST SQL endpoint.
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        'Content-Profile': 'public',
        'Content-Type': 'application/json',
        'Prefer': 'params=single-object',
      },
    });
    results.push({ sql: sql.slice(0, 60), ok: false, error: 'PostgREST does not execute DDL directly' });
  }

  return NextResponse.json({ message: 'Use Supabase Dashboard SQL Editor to run the migration', results });
}
