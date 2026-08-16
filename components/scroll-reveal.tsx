'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger offset in ms, applied as transition-delay. */
  delay?: number;
}

/**
 * Reveals its children once, the first time they scroll into view.
 * Marketing sections only -- not for UI a user visits daily.
 */
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // threshold must stay 0 -- a fractional threshold combined with a negative
    // rootMargin silently stops firing after the initial callback in some
    // Chromium builds (reproduced against this project's dev server). Zero is
    // also the more natural trigger point for a reveal: as soon as any part
    // of the section enters the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-visible={visible || undefined}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
