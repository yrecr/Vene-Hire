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
}): Promise<ZoomMeeting> {
  const res = await fetch('/api/zoom/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function triggerN8nWebhook(payload: {
  interview_id: string;
  topic: string;
  start_time: string;
  applicant_name: string;
  employer_name: string;
  employer_email: string;
  applicant_email: string;
}) {
  if (!N8N_WEBHOOK_URL) return;
  // ponytail: fire-and-forget, n8n handles retry
  fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
