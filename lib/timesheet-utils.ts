import type { TimesheetDay } from '@/types';

export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function groupDaysByWeek(days: TimesheetDay[]): { week: number; days: TimesheetDay[] }[] {
  const weeks = new Map<number, TimesheetDay[]>();
  days.forEach((d) => {
    const w = isoWeek(new Date(d.date + 'T00:00:00'));
    if (!weeks.has(w)) weeks.set(w, []);
    weeks.get(w)!.push(d);
  });
  return Array.from(weeks.entries()).map(([week, days]) => ({ week, days })).sort((a, b) => a.week - b.week);
}
