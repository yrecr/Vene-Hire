'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  GitBranch, MessageSquare, TrendingUp, CalendarDays,
  Bell, Globe, Clock, Code2, CheckCircle2,
  FileText, Video, Plus, Trash2, Upload,
} from 'lucide-react';
import { useDemoAuth } from '@/lib/demo-auth';
import { useMockData } from '@/lib/data-context';
import { StatCard } from '@/components/stat-card';
import { ProfileCompletionCard } from '@/components/profile-completion-card';
import { ProcessTimeline } from '@/components/process-timeline';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { loadEmployerProfiles } from '@/lib/employer-profiles';

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
  const { currentUser } = useDemoAuth();
  const {
    interviewRequests,
    selectionProcesses,
    getNotificationsForUser,
    getAvailabilityForApplicant,
    updateAvailabilitySlots,
    respondToInterview,
    talentProfiles,
  } = useMockData();

  const user = currentUser;

  const talentProfile = useMemo(() => {
    if (!user?.talent_profile_id) return null;
    return talentProfiles.find((t) => t.id === user.talent_profile_id) ?? null;
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

  // ponytail: mock uploads stored in local state, not persisted
  const [mockResumeUrl, setMockResumeUrl] = useState<string | null>(null);
  const [mockVideoUrl, setMockVideoUrl] = useState<string | null>(null);

  const [newSlotDay, setNewSlotDay] = useState('1');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('10:00');

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const resumeUrl = mockResumeUrl ?? talentProfile?.resume_url;
  const videoUrl = mockVideoUrl ?? talentProfile?.video_url;

  const slots = useMemo(
    () => talentProfile ? getAvailabilityForApplicant(talentProfile.id) : [],
    [talentProfile, getAvailabilityForApplicant]
  );

  const addSlot = useCallback(() => {
    if (!talentProfile) return;
    const slot = {
      id: `as-mock-${Date.now()}`,
      applicant_id: talentProfile.id,
      day_of_week: parseInt(newSlotDay),
      start_time: newSlotStart,
      end_time: newSlotEnd,
      timezone: talentProfile.timezone,
    };
    updateAvailabilitySlots(talentProfile.id, [...slots, slot]);
  }, [talentProfile, newSlotDay, newSlotStart, newSlotEnd, slots, updateAvailabilitySlots]);

  const removeSlot = useCallback((slotId: string) => {
    if (!talentProfile) return;
    updateAvailabilitySlots(talentProfile.id, slots.filter((s) => s.id !== slotId));
  }, [talentProfile, slots, updateAvailabilitySlots]);

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

  const completion = talentProfile.profile_completion ?? 0;
  const completionItems = [
    { label: 'Full Name', done: talentProfile.display_name.length > 0 },
    { label: 'Professional Title', done: talentProfile.title.length > 0 },
    { label: 'Summary', done: (talentProfile.summary?.length ?? 0) > 2 },
    { label: 'Bio', done: (talentProfile.bio?.length ?? 0) > 10 },
    { label: 'Tech Stack', done: (talentProfile.tech_stack?.length ?? 0) > 0 },
    { label: 'Skills Assessment', done: (talentProfile.skills?.length ?? 0) > 0 },
    { label: 'English Level', done: true },
    { label: 'Resume', done: (talentProfile.resume_url?.length ?? 0) > 0 },
    { label: 'Video', done: (talentProfile.video_url?.length ?? 0) > 0 },
    { label: 'Availability', done: true },
  ];

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  const employer = loadEmployerProfiles().find((e) => e.id === process.employer_id);
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
                  const employer = loadEmployerProfiles().find((e) => e.id === interview.employer_id);
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

          {/* Tech Stack */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4">Tech Stack</h3>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{talentProfile.years_experience} year{talentProfile.years_experience !== 1 ? 's' : ''} of experience</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {talentProfile.tech_stack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Multimedia */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Video className="w-4 h-4" />
              Multimedia
            </h3>

            {/* Resume */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Resume</p>
              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[hsl(210,100%,45%)] hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Resume
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setMockResumeUrl('/resumes/mock-upload.pdf')}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Resume
                </button>
              )}
            </div>

            {/* Video */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Presentation Video</p>
              {videoUrl ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Presentation video"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMockVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Video
                </button>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" />
              Availability
            </h3>

            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">No availability set.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {slots.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">{DAY_NAMES[s.day_of_week]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{s.start_time}–{s.end_time}</span>
                      <button
                        type="button"
                        onClick={() => removeSlot(s.id)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <select
                value={newSlotDay}
                onChange={(e) => setNewSlotDay(e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white"
              >
                {DAY_NAMES.map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>
              <input
                type="time"
                value={newSlotStart}
                onChange={(e) => setNewSlotStart(e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white w-16"
              />
              <span className="text-xs text-muted-foreground">–</span>
              <input
                type="time"
                value={newSlotEnd}
                onChange={(e) => setNewSlotEnd(e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white w-16"
              />
              <button
                type="button"
                onClick={addSlot}
                className="ml-auto text-[hsl(210,100%,45%)] hover:text-[hsl(210,100%,38%)]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
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
                  const employer = loadEmployerProfiles().find((e) => e.id === p.employer_id);
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
