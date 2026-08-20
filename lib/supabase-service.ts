import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { Profile, TalentProfile, TalentSkill, EmployerProfile, AccessRequest, SelectionProcess, InterviewRequest, Notification, AvailabilitySlot, Bootcamp, Enrollment, Resource, ContractApprovalRequest, Vacancy, Candidate } from '@/types';

let _sb: ReturnType<typeof createBrowserClient> | null = null;
function sb() {
  if (!_sb) {
    _sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _sb;
}

// ─── Profiles ────────────────────────────────────────
export async function fetchProfiles(): Promise<Profile[]> {
  const { data } = await sb().from('profiles').select('*');
  return data ?? [];
}

export async function fetchProfile(id: string): Promise<Profile | null> {
  const { data } = await sb().from('profiles').select('*').eq('id', id).single();
  return data;
}

export async function fetchProfileByEmail(email: string): Promise<Profile | null> {
  const { data } = await sb().from('profiles').select('*').eq('email', email).single();
  return data;
}

export async function upsertProfile(profile: Profile): Promise<void> {
  await sb().from('profiles').upsert(profile, { onConflict: 'id' });
}

export async function deleteProfile(id: string): Promise<void> {
  await sb().from('profiles').delete().eq('id', id);
}

// ─── Talent Profiles ─────────────────────────────────
export async function fetchTalentProfiles(): Promise<(TalentProfile & { skills: TalentSkill[] })[]> {
  const { data: profiles } = await sb().from('talent_profiles').select('*');
  if (!profiles) return [];
  const { data: skills } = await sb().from('talent_skills').select('*');
  return profiles.map((p: TalentProfile) => ({
    ...p,
    skills: (skills ?? []).filter((s: TalentSkill) => s.talent_profile_id === p.id),
  }));
}

export async function fetchTalentProfile(id: string): Promise<(TalentProfile & { skills: TalentSkill[] }) | null> {
  const { data: p } = await sb().from('talent_profiles').select('*').eq('id', id).single();
  if (!p) return null;
  const { data: skills } = await sb().from('talent_skills').select('*').eq('talent_profile_id', id);
  return { ...p, skills: skills ?? [] };
}

export async function upsertTalentProfile(profile: TalentProfile & { skills: TalentSkill[] }): Promise<void> {
  const { skills, ...dbFields } = profile;
  // Use UPDATE instead of upsert: students have UPDATE permission but not INSERT.
  // The talent_profile row is always pre-created by an admin, so UPDATE is correct.
  const { error } = await sb()
    .from('talent_profiles')
    .update(dbFields)
    .eq('id', dbFields.id);
  if (error) throw new Error(error.message);
  if (skills?.length) {
    const { error: skillsError } = await sb().from('talent_skills').upsert(skills, { onConflict: 'id' });
    if (skillsError) throw new Error(skillsError.message);
  }
}

// ─── Employer Profiles ───────────────────────────────
export async function fetchEmployerProfiles(): Promise<EmployerProfile[]> {
  const { data } = await sb().from('employer_profiles').select('*');
  return data ?? [];
}

export async function fetchEmployerProfile(id: string): Promise<EmployerProfile | null> {
  const { data } = await sb().from('employer_profiles').select('*').eq('id', id).single();
  return data;
}

export async function upsertEmployerProfile(profile: EmployerProfile): Promise<void> {
  await sb().from('employer_profiles').upsert(profile, { onConflict: 'id' });
}

// ─── Access Requests ─────────────────────────────────
export async function fetchAccessRequests(): Promise<AccessRequest[]> {
  const { data } = await sb().from('access_requests').select('*');
  return data ?? [];
}

export async function upsertAccessRequest(req: AccessRequest): Promise<void> {
  await sb().from('access_requests').upsert(req, { onConflict: 'id' });
}

// ─── Selection Processes ─────────────────────────────
export async function fetchSelectionProcesses(): Promise<SelectionProcess[]> {
  const { data } = await sb().from('selection_processes').select('*');
  return data ?? [];
}

// ponytail: route through /api/selection-processes/create to use service_role key,
// bypassing RLS that blocks selection process persistence
export async function upsertSelectionProcess(sp: SelectionProcess): Promise<void> {
  const res = await fetch('/api/selection-processes/create', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([sp]),
  });
  if (!res.ok) throw new Error(`Failed to upsert selection process: ${await res.text()}`);
}

// ─── Interview Requests ──────────────────────────────
export async function fetchInterviewRequests(): Promise<InterviewRequest[]> {
  const { data } = await sb().from('interview_requests').select('*');
  return data ?? [];
}

// ponytail: route through /api/interview-requests/create to use service_role key,
// bypassing RLS that can block interview request persistence
export async function upsertInterviewRequest(ir: InterviewRequest): Promise<void> {
  const res = await fetch('/api/interview-requests/create', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([ir]),
  });
  if (!res.ok) throw new Error(`Failed to upsert interview request: ${await res.text()}`);
}

// ─── Notifications ───────────────────────────────────
export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await sb().from('notifications').select('*');
  return data ?? [];
}

