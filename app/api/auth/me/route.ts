import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { mergeSupabaseCookies } from '@/lib/supabase-response';

export async function GET(req: NextRequest) {
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

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return mergeSupabaseCookies(res, NextResponse.json({ user: null }));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', authUser.id)
    .single();

  if (!profile) {
    return mergeSupabaseCookies(res, NextResponse.json({ user: null }));
  }

  const user: any = {
    id: authUser.id,
    email: authUser.email,
    full_name: profile.full_name,
    role: profile.role,
    profile_id: profile.id,
  };

  if (user.role === 'applicant') {
    const { data: tp } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', profile.id)
      .single();
    if (tp) user.talent_profile_id = tp.id;
  }

  if (user.role === 'employer') {
    const { data: ep } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', profile.id)
      .single();
    if (ep) user.employer_profile_id = ep.id;
  }

  return mergeSupabaseCookies(res, NextResponse.json({ user }));
}
