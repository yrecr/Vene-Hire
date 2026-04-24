'use client';

import { useState } from 'react';
import { DashboardSidebar, type SidebarLink } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { LayoutDashboard, BookOpen, Code as Code2, FolderOpen, User } from 'lucide-react';

const studentLinks: SidebarLink[] = [
  { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/bootcamp', label: 'My Bootcamp', icon: BookOpen },
  { href: '/student/projects', label: 'Projects', icon: Code2 },
  { href: '/student/resources', label: 'Resources', icon: FolderOpen },
  { href: '/student/profile', label: 'My Profile', icon: User },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <DashboardSidebar
        links={studentLinks}
        role="Student"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          title="Student Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
