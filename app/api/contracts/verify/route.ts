import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireSession } from '@/lib/api-auth';
import { dbError } from '@/lib/api-error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const caller = await requireSession(req);
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: admins only' }, { status: 403 });
    }

    const { process_id } = await req.json();
    if (!process_id) {
      return NextResponse.json({ error: 'Missing process_id' }, { status: 400 });
    }

    const { data: process, error: fetchError } = await supabase
      .from('selection_processes')
      .select('applicant_id')
      .eq('id', process_id)
      .single();
    if (fetchError || !process) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('selection_processes')
      .update({ contract_status: 'signed', status: 'hired' })
      .eq('id', process_id);

    if (error) {
      // Unique violation: this applicant already has another 'hired' process
      // (one_hired_process_per_applicant) — surface a real reason instead of
      // the generic dbError message.
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This candidate already has an active hire elsewhere. Resolve that process first.' },
          { status: 409 }
        );
      }
      return dbError('contracts/verify', error);
    }

    // Take the candidate off the market — Browse Applicants and the public
    // profile both hide/disable requests once availability_status is 'Hired'.
    // No code path resets this yet; that lands with Fase 14's contract end date.
    await supabase
      .from('talent_profiles')
      .update({ availability_status: 'Hired' })
      .eq('id', process.applicant_id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contracts/verify]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
