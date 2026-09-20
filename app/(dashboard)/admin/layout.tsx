'use client';

import { useMemo, useState } from 'react';
import { DashboardSidebar, type SidebarLink } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { DemoBanner } from '@/components/demo-banner';
import { useT } from '@/lib/i18n';
import {
  LayoutDashboard,
  UserCog,
  MessageSquare,
  Mail,
  Users,
  Building2,
  GitBranch,
  BookOpen,
  FolderOpen,
  Clock,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useT();

  const adminLinks: SidebarLink[] = useMemo(() => [
    { href: '/admin', label: t.admin.dashboard, icon: LayoutDashboard },
    { href: '/admin/users', label: t.admin.userManagement, icon: UserCog },
    { href: '/admin/requests', label: t.admin.accessRequests, icon: MessageSquare },
    { href: '/admin/contact', label: t.admin.contactMessages, icon: Mail },
    { href: '/admin/applicants', label: t.admin.applicants, icon: Users },
    { href: '/admin/employers', label: t.admin.employers, icon: Building2 },
    { href: '/admin/processes', label: t.admin.processes, icon: GitBranch },
    { href: '/admin/timesheets', label: t.admin.timesheets, icon: Clock },
    { href: '/admin/bootcamps', label: t.admin.bootcamps, icon: BookOpen },
    { href: '/admin/resources', label: t.admin.resources, icon: FolderOpen },
  ], [t]);

  return (
    <div className="flex h-screen">
      <DashboardSidebar
        links={adminLinks}
        role={t.badges.admin}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DemoBanner />
        <DashboardHeader
          title={t.admin.dashboardTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
