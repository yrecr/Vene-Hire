import { ensureWorkflow } from './n8n';
let mockId = 567891011;
let webhookPromise: Promise<string> | null = null;
const webhookUrl = () => {
  if (!webhookPromise) webhookPromise = ensureWorkflow();
  return webhookPromise;
};

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
  /** Profile ID of the employer (used by n8n callback to create notifications) */
  employer_id?: string;
  /** Talent profile ID of the applicant (used by n8n callback to create notifications) */
  applicant_id?: string;
}): Promise<ZoomMeeting> {
  // n8n configured → try it first
  const url = await webhookUrl();
  if (url) {
    try {
      // Determine the app base URL so n8n can call back to our /api/n8n-webhook endpoint.
      // In the browser NEXT_PUBLIC_APP_URL may not be set; fall back to window.location.origin.
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
          employer_id: params.employer_id,
          applicant_id: params.applicant_id,
          // Included in body so n8n can read it reliably via $json.callback_url
          callback_url: appUrl,
        }),
      });
      if (res.ok) return res.json();
    } catch {
      // n8n unreachable → fall through to mock
    }
  }

  // ponytail: mock meeting — replace with real Zoom API call in production
  const id = mockId++;
  return {
    id,
    topic: params.topic,
    join_url: `https://zoom.us/j/${id}?pwd=mock${id}`,
    start_url: `https://zoom.us/s/${id}?zak=mock${id}`,
    start_time: params.start_time,
    duration: params.duration || 60,
    timezone: params.timezone || 'America/Bogota',
    password: `mock${id}`,
  };
}
