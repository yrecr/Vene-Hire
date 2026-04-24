'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoAuth } from '@/lib/demo-auth';
import { demoUsers } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Users, ChevronDown, LogOut, X } from 'lucide-react';

const roleColors: Record<string, string> = {
  admin: 'bg-orange-500',
  applicant: 'bg-emerald-500',
  employer: 'bg-blue-500',
};

const rolePaths: Record<string, string> = {
  admin: '/admin',
  applicant: '/applicant',
  employer: '/employer',
};

export function RoleSwitcher() {
  const { currentUser, switchUser, logout } = useDemoAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {open && (
        <div className="absolute bottom-14 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in-up">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demo Mode</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{currentUser.full_name}</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2 max-h-[320px] overflow-y-auto">
            {(['admin', 'applicant', 'employer'] as const).map((role) => (
              <div key={role}>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {role}s
                </p>
                {demoUsers.filter((u) => u.role === role).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setOpen(false);
                      router.push(rolePaths[user.role]);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                      currentUser.id === user.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${roleColors[user.role]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {currentUser.id === user.id && (
                      <span className="text-[10px] font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-gray-100">
            <button
              onClick={() => { logout(); setOpen(false); router.push('/'); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      <Button
        onClick={() => setOpen(!open)}
        className="rounded-full h-12 px-4 shadow-lg shadow-gray-300/50 bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] text-white hover:shadow-xl transition-all"
      >
        <div className={`w-2.5 h-2.5 rounded-full ${roleColors[currentUser.role]} mr-2`} />
        <span className="text-sm font-medium mr-1">{currentUser.full_name.split(' ')[0]}</span>
        <span className="text-xs opacity-75 capitalize mr-2">({currentUser.role})</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>
    </div>
  );
}

export function DemoLoginPanel() {
  const { login } = useDemoAuth();
  const router = useRouter();

  const handleQuickLogin = (email: string, role: string) => {
    login(email);
    router.push(rolePaths[role]);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-[hsl(210,100%,45%)]" />
        <h3 className="text-lg font-semibold">Demo Access</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Select a test account to explore the platform. No real authentication required.
      </p>
      <div className="space-y-3">
        {(['admin', 'applicant', 'employer'] as const).map((role) => (
          <div key={role}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 capitalize">{role}</p>
            <div className="space-y-1">
              {demoUsers.filter((u) => u.role === role).map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user.email, user.role)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                >
                  <div className={`w-2 h-2 rounded-full ${roleColors[user.role]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
