import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { dbError } from '@/lib/api-error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Anon key — access_requests' public INSERT policy already requires
// status='pending' and reviewed_by IS NULL (see
// 20260905000001_column_level_guards.sql). Routing through the server adds
// the rate limit and lets us set status/created_at ourselves instead of
// trusting whatever the client sends.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  if (!checkRateLimit(`access-request:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests sent. Please try again later.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const { request_type, full_name, company, email, country, hiring_need, candidate_slug, message } = body;

  const isApplicant = request_type === 'applicant';
  if (!full_name?.trim() || !email?.trim() || !country || !hiring_need?.trim() || (!isApplicant && !company?.trim())) {
    return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const { error } = await supabase.from('access_requests').insert({
    request_type: isApplicant ? 'applicant' : 'employer',
    full_name: full_name.trim(),
    company: isApplicant ? '' : company.trim(),
    email: email.trim(),
    country,
    hiring_need: hiring_need.trim(),
    candidate_slug: isApplicant ? null : (candidate_slug || null),
    message: message || '',
    status: 'pending',
    created_at: new Date().toISOString(),
  });
  if (error) return dbError('access-requests/create', error);

  return NextResponse.json({ success: true });
}
