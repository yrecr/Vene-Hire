import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireSession } from '@/lib/api-auth';
import { dbError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const caller = await requireSession(req);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: admins only' }, { status: 403 });
  }

  const body = await req.json();
  const { email, full_name, company, request_type, hiring_need, access_request_id, password } = body;

  if (!email || !full_name) {
    return NextResponse.json({ error: 'email and full_name are required' }, { status: 400 });
  }

  // No password given => send a real invitation and let the user choose their own.
  // An explicit password stays supported so an admin can still hand-create an account.
  const shouldInvite = !password;
  const userMetadata = { full_name, role: request_type === 'employer' ? 'employer' : 'applicant' };

  let authUserId: string;
  let profileId: string;

  const { data: authData, error: authError } = shouldInvite
    ? await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: userMetadata,
        redirectTo: new URL('/welcome', req.nextUrl.origin).toString(),
      })
    : await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: userMetadata,
      });
  if (authData?.user?.id) {
    authUserId = authData.user.id;
    profileId = crypto.randomUUID();
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: profileId,
      auth_user_id: authUserId,
      full_name,
      email,
      role: request_type === 'employer' ? 'employer' : 'applicant',
      company_name: company || null,
      status: 'active',
      created_at: new Date().toISOString(),
    });
    if (profileError) {
      return dbError('approve-request:profile', profileError);
    }
  } else {
    // Either the user already exists, or the invite/create genuinely failed.
    // Only the first case is recoverable — otherwise surface the error instead of
    // silently "approving" someone who can never sign in.
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id, auth_user_id')
      .eq('email', email)
      .single();
    if (!existing) {
      return authError
        ? dbError(shouldInvite ? 'approve-request:invite' : 'approve-request:create-user', authError)
        : NextResponse.json({ error: 'User exists but no profile found' }, { status: 500 });
    }
    authUserId = existing.auth_user_id;
    profileId = existing.id;
  }

  if (request_type === 'applicant') {
    const { data: tpExists } = await supabaseAdmin
      .from('talent_profiles')
      .select('id, slug')
      .eq('user_id', profileId)
      .maybeSingle();
      if (!tpExists) {
      const tpId = crypto.randomUUID();
      const { error: tpError } = await supabaseAdmin.from('talent_profiles').insert({
        id: tpId,
        user_id: profileId,
        slug: email.split('@')[0],
        display_name: full_name,
        title: '',
        summary: '',
        bio: '',
        tech_stack: [],
        english_level: 'Basic',
        availability_status: 'In Training',
        years_experience: 0,
        featured: false,
        public_visible: false,
        video_url: null,
        profile_image_url: null,
        resume_url: null,
        timezone: 'America/Bogota',
        profile_completion: 0,
        created_at: new Date().toISOString(),
      });
      if (tpError) {
        return dbError('approve-request:talent_profile', tpError);
      }
    } else {
      const { error: tpUpdateError } = await supabaseAdmin
        .from('talent_profiles')
        .update({ public_visible: true })
        .eq('user_id', profileId);
      if (tpUpdateError) {
        return dbError('approve-request:talent_profile_update', tpUpdateError);
      }
    }
  }

  if (request_type === 'employer') {
    const { error: empError } = await supabaseAdmin.from('employer_profiles').insert({
      id: crypto.randomUUID(),
      user_id: profileId,
      company_name: company || full_name,
      contact_name: full_name,
      summary: `Approved demo request for ${company || full_name}.`,
      hiring_needs: hiring_need || 'Not specified',
      status: 'active',
      created_at: new Date().toISOString(),
    });
    if (empError) {
      return dbError('approve-request:employer_profile', empError);
    }
  }

  if (access_request_id) {
    await supabaseAdmin.from('access_requests').update({ status: 'approved' }).eq('id', access_request_id);
  }

  return NextResponse.json({ success: true, email, invited: shouldInvite });
}
