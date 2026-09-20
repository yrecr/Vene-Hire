'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Building2, MessageSquare, GitBranch, CircleCheck as CheckCircle, ArrowRight, UserCog } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { TrendCard, DonutCard } from '@/components/dashboard-charts';
import { useData } from '@/lib/data-context';
import { useT } from '@/lib/i18n';
import { bucketLast14Days, countByStatus } from '@/lib/chart-utils';
import { PageLoading } from '@/components/page-loading';
import type { AccessRequest } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t, formatDate } = useT();
  const { selectionProcesses, accessRequests, profiles, isHydrated } = useData();
  const totalApplicants = profiles.filter((p) => p.role === 'applicant').length;
  const totalEmployers = profiles.filter((p) => p.role === 'employer').length;
  const pendingRequests = accessRequests.filter((r) => r.status === 'pending').length;
  const activeProcesses = selectionProcesses.filter((p) => p.status === 'active').length;
  const hiredCount = selectionProcesses.filter((p) => p.status === 'hired').length;

  const processStatusLabels: Record<string, string> = useMemo(() => ({
    active: t.badges.active,
    hired: t.badges.hired,
    on_hold: t.badges.on_hold,
    not_selected: t.badges.not_selected,
  }), [t]);

  const columns: DataTableColumn<AccessRequest>[] = useMemo(() => [
    {
      key: 'name',
      header: t.admin.colName,
      render: (item) => <span className="font-medium text-foreground">{item.full_name}</span>,
    },
    {
      key: 'type',
      header: t.admin.colRole,
      render: (item) => <RoleBadge role={item.request_type} />,
    },
    {
      key: 'company',
      header: t.admin.colCompany,
      render: (item) => <span className="text-muted-foreground">{item.company || '-'}</span>,
    },
    {
      key: 'status',
      header: t.admin.colStatus,
      render: (item) => <RoleBadge role={item.status} />,
    },
    {
      key: 'date',
      header: t.admin.colDate,
      render: (item) => (
        <span className="text-muted-foreground">
          {formatDate(item.created_at, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ], [t, formatDate]);

  const requestsTrend = bucketLast14Days(accessRequests, (r) => r.created_at);
  const processStatusDistribution = countByStatus(selectionProcesses, (p) => p.status, processStatusLabels);

  if (!isHydrated) {
    return (
      <PageLoading />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label={t.admin.totalApplicants} value={totalApplicants} />
        <StatCard icon={Building2} label={t.admin.totalEmployers} value={totalEmployers} />
        <StatCard icon={MessageSquare} label={t.admin.pendingRequests} value={pendingRequests} />
        <StatCard icon={GitBranch} label={t.admin.activeProcesses} value={activeProcesses} />
        <StatCard icon={CheckCircle} label={t.admin.hiredCount} value={hiredCount} />
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendCard title={t.admin.requestsTrendTitle} data={requestsTrend} />
        <DonutCard title={t.admin.processStatusTitle} data={processStatusDistribution} />
      </div>

      {/* Recent Access Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t.admin.recentAccessRequests}</h2>
          <Link href="/admin/requests">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              {t.admin.viewAll} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <DataTable columns={columns} data={accessRequests.slice(0, 3)} onRowClick={() => router.push('/admin/requests')} />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">{t.admin.quickActions}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/admin/users" className="block">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-[hsl(210,100%,45%)]/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-3">
                <UserCog className="w-5 h-5 text-[hsl(210,100%,45%)]" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t.admin.manageUsers}</h3>
              <p className="text-sm text-muted-foreground">{t.admin.manageUsersDesc}</p>
              <ArrowRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link href="/admin/requests" className="block">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-[hsl(210,100%,45%)]/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 text-[hsl(210,100%,45%)]" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t.admin.reviewRequests}</h3>
              <p className="text-sm text-muted-foreground">{t.admin.reviewRequestsDesc}</p>
              <ArrowRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link href="/admin/processes" className="block">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-[hsl(210,100%,45%)]/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-3">
                <GitBranch className="w-5 h-5 text-[hsl(210,100%,45%)]" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t.admin.viewProcesses}</h3>
              <p className="text-sm text-muted-foreground">{t.admin.viewProcessesDesc}</p>
              <ArrowRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
