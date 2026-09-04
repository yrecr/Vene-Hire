import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Vacancy } from '@/types';
import { requireSession, resolveActorIds } from '@/lib/api-auth';
import { dbError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
  try {
    const caller = await requireSession(req);
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'employer') {
      return NextResponse.json({ error: 'Forbidden: employers only' }, { status: 403 });
    }

    const body = await req.json();
    const vacancies: Vacancy[] = Array.isArray(body) ? body : [body];

    if (!vacancies.length) {
      return NextResponse.json({ error: 'No vacancies provided' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { employerProfileId } = await resolveActorIds(supabase, caller);
    // Both sides must be present: `undefined === undefined` would let a caller
    // with no employer profile overwrite any vacancy by id.
    const owns = !!employerProfileId && vacancies.every((v) => v.employer_id === employerProfileId);
    if (!owns) {
      return NextResponse.json({ error: 'Forbidden: not your vacancy' }, { status: 403 });
    }

    const { error } = await supabase
      .from('vacancies')
      .upsert(vacancies, { onConflict: 'id' });

    if (error) {
      return dbError('vacancies/create', error);
    }

    return NextResponse.json({ ok: true, count: vacancies.length });
  } catch (err) {
    console.error('[vacancies/create] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
