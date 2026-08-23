import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireSession } from '@/lib/api-auth';
import { dbError } from '@/lib/api-error';

// Service-role client: bypasses RLS for secure server-side operations
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: NextRequest) {
  const caller = await requireSession(req);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (caller.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: admins only' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { id, title, description, visibility } = body ?? {};
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  if (visibility && !['all', 'admin', 'employer', 'applicant'].includes(visibility)) {
    return NextResponse.json({ error: 'Invalid visibility' }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (visibility !== undefined) updates.visibility = visibility;

  const { error } = await adminSupabase.from('resources').update(updates).eq('id', id);
  if (error) {
    return dbError('resources/update', error);
  }

  return NextResponse.json({ ok: true });
}
