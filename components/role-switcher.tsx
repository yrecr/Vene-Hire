'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoAuth } from '@/lib/demo-auth';
import { Button } from '@/components/ui/button';
import { Users, ChevronDown, LogOut, X } from 'lucide-react';

export function RoleSwitcher() {
  const { currentUser, logout } = useDemoAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {open && (
        <div className="absolute bottom-14 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in-up">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {currentUser ? 'Signed In' : 'Not signed in'}
              </p>
              <p className="text-sm font-medium text-foreground mt-0.5">
                {currentUser?.email ?? '—'}
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          {!currentUser && (
            <div className="p-3">
              <Button
                onClick={() => { setOpen(false); router.push('/login'); }}
                className="w-full"
                size="sm"
              >
                Sign In
              </Button>
            </div>
          )}

          {currentUser && (
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={() => { logout(); setOpen(false); router.push('/'); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}

      <Button
        onClick={() => setOpen(!open)}
        className="rounded-full h-12 px-4 shadow-lg shadow-gray-300/50 bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] text-white hover:shadow-xl transition-all"
      >
        {currentUser ? (
          <span className="text-sm font-medium mr-1">{currentUser.email?.split('@')[0]}</span>
        ) : (
          <>
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium mr-2">Account</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>
    </div>
  );
}
