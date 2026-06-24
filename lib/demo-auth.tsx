'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'applicant' | 'employer';
  profile_id: string;
  talent_profile_id?: string;
  employer_profile_id?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  logout: () => {},
});

async function fetchAuthUser(sessionUserId: string, sessionEmail: string): Promise<AuthUser | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', sessionUserId)
    .single();

  if (!profile) return null;

  const user: AuthUser = {
    id: sessionUserId,
    email: sessionEmail,
    full_name: profile.full_name,
    role: profile.role as AuthUser['role'],
    profile_id: profile.id,
  };

  if (user.role === 'applicant') {
    const { data: tp } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', profile.id)
      .single();
    if (tp) user.talent_profile_id = tp.id;
  }

  if (user.role === 'employer') {
    const { data: ep } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', profile.id)
      .single();
    if (ep) user.employer_profile_id = ep.id;
  }

  return user;
}

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = await fetchAuthUser(session.user.id, session.user.email ?? '');
        if (u) setCurrentUser(u);
      }
      setHydrated(true);
    }).catch(() => setHydrated(true));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = await fetchAuthUser(session.user.id, session.user.email ?? '');
        if (u) setCurrentUser(u);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  if (!hydrated) return <>{children}</>;

  return (
    <AuthContext.Provider value={{ currentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useDemoAuth() {
  return useContext(AuthContext);
}
