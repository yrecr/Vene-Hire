'use client';

import { Menu, LogOut, User, Settings, KeyRound, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import { NotificationCenter } from '@/components/notification-center';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function DashboardHeader({ title, onMenuClick }: DashboardHeaderProps) {
  const { currentUser, logout } = useAuth();
  const { getNotificationsForUser } = useData();
  const router = useRouter();
  const userNotifications = getNotificationsForUser(currentUser?.profile_id ?? '');
  const settingsBase = currentUser ? `/${currentUser.role}/settings` : '/';
  const initials = currentUser?.full_name
    ? currentUser.full_name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '?';

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
        <NotificationCenter notifications={userNotifications} role={currentUser?.role} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(210,100%,45%)] to-[hsl(170,60%,42%)] flex items-center justify-center text-white text-xs font-semibold hover:opacity-90 transition-opacity">
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium text-foreground truncate">{currentUser?.full_name}</p>
              <p className="text-xs font-normal text-muted-foreground truncate">{currentUser?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`${settingsBase}#profile`)} className="gap-2 cursor-pointer">
              <User className="w-4 h-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`${settingsBase}#system`)} className="gap-2 cursor-pointer">
              <Settings className="w-4 h-4" /> System Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`${settingsBase}#security`)} className="gap-2 cursor-pointer">
              <KeyRound className="w-4 h-4" /> Change Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`${settingsBase}#about`)} className="gap-2 cursor-pointer">
              <Info className="w-4 h-4" /> About
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); router.push('/'); }} className="gap-2 cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="w-4 h-4" /> Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
