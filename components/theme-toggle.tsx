'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className={`w-9 h-9 text-muted-foreground ${className ?? ''}`}
      >
        <Sun className="w-4 h-4 opacity-70" />
      </Button>
    );
  }

  const currentIcon =
    theme === 'system' ? (
      <Laptop className="w-4 h-4" />
    ) : resolvedTheme === 'dark' ? (
      <Moon className="w-4 h-4 text-blue-400" />
    ) : (
      <Sun className="w-4 h-4 text-amber-500" />
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Select theme"
          className={`w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${className ?? ''}`}
        >
          {currentIcon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center justify-between cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light</span>
          </span>
          {theme === 'light' && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center justify-between cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-blue-400" />
            <span>Dark</span>
          </span>
          {theme === 'dark' && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center justify-between cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-muted-foreground" />
            <span>System</span>
          </span>
          {theme === 'system' && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ThemeMenuSub() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="px-2 py-1.5">
      <div className="text-xs font-semibold text-muted-foreground mb-1.5 px-1">Theme</div>
      <div className="grid grid-cols-3 gap-1 bg-secondary p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center justify-center gap-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
            theme === 'light'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center justify-center gap-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-blue-400" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center justify-center gap-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
            theme === 'system'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Auto</span>
        </button>
      </div>
    </div>
  );
}
