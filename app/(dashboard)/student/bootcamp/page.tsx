'use client';

import { RoleBadge } from '@/components/role-badge';
import { useData } from '@/lib/data-context';
import { CircleCheck as CheckCircle2, Lock, BookOpen, Calendar, Clock, Activity } from 'lucide-react';

const modules = [
  { title: 'Module 1: Fundamentals', status: 'completed' },
  { title: 'Module 2: Backend Development', status: 'completed' },
  { title: 'Module 3: Frontend Development', status: 'in_progress' },
  { title: 'Module 4: DevOps & Deployment', status: 'locked' },
  { title: 'Module 5: Final Project', status: 'locked' },
];

function getModuleStatusStyles(status: string) {
  switch (status) {
    case 'completed':
      return 'border-emerald-200 bg-emerald-50/50';
    case 'in_progress':
      return 'border-blue-200 bg-blue-50/50';
    case 'locked':
      return 'border-gray-200 bg-gray-50/50 opacity-60';
    default:
      return 'border-gray-200';
  }
}

export default function BootcampPage() {
  const { bootcamps, enrollments } = useData();
  const bootcamp = bootcamps[0];
  const enrollment = enrollments[0];
  const startDate = bootcamp?.start_date ? new Date(bootcamp.start_date) : null;
  const endDate = bootcamp?.end_date ? new Date(bootcamp.end_date) : null;
  const durationWeeks = startDate && endDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
    : 0;

  if (!bootcamp || !enrollment) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-foreground">Bootcamp</h2>
        <p className="text-muted-foreground">No bootcamp enrollment found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">{bootcamp.title}</h2>
        <p className="text-muted-foreground mt-1">
          Track your progress through the bootcamp curriculum.
        </p>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">Overall Progress</h3>
          <span className="text-2xl font-bold text-primary">{enrollment.progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
            style={{ width: `${enrollment.progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-3">{bootcamp.description}</p>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Start Date</span>
          </div>
          <p className="text-base font-semibold text-foreground">{bootcamp.start_date ?? '—'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">End Date</span>
          </div>
          <p className="text-base font-semibold text-foreground">{bootcamp.end_date ?? '—'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Status</span>
          </div>
          <RoleBadge role={bootcamp.status ?? 'active'} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Duration</span>
          </div>
          <p className="text-base font-semibold text-foreground">{durationWeeks} weeks</p>
        </div>
      </div>

      {/* Curriculum Modules */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Curriculum</h3>
        <div className="space-y-3">
          {modules.map((mod, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${getModuleStatusStyles(mod.status)}`}
            >
              <div className="flex items-center gap-3">
                {mod.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : mod.status === 'in_progress' ? (
                  <BookOpen className="w-5 h-5 text-primary" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium text-foreground">{mod.title}</span>
              </div>
              <RoleBadge role={mod.status === 'locked' ? 'inactive' : mod.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
