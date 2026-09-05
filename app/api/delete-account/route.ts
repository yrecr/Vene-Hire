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

  const body = await req.json().catch(() => ({}));
  const targetId: string = body.profile_id || caller.id;
  const isSelf = targetId === caller.id;
  if (!isSelf && caller.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: admins only' }, { status: 403 });
  }

  const { data: target, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('id, auth_user_id, role')
    .eq('id', targetId)
    .single();
  if (fetchError || !target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (target.role === 'admin') {
    // Never let the last admin delete themselves (or be deleted) — that would
    // lock everyone out of the admin panel with no way back in from the UI.
    const { count } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');
    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last remaining admin account' }, { status: 400 });
    }
  }

  // Deleting the Auth user (rather than just the `profiles` row) cascades
  // through profiles -> talent_profiles/employer_profiles -> everything
  // downstream, per the ON DELETE CASCADE chain in
  // 20260820000002_fk_on_delete_and_indexes.sql. The old deleteProfile()
  // only removed the `profiles` row, leaving an orphaned Auth user that
  // could still sign in with its old password and blocked re-approving the
  // same email later ("User exists but no profile found").
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(target.auth_user_id);
  if (deleteError) {
    return dbError('delete-account', deleteError);
  }

  return NextResponse.json({ success: true });
}
