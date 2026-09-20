'use client';

import { useMemo } from 'react';
import {
  GitBranch, MessageSquare, TrendingUp, CalendarDays,
  Globe, Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import { StatCard } from '@/components/stat-card';
import { ProfileCompletionBubble } from '@/components/profile-completion-bubble';
import { ProcessTimeline } from '@/components/process-timeline';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { Button } from '@/components/ui/button';
import { TrendCard, DonutCard } from '@/components/dashboard-charts';
import { bucketLast14Days, countByStatus } from '@/lib/chart-utils';
import { getApplicantCompletionItems, getCompletionPercent } from '@/lib/profile-completion';
import { PageLoading } from '@/components/page-loading';
import { useT } from '@/lib/i18n';

const PROCESS_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  hired: 'Hired',
  on_hold: 'On Hold',
  not_selected: 'Not Selected',
};


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
  const { t, lang, formatDate } = useT();
  const isEs = lang === 'es';
  const { currentUser, loading } = useAuth();
  const {
    interviewRequests,
    selectionProcesses,
    respondToInterview,
    talentProfiles,
    getEmployerById,
    isHydrated,
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

  const interviewsTrend = useMemo(() => bucketLast14Days(myInterviews, (i) => i.created_at), [myInterviews]);
  const processStatusDistribution = useMemo(
    () => countByStatus(myProcesses, (p) => p.status, PROCESS_STATUS_LABELS),
    [myProcesses]
  );

  if (loading || !isHydrated) {
    return (
      <PageLoading />
    );
  }

  if (!user || !talentProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">{isEs ? 'Por favor inicia sesión' : 'Please sign in'}</h2>
          <p className="text-muted-foreground">{isEs ? 'Inicia sesión con una cuenta de aplicante para ver tu panel.' : 'Sign in with an applicant account to view your dashboard.'}</p>
        </div>
      </div>
    );
  }

  const completionItems = getApplicantCompletionItems(talentProfile);
  const completion = getCompletionPercent(completionItems);

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t.applicant.welcome.replace('{name}', talentProfile.display_name)}
          </h2>
          <p className="text-muted-foreground mt-1">
            {talentProfile.title} · {talentProfile.timezone}
          </p>
        </div>

        {/* Profile badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${ENGLISH_COLORS[talentProfile.english_level] ?? 'bg-gray-100 text-gray-700'}`}>
            <Globe className="w-3 h-3" />
            {talentProfile.english_level} {isEs ? 'Inglés' : 'English'}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${AVAILABILITY_COLORS[talentProfile.availability_status] ?? 'bg-gray-100 text-gray-700'}`}>
            <Clock className="w-3 h-3" />
            {(t.badges as Record<string, string>)[talentProfile.availability_status.toLowerCase().replace(/\s+/g, '_')] || talentProfile.availability_status}
          </span>
        </div>
      </div>

      {/* ── KPI Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label={t.applicant.activeProcesses} value={activeProcesses.length} />
        <StatCard icon={MessageSquare} label={isEs ? 'Entrevistas Pendientes' : 'Pending Interviews'} value={pendingInterviews.length} />
        <StatCard icon={CalendarDays} label={isEs ? 'Total de Entrevistas' : 'Total Interviews'} value={myInterviews.length} />
        <StatCard icon={GitBranch} label={isEs ? 'Total de Procesos' : 'Total Processes'} value={myProcesses.length} />
      </div>

      {/* ── Trends ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendCard title={isEs ? 'Solicitudes de Entrevista (Últimos 14 días)' : 'Interview Requests (Last 14 Days)'} data={interviewsTrend} />
        <DonutCard title={isEs ? 'Mis Procesos por Estado' : 'My Processes by Status'} data={processStatusDistribution} />
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="space-y-6">

          {/* Active Processes */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4">{t.applicant.activeProcesses}</h3>

            {activeProcesses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {isEs
                    ? 'No hay procesos activos aún. Cuando un empleador acepte tu entrevista, aparecerá aquí.'
                    : 'No active processes yet. Once an employer accepts your interview, it will appear here.'}
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
                          <p className="text-sm text-muted-foreground">{employer?.company_name ?? (isEs ? 'Empresa Desconocida' : 'Unknown Company')}</p>
                        </div>
                        <ProcessStatusBadge status={process.status} />
                      </div>

                      {/* Current stage callout */}
                      <p className="text-xs text-muted-foreground mb-4 mt-2">
                        {isEs ? 'Etapa actual: ' : 'Current stage: '}
                        <span className="font-medium text-foreground capitalize">
                          {(t.badges as Record<string, string>)[process.current_stage] || process.current_stage.replace(/_/g, ' ')}
                        </span>
                        {process.current_stage === 'contract_signing' && process.contract_status && (
                          <span className="ml-2 text-amber-600">· {isEs ? 'Contrato ' : 'Contract '}{(t.badges as Record<string, string>)[process.contract_status] || process.contract_status.replace(/_/g, ' ')}</span>
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
            <h3 className="text-lg font-semibold text-foreground mb-4">{isEs ? 'Solicitudes de Entrevista' : 'Interview Requests'}</h3>

            {pendingInterviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {isEs
                    ? 'No hay solicitudes de entrevista pendientes. Los empleadores podrán contactarte tras revisar tu perfil.'
                    : 'No pending interview requests. Employers can contact you after viewing your profile.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingInterviews.map((interview) => {
                  const employer = getEmployerById(interview.employer_id);
                  const dateStr = interview.requested_date
                    ? formatDate(interview.requested_date, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : (isEs ? 'Por definir' : 'TBD');

                  return (
                    <div key={interview.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <MessageSquare className="w-5 h-5 text-[hsl(210,100%,45%)] flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">{employer?.company_name ?? (isEs ? 'Empresa Desconocida' : 'Unknown Company')}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{interview.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{isEs ? 'Propuesta: ' : 'Proposed: '}{dateStr}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => respondToInterview(interview.id, 'declined')}
                          >
                            {isEs ? 'Rechazar' : 'Decline'}
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs h-7 bg-[hsl(210,100%,45%)] hover:bg-[hsl(210,100%,38%)]"
                            onClick={() => respondToInterview(interview.id, 'accepted')}
                          >
                            {isEs ? 'Aceptar' : 'Accept'}
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

      <ProfileCompletionBubble
        completion={completion}
        items={completionItems}
        href="/applicant/settings"
        ctaLabel={isEs ? 'Completar mi perfil' : 'Complete your profile'}
        message={isEs ? 'Un perfil completo aumenta tus oportunidades de ser contratado.' : 'A complete profile gets you more opportunities to land an employer.'}
        storageKey="venehire-profile-bubble-applicant"
      />
    </div>
  );
}
