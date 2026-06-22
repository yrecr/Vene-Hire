const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';

export interface ZoomMeeting {
  id: number;
  topic: string;
  join_url: string;
  start_url: string;
  start_time: string;
  duration: number;
  timezone: string;
  password: string;
}

export async function createZoomMeeting(params: {
  topic: string;
  start_time: string;
  duration?: number;
  timezone?: string;
  interview_id?: string;
  applicant_name?: string;
  employer_name?: string;
  employer_email?: string;
  applicant_email?: string;
}): Promise<ZoomMeeting> {
  // n8n configured → POST to n8n, it calls Zoom and returns the meeting
  if (N8N_WEBHOOK_URL) {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interview_id: params.interview_id,
        topic: params.topic,
        start_time: params.start_time,
        duration: params.duration || 60,
        timezone: params.timezone || 'America/Bogota',
        applicant_name: params.applicant_name,
        employer_name: params.employer_name,
        employer_email: params.employer_email,
        applicant_email: params.applicant_email,
      }),
    });
    if (!res.ok) throw new Error('n8n webhook failed');
    return res.json();
  }

  // fallback: local mock Zoom API
  const res = await fetch('/api/zoom/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}
