import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireSession, resolveActorIds } from '@/lib/api-auth';
import { dbError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
  try {
    const caller = await requireSession(req);
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'employer') {
      return NextResponse.json({ error: 'Forbidden: employers only' }, { status: 403 });
    }

    const { talent_profile_id } = await req.json();
    if (!talent_profile_id) {
      return NextResponse.json({ error: 'Missing talent_profile_id' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { employerProfileId } = await resolveActorIds(supabase, caller);
    if (!employerProfileId) {
      return NextResponse.json({ error: 'Forbidden: no employer profile' }, { status: 403 });
    }

    const { data: existing, error: findErr } = await supabase
      .from('shortlists')
      .select('id')
      .eq('employer_id', employerProfileId)
      .eq('talent_profile_id', talent_profile_id)
      .maybeSingle();
    if (findErr) return dbError('shortlist/toggle:find', findErr);

    if (existing) {
      const { error } = await supabase.from('shortlists').delete().eq('id', existing.id);
      if (error) return dbError('shortlist/toggle:delete', error);
      return NextResponse.json({ shortlisted: false });
    }

    const { error } = await supabase.from('shortlists').insert({
      id: crypto.randomUUID(), employer_id: employerProfileId, talent_profile_id,
    });
    if (error) return dbError('shortlist/toggle:insert', error);
    return NextResponse.json({ shortlisted: true });
  } catch (err) {
    console.error('[shortlist/toggle] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
