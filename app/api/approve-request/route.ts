import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireSession } from '@/lib/api-auth';

const DEFAULT_PASSWORD = 'Demo123!';

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

  const userPassword = password || DEFAULT_PASSWORD;

  let authUserId: string;
  let profileId: string;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: userPassword,
    email_confirm: true,
    user_metadata: { full_name, role: request_type === 'employer' ? 'employer' : 'applicant' },
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
      return NextResponse.json({ error: `profile: ${profileError.message}` }, { status: 500 });
    }
  } else {
    // User already exists — look up existing profile
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id, auth_user_id')
      .eq('email', email)
      .single();
    if (!existing) {
      return NextResponse.json({ error: 'User exists but no profile found' }, { status: 500 });
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
        title: full_name.split(' ')[0] + ' — Aspiring Software Engineer',
        summary: `${full_name} is a motivated software engineer ready to contribute to production teams.`,
        bio: `${full_name} is an aspiring engineer looking to join a production team.`,
        tech_stack: ['Python', 'JavaScript', 'SQL'],
        english_level: 'Intermediate',
        availability_status: 'Available',
        years_experience: 1,
        featured: false,
        public_visible: true,
        video_url: null,
        profile_image_url: null,
        resume_url: null,
        timezone: 'America/Bogota',
        profile_completion: 0,
        created_at: new Date().toISOString(),
      });
      if (tpError) {
        return NextResponse.json({ error: `talent_profile: ${tpError.message}` }, { status: 500 });
      }
      // Insert default skills
      const defaultSkills = ['Python', 'JavaScript', 'SQL', 'Git', 'Communication'];
      const { error: skError } = await supabaseAdmin.from('talent_skills').insert(
        defaultSkills.map((name) => ({
          id: crypto.randomUUID(),
          talent_profile_id: tpId,
          skill_name: name,
          score: 50,
          category: 'technical',
        }))
      );
      if (skError) {
        return NextResponse.json({ error: `talent_skills: ${skError.message}` }, { status: 500 });
      }
    } else {
      const { error: tpUpdateError } = await supabaseAdmin
        .from('talent_profiles')
        .update({ public_visible: true })
        .eq('user_id', profileId);
      if (tpUpdateError) {
        return NextResponse.json({ error: `talent_profile_update: ${tpUpdateError.message}` }, { status: 500 });
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
      return NextResponse.json({ error: `employer_profile: ${empError.message}` }, { status: 500 });
    }
  }

  if (access_request_id) {
    await supabaseAdmin.from('access_requests').update({ status: 'approved' }).eq('id', access_request_id);
  }

  return NextResponse.json({ success: true, email, password: userPassword });
}
