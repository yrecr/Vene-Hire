'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CircleCheck, ArrowRight, X, User } from 'lucide-react';

interface ProfileCompletionBubbleProps {
  completion: number;
  items: { label: string; done: boolean }[];
  href: string;
  ctaLabel?: string;
  message?: string;
  /** Separate localStorage slot per role so applicant/employer don't fight over one flag. */
  storageKey: string;
}

/**
 * Floating, collapsible reminder — replaces the old static sidebar card.
 * "Closing" it collapses to a small round button (not gone for good); the
 * collapsed/expanded choice persists across reloads via localStorage.
 */
export function ProfileCompletionBubble({ completion, items, href, ctaLabel, message, storageKey }: ProfileCompletionBubbleProps) {
  const clamped = Math.min(100, Math.max(0, completion));
  // Lazy initializer (not an effect) so there's no flash of the wrong state —
  // reads the saved preference on first render; defaults to expanded (new
  // users should actually see the nudge) if nothing was saved yet.
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(storageKey) === 'collapsed';
    } catch {
      return false;
    }
  });

  const setAndPersist = (next: boolean) => {
    setCollapsed(next);
    try {
      localStorage.setItem(storageKey, next ? 'collapsed' : 'open');
    } catch {
      // Non-fatal — the toggle still works for this page view, just won't stick.
    }
  };

  if (clamped >= 100) return null;

  if (collapsed) {
    return (
      <button
        onClick={() => setAndPersist(false)}
        aria-label="Complete your profile"
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(210,100%,45%)] to-[hsl(170,60%,42%)] shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-white"
      >
        <User className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 bg-white text-[hsl(210,100%,45%)] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow">
          {clamped}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 w-80 max-w-[calc(100vw-3rem)] bg-white rounded-2xl border border-gray-100 shadow-xl p-5">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-sm font-semibold text-foreground">Complete your profile</h3>
        <button
          onClick={() => setAndPersist(true)}
          aria-label="Minimize"
          className="text-muted-foreground hover:text-foreground -mt-1 -mr-1 p-1 rounded-md hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {message && <p className="text-xs text-muted-foreground mb-3">{message}</p>}

      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Progress</span>
        <span className="text-xs font-bold text-foreground">{clamped}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(170,60%,42%)] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>

      <ul className="space-y-2 mb-4">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            {item.done ? (
              <CircleCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
            )}
            <span className={`text-xs ${item.done ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(210,100%,45%)] hover:gap-2 transition-all"
      >
        {ctaLabel || 'Complete your profile'} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
