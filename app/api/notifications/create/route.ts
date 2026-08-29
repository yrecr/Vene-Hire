import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Notification } from '@/types';
import { requireSession } from '@/lib/api-auth';
import { dbError } from '@/lib/api-error';

/**
 * Server-side endpoint to insert notifications using the service role key,
 * bypassing RLS restrictions that prevent regular users (employers, applicants)
 * from inserting notifications for other users.
 *
 * POST /api/notifications/create
 * Body: Notification | Notification[]
 */
export async function POST(req: NextRequest) {
  try {
    // ponytail: notifications are inherently cross-user (employer notifies
    // applicant and vice versa), so there's no "ownership" to check here —
    // this only closes the door on unauthenticated callers.
    const caller = await requireSession(req);
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const notifications: Notification[] = Array.isArray(body) ? body : [body];

    if (!notifications.length) {
      return NextResponse.json({ error: 'No notifications provided' }, { status: 400 });
    }

    // Use service role key to bypass RLS for notification creation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { error } = await supabase
      .from('notifications')
      .upsert(notifications, { onConflict: 'id' });

    if (error) {
      return dbError('notifications/create', error);
    }

    return NextResponse.json({ ok: true, count: notifications.length });
  } catch (err) {
    console.error('[notifications/create] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
