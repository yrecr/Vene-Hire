import { mockEmployerProfiles } from '@/data/mock';
import type { EmployerProfile } from '@/types';

const LS_KEY = 'vh-employers';

export function loadEmployerProfiles(): EmployerProfile[] {
  if (typeof window === 'undefined') return mockEmployerProfiles;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as EmployerProfile[]) : mockEmployerProfiles;
  } catch { return mockEmployerProfiles; }
}

export function getEmployerById(id: string | null | undefined): EmployerProfile | undefined {
  if (!id) return undefined;
  const all = loadEmployerProfiles();
  return all.find((e) => e.id === id);
}
