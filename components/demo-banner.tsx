'use client';

import { isDemoMode, exitDemo } from '@/lib/demo';
import { AlertTriangle, X } from 'lucide-react';

export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">Demo mode</span>
        <span className="hidden sm:inline text-amber-700">— sample data only, nothing is saved.</span>
      </div>
      <button
        onClick={exitDemo}
        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors"
      >
        Exit demo
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
