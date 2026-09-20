'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CircleAlert as AlertCircle } from 'lucide-react';
import { useT } from '@/lib/i18n';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useT();

  useEffect(() => {
    console.error('[app error boundary]', error);

    const isChunkLoadError =
      error.name === 'ChunkLoadError' ||
      /Loading chunk|Failed to fetch dynamically imported module|failed to import/i.test(error.message);

    if (isChunkLoadError && !sessionStorage.getItem('chunk-reload')) {
      sessionStorage.setItem('chunk-reload', '1');
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <AlertCircle className="w-7 h-7 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.common.errorTitle}</h1>
        <p className="text-muted-foreground mb-8">
          {t.common.errorDesc}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => reset()}>
            {t.common.tryAgainBtn}
          </Button>
          <Button
            className="bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] text-white"
            onClick={() => { window.location.href = '/'; }}
          >
            {t.common.backToHome}
          </Button>
        </div>
      </div>
    </div>
  );
}
