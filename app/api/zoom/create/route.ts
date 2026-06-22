import { NextResponse } from 'next/server';

let nextMeetingId = 123456789;

export async function POST(req: Request) {
  const body = await req.json();
  const { topic, start_time, duration = 60, timezone = 'America/Bogota' } = body;

  const meetingId = nextMeetingId++;
  const join_url = `https://zoom.us/j/${meetingId}?pwd=demo${meetingId}`;
  const start_url = `https://zoom.us/s/${meetingId}?zak=demo${meetingId}`;

  // ponytail: mock Zoom API — replace with real Zoom Server-to-Server OAuth + API call
  return NextResponse.json({
    id: meetingId,
    topic: topic || 'Interview',
    join_url,
    start_url,
    start_time: start_time || new Date().toISOString(),
    duration,
    timezone,
    password: `demo${meetingId}`,
    created_at: new Date().toISOString(),
  });
}
