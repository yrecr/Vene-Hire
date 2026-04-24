'use client';

import { useState } from 'react';
import { DashboardSidebar, type SidebarLink } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FolderOpen,
  Building2,
} from 'lucide-react';

const clientLinks: SidebarLink[] = [
  { href: '/client', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/client/talent', label: 'Talent Pool', icon: Users },
  { href: '/client/requests', label: 'My Requests', icon: MessageSquare },
  { href: '/client/resources', label: 'Resources', icon: FolderOpen },
  { href: '/client/company', label: 'Company', icon: Building2 },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <DashboardSidebar
        links={clientLinks}
        role="Client"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          title="Client Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
