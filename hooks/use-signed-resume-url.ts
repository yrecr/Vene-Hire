'use client';

import { useEffect, useState } from 'react';
import { getResumeSignedUrl } from '@/lib/supabase-service';

export function useSignedResumeUrl(resumeUrl: string | null | undefined, active: boolean) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    if (!active || !resumeUrl) {
      setUrl(null);
      setStatus('idle');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    getResumeSignedUrl(resumeUrl)
      .then((signed) => {
        if (cancelled) return;
        setUrl(signed);
        setStatus(signed ? 'idle' : 'error');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [resumeUrl, active]);

  return { url, status };
}
