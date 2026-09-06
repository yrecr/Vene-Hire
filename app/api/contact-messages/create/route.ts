import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { dbError } from '@/lib/api-error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Anon key, not service role — this table's RLS already allows a public
// insert (see 20260904000002_create_contact_messages.sql); routing it
// through the server just adds a rate-limit check the client couldn't do.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  if (!checkRateLimit(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many messages sent. Please try again later.' }, { status: 429 });
  }

  const { name, email, subject, message } = await req.json().catch(() => ({}));
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const { error } = await supabase.from('contact_messages').insert({
    name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim(),
  });
  if (error) return dbError('contact-messages/create', error);

  return NextResponse.json({ success: true });
}
