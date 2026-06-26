import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


interface N8nPayload {
  interview_id: string;
  zoom_meeting_id: string | number;
  join_url: string;
  start_url: string;
  topic: string;
  start_time: string;
  duration: number;
  password?: string;
  employer_id?: string;
  applicant_id?: string;
}

// In-memory store for quick lookup (server restarts clear this, Supabase is the durable store)
const meetings = new Map<string, N8nPayload>();

async function pushNotifications(payload: N8nPayload) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return;

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const notifications = [];

  if (payload.employer_id) {
    // Resolve employer_id → user_id via profile id
    const { data: empProfile } = await supabase
      .from('profiles')
      .select('id, auth_user_id')
      .eq('id', payload.employer_id)
      .maybeSingle();

    const empUserId = empProfile?.id;
    if (empUserId) {
      notifications.push({
        id: crypto.randomUUID(),
        user_id: empUserId,
        title: 'Intro Interview Meeting Created',
        message: `The Zoom meeting for "${payload.topic}" has been scheduled. Click the link to join.`,
        type: 'interview',
        read: false,
        created_at: new Date().toISOString(),
        metadata: { join_url: payload.join_url },
      });
    }
  }

  if (payload.applicant_id) {
    // applicant_id here is a talent_profile id — find the associated profile user_id
    const { data: talentProfile } = await supabase
      .from('talent_profiles')
      .select('user_id')
      .eq('id', payload.applicant_id)
      .maybeSingle();

    // user_id on talent_profiles links to profiles.auth_user_id — get the profile id
    let applicantUserId: string | null = null;
    if (talentProfile?.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', talentProfile.user_id)
        .maybeSingle();
      applicantUserId = profile?.id ?? null;
    }

    if (applicantUserId) {
      notifications.push({
        id: crypto.randomUUID(),
        user_id: applicantUserId,
        title: 'Intro Interview Meeting Ready',
        message: `Your intro interview meeting for "${payload.topic}" is ready. Join using the link below.`,
        type: 'interview',
        read: false,
        created_at: new Date().toISOString(),
        metadata: { join_url: payload.join_url },
      });
    }
  }

  if (notifications.length > 0) {
    const { error } = await supabase
      .from('notifications')
      .upsert(notifications, { onConflict: 'id' });
    if (error) {
      console.error('[n8n-webhook] Failed to insert notifications:', error);
    }
  }
}

export async function POST(req: Request) {
  try {
    const body: N8nPayload = await req.json();
    if (!body.interview_id) {
      return NextResponse.json({ error: 'Missing interview_id' }, { status: 400 });
    }

    meetings.set(body.interview_id, body);

    // Fire-and-forget: push notifications to Supabase
    pushNotifications(body).catch((err) =>
      console.error('[n8n-webhook] pushNotifications error:', err)
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[n8n-webhook] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const interviewId = searchParams.get('interview_id');
  if (!interviewId) return NextResponse.json({ meetings: Array.from(meetings.values()) });
  return NextResponse.json(meetings.get(interviewId) ?? null);
}
