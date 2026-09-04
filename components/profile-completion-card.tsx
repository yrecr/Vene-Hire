'use client';

import Link from 'next/link';
import { CircleCheck, ArrowRight } from 'lucide-react';

interface ProfileCompletionCardProps {
  completion: number;
  items: { label: string; done: boolean }[];
  href?: string;
  ctaLabel?: string;
  message?: string;
}

export function ProfileCompletionCard({ completion, items, href, ctaLabel, message }: ProfileCompletionCardProps) {
  const clampedCompletion = Math.min(100, Math.max(0, completion));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <h3 className="text-base font-semibold text-foreground mb-1">Complete your profile</h3>
      {message && clampedCompletion < 100 && (
        <p className="text-xs text-muted-foreground mb-3">{message}</p>
      )}

      {/* Progress bar */}
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Progress</span>
        <span className="text-sm font-bold text-foreground">{clampedCompletion}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(170,60%,42%)] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${clampedCompletion}%` }}
        />
      </div>

      {clampedCompletion === 100 ? (
        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
          <CircleCheck className="w-5 h-5" />
          Your profile is complete
        </div>
      ) : (
        <>
          <ul className="space-y-2.5 mb-4">
            {items.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5">
                {item.done ? (
                  <CircleCheck className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    item.done
                      ? 'text-muted-foreground line-through'
                      : 'text-foreground font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
          {href && (
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(210,100%,45%)] hover:gap-2 transition-all"
            >
              {ctaLabel || 'Complete your profile'} <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </>
      )}
    </div>
  );
}
