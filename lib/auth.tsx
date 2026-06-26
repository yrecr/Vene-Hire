'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
