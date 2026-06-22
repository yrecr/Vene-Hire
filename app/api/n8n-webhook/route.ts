import { NextResponse } from 'next/server';

interface N8nPayload {
  interview_id: string;
  zoom_meeting_id: string;
  join_url: string;
  start_url: string;
  topic: string;
  start_time: string;
  duration: number;
  password?: string;
}

// ponytail: in-memory store, replace with DB in production
const meetings = new Map<string, N8nPayload>();

export async function POST(req: Request) {
  const body: N8nPayload = await req.json();
  meetings.set(body.interview_id, body);
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const interviewId = searchParams.get('interview_id');
  if (!interviewId) return NextResponse.json({ meetings: Array.from(meetings.values()) });
  return NextResponse.json(meetings.get(interviewId) ?? null);
}
