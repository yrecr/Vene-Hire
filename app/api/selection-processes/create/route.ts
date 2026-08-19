import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SelectionProcess } from '@/types';
import { requireSession, resolveActorIds } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  try {
    const caller = await requireSession(req);
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const processes: SelectionProcess[] = Array.isArray(body) ? body : [body];

    if (!processes.length) {
      return NextResponse.json({ error: 'No selection processes provided' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { employerProfileId, talentProfileId } = await resolveActorIds(supabase, caller);
    const owns = processes.every((p) => p.employer_id === employerProfileId || p.applicant_id === talentProfileId);
    if (!owns) {
      return NextResponse.json({ error: 'Forbidden: not your selection process' }, { status: 403 });
    }

    const { error } = await supabase
      .from('selection_processes')
      .upsert(processes, { onConflict: 'id' });

    if (error) {
      console.error('[selection-processes/create] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: processes.length });
  } catch (err) {
    console.error('[selection-processes/create] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
