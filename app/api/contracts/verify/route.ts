import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireSession } from '@/lib/api-auth';

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

    const { error } = await supabase
      .from('selection_processes')
      .update({ contract_status: 'signed', status: 'hired' })
      .eq('id', process_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contracts/verify]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
