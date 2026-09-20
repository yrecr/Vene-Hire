'use client';

import { useT } from '@/lib/i18n';

const statusStyles: Record<string, string> = {
  active: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40',
  hired: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',
  not_selected: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/40',
  on_hold: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40',
  pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40',
  signed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',
  intro_interview: 'bg-blue-50 text-[hsl(210,100%,45%)] border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40',
  technical_interview: 'bg-teal-50 text-[hsl(170,60%,42%)] border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/40',
  contract_signing: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40',
};

interface ProcessStatusBadgeProps {
  status: string;
}

export function ProcessStatusBadge({ status }: ProcessStatusBadgeProps) {
  const { t } = useT();
  const normalizedKey = status.toLowerCase().replace(/\s+/g, '_');
  const style = statusStyles[normalizedKey] || 'bg-gray-100 text-gray-600 border-gray-200';
  const label =
    (t.badges as Record<string, string>)[normalizedKey] ||
    status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${style}`}
    >
      {label}
    </span>
  );
}
