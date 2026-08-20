import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';
import type { Candidate } from '@/types';
import { dbError } from '@/lib/api-error';

function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Receiver for the n8n/DeepSeek CV-analysis workflow: n8n scores a resume
// against a vacancy and POSTs the result here to be written into
// `candidates`. n8n has no user session, so this is gated by a shared
// secret instead of requireSession().
export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-webhook-secret');
    const expected = process.env.N8N_CANDIDATES_WEBHOOK_SECRET;
    if (!secret || !expected || !secretMatches(secret, expected)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const candidates: Candidate[] = Array.isArray(body) ? body : [body];

    if (!candidates.length || candidates.some((c) => !c.vacancy_id)) {
      return NextResponse.json({ error: 'Each candidate needs a vacancy_id' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { error } = await supabase
      .from('candidates')
      .upsert(candidates, { onConflict: 'id' });

    if (error) {
      return dbError('candidates/webhook', error);
    }

    return NextResponse.json({ ok: true, count: candidates.length });
  } catch (err) {
    console.error('[candidates/webhook] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
