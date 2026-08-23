'use client';

import { useMemo } from 'react';
import {
  GitBranch, MessageSquare, TrendingUp, CalendarDays,
  Bell, Globe, Clock, CheckCircle2, Video,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import { StatCard } from '@/components/stat-card';
import { ProfileCompletionCard } from '@/components/profile-completion-card';
import { ProcessTimeline } from '@/components/process-timeline';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { Button } from '@/components/ui/button';


// --- English level color map ---
const ENGLISH_COLORS: Record<string, string> = {
  Basic: 'bg-gray-100 text-gray-700',
  Intermediate: 'bg-blue-50 text-blue-700',
  Advanced: 'bg-indigo-50 text-indigo-700',
  Fluent: 'bg-purple-50 text-purple-700',
  Native: 'bg-emerald-50 text-emerald-700',
};

// --- Availability color map ---
const AVAILABILITY_COLORS: Record<string, string> = {
  Available: 'bg-emerald-50 text-emerald-700',
  Hired: 'bg-blue-50 text-blue-700',
  'In Training': 'bg-amber-50 text-amber-700',
  'On Hold': 'bg-gray-100 text-gray-600',
};

export default function ApplicantDashboardPage() {
  const { currentUser } = useAuth();
  const {
    interviewRequests,
    selectionProcesses,
    getNotificationsForUser,
    respondToInterview,
    talentProfiles,
    getEmployerById,
  } = useData();

  const user = currentUser;

  const talentProfile = useMemo(() => {
    if (user?.talent_profile_id) {
      const found = talentProfiles.find((t) => t.id === user.talent_profile_id);
      if (found) return found;
    }
    if (user?.profile_id) {
      const found = talentProfiles.find((t) => t.user_id === user.profile_id);
      if (found) return found;
    }
    return null;
  }, [user, talentProfiles]);

  const myProcesses = useMemo(() => {
    if (!talentProfile) return [];
    return selectionProcesses.filter((p) => p.applicant_id === talentProfile.id);
  }, [talentProfile, selectionProcesses]);

  const myInterviews = useMemo(() => {
    if (!talentProfile) return [];
    return interviewRequests.filter((r) => r.applicant_id === talentProfile.id);
  }, [talentProfile, interviewRequests]);

  const activeProcesses = myProcesses.filter((p) => p.status === 'active');
  const pendingInterviews = myInterviews.filter((i) => i.status === 'pending');
  const notifications = getNotificationsForUser(user?.profile_id ?? '').slice(0, 4);

  if (!user || !talentProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Please sign in</h2>
          <p className="text-muted-foreground">Sign in with an applicant account to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const completionItems = [
    { label: 'Full Name', done: talentProfile.display_name.length > 0 },
    { label: 'Professional Title', done: talentProfile.title.length > 0 },
    { label: 'Summary', done: (talentProfile.summary?.length ?? 0) > 2 },
    { label: 'Bio', done: (talentProfile.bio?.length ?? 0) > 0 },
    { label: 'Tech Stack', done: (talentProfile.tech_stack?.length ?? 0) > 0 },
    { label: 'Skills Assessment', done: (talentProfile.tech_stack?.length ?? 0) > 0 },
    { label: 'English Level', done: talentProfile.english_level !== 'Basic' },
    { label: 'Resume', done: (talentProfile.resume_url?.length ?? 0) > 0 },
    { label: 'Video', done: (talentProfile.video_url?.length ?? 0) > 0 },
    { label: 'Availability', done: talentProfile.availability_status !== 'In Training' },
  ];
  const completion = Math.round((completionItems.filter((i) => i.done).length / completionItems.length) * 100);

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {talentProfile.display_name}
          </h2>
          <p className="text-muted-foreground mt-1">
            {talentProfile.title} · {talentProfile.timezone}
          </p>
        </div>

        {/* Profile badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${ENGLISH_COLORS[talentProfile.english_level] ?? 'bg-gray-100 text-gray-700'}`}>
            <Globe className="w-3 h-3" />
            {talentProfile.english_level} English
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${AVAILABILITY_COLORS[talentProfile.availability_status] ?? 'bg-gray-100 text-gray-700'}`}>
            <Clock className="w-3 h-3" />
            {talentProfile.availability_status}
          </span>
        </div>
      </div>

      {/* ── KPI Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Active Processes" value={activeProcesses.length} />
        <StatCard icon={MessageSquare} label="Pending Interviews" value={pendingInterviews.length} />
        <StatCard icon={CalendarDays} label="Total Interviews" value={myInterviews.length} />
        <StatCard icon={GitBranch} label="Total Processes" value={myProcesses.length} />
      </div>

      {/* ── Main grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: processes + interviews */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active Processes */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4">Active Processes</h3>

            {activeProcesses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No active processes yet. Once an employer accepts your interview, it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeProcesses.map((process) => {
                  const employer = getEmployerById(process.employer_id);
                  return (
                    <div key={process.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h4 className="font-semibold text-foreground">{process.role_title}</h4>
                          <p className="text-sm text-muted-foreground">{employer?.company_name ?? 'Unknown Company'}</p>
                        </div>
                        <ProcessStatusBadge status={process.status} />
                      </div>

                      {/* Current stage callout */}
                      <p className="text-xs text-muted-foreground mb-4 mt-2">
                        Current stage:{' '}
                        <span className="font-medium text-foreground capitalize">
                          {process.current_stage.replace(/_/g, ' ')}
                        </span>
                        {process.current_stage === 'contract_signing' && process.contract_status && (
                          <span className="ml-2 text-amber-600">· Contract {process.contract_status.replace(/_/g, ' ')}</span>
                        )}
                      </p>

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
          </section>

          {/* Pending Interview Requests */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4">Interview Requests</h3>

            {pendingInterviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No pending interview requests. Employers can contact you after viewing your profile.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingInterviews.map((interview) => {
                  const employer = getEmployerById(interview.employer_id);
                  const dateStr = interview.requested_date
                    ? new Date(interview.requested_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'TBD';

                  return (
                    <div key={interview.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <MessageSquare className="w-5 h-5 text-[hsl(210,100%,45%)] flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">{employer?.company_name ?? 'Unknown Company'}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{interview.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">Proposed: {dateStr}</p>
                          </div>
                        </div>
                        {/* ponytail: accept/decline actions inline — no modal needed for basic response */}
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => respondToInterview(interview.id, 'declined')}
                          >
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs h-7 bg-[hsl(210,100%,45%)] hover:bg-[hsl(210,100%,38%)]"
                            onClick={() => respondToInterview(interview.id, 'accepted')}
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>

        {/* RIGHT: sidebar */}
        <div className="space-y-6">

          {/* Profile Completion */}
          <ProfileCompletionCard completion={completion} items={completionItems} />

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4" />
              Notifications
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="ml-auto text-xs bg-[hsl(210,100%,45%)] text-white rounded-full px-2 py-0.5">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </h3>

            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No notifications.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-[hsl(210,100%,45%)]'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                      {notif.metadata?.join_url && (
                        <a
                          href={notif.metadata.join_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-md bg-[hsl(210,100%,45%)] text-white text-xs font-medium hover:bg-[hsl(210,100%,38%)] transition-colors"
                        >
                          <Video className="w-3 h-3" />
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Processes (historical) */}
          {myProcesses.filter((p) => p.status !== 'active').length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Past Processes
              </h3>
              <div className="space-y-2">
                {myProcesses.filter((p) => p.status !== 'active').map((p) => {
                  const employer = getEmployerById(p.employer_id);
                  return (
                    <div key={p.id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.role_title}</p>
                        <p className="text-xs text-muted-foreground">{employer?.company_name}</p>
                      </div>
                      <ProcessStatusBadge status={p.status} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
