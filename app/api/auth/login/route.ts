import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rolePath: Record<string, string> = {
  admin: '/admin',
  applicant: '/applicant',
  employer: '/employer',
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0];

function b64url(s: string): string {
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!authRes.ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const session = await authRes.json();
  const role = (session.user?.user_metadata?.role as string) || '';
  const redirect = rolePath[role] || '/';

  const cookie = `sb-${PROJECT_REF}-auth-token=base64-${b64url(JSON.stringify(session))}; Path=/; SameSite=Lax; Max-Age=${400 * 24 * 60 * 60}`;

  return new Response(JSON.stringify({ redirect, role, email: session.user.email }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie },
  });
}
