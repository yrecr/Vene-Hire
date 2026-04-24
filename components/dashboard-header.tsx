'use client';

import { Menu, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function DashboardHeader({ title, onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[hsl(210,100%,45%)] rounded-full" />
        </Button>
        <Button variant="ghost" size="icon">
          <LogOut className="w-[18px] h-[18px]" />
        </Button>
      </div>
    </header>
  );
}
