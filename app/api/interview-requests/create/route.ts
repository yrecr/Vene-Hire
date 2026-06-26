import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { InterviewRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
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

    const { error } = await supabase
      .from('interview_requests')
      .upsert(requests, { onConflict: 'id' });

    if (error) {
      console.error('[interview-requests/create] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: requests.length });
  } catch (err) {
    console.error('[interview-requests/create] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
