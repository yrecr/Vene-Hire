'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getDemoUser, isDemoMode, exitDemo } from '@/lib/demo';

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
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In demo mode, use fixed demo profile — skip /api/auth/me entirely
    const demoUser = getDemoUser();
    if (demoUser) {
      setCurrentUser(demoUser);
      setLoading(false);
      return;
    }

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    // In demo mode, exit demo instead of calling API
    if (isDemoMode()) {
      exitDemo();
      return;
    }

    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
