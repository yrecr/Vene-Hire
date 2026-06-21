'use client';

import { useMemo } from 'react';
import { Users, GitBranch, MessageSquare, Star, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { useDemoAuth } from '@/lib/demo-auth';
import { useMockData } from '@/lib/data-context';
import { mockTalentProfiles, mockEmployerProfiles } from '@/data/mock';
import Link from 'next/link';

export default function EmployerDashboard() {
  const { currentUser } = useDemoAuth();
  const { interviewRequests, selectionProcesses, notifications, shortlistedIds, getNotificationsForUser } = useMockData();

  const employerProfile = currentUser?.employer_profile_id
    ? mockEmployerProfiles.find((e) => e.id === currentUser.employer_profile_id)
    : mockEmployerProfiles[0];

  const employerId = employerProfile?.id || 'ep-acme';
  const profileId = currentUser?.profile_id || 'p-acme';
  const companyName = employerProfile?.company_name || 'Your Company';

  const availableCount = mockTalentProfiles.filter(
    (t) => t.availability_status === 'Available'
  ).length;

  const activeProcesses = useMemo(
    () => selectionProcesses.filter((p) => p.employer_id === employerId && p.status === 'active'),
    [selectionProcesses, employerId]
  );

  const pendingInterviews = useMemo(
    () => interviewRequests.filter((i) => i.employer_id === employerId && i.status === 'pending'),
    [interviewRequests, employerId]
  );

  const userNotifications = getNotificationsForUser(profileId);
  const recentNotifications = userNotifications.slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back, {companyName}</h2>
        <p className="text-muted-foreground mt-1">
          Manage your hiring pipeline and discover top talent.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Available Applicants" value={availableCount} />
        <StatCard icon={GitBranch} label="Active Processes" value={activeProcesses.length} />
        <StatCard icon={MessageSquare} label="Pending Interviews" value={pendingInterviews.length} />
        <StatCard icon={Star} label="Shortlisted" value={shortlistedIds.length} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/employer/applicants">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-[hsl(210,100%,45%)]" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">Browse Applicants</h4>
              <p className="text-sm text-muted-foreground mb-3">Search and filter through our vetted talent pool.</p>
              <span className="text-sm font-medium text-[hsl(210,100%,45%)] flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          <Link href="/employer/processes">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-3">
                <GitBranch className="w-5 h-5 text-[hsl(170,60%,42%)]" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">View Processes</h4>
              <p className="text-sm text-muted-foreground mb-3">Track your active selection processes and stages.</p>
              <span className="text-sm font-medium text-[hsl(210,100%,45%)] flex items-center gap-1 group-hover:gap-2 transition-all">
                View <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          <Link href="/employer/requests">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 text-[hsl(210,100%,45%)]" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">Schedule Interview</h4>
              <p className="text-sm text-muted-foreground mb-3">Manage interview requests and scheduling.</p>
              <span className="text-sm font-medium text-[hsl(210,100%,45%)] flex items-center gap-1 group-hover:gap-2 transition-all">
                Manage <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <Link href="/employer/notifications">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
          {recentNotifications.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No recent activity.</div>
          ) : (
            recentNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 px-5 py-4">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.read ? 'bg-gray-300' : 'bg-[hsl(210,100%,45%)]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{notification.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
