import type { TalentProfile, TalentSkill, EmployerProfile } from '@/types';

export const APPLICANT_PUBLISH_THRESHOLD = 60;
export const EMPLOYER_COMPLETION_THRESHOLD = 60;

export interface CompletionItem {
  label: string;
  done: boolean;
}

export function getApplicantCompletionItems(profile: TalentProfile & { skills?: TalentSkill[] }): CompletionItem[] {
  return [
    { label: 'Full Name', done: profile.display_name.length > 0 },
    { label: 'Professional Title', done: profile.title.length > 0 },
    { label: 'Summary', done: (profile.summary?.length ?? 0) > 2 },
    { label: 'Bio', done: (profile.bio?.length ?? 0) > 0 },
    { label: 'Tech Stack', done: (profile.tech_stack?.length ?? 0) > 0 },
    { label: 'Skills Assessment', done: (profile.skills?.length ?? 0) > 0 },
    { label: 'English Level', done: profile.english_level !== 'Basic' },
    { label: 'Resume', done: (profile.resume_url?.length ?? 0) > 0 },
    { label: 'Video', done: (profile.video_url?.length ?? 0) > 0 },
    { label: 'Availability', done: profile.availability_status !== 'In Training' },
  ];
}

export function getCompletionPercent(items: CompletionItem[]): number {
  if (!items.length) return 0;
  return Math.round((items.filter((i) => i.done).length / items.length) * 100);
}

export function getApplicantCompletionPercent(profile: TalentProfile & { skills?: TalentSkill[] }): number {
  return getCompletionPercent(getApplicantCompletionItems(profile));
}

export function getEmployerCompletionItems(profile: EmployerProfile): CompletionItem[] {
  return [
    { label: 'Company Name', done: profile.company_name.length > 0 },
    { label: 'Contact Name', done: profile.contact_name.length > 0 },
    { label: 'Company Summary', done: (profile.summary?.length ?? 0) > 2 },
    { label: 'Hiring Needs', done: (profile.hiring_needs?.length ?? 0) > 0 },
    { label: 'Payment Method', done: !!profile.payment_method },
  ];
}

export function getEmployerCompletionPercent(profile: EmployerProfile): number {
  return getCompletionPercent(getEmployerCompletionItems(profile));
}
