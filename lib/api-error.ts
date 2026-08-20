import { NextResponse } from 'next/server';

// ponytail: never forward raw Postgres/Supabase error text to the client
// (leaks column/constraint/schema names) — log it server-side instead.
export function dbError(context: string, error: { message: string }, status = 500) {
  console.error(`[${context}]`, error.message);
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status });
}
