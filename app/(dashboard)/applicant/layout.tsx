'use client';

import { useState } from 'react';
import { DashboardSidebar, type SidebarLink } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { LayoutDashboard, User, FileText, Video, Calendar, MessageSquare, GitBranch, Signature as FileSignature } from 'lucide-react';

const applicantLinks: SidebarLink[] = [
  { href: '/applicant', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/applicant/profile', label: 'My Profile', icon: User },
  { href: '/applicant/resume', label: 'My Resume', icon: FileText },
  { href: '/applicant/video', label: 'My Video', icon: Video },
  { href: '/applicant/availability', label: 'Availability', icon: Calendar },
  { href: '/applicant/interviews', label: 'Interviews', icon: MessageSquare },
  { href: '/applicant/processes', label: 'Processes', icon: GitBranch },
  { href: '/applicant/contract', label: 'Contract', icon: FileSignature },
];

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <DashboardSidebar
        links={applicantLinks}
        role="Applicant"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          title="Applicant Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
