import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { TimesheetDay } from '@/types';
import { requireSession, resolveActorIds } from '@/lib/api-auth';
import { dbError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  const caller = await requireSession(req);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { process_id, month, days } = await req.json() as { process_id: string; month: string; days: TimesheetDay[] };
  if (!process_id || !month || !Array.isArray(days)) {
    return NextResponse.json({ error: 'process_id, month and days are required' }, { status: 400 });
  }

  const { talentProfileId } = await resolveActorIds(supabase, caller);
  const { data: process } = await supabase
    .from('selection_processes').select('id, applicant_id').eq('id', process_id).single();
  if (!process || process.applicant_id !== talentProfileId) {
    return NextResponse.json({ error: 'Forbidden: not your process' }, { status: 403 });
  }

  const total_hours = days.reduce((sum, d) => sum + (Number(d.hours) || 0), 0);

  const { data: timesheet, error } = await supabase
    .from('timesheets')
    .upsert(
      { process_id, month, days, total_hours, status: 'submitted', updated_at: new Date().toISOString() },
      { onConflict: 'process_id,month' }
    )
    .select()
    .single();

  if (error || !timesheet) {
    return dbError('timesheets/submit', error ?? { message: 'Upsert returned no row' });
  }

  const { error: eventError } = await supabase.from('timesheet_events').insert({
    timesheet_id: timesheet.id,
    event_type: 'submitted',
    actor_profile_id: caller.id,
  });
  if (eventError) {
    return dbError('timesheets/submit:event', eventError);
  }

  return NextResponse.json({ timesheet });
}
