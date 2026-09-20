'use client';

import type { AuthUser } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

// ─── Types ──────────────────────────────────────────────
export type DemoRole = 'admin' | 'employer' | 'applicant';

const COOKIE_NAME = 'venehire_demo';

// ─── Fixed demo profiles ────────────────────────────────
const DEMO_PROFILES: Record<DemoRole, AuthUser> = {
  admin: {
    id: 'p-admin1',
    email: 'admin@example.com',
    full_name: 'Demo Admin',
    role: 'admin',
    profile_id: 'p-admin1',
  },
  employer: {
    id: 'p-acme',
    email: 'talent@acme-example.com',
    full_name: 'ACME Hiring Team',
    role: 'employer',
    profile_id: 'p-acme',
    employer_profile_id: 'ep-acme',
  },
  applicant: {
    id: 'p-sofia',
    email: 'sofia.backend@example.com',
    full_name: 'Sofia Ramirez',
    role: 'applicant',
    profile_id: 'p-sofia',
    talent_profile_id: 'tp-sofia',
  },
};

// ─── Cookie helpers ─────────────────────────────────────

/** Read the demo role from the cookie (client-side only). */
export function getDemoRole(): DemoRole | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1] as DemoRole | undefined;
  if (value && (value === 'admin' || value === 'employer' || value === 'applicant')) {
    return value;
  }
  return null;
}

/** True when the browser is running in demo mode. */
export function isDemoMode(): boolean {
  return getDemoRole() !== null;
}

/** Get the fixed AuthUser for the current demo role. */
export function getDemoUser(): AuthUser | null {
  const role = getDemoRole();
  return role ? DEMO_PROFILES[role] : null;
}

/** Get the fixed AuthUser for a specific demo role. */
export function getDemoUserForRole(role: DemoRole): AuthUser {
  return DEMO_PROFILES[role];
}

/** Activate demo mode: set cookie and redirect to the role's dashboard. */
export function enterDemo(role: DemoRole): void {
  document.cookie = `${COOKIE_NAME}=${role}; path=/; SameSite=Lax; max-age=${60 * 60 * 24}`;
  window.location.href = `/${role}`;
}

/** Drop the demo cookie without navigating. */
export function clearDemoCookie(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; SameSite=Lax; max-age=0`;
}

/** Exit demo mode: delete cookie and redirect to /demo. */
export function exitDemo(): void {
  clearDemoCookie();
  window.location.href = '/demo';
}

// ─── Demo guard ─────────────────────────────────────────

/**
 * Call at the top of any action handler that would call an API or Supabase.
 * Returns `true` if in demo mode (caller should abort).
 */
export function demoGuard(actionLabel?: string): boolean {
  if (!isDemoMode()) return false;

  toast({
    title: 'Not available in demo mode',
    description: actionLabel
      ? `"${actionLabel}" is disabled in the demo. Register for full access.`
      : 'This action is disabled in the demo. Register for full access.',
    variant: 'destructive',
  });

  return true;
}
