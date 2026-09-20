'use client';

import { useMemo } from 'react';
import { Users, GitBranch, MessageSquare, Star, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { TrendCard, DonutCard } from '@/components/dashboard-charts';
import { ProfileCompletionBubble } from '@/components/profile-completion-bubble';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import { bucketLast14Days, countByStatus } from '@/lib/chart-utils';
import { PageLoading } from '@/components/page-loading';
import { getEmployerCompletionItems, getCompletionPercent } from '@/lib/profile-completion';
import Link from 'next/link';
import { useT } from '@/lib/i18n';

export default function EmployerDashboard() {
  const { currentUser, loading } = useAuth();
  const {
    interviewRequests,
    selectionProcesses,
    shortlistedIds,
    getNotificationsForUser,
    talentProfiles,
    employerProfiles,
    isHydrated,
  } = useData();
  const { t, lang, formatDate } = useT();

  const employerProfile = employerProfiles.find((e) => e.id === currentUser?.employer_profile_id);
  const employerId = employerProfile?.id ?? '';
  const profileId = currentUser?.profile_id;
  const companyName = employerProfile?.company_name || 'Your Company';

  const availableCount = talentProfiles.filter(
    (item) => item.availability_status === 'Available'
  ).length;

  const activeProcesses = useMemo(
    () => selectionProcesses.filter((p) => p.employer_id === employerId && p.status === 'active'),
    [selectionProcesses, employerId]
  );

  const pendingInterviews = useMemo(
    () => interviewRequests.filter((i) => i.employer_id === employerId && i.status === 'pending'),
    [interviewRequests, employerId]
  );

  const myInterviews = useMemo(
    () => interviewRequests.filter((i) => i.employer_id === employerId),
    [interviewRequests, employerId]
  );

  const myProcesses = useMemo(
    () => selectionProcesses.filter((p) => p.employer_id === employerId),
    [selectionProcesses, employerId]
  );

  const processStatusLabels: Record<string, string> = useMemo(
    () => ({
      active: t.badges.active,
      hired: t.badges.hired,
      on_hold: t.badges.on_hold,
      not_selected: t.badges.not_selected,
    }),
    [t]
  );

  const interviewsTrend = useMemo(
    () => bucketLast14Days(myInterviews, (i) => i.created_at),
    [myInterviews]
  );
  const processStatusDistribution = useMemo(
    () => countByStatus(myProcesses, (p) => p.status, processStatusLabels),
    [myProcesses, processStatusLabels]
  );

  const userNotifications = getNotificationsForUser(profileId ?? '');
  const recentNotifications = userNotifications.slice(0, 3);
  const completionItems = employerProfile ? getEmployerCompletionItems(employerProfile) : [];
  const completion = getCompletionPercent(completionItems);

  if (loading || !isHydrated) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {t.employer.welcome.replace('{name}', companyName)}
        </h2>
        <p className="text-muted-foreground mt-1">
          {lang === 'es'
            ? 'Gestiona tu embudo de contratación y descubre el mejor talento.'
            : 'Manage your hiring pipeline and discover top talent.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label={lang === 'es' ? 'Candidatos Disponibles' : 'Available Applicants'}
          value={availableCount}
        />
        <StatCard icon={GitBranch} label={t.employer.activeProcesses} value={activeProcesses.length} />
        <StatCard
          icon={MessageSquare}
          label={lang === 'es' ? 'Entrevistas Pendientes' : 'Pending Interviews'}
          value={pendingInterviews.length}
        />
        <StatCard
          icon={Star}
          label={lang === 'es' ? 'Preseleccionados' : 'Shortlisted'}
          value={shortlistedIds.length}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendCard
          title={lang === 'es' ? 'Solicitudes de Entrevista (Últimos 14 días)' : 'Interview Requests (Last 14 Days)'}
          data={interviewsTrend}
        />
        <DonutCard
          title={lang === 'es' ? 'Mis Procesos por Estado' : 'My Processes by Status'}
          data={processStatusDistribution}
        />
      </div>

      <ProfileCompletionBubble
        completion={completion}
        items={completionItems}
        href="/employer/settings"
        ctaLabel={lang === 'es' ? 'Completa el perfil de tu empresa' : 'Complete your company profile'}
        message={
          lang === 'es'
            ? 'Un perfil de empresa completo te ayuda a atraer talento mejor calificado.'
            : 'A complete company profile helps you attract better-matched talent.'
        }
        storageKey="venehire-profile-bubble-employer"
      />

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">{t.employer.quickActions}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/employer/applicants">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-[hsl(210,100%,45%)]" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">{t.employer.applicantsTitle}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {lang === 'es'
                  ? 'Busca y filtra entre nuestro grupo de talento pre-evaluado.'
                  : 'Search and filter through our vetted talent pool.'}
              </p>
              <span className="text-sm font-medium text-[hsl(210,100%,45%)] flex items-center gap-1 group-hover:gap-2 transition-all">
                {t.common.view} <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          <Link href="/employer/processes">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-3">
                <GitBranch className="w-5 h-5 text-[hsl(170,60%,42%)]" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">{t.employer.processesTitle}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {lang === 'es'
                  ? 'Monitorea tus procesos de selección y etapas activas.'
                  : 'Track your active selection processes and stages.'}
              </p>
              <span className="text-sm font-medium text-[hsl(210,100%,45%)] flex items-center gap-1 group-hover:gap-2 transition-all">
                {t.common.view} <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          <Link href="/employer/requests">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 text-[hsl(210,100%,45%)]" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">{t.employer.requestsTitle}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {lang === 'es'
                  ? 'Administra solicitudes y programación de entrevistas.'
                  : 'Manage interview requests and scheduling.'}
              </p>
              <span className="text-sm font-medium text-[hsl(210,100%,45%)] flex items-center gap-1 group-hover:gap-2 transition-all">
                {t.common.view} <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{t.employer.recentActivity}</h3>
          <Link href="/employer/notifications">
            <Button variant="outline" size="sm">
              {t.common.viewAll}
            </Button>
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
          {recentNotifications.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              {t.common.noData}
            </div>
          ) : (
            recentNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 px-5 py-4">
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    notification.read ? 'bg-gray-300' : 'bg-[hsl(210,100%,45%)]'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{notification.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(notification.created_at)}
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