// ponytail: route through /api/notifications/create to use service_role key,
// bypassing RLS that blocks non-admin notification inserts
export async function upsertNotification(n: Notification): Promise<void> {
  const res = await fetch('/api/notifications/create', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([n]),
  });
  if (!res.ok) throw new Error(`upsertNotification failed: ${await res.text()}`);
}

export async function upsertNotifications(notifications: Notification[]): Promise<void> {
  if (!notifications.length) return;
  const res = await fetch('/api/notifications/create', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notifications),
  });
  if (!res.ok) throw new Error(`upsertNotifications failed: ${await res.text()}`);
}

export async function markNotificationRead(id: string): Promise<void> {
  await sb().from('notifications').update({ read: true }).eq('id', id);
}

// ─── Availability Slots ──────────────────────────────
export async function fetchAvailabilitySlots(): Promise<AvailabilitySlot[]> {
  const { data } = await sb().from('availability_slots').select('*');
  return data ?? [];
}

export async function upsertAvailabilitySlots(slots: AvailabilitySlot[]): Promise<void> {
  if (!slots.length) return;
  await sb().from('availability_slots').upsert(slots, { onConflict: 'id' });
}

export async function deleteAvailabilitySlots(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await sb().from('availability_slots').delete().in('id', ids);
}

// ─── Resume Upload ──────────────────────────────────
export async function uploadResume(
  applicantId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split('.').pop() || 'pdf';
  const path = `${applicantId}/resume.${ext}`;
  const { error } = await sb().storage.from('resumes').upload(path, file, {
    upsert: true,
  });
  if (error) return { error: error.message };
  const { data } = sb().storage.from('resumes').getPublicUrl(path);
  return { url: data.publicUrl };
}

// ─── Contract Approval Requests ──────────────────────
export async function fetchContractApprovalRequests(): Promise<ContractApprovalRequest[]> {
  const { data } = await sb().from('contract_approval_requests').select('*');
  return data ?? [];
}

export async function createContractApprovalRequest(processId: string, employerId: string, applicantId: string): Promise<ContractApprovalRequest> {
  const res = await fetch('/api/contract-approval', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ process_id: processId, employer_id: employerId, applicant_id: applicantId }),
  });
  if (!res.ok) throw new Error(`createContractApprovalRequest failed: ${await res.text()}`);
  return res.json();
}

export async function reviewContractApprovalRequest(requestId: string, status: 'approved' | 'rejected'): Promise<void> {
  const res = await fetch('/api/contract-approval', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, status }),
  });
  if (!res.ok) throw new Error(`reviewContractApprovalRequest failed: ${await res.text()}`);
}

// ─── Contract Documents ──────────────────────────────
export async function generateContractPdf(processId: string): Promise<{ url?: string; error?: string }> {
  const res = await fetch('/api/contracts/generate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ process_id: processId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.error || 'Failed to generate contract PDF' };
  }
  return res.json();
}

export async function signContract(processId: string, signatureBlob: Blob): Promise<{ signature_url?: string; contract_url?: string; error?: string }> {
  const fd = new FormData();
  fd.append('process_id', processId);
  fd.append('signature', signatureBlob, 'signature.png');
  const res = await fetch('/api/contracts/sign', { method: 'POST', body: fd });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    try { const body = JSON.parse(text); return { error: `${res.status}: ${body.error || res.statusText}` }; }
    catch { return { error: `${res.status}: ${text.slice(0, 100) || res.statusText}` }; }
  }
  return res.json();
}

export async function verifyContract(processId: string): Promise<{ error?: string }> {
  const res = await fetch('/api/contracts/verify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ process_id: processId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.error || 'Failed to verify contract' };
  }
  return res.json();
}

// ─── Vacancies ───────────────────────────────────────
export async function fetchVacancies(): Promise<Vacancy[]> {
  const { data } = await sb().from('vacancies').select('*');
  return data ?? [];
}

// ponytail: route through /api/vacancies/create to use service_role key,
// same pattern as upsertInterviewRequest/upsertSelectionProcess
export async function upsertVacancy(v: Vacancy): Promise<void> {
  const res = await fetch('/api/vacancies/create', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(v),
  });
  if (!res.ok) throw new Error(`Failed to upsert vacancy: ${await res.text()}`);
}

// ─── Candidates ──────────────────────────────────────
export async function fetchCandidates(): Promise<Candidate[]> {
  const { data } = await sb().from('candidates').select('*');
  return data ?? [];
}

export async function updateCandidateStatus(candidateId: string, manualStatus: Candidate['manual_status']): Promise<void> {
  const res = await fetch('/api/candidates/status', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate_id: candidateId, manual_status: manualStatus }),
  });
  if (!res.ok) throw new Error(`Failed to update candidate status: ${await res.text()}`);
}

// ─── Bootcamps ───────────────────────────────────────
export async function fetchBootcamps(): Promise<Bootcamp[]> {
  const { data } = await sb().from('bootcamps').select('*');
  return data ?? [];
}

// ─── Enrollments ─────────────────────────────────────
export async function fetchEnrollments(): Promise<Enrollment[]> {
  const { data } = await sb().from('enrollments').select('*');
  return data ?? [];
}

// ─── Resources ───────────────────────────────────────
export async function fetchResources(): Promise<Resource[]> {
  const { data } = await sb().from('resources').select('*');
  return data ?? [];
}
