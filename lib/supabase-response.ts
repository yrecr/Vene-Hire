import { NextResponse } from 'next/server';

// Supabase's cookie adapter writes token refreshes onto whatever response
// object it was wired to (`res` below) — but route handlers often construct
// a *different* response object for the actual return (NextResponse.json,
// NextResponse.redirect). Returning that new object silently drops any
// refreshed session cookie. This copies `res`'s cookies onto the real return
// value so a refresh is never lost.
export function mergeSupabaseCookies(from: NextResponse, into: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => {
    into.cookies.set(cookie);
  });
  return into;
}
