import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  mockProfiles, mockTalentProfiles, mockEmployerProfiles,
  mockBootcamps, mockResources, mockAccessRequests,
  mockNotifications,
} from '@/data/mock';

const SEED_USERS = [
  { email: 'admin@demo.com', password: 'Demo123!', full_name: 'Admin User', role: 'admin', mid: 'p-admin1' },
  { email: 'admin2@demo.com', password: 'Demo123!', full_name: 'Operations Admin', role: 'admin', mid: 'p-admin2' },
  { email: 'sofia.backend@demo.com', password: 'Demo123!', full_name: 'Sofia Ramirez', role: 'applicant', mid: 'p-sofia' },
  { email: 'daniel.ai@demo.com', password: 'Demo123!', full_name: 'Daniel Torres', role: 'applicant', mid: 'p-daniel' },
  { email: 'camila.csharp@demo.com', password: 'Demo123!', full_name: 'Camila Vega', role: 'applicant', mid: 'p-camila' },
  { email: 'juan.fullstack@demo.com', password: 'Demo123!', full_name: 'Juan Herrera', role: 'applicant', mid: 'p-juan' },
  { email: 'talent@acme.com', password: 'Demo123!', full_name: 'ACME Hiring Team', role: 'employer', mid: 'p-acme' },
  { email: 'hr@innovasoft.com', password: 'Demo123!', full_name: 'InnovaSoft Recruiting', role: 'employer', mid: 'p-innova' },
  { email: 'hiring@nextlayer.com', password: 'Demo123!', full_name: 'NextLayer Talent Team', role: 'employer', mid: 'p-next' },
];

const uuid = () => crypto.randomUUID();

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const out: { users: string[]; errors: string[] } = { users: [], errors: [] };
  const authIdByEmail: Record<string, string> = {};

  // Get existing users so we can skip creation
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingByEmail: Record<string, string> = {};
  for (const eu of existingUsers?.users ?? []) {
    if (eu.email) existingByEmail[eu.email] = eu.id;
  }

  for (const u of SEED_USERS) {
    if (existingByEmail[u.email]) {
      authIdByEmail[u.email] = existingByEmail[u.email];
      out.users.push(`${u.email} -> ${existingByEmail[u.email]} (existing)`);
      continue;
    }
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email, password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    });
    if (error) { out.errors.push(`${u.email}: ${error.message}`); continue; }
    authIdByEmail[u.email] = data.user.id;
    out.users.push(`${u.email} -> ${data.user.id}`);
  }

  if (!out.users.length) return NextResponse.json(out, { status: 500 });

  // Map mock profile IDs to real UUIDs we generate
  const profileUuid: Record<string, string> = {};
  const profileRows = mockProfiles.map((p) => {
    const id = uuid();
    profileUuid[p.id] = id;
    const seedUser = SEED_USERS.find((u) => u.mid === p.id);
    return {
      id,
      auth_user_id: seedUser ? authIdByEmail[seedUser.email] ?? p.auth_user_id : p.auth_user_id,
      full_name: p.full_name, email: p.email, role: p.role,
      company_name: p.company_name, status: p.status, created_at: p.created_at,
    };
  });

  const { error: profilesErr } = await supabaseAdmin.from('profiles').insert(profileRows);
  if (profilesErr) out.errors.push(`profiles: ${profilesErr.message}`);

  // Employer profiles — map user_id to real UUID
  const empUuid: Record<string, string> = {};
  const empRows = mockEmployerProfiles.map((e) => {
    const id = uuid();
    empUuid[e.id] = id;
    return { id, user_id: profileUuid[e.user_id ?? ''] ?? null, company_name: e.company_name, contact_name: e.contact_name, summary: e.summary, hiring_needs: e.hiring_needs, status: e.status, created_at: e.created_at };
  });

  const { error: empErr } = await supabaseAdmin.from('employer_profiles').insert(empRows);
  if (empErr) out.errors.push(`employer_profiles: ${empErr.message}`);

  // Talent profiles + skills — map user_id to real UUID
  const tpUuid: Record<string, string> = {};
  for (const tp of mockTalentProfiles) {
    const id = uuid();
    tpUuid[tp.id] = id;
    const { error: tpErr } = await supabaseAdmin.from('talent_profiles').insert({
      id, user_id: profileUuid[tp.user_id ?? ''] ?? null, slug: tp.slug,
      display_name: tp.display_name, title: tp.title, summary: tp.summary, bio: tp.bio,
      tech_stack: tp.tech_stack, english_level: tp.english_level,
      availability_status: tp.availability_status, years_experience: tp.years_experience,
      featured: tp.featured, public_visible: tp.public_visible,
      video_url: tp.video_url, profile_image_url: tp.profile_image_url, created_at: tp.created_at,
    });
    if (tpErr) { out.errors.push(`talent_profile ${tp.id}: ${tpErr.message}`); continue; }
    if (tp.skills?.length) {
      const { error: skErr } = await supabaseAdmin.from('talent_skills').insert(
        tp.skills.map((s) => ({ id: uuid(), talent_profile_id: id, skill_name: s.skill_name, score: s.score, display_order: s.display_order })),
      );
      if (skErr) out.errors.push(`skills ${tp.id}: ${skErr.message}`);
    }
  }

  // Bootcamps
  const bcUuid: Record<string, string> = {};
  const bcRows = mockBootcamps.map((b) => {
    const id = uuid(); bcUuid[b.id] = id;
    return { id, title: b.title, description: b.description, start_date: b.start_date, end_date: b.end_date, status: b.status, created_at: b.created_at };
  });
  const { error: bcErr } = await supabaseAdmin.from('bootcamps').insert(bcRows);
  if (bcErr) out.errors.push(`bootcamps: ${bcErr.message}`);

  // Resources
  const { error: rErr } = await supabaseAdmin.from('resources').insert(
    mockResources.map((r) => ({ id: uuid(), title: r.title, description: r.description, file_path: r.file_path, visibility: r.visibility, bootcamp_id: bcUuid[r.bootcamp_id ?? ''] ?? null, created_at: r.created_at })),
  );
  if (rErr) out.errors.push(`resources: ${rErr.message}`);

  // Access requests
  const { error: arErr } = await supabaseAdmin.from('access_requests').insert(
    mockAccessRequests.map((r) => ({ id: uuid(), request_type: r.request_type, full_name: r.full_name, company: r.company, email: r.email, country: r.country, hiring_need: r.hiring_need, candidate_slug: r.candidate_slug, message: r.message, status: r.status, created_at: r.created_at, reviewed_by: r.reviewed_by })),
  );
  if (arErr) out.errors.push(`access_requests: ${arErr.message}`);

  // Notifications
  const { error: nErr } = await supabaseAdmin.from('notifications').insert(
    mockNotifications.map((n) => ({ id: uuid(), user_id: profileUuid[n.user_id] ?? n.user_id, title: n.title, message: n.message, type: n.type, read: n.read, created_at: n.created_at })),
  );
  if (nErr) out.errors.push(`notifications: ${nErr.message}`);

  return NextResponse.json(out, { status: out.errors.length ? 207 : 200 });
}
