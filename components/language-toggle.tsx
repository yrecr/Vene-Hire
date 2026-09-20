'use client';

import * as React from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useT } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useT();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle language"
        className={`w-9 h-9 text-muted-foreground ${className ?? ''}`}
      >
        <Globe className="w-4 h-4 opacity-70" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Select language"
          className={`flex items-center gap-1.5 px-2.5 h-9 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${className ?? ''}`}
        >
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="uppercase">{lang}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onClick={() => setLang('en')}
          className="flex items-center justify-between cursor-pointer text-xs"
        >
          <span className="flex items-center gap-2">
            <span>🇺🇸</span>
            <span>English</span>
          </span>
          {lang === 'en' && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLang('es')}
          className="flex items-center justify-between cursor-pointer text-xs"
        >
          <span className="flex items-center gap-2">
            <span>🇪🇸</span>
            <span>Español</span>
          </span>
          {lang === 'es' && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LanguageMenuSub() {
  const { lang, setLang, t } = useT();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="px-2 py-1.5">
      <div className="text-xs font-semibold text-muted-foreground mb-1.5 px-1 flex items-center justify-between">
        <span>{t.nav.language}</span>
        <Globe className="w-3 h-3 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-2 gap-1 bg-secondary p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded text-xs font-medium transition-colors ${
            lang === 'en'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>🇺🇸</span>
          <span>English</span>
        </button>
        <button
          type="button"
          onClick={() => setLang('es')}
          className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded text-xs font-medium transition-colors ${
            lang === 'es'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>🇪🇸</span>
          <span>Español</span>
        </button>
      </div>
    </div>
  );
}
