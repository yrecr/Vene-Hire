'use client';

import { AccountSettingsShell } from '@/components/account-settings-shell';
import { useAuth } from '@/lib/auth';

function AdminProfile() {
  const { currentUser } = useAuth();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-md space-y-4">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(210,100%,45%)] to-[hsl(170,60%,42%)] flex items-center justify-center text-white text-lg font-semibold">
        {currentUser?.full_name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?'}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Full name</p>
        <p className="font-medium text-foreground">{currentUser?.full_name}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Email</p>
        <p className="font-medium text-foreground">{currentUser?.email}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Role</p>
        <p className="font-medium text-foreground capitalize">{currentUser?.role}</p>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return <AccountSettingsShell profileContent={<AdminProfile />} />;
}
