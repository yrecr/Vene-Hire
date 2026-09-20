'use client';

import { useMemo, useState } from 'react';
import { DashboardSidebar, type SidebarLink } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { DemoBanner } from '@/components/demo-banner';
import { LayoutDashboard, MessageSquare, GitBranch, FileSignature, Clock } from 'lucide-react';
import { useT } from '@/lib/i18n';

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useT();

  const applicantLinks: SidebarLink[] = useMemo(() => [
    { href: '/applicant', label: t.applicant.dashboardTitle, icon: LayoutDashboard },
    { href: '/applicant/interviews', label: t.applicant.interviewsTitle, icon: MessageSquare },
    { href: '/applicant/processes', label: t.applicant.processesTitle, icon: GitBranch },
    { href: '/applicant/timesheet', label: t.applicant.timesheetTitle, icon: Clock },
    { href: '/applicant/contract', label: t.applicant.contractTitle, icon: FileSignature },
  ], [t]);

  return (
    <div className="flex h-screen">
      <DashboardSidebar
        links={applicantLinks}
        role="Applicant"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DemoBanner />
        <DashboardHeader
          title={t.applicant.dashboardTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
