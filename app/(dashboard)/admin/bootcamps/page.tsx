'use client';

import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-context';
import { useT } from '@/lib/i18n';
import { PageLoading } from '@/components/page-loading';
import { Plus, Calendar, Users } from 'lucide-react';

const studentCounts: Record<string, number> = {
  bc1: 12,
  bc2: 0,
  bc3: 8,
};

export default function BootcampsPage() {
  const { t, formatDate } = useT();
  const { bootcamps, isHydrated } = useData();

  if (!isHydrated) {
    return (
      <PageLoading />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">{t.admin.bootcamps}</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {t.admin.comingSoonBadge}
          </span>
        </div>
        <Button size="sm" className="gap-2" disabled title={t.admin.bootcampComingSoonTooltip}>
          <Plus className="w-4 h-4" />
          {t.admin.createBootcampBtn}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground -mt-4">
        {t.admin.bootcampNotice}
      </p>

      {/* Bootcamp Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bootcamps.map((bootcamp) => (
          <div
            key={bootcamp.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-foreground leading-tight pr-2">
                {bootcamp.title}
              </h3>
              <RoleBadge role={bootcamp.status} />
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {bootcamp.description}
            </p>

            <div className="mt-auto space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>
                  {bootcamp.start_date
                    ? formatDate(bootcamp.start_date, {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'TBD'}
                  {' - '}
                  {bootcamp.end_date
                    ? formatDate(bootcamp.end_date, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'TBD'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 shrink-0" />
                <span>{t.admin.studentsEnrolled.replace('{count}', String(studentCounts[bootcamp.id] ?? 0))}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
