import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export type AuthedProfile = { id: string; role: string; auth_user_id: string };

// ponytail: shared session+profile lookup, reused by every API route that
// needs to know who's calling before touching the service-role client.
export async function requireSession(req: NextRequest): Promise<AuthedProfile | null> {
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
  if (!session?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, auth_user_id')
    .eq('auth_user_id', session.user.id)
    .single();

  return profile ?? null;
}

// Resolves the employer_profiles.id / talent_profiles.id that belong to this
// caller, so routes can check "does this row actually belong to whoever's calling".
export async function resolveActorIds(supabaseAdmin: any, profile: AuthedProfile) {
  const [{ data: emp }, { data: talent }] = await Promise.all([
    supabaseAdmin.from('employer_profiles').select('id').eq('user_id', profile.id).maybeSingle(),
    supabaseAdmin.from('talent_profiles').select('id').eq('user_id', profile.id).maybeSingle(),
  ]);
  return { employerProfileId: emp?.id as string | undefined, talentProfileId: talent?.id as string | undefined };
}

export type ActorIds = { employerProfileId?: string; talentProfileId?: string };

/**
 * True only when the row genuinely belongs to this caller.
 *
 * The naive `row.employer_id === employerProfileId` check passes when BOTH sides
 * are undefined — so a caller with no talent profile could upsert ANY row by id
 * just by omitting `applicant_id` from the body. Both sides must be present and
 * equal for ownership to hold.
 */
export function ownsRow(
  row: { employer_id?: string | null; applicant_id?: string | null },
  ids: ActorIds
): boolean {
  return (
    (!!ids.employerProfileId && row.employer_id === ids.employerProfileId) ||
    (!!ids.talentProfileId && row.applicant_id === ids.talentProfileId)
  );
}
