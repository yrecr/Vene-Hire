'use client';

import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <NotificationCenter notifications={userNotifications} />
        <Button variant="ghost" size="icon" onClick={() => { logout(); router.push('/'); }}>
          <LogOut className="w-[18px] h-[18px]" />
        </Button>
      </div>
    </header>
  );
}
