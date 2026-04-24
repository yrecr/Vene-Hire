'use client';

import { useMemo } from 'react';
import { GitBranch, MessageSquare, TrendingUp, CalendarDays, Bell } from 'lucide-react';
import { useDemoAuth } from '@/lib/demo-auth';
import { StatCard } from '@/components/stat-card';
import { ProfileCompletionCard } from '@/components/profile-completion-card';
import { ProcessTimeline } from '@/components/process-timeline';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { RoleBadge } from '@/components/role-badge';
import {
  mockTalentProfiles,
  mockEmployerProfiles,
  getProcessesForApplicant,
  getInterviewsForApplicant,
  getNotificationsForUser,
  demoUsers,
} from '@/data/mock';

export default function ApplicantDashboardPage() {
  const { currentUser } = useDemoAuth();

  // Fall back to first applicant demo user for demo purposes
  const user = currentUser ?? demoUsers.find(function (u) { return u.role === 'applicant'; }) ?? null;

  const talentProfile = useMemo(function () {
    if (!user?.talent_profile_id) return null;
    return mockTalentProfiles.find(function (t) { return t.id === user.talent_profile_id; }) || null;
  }, [user]);

  const processes = useMemo(function () {
    if (!talentProfile) return [];
    return getProcessesForApplicant(talentProfile.id);
  }, [talentProfile]);

  const interviews = useMemo(function () {
    if (!talentProfile) return [];
    return getInterviewsForApplicant(talentProfile.id);
  }, [talentProfile]);

  const notifications = useMemo(function () {
    if (!user) return [];
    return getNotificationsForUser(user.profile_id);
  }, [user]);

  const upcomingInterviews = interviews.filter(function (i) {
    return i.status === 'pending' || i.status === 'scheduled';
  });

  const activeProcesses = processes.filter(function (p) {
    return p.status === 'active';
  });

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

  const firstName = user.full_name.split(' ')[0];

  const daysActive = talentProfile
    ? Math.floor((Date.now() - new Date(talentProfile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const completionItems = [
    { label: 'Basic information', done: true },
    { label: 'Profile photo', done: !!talentProfile?.profile_image_url },
    { label: 'Summary & bio', done: !!(talentProfile?.summary && talentProfile?.bio) },
    { label: 'Tech stack', done: !!(talentProfile?.tech_stack && talentProfile.tech_stack.length > 0) },
    { label: 'Resume uploaded', done: !!talentProfile?.resume_url },
    { label: 'Video uploaded', done: !!talentProfile?.video_url },
    { label: 'Availability set', done: !!talentProfile?.availability_status },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back, {firstName}</h2>
        <p className="text-muted-foreground mt-1">
          Here is an overview of your hiring activity and profile status.
        </p>
      </div>

      {/* Stats + Profile Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion (left column) */}
        <div className="lg:col-span-1">
          <ProfileCompletionCard
            completion={talentProfile?.profile_completion ?? 0}
            items={completionItems}
          />
        </div>

        {/* Stats (right area) */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={GitBranch}
              label="Active Processes"
              value={activeProcesses.length}
            />
            <StatCard
              icon={MessageSquare}
              label="Pending Interviews"
              value={upcomingInterviews.length}
            />
            <StatCard
              icon={TrendingUp}
              label="Profile Completion"
              value={`${talentProfile?.profile_completion ?? 0}%`}
            />
            <StatCard
              icon={CalendarDays}
              label="Days Active"
              value={daysActive}
            />
          </div>
        </div>
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Upcoming Interviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingInterviews.map(function (interview) {
              var employer = mockEmployerProfiles.find(function (e) {
                return e.id === interview.employer_id;
              });
              return (
                <div
                  key={interview.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">
                      {employer?.company_name || 'Unknown Company'}
                    </h4>
                    <RoleBadge role={interview.status} />
                  </div>
                  {interview.requested_date && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(interview.requested_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">{interview.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Processes */}
      {activeProcesses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Active Processes</h3>
          <div className="grid grid-cols-1 gap-4">
            {activeProcesses.map(function (process) {
              var employer = mockEmployerProfiles.find(function (e) {
                return e.id === process.employer_id;
              });
              return (
                <div
                  key={process.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-foreground">{process.role_title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {employer?.company_name || 'Unknown Company'}
                      </p>
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
                  {process.notes && (
                    <p className="text-sm text-muted-foreground mt-4 italic">
                      {process.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Notifications
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
            {notifications.slice(0, 5).map(function (notification) {
              return (
                <div
                  key={notification.id}
                  className={`px-5 py-4 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
