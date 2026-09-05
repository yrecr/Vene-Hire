'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CircleAlert as AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app error boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <AlertCircle className="w-7 h-7 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">
          An unexpected error occurred. You can try again, or head back to the homepage.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => reset()}>
            Try Again
          </Button>
          <Button
            className="bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] text-white"
            onClick={() => { window.location.href = '/'; }}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
