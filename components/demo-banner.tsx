'use client';

import { isDemoMode, exitDemo } from '@/lib/demo';
import { AlertTriangle, X } from 'lucide-react';
import { useT } from '@/lib/i18n';

export function DemoBanner() {
  const { t } = useT();

  if (!isDemoMode()) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/40 px-4 py-2 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">{t.demo.bannerTitle}</span>
        <span className="hidden sm:inline text-amber-700 dark:text-amber-400">— {t.demo.bannerText}</span>
      </div>
      <button
        onClick={exitDemo}
        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700/50 dark:hover:bg-amber-900/60 rounded-lg transition-colors"
      >
        {t.demo.exitDemo}
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
