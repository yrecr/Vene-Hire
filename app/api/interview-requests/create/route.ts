import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { InterviewRequest } from '@/types';
import { requireSession, resolveActorIds } from '@/lib/api-auth';
import { dbError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
  try {
    const caller = await requireSession(req);
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const requests: InterviewRequest[] = Array.isArray(body) ? body : [body];

    if (!requests.length) {
      return NextResponse.json({ error: 'No interview requests provided' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { employerProfileId, talentProfileId } = await resolveActorIds(supabase, caller);
    const owns = requests.every((r) => r.employer_id === employerProfileId || r.applicant_id === talentProfileId);
    if (!owns) {
      return NextResponse.json({ error: 'Forbidden: not your interview request' }, { status: 403 });
    }

    const { error } = await supabase
      .from('interview_requests')
      .upsert(requests, { onConflict: 'id' });

    if (error) {
      return dbError('interview-requests/create', error);
    }

    return NextResponse.json({ ok: true, count: requests.length });
  } catch (err) {
    console.error('[interview-requests/create] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
