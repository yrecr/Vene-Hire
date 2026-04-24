'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { demoUsers } from '@/data/mock';
import type { DemoUser } from '@/types';

interface DemoAuthContextType {
  currentUser: DemoUser | null;
  login: (email: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
}

const DemoAuthContext = createContext<DemoAuthContextType>({
  currentUser: null,
  login: () => false,
  logout: () => {},
  switchUser: () => {},
});

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);

  const login = useCallback((email: string) => {
    const user = demoUsers.find((u) => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const switchUser = useCallback((userId: string) => {
    const user = demoUsers.find((u) => u.id === userId);
    if (user) setCurrentUser(user);
  }, []);

  return (
    <DemoAuthContext.Provider value={{ currentUser, login, logout, switchUser }}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  return useContext(DemoAuthContext);
}
