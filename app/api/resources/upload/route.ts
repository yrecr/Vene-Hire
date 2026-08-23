import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireSession } from '@/lib/api-auth';
import { dbError } from '@/lib/api-error';
import type { Resource } from '@/types';

// Service-role client: bypasses RLS for secure server-side operations
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const caller = await requireSession(req);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (caller.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: admins only' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const title = (formData.get('title') as string | null)?.trim();
  const description = (formData.get('description') as string | null) ?? '';
  const visibility = (formData.get('visibility') as string | null) ?? 'all';
  const bootcampId = (formData.get('bootcamp_id') as string | null) || null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  if (!['all', 'admin', 'employer', 'applicant'].includes(visibility)) {
    return NextResponse.json({ error: 'Invalid visibility' }, { status: 400 });
  }

  const resourceId = crypto.randomUUID();
  const path = `${resourceId}/${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await adminSupabase.storage
    .from('resources')
    .upload(path, buffer, {
      contentType: file.type || 'application/pdf',
      upsert: true,
    });

  if (uploadError) {
    return dbError('resources/upload', uploadError);
  }

  const { data: urlData } = adminSupabase.storage.from('resources').getPublicUrl(path);

  const row: Resource = {
    id: resourceId,
    title,
    description,
    file_path: urlData.publicUrl,
    visibility: visibility as Resource['visibility'],
    bootcamp_id: bootcampId,
    created_at: new Date().toISOString(),
  };

  const { error: insertError } = await adminSupabase.from('resources').insert(row);
  if (insertError) {
    return dbError('resources/upload', insertError);
  }

  return NextResponse.json(row);
}
