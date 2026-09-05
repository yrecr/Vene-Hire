'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock, Send, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Hourglass, Plus, Minus, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { TimesheetDay } from '@/types';
import { groupDaysByWeek } from '@/lib/timesheet-utils';
import { PageLoading } from '@/components/page-loading';

const DEFAULT_DAILY_HOURS = 8;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function addMonths(monthStr: string, delta: number): string {
  const [y, m] = monthStr.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}

/**
 * Weekdays (Mon-Fri) of the given month, defaulted to 8h each — clipped to
 * [minDate, maxDate] (the contract's real start/end) so a partial first or
 * last month only offers the days actually worked, instead of the whole
 * calendar month regardless of when the contract started or ends.
 */
function defaultDaysForMonth(monthStr: string, minDate?: string | null, maxDate?: string | null): TimesheetDay[] {
  const [year, month] = monthStr.split('-').map(Number);
  const days: TimesheetDay[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    const dow = date.getDay();
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const withinStart = !minDate || iso >= minDate;
    const withinEnd = !maxDate || iso <= maxDate;
    if (dow >= 1 && dow <= 5 && withinStart && withinEnd) {
      days.push({ date: iso, hours: DEFAULT_DAILY_HOURS });
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
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

  const todayISO = new Date().toISOString().slice(0, 10);
  const currentMonth = monthKey(new Date());
  const selectedProcess = hiredProcesses.find((p) => p.id === selectedProcessId);

  // The calendar only ever spans the real contract: from the month it
  // started to whichever comes first — the month it ends, or today (can't
  // log hours for a month that hasn't happened yet).
  const startMonth = selectedProcess?.contract_start_date
    ? monthKey(new Date(selectedProcess.contract_start_date + 'T00:00:00'))
    : currentMonth;
  const contractEndMonth = selectedProcess?.contract_end_date
    ? monthKey(new Date(selectedProcess.contract_end_date + 'T00:00:00'))
    : null;
  const endMonth = [currentMonth, contractEndMonth].filter((m): m is string => !!m).sort()[0];

  const [selectedMonth, setSelectedMonth] = useState('');
  useEffect(() => {
    if (selectedProcess) setSelectedMonth(endMonth);
    // Reset to the most recent billable month whenever the contract changes —
    // deliberately not depending on startMonth/endMonth so switching months
    // within the same contract doesn't get stomped back to endMonth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProcessId]);

  const canGoPrevMonth = selectedMonth > startMonth;
  const canGoNextMonth = selectedMonth < endMonth;

  const existingTimesheet = timesheets.find((t) => t.process_id === selectedProcessId && t.month === selectedMonth);

  const [days, setDays] = useState<TimesheetDay[]>([]);
  useEffect(() => {
    if (existingTimesheet) {
      setDays(existingTimesheet.days);
    } else if (selectedMonth) {
      setDays(defaultDaysForMonth(selectedMonth, selectedProcess?.contract_start_date, selectedProcess?.contract_end_date));
    }
  }, [existingTimesheet?.id, selectedProcessId, selectedMonth]);

  const isLocked = existingTimesheet?.status === 'submitted' || existingTimesheet?.status === 'approved';
  const total = days.reduce((sum, d) => sum + (Number(d.hours) || 0), 0);
  const hasEnded = !!selectedProcess?.contract_end_date && selectedProcess.contract_end_date < todayISO;

  const lastRejection = existingTimesheet?.status === 'rejected'
    ? [...timesheetEvents].filter((e) => e.timesheet_id === existingTimesheet.id && e.event_type === 'rejected').sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
    : undefined;

  const adjustHours = (date: string, delta: number) => {
    setDays((prev) => prev.map((d) => (
      d.date === date ? { ...d, hours: Math.max(0, Math.min(24, Math.round((d.hours + delta) * 100) / 100)) } : d
    )));
  };

  const handleSubmit = async () => {
    if (!selectedProcessId) return;
    setSubmitting(true);
    try {
      await submitTimesheet(selectedProcessId, selectedMonth, days);
      toast({ title: 'Hours submitted', description: 'Your employer will review and approve them.' });
    } catch (err) {
      toast({ title: 'Could not submit hours', description: err instanceof Error ? err.message : 'Try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !isHydrated) {
    return (
      <PageLoading />
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

      {hasEnded && (
        <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
          <Info className="w-4 h-4 flex-shrink-0" />
          This contract ended on {new Date(selectedProcess!.contract_end_date! + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. You can still submit hours through {new Date(endMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="sm" className="h-8 w-8 p-0"
              disabled={!canGoPrevMonth}
              onClick={() => setSelectedMonth((m) => addMonths(m, -1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="font-semibold text-foreground w-40 text-center">
              {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <Button
              variant="ghost" size="sm" className="h-8 w-8 p-0"
              disabled={!canGoNextMonth}
              onClick={() => setSelectedMonth((m) => addMonths(m, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Total: <span className="font-semibold text-foreground">{total.toFixed(2)}h</span>
          </div>
        </div>

        {/* Fixed 6-column grid (label + 5 weekdays) doesn't reflow on narrow
            screens — scroll it horizontally instead of squeezing the pills. */}
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
        <div className="space-y-3 min-w-[560px]">
          {groupDaysByWeek(days).map(({ week, days: weekDays }) => (
            <div key={week} className="grid grid-cols-[80px_repeat(5,1fr)] gap-2 items-center">
              <span className="text-xs text-muted-foreground">Week {week}</span>
              {weekDays.map((d) => {
                const isZero = d.hours === 0;
                return (
                  <div key={d.date} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                    </span>
                    <div
                      className={`flex items-center justify-between gap-1 w-full rounded-lg px-1 py-1 ${
                        isZero ? 'bg-gray-50' : 'bg-[hsl(210,100%,45%)]/10'
                      }`}
                    >
                      <button
                        type="button"
                        aria-label="Subtract 0.25 hours"
                        disabled={isLocked}
                        onClick={() => adjustHours(d.date, -0.25)}
                        className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full border border-[hsl(210,100%,45%)]/30 text-[hsl(210,100%,45%)] hover:bg-[hsl(210,100%,45%)]/10 disabled:opacity-0 disabled:pointer-events-none"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className={`text-xs font-semibold ${isZero ? 'text-muted-foreground' : 'text-[hsl(210,100%,38%)]'}`}>
                        {d.hours}h
                      </span>
                      <button
                        type="button"
                        aria-label="Add 0.25 hours"
                        disabled={isLocked}
                        onClick={() => adjustHours(d.date, 0.25)}
                        className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full border border-[hsl(210,100%,45%)]/30 text-[hsl(210,100%,45%)] hover:bg-[hsl(210,100%,45%)]/10 disabled:opacity-0 disabled:pointer-events-none"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
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
