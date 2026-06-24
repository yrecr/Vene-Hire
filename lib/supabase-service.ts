import { supabase } from './supabase';
import type { Profile, TalentProfile, TalentSkill, EmployerProfile, AccessRequest, SelectionProcess, InterviewRequest, Notification, AvailabilitySlot, Bootcamp, Enrollment, Resource } from '@/types';

// ─── Profiles ────────────────────────────────────────
export async function fetchProfiles(): Promise<Profile[]> {
  const { data } = await supabase.from('profiles').select('*');
  return data ?? [];
}

export async function fetchProfile(id: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
  return data;
}

export async function fetchProfileByEmail(email: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
  return data;
}

export async function upsertProfile(profile: Profile): Promise<void> {
  await supabase.from('profiles').upsert(profile, { onConflict: 'id' });
}

export async function deleteProfile(id: string): Promise<void> {
  await supabase.from('profiles').delete().eq('id', id);
}

// ─── Talent Profiles ─────────────────────────────────
export async function fetchTalentProfiles(): Promise<(TalentProfile & { skills: TalentSkill[] })[]> {
  const { data: profiles } = await supabase.from('talent_profiles').select('*');
  if (!profiles) return [];
  const { data: skills } = await supabase.from('talent_skills').select('*');
  return profiles.map((p: TalentProfile) => ({
    ...p,
    skills: (skills ?? []).filter((s: TalentSkill) => s.talent_profile_id === p.id),
  }));
}

export async function fetchTalentProfile(id: string): Promise<(TalentProfile & { skills: TalentSkill[] }) | null> {
  const { data: p } = await supabase.from('talent_profiles').select('*').eq('id', id).single();
  if (!p) return null;
  const { data: skills } = await supabase.from('talent_skills').select('*').eq('talent_profile_id', id);
  return { ...p, skills: skills ?? [] };
}

export async function upsertTalentProfile(profile: TalentProfile & { skills: TalentSkill[] }): Promise<void> {
  await supabase.from('talent_profiles').upsert(profile, { onConflict: 'id' });
  if (profile.skills?.length) {
    await supabase.from('talent_skills').upsert(profile.skills, { onConflict: 'id' });
  }
}

// ─── Employer Profiles ───────────────────────────────
export async function fetchEmployerProfiles(): Promise<EmployerProfile[]> {
  const { data } = await supabase.from('employer_profiles').select('*');
  return data ?? [];
}

export async function fetchEmployerProfile(id: string): Promise<EmployerProfile | null> {
  const { data } = await supabase.from('employer_profiles').select('*').eq('id', id).single();
  return data;
}

export async function upsertEmployerProfile(profile: EmployerProfile): Promise<void> {
  await supabase.from('employer_profiles').upsert(profile, { onConflict: 'id' });
}

// ─── Access Requests ─────────────────────────────────
export async function fetchAccessRequests(): Promise<AccessRequest[]> {
  const { data } = await supabase.from('access_requests').select('*');
  return data ?? [];
}

export async function upsertAccessRequest(req: AccessRequest): Promise<void> {
  await supabase.from('access_requests').upsert(req, { onConflict: 'id' });
}

// ─── Selection Processes ─────────────────────────────
export async function fetchSelectionProcesses(): Promise<SelectionProcess[]> {
  const { data } = await supabase.from('selection_processes').select('*');
  return data ?? [];
}

export async function upsertSelectionProcess(sp: SelectionProcess): Promise<void> {
  await supabase.from('selection_processes').upsert(sp, { onConflict: 'id' });
}

// ─── Interview Requests ──────────────────────────────
export async function fetchInterviewRequests(): Promise<InterviewRequest[]> {
  const { data } = await supabase.from('interview_requests').select('*');
  return data ?? [];
}

export async function upsertInterviewRequest(ir: InterviewRequest): Promise<void> {
  await supabase.from('interview_requests').upsert(ir, { onConflict: 'id' });
}

// ─── Notifications ───────────────────────────────────
export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await supabase.from('notifications').select('*');
  return data ?? [];
}

export async function upsertNotification(n: Notification): Promise<void> {
  await supabase.from('notifications').upsert(n, { onConflict: 'id' });
}

// ─── Availability Slots ──────────────────────────────
export async function fetchAvailabilitySlots(): Promise<AvailabilitySlot[]> {
  const { data } = await supabase.from('availability_slots').select('*');
  return data ?? [];
}

export async function upsertAvailabilitySlots(slots: AvailabilitySlot[]): Promise<void> {
  if (!slots.length) return;
  await supabase.from('availability_slots').upsert(slots, { onConflict: 'id' });
}

export async function deleteAvailabilitySlots(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await supabase.from('availability_slots').delete().in('id', ids);
}

// ─── Bootcamps ───────────────────────────────────────
export async function fetchBootcamps(): Promise<Bootcamp[]> {
  const { data } = await supabase.from('bootcamps').select('*');
  return data ?? [];
}

// ─── Enrollments ─────────────────────────────────────
export async function fetchEnrollments(): Promise<Enrollment[]> {
  const { data } = await supabase.from('enrollments').select('*');
  return data ?? [];
}

// ─── Resources ───────────────────────────────────────
export async function fetchResources(): Promise<Resource[]> {
  const { data } = await supabase.from('resources').select('*');
  return data ?? [];
}
