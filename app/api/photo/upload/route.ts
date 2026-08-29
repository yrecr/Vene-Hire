import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { dbError } from '@/lib/api-error';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${tp.id}/photo.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await adminSupabase.storage
    .from('profile-photos')
    .upload(path, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    return dbError('photo/upload', uploadError);
  }

  const { data: urlData } = adminSupabase.storage.from('profile-photos').getPublicUrl(path);

  await adminSupabase
    .from('talent_profiles')
    .update({ profile_image_url: urlData.publicUrl })
    .eq('id', tp.id);

  return NextResponse.json({ url: urlData.publicUrl });
}
