'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock, Send, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Hourglass } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { TimesheetDay } from '@/types';

const DEFAULT_DAILY_HOURS = 8;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/** Weekdays (Mon-Fri) of the given month, defaulted to 8h each. */
function defaultDaysForMonth(monthStr: string): TimesheetDay[] {
  const [year, month] = monthStr.split('-').map(Number);
  const days: TimesheetDay[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    const dow = date.getDay();
    if (dow >= 1 && dow <= 5) {
      days.push({ date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`, hours: DEFAULT_DAILY_HOURS });
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function groupByWeek(days: TimesheetDay[]): { week: number; days: TimesheetDay[] }[] {
  const weeks = new Map<number, TimesheetDay[]>();
  days.forEach((d) => {
    const w = isoWeek(new Date(d.date + 'T00:00:00'));
    if (!weeks.has(w)) weeks.set(w, []);
    weeks.get(w)!.push(d);
  });
  return Array.from(weeks.entries()).map(([week, days]) => ({ week, days })).sort((a, b) => a.week - b.week);
}

export default function ApplicantTimesheetPage() {
  const { currentUser, loading } = useAuth();
  const { talentProfiles, employerProfiles, selectionProcesses, timesheets, timesheetEvents, submitTimesheet, isHydrated } = useData();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const talentProfile = useMemo(() => {
    if (currentUser?.talent_profile_id) return talentProfiles.find((t) => t.id === currentUser.talent_profile_id);
    if (currentUser?.profile_id) return talentProfiles.find((t) => t.user_id === currentUser.profile_id);
    return undefined;
  }, [currentUser, talentProfiles]);

  const hiredProcesses = useMemo(
    () => selectionProcesses.filter((p) => talentProfile && p.applicant_id === talentProfile.id && p.status === 'hired'),
    [selectionProcesses, talentProfile]
  );

  const [selectedProcessId, setSelectedProcessId] = useState<string>('');
  useEffect(() => {
    if (!selectedProcessId && hiredProcesses.length) setSelectedProcessId(hiredProcesses[0].id);
  }, [hiredProcesses, selectedProcessId]);

  const currentMonth = monthKey(new Date());
  const selectedProcess = hiredProcesses.find((p) => p.id === selectedProcessId);
  const existingTimesheet = timesheets.find((t) => t.process_id === selectedProcessId && t.month === currentMonth);

  const [days, setDays] = useState<TimesheetDay[]>([]);
  useEffect(() => {
    if (existingTimesheet) {
      setDays(existingTimesheet.days);
    } else {
      setDays(defaultDaysForMonth(currentMonth));
    }
  }, [existingTimesheet?.id, selectedProcessId, currentMonth]);

  const isLocked = existingTimesheet?.status === 'submitted' || existingTimesheet?.status === 'approved';
  const total = days.reduce((sum, d) => sum + (Number(d.hours) || 0), 0);

  const lastRejection = existingTimesheet?.status === 'rejected'
    ? [...timesheetEvents].filter((e) => e.timesheet_id === existingTimesheet.id && e.event_type === 'rejected').sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
    : undefined;

  const updateHours = (date: string, hours: number) => {
    setDays((prev) => prev.map((d) => (d.date === date ? { ...d, hours } : d)));
  };

  const handleSubmit = async () => {
    if (!selectedProcessId) return;
    setSubmitting(true);
    try {
      await submitTimesheet(selectedProcessId, currentMonth, days);
      toast({ title: 'Hours submitted', description: 'Your employer will review and approve them.' });
    } catch (err) {
      toast({ title: 'Could not submit hours', description: err instanceof Error ? err.message : 'Try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (hiredProcesses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Hours</h2>
          <p className="text-muted-foreground mt-1">Report your monthly hours once you&apos;re hired for a role.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            You don&apos;t have an active contract yet. This section unlocks once an employer hires you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Hours</h2>
          <p className="text-muted-foreground mt-1">Report the hours you worked this month for each contract.</p>
        </div>
        {hiredProcesses.length > 1 && (
          <select
            value={selectedProcessId}
            onChange={(e) => setSelectedProcessId(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
          >
            {hiredProcesses.map((p) => (
              <option key={p.id} value={p.id}>
                {employerProfiles.find((e) => e.id === p.employer_id)?.company_name || p.role_title}
              </option>
            ))}
          </select>
        )}
      </div>

      {existingTimesheet?.status === 'submitted' && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
          <Hourglass className="w-4 h-4 flex-shrink-0" />
          Submitted — waiting for your employer to approve.
        </div>
      )}
      {existingTimesheet?.status === 'approved' && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Approved. {existingTimesheet.invoice_url && (
            <a href={existingTimesheet.invoice_url} target="_blank" rel="noreferrer" className="underline font-medium">
              View billing statement
            </a>
          )}
        </div>
      )}
      {existingTimesheet?.status === 'rejected' && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Sent back for corrections{lastRejection?.comment ? `: ${lastRejection.comment}` : '.'} Adjust the hours below and resubmit.</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">
            {new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Total: <span className="font-semibold text-foreground">{total.toFixed(2)}h</span>
          </div>
        </div>

        <div className="space-y-3">
          {groupByWeek(days).map(({ week, days: weekDays }) => (
            <div key={week} className="grid grid-cols-[80px_repeat(5,1fr)] gap-2 items-center">
              <span className="text-xs text-muted-foreground">Week {week}</span>
              {weekDays.map((d) => (
                <div key={d.date} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                  </span>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="24"
                    value={d.hours}
                    disabled={isLocked}
                    onChange={(e) => updateHours(d.date, parseFloat(e.target.value) || 0)}
                    className="w-16 text-center rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)] disabled:bg-gray-50 disabled:text-muted-foreground"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {!isLocked && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit hours'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
