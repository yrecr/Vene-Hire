import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Service-role client: bypasses RLS for secure server-side operations
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const res = NextResponse.next();

  // 1. Verify the user session (same pattern as /api/auth/me)
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

  // 2. Look up the talent profile for this authenticated user
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('auth_user_id', session.user.id)
    .single();

  if (!profile || profile.role !== 'applicant') {
    return NextResponse.json({ error: 'Forbidden: applicants only' }, { status: 403 });
  }

  const { data: tp } = await supabase
    .from('talent_profiles')
    .select('id')
    .eq('user_id', profile.id)
    .single();

  if (!tp) {
    return NextResponse.json({ error: 'Talent profile not found' }, { status: 404 });
  }

  // 3. Parse the uploaded file from the multipart form
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'pdf';
  const path = `${tp.id}/resume.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 4. Upload via service-role client (bypasses RLS safely on the server)
  const { error: uploadError } = await adminSupabase.storage
    .from('resumes')
    .upload(path, buffer, {
      contentType: file.type || 'application/pdf',
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = adminSupabase.storage.from('resumes').getPublicUrl(path);

  // 5. Persist the URL on the talent profile
  await adminSupabase
    .from('talent_profiles')
    .update({ resume_url: urlData.publicUrl })
    .eq('id', tp.id);

  return NextResponse.json({ url: urlData.publicUrl });
}
