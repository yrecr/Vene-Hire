import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireSession } from '@/lib/api-auth';
import { dbError } from '@/lib/api-error';

const VALID_STATUSES = ['Received', 'Interview', 'Offer'];

export async function PATCH(req: NextRequest) {
  try {
    const caller = await requireSession(req);
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'employer') {
      return NextResponse.json({ error: 'Forbidden: employers only' }, { status: 403 });
    }

    const { candidate_id, manual_status } = await req.json();
    if (!candidate_id || !VALID_STATUSES.includes(manual_status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Ownership: the candidate's vacancy must belong to this employer
    const { data: ownerCheck, error: ownerErr } = await supabase
      .from('candidates')
      .select('vacancies!inner(employer_profiles!inner(user_id))')
      .eq('id', candidate_id)
      .single();
    if (ownerErr) console.error('[candidates/status] ownership lookup:', ownerErr.message);
    const vacancy = (ownerCheck as any)?.vacancies;
    if (!vacancy || vacancy.employer_profiles?.user_id !== caller.id) {
      return NextResponse.json({ error: 'Forbidden: not your candidate' }, { status: 403 });
    }

    const { error } = await supabase
      .from('candidates')
      .update({ manual_status })
      .eq('id', candidate_id);

    if (error) {
      return dbError('candidates/status', error);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[candidates/status] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
