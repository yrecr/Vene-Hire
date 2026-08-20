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

    const { process_id, employer_id, applicant_id } = await req.json();
    if (!process_id || !employer_id || !applicant_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { employerProfileId } = await resolveActorIds(supabase, caller);
    if (employerProfileId !== employer_id) {
      return NextResponse.json({ error: 'Forbidden: not your process' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('contract_approval_requests')
      .insert({ process_id, employer_id, applicant_id, status: 'pending' })
      .select()
      .single();

    if (error) {
      return dbError('contract-approval:POST', error);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[contract-approval] POST unexpected:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const caller = await requireSession(req);
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: admins only' }, { status: 403 });
    }

    const { requestId, status } = await req.json();
    if (!requestId || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: request, error: fetchError } = await supabase
      .from('contract_approval_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('contract_approval_requests')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', requestId);

    if (updateError) {
      return dbError('contract-approval:PATCH', updateError);
    }

    if (status === 'approved') {
      const { error: processError } = await supabase
        .from('selection_processes')
        .update({ current_stage: 'contract_signing', contract_status: 'pending' })
        .eq('id', request.process_id);

      if (processError) {
        return dbError('contract-approval:process_update', processError);
      }
    }

    return NextResponse.json({ ok: true, status });
  } catch (err) {
    console.error('[contract-approval] PATCH unexpected:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
