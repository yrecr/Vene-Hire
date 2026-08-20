import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const roleRoutes: Record<string, string[]> = {
  admin: ['/admin'],
  applicant: ['/applicant'],
  employer: ['/employer'],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => req.cookies.get(key)?.value,
        set: (key, value, options) => { res.cookies.set(key, value, options); },
        remove: (key, options) => { res.cookies.set(key, '', options); },
      },
    }
  );
  const { data: { session } } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;
  const isProtected = Object.values(roleRoutes).flat().some((p) => path.startsWith(p));
  if (!isProtected) return res;
  if (!session) return NextResponse.redirect(new URL('/login', req.url));

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', session.user.id)
    .single();

  const role = profile?.role as string;
  const allowed = Object.entries(roleRoutes).find(([, paths]) =>
    paths.some((p) => path.startsWith(p))
  )?.[0];

  if (allowed && role !== allowed) {
    const redirectMap: Record<string, string> = { admin: '/admin', applicant: '/applicant', employer: '/employer' };
    return NextResponse.redirect(new URL(redirectMap[role] || '/', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/applicant/:path*', '/employer/:path*'],
};
