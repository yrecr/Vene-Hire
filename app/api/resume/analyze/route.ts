import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => req.cookies.get(key)?.value,
        set: (key, value, options) => { res.cookies.set(key, value, options); },
        remove: (key, options) => { res.cookies.set(key, '', options); },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('auth_user_id', session.user.id)
    .single();

  if (!profile || profile.role !== 'applicant') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: tp } = await supabase
    .from('talent_profiles')
    .select('id, resume_url')
    .eq('user_id', profile.id)
    .single();

  if (!tp) {
    return NextResponse.json({ error: 'Talent profile not found' }, { status: 404 });
  }

  if (!tp.resume_url) {
    return NextResponse.json({ error: 'Upload a resume first' }, { status: 400 });
  }

  const webhookUrl = process.env.N8N_RESUME_ANALYZE_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Analysis service not configured' }, { status: 500 });
  }

  const n8nResp = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      talent_profile_id: tp.id,
      resume_url: tp.resume_url,
    }),
  });

  if (!n8nResp.ok) {
    const errBody = await n8nResp.text();
    return NextResponse.json({ error: `Analysis trigger failed: ${errBody}` }, { status: 502 });
  }

  return NextResponse.json({ status: 'processing' }, { status: 202 });
}
