'use client';

import { useState } from 'react';
import { DashboardSidebar, type SidebarLink } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import {
  LayoutDashboard,
  UserCog,
  MessageSquare,
  Users,
  Building2,
  GitBranch,
  BookOpen,
  FolderOpen,
} from 'lucide-react';

const adminLinks: SidebarLink[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User Management', icon: UserCog },
  { href: '/admin/requests', label: 'Access Requests', icon: MessageSquare },
  { href: '/admin/applicants', label: 'Applicants', icon: Users },
  { href: '/admin/employers', label: 'Employers', icon: Building2 },
  { href: '/admin/processes', label: 'Processes', icon: GitBranch },
  { href: '/admin/bootcamps', label: 'Bootcamps', icon: BookOpen },
  { href: '/admin/resources', label: 'Resources', icon: FolderOpen },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <DashboardSidebar
        links={adminLinks}
        role="Admin"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          title="Admin Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
