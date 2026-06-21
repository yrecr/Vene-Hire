'use client';

import { useMemo } from 'react';
import { GitBranch, MessageSquare, TrendingUp, CalendarDays, Bell } from 'lucide-react';
import { useDemoAuth } from '@/lib/demo-auth';
import { useMockData } from '@/lib/data-context';
import { StatCard } from '@/components/stat-card';
import { ProfileCompletionCard } from '@/components/profile-completion-card';
import { ProcessTimeline } from '@/components/process-timeline';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { RoleBadge } from '@/components/role-badge';
import {
  mockTalentProfiles,
  mockEmployerProfiles,
  demoUsers,
} from '@/data/mock';

export default function ApplicantDashboardPage() {
  const { currentUser } = useDemoAuth();
  const { interviewRequests, selectionProcesses, notifications, getNotificationsForUser } = useMockData();

  const user = currentUser ?? demoUsers.find(function (u) { return u.role === 'applicant'; }) ?? null;

  const talentProfile = useMemo(function () {
    if (!user?.talent_profile_id) return null;
    return mockTalentProfiles.find(function (t) { return t.id === user.talent_profile_id; }) || null;
  }, [user]);

  const processes = useMemo(function () {
    if (!talentProfile) return [];
    return selectionProcesses.filter(function (p) { return p.applicant_id === talentProfile.id; });
  }, [talentProfile, selectionProcesses]);

  const interviews = useMemo(function () {
    if (!talentProfile) return [];
    return interviewRequests.filter(function (r) { return r.applicant_id === talentProfile.id; });
  }, [talentProfile, interviewRequests]);

  const activeProcesses = processes.filter(function (p) { return p.status === 'active'; });
  const pendingInterviews = interviews.filter(function (i) { return i.status === 'pending'; });

  const profileId = user?.profile_id || '';
  const userNotifications = getNotificationsForUser(profileId);
  const recentNotifications = userNotifications.slice(0, 3);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Please sign in</h2>
          <p className="text-muted-foreground">Sign in with an applicant account to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const applicant = talentProfile;
  const completion = applicant?.profile_completion ?? 0;

  const completionItems = [
    { label: 'Full Name', done: (applicant?.display_name?.length ?? 0) > 0 },
    { label: 'Professional Title', done: (applicant?.title?.length ?? 0) > 0 },
    { label: 'Summary', done: (applicant?.summary?.length ?? 0) > 2 },
    { label: 'Bio', done: (applicant?.bio?.length ?? 0) > 10 },
    { label: 'Tech Stack', done: (applicant?.tech_stack?.length ?? 0) > 0 },
    { label: 'Skills Assessment', done: (applicant?.skills?.length ?? 0) > 0 },
    { label: 'English Level', done: true },
    { label: 'Resume', done: (applicant?.resume_url?.length ?? 0) > 0 },
    { label: 'Video', done: (applicant?.video_url?.length ?? 0) > 0 },
    { label: 'Availability', done: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, {applicant?.display_name || user.full_name}
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage your profile, interviews, and track your selection processes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Active Processes" value={activeProcesses.length} />
        <StatCard icon={MessageSquare} label="Pending Interviews" value={pendingInterviews.length} />
        <StatCard icon={CalendarDays} label="Total Interviews" value={interviews.length} />
        <StatCard icon={GitBranch} label="Total Processes" value={processes.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Active Processes
            </h3>
            {activeProcesses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No active processes. When an employer accepts your interview request, a process will start.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeProcesses.map(function (process) {
                  const employer = mockEmployerProfiles.find(function (e) {
                    return e.id === process.employer_id;
                  });
                  return (
                    <div key={process.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-foreground">{process.role_title}</h4>
                          <p className="text-sm text-muted-foreground">{employer?.company_name || 'Unknown Company'}</p>
                        </div>
                        <ProcessStatusBadge status={process.status} />
                      </div>
                      <ProcessTimeline
                        currentStage={process.current_stage}
                        status={process.status}
                        introDate={process.intro_interview_date}
                        technicalDate={process.technical_interview_date}
                        contractStatus={process.contract_status}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Upcoming Interviews
            </h3>
            {pendingInterviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No upcoming interviews. When an employer sends a request, it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingInterviews.map(function (interview) {
                  const employer = mockEmployerProfiles.find(function (e) {
                    return e.id === interview.employer_id;
                  });
                  return (
                    <div key={interview.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-[hsl(210,100%,45%)]" />
                        <div>
                          <p className="font-medium text-foreground">{employer?.company_name || 'Unknown Company'}</p>
                          <p className="text-sm text-muted-foreground">{interview.message}</p>
                        </div>
                      </div>
                      <RoleBadge role={interview.status} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <ProfileCompletionCard completion={completion} items={completionItems} />

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </h3>
            </div>
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No notifications.</p>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map(function (notif) {
                  return (
                    <div key={notif.id} className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-[hsl(210,100%,45%)]'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{notif.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
