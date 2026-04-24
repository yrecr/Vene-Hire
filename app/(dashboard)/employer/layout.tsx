'use client';

import { useState } from 'react';
import { DashboardSidebar, type SidebarLink } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import {
  LayoutDashboard,
  Users,
  Star,
  GitBranch,
  MessageSquare,
  Bell,
  Building2,
} from 'lucide-react';

const employerLinks: SidebarLink[] = [
  { href: '/employer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employer/applicants', label: 'Browse Applicants', icon: Users },
  { href: '/employer/shortlist', label: 'Shortlist', icon: Star },
  { href: '/employer/processes', label: 'Active Processes', icon: GitBranch },
  { href: '/employer/requests', label: 'Interviews', icon: MessageSquare },
  { href: '/employer/notifications', label: 'Notifications', icon: Bell },
  { href: '/employer/company', label: 'Company', icon: Building2 },
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <DashboardSidebar
        links={employerLinks}
        role="Employer"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          title="Employer Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
