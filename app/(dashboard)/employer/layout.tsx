'use client';

import { useState } from 'react';
import { DashboardSidebar, type SidebarLink } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { DemoBanner } from '@/components/demo-banner';
import { useT } from '@/lib/i18n';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  MessageSquare,
  Briefcase,
} from 'lucide-react';

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useT();

  const employerLinks: SidebarLink[] = [
    { href: '/employer', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/employer/vacancies', label: t.employer.vacanciesTitle, icon: Briefcase },
    { href: '/employer/applicants', label: t.employer.applicantsTitle, icon: Users },
    { href: '/employer/processes', label: t.employer.processesTitle, icon: GitBranch },
    { href: '/employer/requests', label: t.employer.requestsTitle, icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen">
      <DashboardSidebar
        links={employerLinks}
        role={t.badges.employer}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DemoBanner />
        <DashboardHeader
          title={t.employer.dashboardTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
